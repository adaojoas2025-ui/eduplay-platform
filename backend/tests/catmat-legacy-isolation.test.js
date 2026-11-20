const test=require('node:test');const assert=require('node:assert/strict');const Module=require('node:module');const path=require('node:path');
test('endpoints legados não autorizam chave CMT em outra extensão',async()=>{
  const original=Module._load;let delegated=0;
  Module._load=function(request,parent,main){if(request==='../services/license.service')return new Proxy({},{get:()=>async()=>{delegated++;return{valid:true};}});if(request==='../utils/logger')return{error(){}};return original.call(this,request,parent,main);};
  let controller;try{const file=path.resolve(__dirname,'../src/controllers/licenseController.js');delete require.cache[require.resolve(file)];controller=require(file);}finally{Module._load=original;}
  for(const action of ['activate','validate','heartbeat','logout']){let status,result;const res={status:n=>{status=n;return res;},json:v=>{result=v;}};await controller[action]({body:{licenseKey:'CMT-AAAA-BBBB-CCCC-DDDD',deviceId:'account'}},res);assert.equal(status,403);assert.equal(result.reason,'wrong_product');}
  assert.equal(delegated,0);
});
