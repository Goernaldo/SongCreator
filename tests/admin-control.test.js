const fs=require('fs'),vm=require('vm'),assert=require('assert');
const values=new Map([
  ['users',JSON.stringify([{username:'Testnutzer',email:'test@example.de',role:'Benutzer'}])],
  ['themes',JSON.stringify([{name:'Legacy Theme'}])],
  ['username','GörnaldoBerlin'],['role','Owner']
]);
const localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
const context={window:{},localStorage,console,Date,Math,JSON,Set,Boolean,Number,String,Array,Object,Error};
vm.createContext(context);vm.runInContext(fs.readFileSync('js/admin-core.js','utf8'),context);
const core=context.window.AdminCore;
assert(core,'AdminCore fehlt');
assert.equal(JSON.parse(values.get('users'))[0].username,'Testnutzer','Legacy-Benutzer wurden überschrieben');
assert.equal(JSON.parse(values.get('themes'))[0].name,'Legacy Theme','Legacy-Themes wurden überschrieben');
let state=core.snapshot();
assert(state.users.some(u=>u.username==='Testnutzer'),'Legacy-Benutzer nicht migriert');
assert(state.users.some(u=>u.username==='GörnaldoBerlin'&&u.role==='Owner'),'Owner fehlt');
assert.throws(()=>core.deleteUser('GörnaldoBerlin'),/geschützt/,'Owner ließ sich löschen');
assert.throws(()=>core.updateUser('GörnaldoBerlin',{banned:true}),/geschützt/,'Owner ließ sich sperren');
assert.throws(()=>core.updateUser('Testnutzer',{role:'Owner'},'Administrator'),/Nur der Owner/,'Administrator konnte Owner vergeben');
const role=core.createRole('Redaktion',['admin_access','manage_content']);
assert(core.snapshot().roles.some(r=>r.id===role.id),'Rolle wurde nicht erstellt');
const backup=core.createBackup();core.setSection('settings',{title:'Geändert'});core.restoreBackup(backup);
state=core.snapshot();
assert.equal(state.settings.title,'Song Creator','Backup wurde nicht wiederhergestellt');
assert(state.users.some(u=>u.username==='GörnaldoBerlin'&&u.role==='Owner'),'Owner ging beim Restore verloren');
assert(state.roles.find(r=>r.name==='Owner').permissions.length===core.PERMISSIONS.length,'Owner-Rechte gingen verloren');
console.log('OK migration legacy-preservation owner-protection roles backup-restore');
