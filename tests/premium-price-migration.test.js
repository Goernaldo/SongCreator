const fs=require('fs'),vm=require('vm'),assert=require('assert');
function run(shop){const old={version:2,users:[{username:'GörnaldoBerlin',role:'Owner',premium:true}],roles:[],logs:[],backups:[],shop};const map=new Map([['songCreator.adminControl.v1',JSON.stringify(old)],['username','GörnaldoBerlin'],['role','Owner']]);const context={window:{},localStorage:{getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v))},console,Date,Math,JSON,Set,Boolean,Number,String,Array,Object,Error};vm.createContext(context);vm.runInContext(fs.readFileSync('js/admin-core.js','utf8'),context);return context.window.AdminCore.snapshot().shop}
const migrated=run({monthlyPrice:4.99,yearlyPrice:49.99,trialDays:29});
assert.equal(migrated.monthlyPrice,9.99);assert.equal(migrated.yearlyPrice,89.99);assert.equal(migrated.trialDays,3);
assert.equal(migrated.monthlyTrialDays,3);assert.equal(migrated.yearlyTrialDays,7);
const custom=run({monthlyPrice:7.5,yearlyPrice:70,trialDays:10});
assert.equal(custom.monthlyPrice,7.5);assert.equal(custom.yearlyPrice,70);assert.equal(custom.trialDays,10);
assert.equal(custom.monthlyTrialDays,10);assert.equal(custom.yearlyTrialDays,10);
console.log('OK premium-default-migration custom-values-preserved');
