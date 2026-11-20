const test=require('node:test');
const assert=require('node:assert/strict');
const Module=require('node:module');
const path=require('node:path');
function setup(){
  const routes=[],preferences=[]; const router={get:(url,...handlers)=>routes.push({method:'get',url,handlers}),post:(url,...handlers)=>routes.push({method:'post',url,handlers})};
  const auth=()=>{},admin=()=>{}; const original=Module._load;
  Module._load=function(request,parent,main){
    if(request==='express')return{Router:()=>router};
    if(request==='../api/middlewares/auth.middleware')return{authenticate:auth,isAdmin:admin};
    if(request==='../services/license.service')return{};
    if(request==='../config/mercadopago')return{createPreference:async p=>{preferences.push(p);return{id:'pref',init_point:'https://www.mercadopago.com.br/checkout/test'};}};
    if(request==='../config/env')return{frontend:{url:'https://educaplayja.com.br'},backend:{url:'https://eduplay-platform.onrender.com'}};
    if(request==='../utils/logger')return{error(){}};
    return original.call(this,request,parent,main);
  };
  try{const target=path.resolve(__dirname,'../src/routes/cacador-catmat.js');delete require.cache[require.resolve(target)];require(target);}finally{Module._load=original;}
  async function post(body){let data,code=200;const res={status:n=>{code=n;return res;},json:v=>{data=v;return res;}};await routes.find(r=>r.url==='/checkout').handlers.at(-1)({body,path:'/checkout'},res);return{data,code};}
  return{routes,preferences,post,auth,admin};
}
test('checkout ignora preço e prefixo enviados pelo cliente e usa plano CMT',async()=>{
  const x=setup();const r=await x.post({plan:'monthly',email:'cliente@example.com',deviceId:'same-account',price:0.01,license_prefix:'IRP'});
  assert.equal(r.code,200);assert.equal(x.preferences[0].items[0].unit_price,9.99);
  assert.equal(x.preferences[0].metadata.license_prefix,'CMT');assert.equal(x.preferences[0].metadata.product_type,'catmat_license');assert.equal(x.preferences[0].metadata.device_id,'same-account');
  assert.ok(x.preferences[0].notification_url.startsWith('https://eduplay-platform.onrender.com/'));
});
test('checkout rejeita plano inválido e e-mail ausente antes de chamar Mercado Pago',async()=>{
  const x=setup();for(const plan of ['constructor','__proto__','weekly'])assert.equal((await x.post({plan,email:'cliente@example.com'})).code,400);
  assert.equal((await x.post({plan:'monthly'})).code,400);assert.equal(x.preferences.length,0);
});
test('listagens e ações de gestão exigem autenticação e perfil ADMIN',()=>{
  const x=setup();for(const route of x.routes.filter(r=>r.url.startsWith('/admin/'))){assert.equal(route.handlers[0],x.auth);assert.equal(route.handlers[1],x.admin);}
  assert.equal(x.routes.filter(r=>r.url.startsWith('/admin/')).length,3);
});
