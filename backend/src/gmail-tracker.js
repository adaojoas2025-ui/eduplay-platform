'use strict';
const express = require('express');
const crypto = require('crypto');
const {rateLimit} = require('express-rate-limit');
const TOKEN = /^[a-f0-9]{48}$/;
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64');
const TABLE = `CREATE TABLE IF NOT EXISTS "GmailTrackerEvent" (
  "token" TEXT PRIMARY KEY, "reference" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "openedAt" TIMESTAMPTZ, "confirmedAt" TIMESTAMPTZ)`;
function createStore(db) {
  let ready;
  const init = () => ready || (ready = (async () => {
    await db.$executeRawUnsafe(TABLE);
    await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "GmailTrackerEvent_createdAt_idx" ON "GmailTrackerEvent" ("createdAt")');
  })().catch(e=>{ready=null;throw e;}));
  return {
    async cleanup() { await init(); await db.$executeRawUnsafe('DELETE FROM "GmailTrackerEvent" WHERE "createdAt" < NOW() - INTERVAL \'90 days\''); },
    async register(reference) { await init(); const rows = await db.$queryRawUnsafe('INSERT INTO "GmailTrackerEvent" ("token","reference") VALUES ($1,$2) ON CONFLICT ("reference") DO UPDATE SET "reference"=EXCLUDED."reference" RETURNING "token"',crypto.randomBytes(24).toString('hex'),reference); return rows[0].token; },
    async events(tokens) { await init(); if(!tokens.length)return {}; const rows=await db.$queryRawUnsafe('SELECT "token","openedAt","confirmedAt" FROM "GmailTrackerEvent" WHERE "token"=ANY($1::text[]) AND "createdAt">NOW()-INTERVAL \'90 days\'',tokens); return Object.fromEntries(rows.map(r=>[r.token,{openedAt:r.openedAt,confirmedAt:r.confirmedAt}])); },
    async find(token) { await init(); const rows=await db.$queryRawUnsafe('SELECT "token" FROM "GmailTrackerEvent" WHERE "token"=$1 AND "createdAt">NOW()-INTERVAL \'90 days\'',token); return !!rows.length; },
    async mark(token,field) { await init(); if(!['openedAt','confirmedAt'].includes(field))throw new Error('Invalid field'); await db.$executeRawUnsafe(`UPDATE "GmailTrackerEvent" SET "${field}"=COALESCE("${field}",NOW()) WHERE "token"=$1 AND "createdAt">NOW()-INTERVAL '90 days'`,token); }
  };
}
function createRouter({store,keyHash}) {
  if(!/^[a-f0-9]{64}$/.test(keyHash))throw new Error('Invalid tracker key hash');
  const router=express.Router();
  const paths=/^\/(?:v1\/(?:register|events)|pixel\/[a-f0-9]{48}\.gif|confirm\/[a-f0-9]{48}|gmail-avisos\/health)\/?$/;
  const limit=rateLimit({windowMs:60000,limit:120,standardHeaders:'draft-7',legacyHeaders:false});
  router.use((req,res,next)=>{
    if(!paths.test(req.path))return next('router');
    res.set({'Cache-Control':'no-store, private, max-age=0','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'cross-origin','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"});
    const origin=req.get('Origin');
    if(origin?.startsWith('chrome-extension://'))res.set({'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'});
    if(req.method==='OPTIONS')return res.sendStatus(204);
    limit(req,res,next);
  });
  router.use('/v1',(req,res,next)=>{
    const raw=req.get('Authorization')||'';
    const key=raw.startsWith('Bearer ')?raw.slice(7):'';
    const digest=crypto.createHash('sha256').update(key).digest();
    if(!key || !crypto.timingSafeEqual(digest,Buffer.from(keyHash,'hex')))return res.status(401).json({error:'Não autorizado.'});
    next();
  });
  router.use(express.json({limit:'64kb'}));
  const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
  const page=body=>'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Confirmação de leitura</title><style>body{font:18px/1.6 system-ui;max-width:600px;margin:10vh auto;padding:24px;color:#18323e}button{padding:14px 20px;background:#087f74;color:white;border:0;border-radius:8px;font:inherit}</style><h1>Confirmação de leitura</h1>'+body+'<p><a href="https://educaplayja.com.br/envio-gmail-planilha/privacidade/index.html">Política de privacidade</a></p></html>';
  router.get('/gmail-avisos/health',wrap(async(req,res)=>{await store.cleanup();res.json({ok:true,service:'gmail-avisos',retentionDays:90});}));
  router.post('/v1/register',wrap(async(req,res)=>{
    const reference=req.body?.reference;
    if(typeof reference!=='string'||!/^[a-f0-9-]{36}:[a-f0-9-]{36}$/.test(reference))return res.status(400).json({error:'Referência inválida.'});
    res.status(201).json({token:await store.register(reference)});
  }));
  router.post('/v1/events',wrap(async(req,res)=>{
    const tokens=req.body?.tokens;
    if(!Array.isArray(tokens)||tokens.length>200||tokens.some(t=>typeof t!=='string'||!TOKEN.test(t)))return res.status(400).json({error:'Tokens inválidos.'});
    res.json({events:await store.events(tokens)});
  }));
  router.get('/pixel/:token.gif',wrap(async(req,res)=>{if(req.method!=='HEAD')await store.mark(req.params.token,'openedAt');res.type('gif').send(PIXEL);}));
  router.get('/confirm/:token',wrap(async(req,res)=>{
    if(!await store.find(req.params.token))return res.status(404).type('html').send(page('<p>Link indisponível ou expirado.</p>'));
    res.type('html').send(page('<p>Ao pressionar o botão, você informa ao remetente que leu a mensagem. Não é necessário fazer login.</p><form method="post"><button type="submit">Confirmar que li a mensagem</button></form>'));
  }));
  router.post('/confirm/:token',wrap(async(req,res)=>{
    if(!await store.find(req.params.token))return res.status(404).type('html').send(page('<p>Link indisponível ou expirado.</p>'));
    await store.mark(req.params.token,'confirmedAt');res.type('html').send(page('<p>Confirmação registrada. Você pode fechar esta página.</p>'));
  }));
  router.use((req,res)=>res.status(405).json({error:'Método não permitido.'}));
  router.use((err,req,res,next)=>{res.status(err.status===413?413:err instanceof SyntaxError?400:503).json({error:'Não foi possível processar a operação.'});});
  return router;
}
function mount(app) {
  const {prisma}=require('./config/database');
  const keyHash=process.env.GMAIL_TRACKER_KEY_HASH||require('./gmail-tracker-key-hash.json').sha256;
  const store=createStore(prisma);
  app.use(createRouter({store,keyHash}));
  const cleanup=()=>store.cleanup().catch(()=>console.error('Gmail tracker: cleanup unavailable'));
  const timer=setInterval(cleanup,3600000);timer.unref();
}
module.exports={createRouter,createStore,mount};
