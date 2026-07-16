const fs=require('fs'),vm=require('vm'),assert=require('assert');
const state={shop:{currency:'EUR',monthlyPrice:6.5,yearlyPrice:65,trialDays:14,benefits:['Testvorteil']}};
const context={window:{},localStorage:{getItem:key=>key==='songCreator.adminControl.v1'?JSON.stringify(state):null},JSON,Object};
vm.createContext(context);vm.runInContext(fs.readFileSync('js/shop-config.js','utf8'),context);
const config=context.window.ShopConfig.get();
assert.equal(config.monthlyPrice,6.5);assert.equal(config.yearlyPrice,65);assert.equal(config.trialDays,14);assert.deepEqual([...config.benefits],['Testvorteil']);
assert.equal(config.monthlyTrialDays,14);assert.equal(config.yearlyTrialDays,14);
console.log('OK central-shop-configuration');
