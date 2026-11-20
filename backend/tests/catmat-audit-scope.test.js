const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
function service(calls) {
  const original = Module._load;
  Module._load = function(request, parent, main) {
    if(request==='../config/database')return{prisma:{$executeRawUnsafe:async()=>1,$queryRawUnsafe:async(sql,...params)=>{calls.push({sql,params});return sql.startsWith('SELECT COUNT(*)::int AS count')?[{count:0}]:[];}}};
    if(request==='../utils/logger')return{warn(){},info(){},error(){}};
    if(request==='./email.service')return{};
    return original.call(this,request,parent,main);
  };
  try{const file=path.resolve(__dirname,'../src/services/license.service.js');delete require.cache[require.resolve(file)];return require(file);}finally{Module._load=original;}
}
test('filtro CMT inclui usos sem chave do próprio produto e não mistura IRP',async()=>{
  const calls=[];const svc=service(calls);await svc.listLicenseAttempts({prefix:'CMT',email:'cliente@example.com'});
  for(const c of calls){assert.ok(!c.sql.includes('\\'));assert.match(c.sql,/"productPrefix" = 'CMT'/);assert.ok(c.params.includes('CMT-%'));assert.ok(!c.params.includes('IRP-%'));}
});
test('filtro IRP mantém a condição de recuperação antiga sem incluir CMT',async()=>{
  const calls=[];const svc=service(calls);await svc.listLicenseAttempts({prefix:'IRP'});
  for(const c of calls){assert.ok(!c.sql.includes('\\'));assert.match(c.sql,/"action" = 'sync'/);assert.ok(c.params.includes('IRP-%'));assert.ok(!c.sql.includes("'CMT'"));}
});
