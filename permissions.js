(function(){
'use strict';
let lastReport=null;
const clone=v=>JSON.parse(JSON.stringify(v)),unique=a=>[...new Set(a.filter(Boolean))];
function clean(item){const parsed=SongAdmin.cleanContentName(item.name);return{...item,cleanName:parsed.name,premium:Boolean(item.premium||parsed.premium||item.tier==='premium'),exclusive:Boolean(item.exclusive||parsed.exclusive||item.tier==='exclusive')}}
function score(item){const dirty=SongAdmin.cleanContentName(item.name).name!==String(item.name).trim();return(dirty?100:0)+String(item.name).length+(item.name===item.name.toLocaleLowerCase('de')?20:0)}
function scan(){
 const groups=[];
 SongAdmin.categories().forEach(category=>{
  const map=new Map();
  category.items.forEach(raw=>{const item=clean(raw),key=`${item.parentId||'root'}::${SongAdmin.contentNameKey(item.cleanName)}`;if(!map.has(key))map.set(key,[]);map.get(key).push(item)});
  map.forEach(items=>{
   const dirty=items.some(i=>i.cleanName!==String(i.name).trim()),statusConflict=items.some(i=>i.premium&&i.exclusive);
   if(items.length>1||dirty||statusConflict){const keeper=[...items].sort((a,b)=>score(a)-score(b))[0],premium=items.some(i=>i.premium),exclusive=items.some(i=>i.exclusive);groups.push({id:`${category.key}:${keeper.id}`,categoryKey:category.key,categoryLabel:category.label,parentId:keeper.parentId||null,items,keeperId:keeper.id,result:{name:keeper.cleanName,premium,exclusive,active:items.some(i=>i.active)},safe:!(premium&&exclusive),conflict:premium&&exclusive?'Premium und Exklusiv sind gemeinsam aktiv. Bitte fachlich prüfen.':null})}
  });
 });
 lastReport={createdAt:new Date().toISOString(),groups,detectedGroups:groups.length,duplicateRecords:groups.reduce((n,g)=>n+Math.max(0,g.items.length-1),0),conflicts:groups.filter(g=>g.conflict)};return clone(lastReport);
}
function makeBackup(){const snapshot={createdAt:new Date().toISOString(),entries:{}};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key||key.startsWith('songCreator.contentCleanup.backup.'))continue;const raw=localStorage.getItem(key);try{JSON.parse(raw);snapshot.entries[key]=raw}catch(_){}}const storageKey=`songCreator.contentCleanup.backup.${Date.now()}`;localStorage.setItem(storageKey,JSON.stringify(snapshot));return storageKey}
function deepReplace(value,mapping,stats){if(typeof value==='string'&&mapping[value]){stats.references++;return mapping[value]}if(Array.isArray(value))return value.map(v=>deepReplace(v,mapping,stats));if(value&&typeof value==='object')Object.keys(value).forEach(k=>value[k]=deepReplace(value[k],mapping,stats));return value}
function migrateReferences(mapping){const stats={references:0,keys:[]};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key||key.startsWith('songCreator.contentCleanup.backup.'))continue;const raw=localStorage.getItem(key);try{const parsed=JSON.parse(raw),before=JSON.stringify(parsed),after=JSON.stringify(deepReplace(parsed,mapping,stats));if(after!==before){localStorage.setItem(key,after);stats.keys.push(key)}}catch(_){}}return stats}
function mergeGroup(groupId,confirmExclusivePremium=false){const report=lastReport||scan(),group=report.groups.find(g=>g.id===groupId);if(!group)throw Error('Dublettengruppe nicht gefunden.');const backupKey=makeBackup(),category=SongAdmin.category(group.categoryKey),ids=new Set(group.items.map(i=>i.id)),keeper=group.items.find(i=>i.id===group.keeperId)||group.items[0],premium=group.result.exclusive&&!confirmExclusivePremium?false:group.result.premium,exclusive=group.result.exclusive;const merged={...keeper,name:group.result.name,premium,exclusive,active:group.result.active,tier:exclusive?'exclusive':premium?'premium':'normal',roles:unique(group.items.flatMap(i=>i.roles||[])),allowedUsers:unique(group.items.flatMap(i=>i.allowedUsers||[])),usageCount:group.items.reduce((n,i)=>n+Number(i.usageCount||i.uses||0),0),favoriteCount:group.items.reduce((n,i)=>n+Number(i.favoriteCount||0),0)};const mapping={};group.items.forEach(i=>{if(i.id!==merged.id)mapping[i.id]=merged.id});const next=category.items.filter(i=>!ids.has(i.id));next.push(merged);SongAdmin.replaceItems(group.categoryKey,next);const refs=migrateReferences(mapping);const result={backupKey,groupId,keptId:merged.id,removedIds:Object.keys(mapping),migratedReferences:refs.references,affectedKeys:refs.keys};lastReport=null;return result}
function mergeSafe(){const report=lastReport||scan(),results=[];report.groups.filter(g=>g.safe).forEach(group=>{if(!lastReport)scan();results.push(mergeGroup(group.id,false));if(results.length<report.groups.length)scan()});return results}
function findDuplicate(categoryKey,name,parentId=null){const key=SongAdmin.contentNameKey(name);return SongAdmin.category(categoryKey)?.items.find(i=>(i.parentId||null)===(parentId||null)&&SongAdmin.contentNameKey(i.name)===key)||null}
function exportReport(){return JSON.stringify(lastReport||scan(),null,2)}
window.ContentCleaner=Object.freeze({scan,mergeGroup,mergeSafe,findDuplicate,makeBackup,exportReport,getLastReport:()=>clone(lastReport)});
}());
