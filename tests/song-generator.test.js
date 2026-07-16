const fs=require('fs'),vm=require('vm'),assert=require('assert');
const context={window:{},document:{},localStorage:{getItem:()=>null,setItem:()=>{}},navigator:{clipboard:{writeText:()=>{}}},alert:()=>{},Event:function(){},Blob:function(){},URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},Date,JSON,Math,String,Number,Array,Object,Set};
vm.createContext(context);vm.runInContext(fs.readFileSync('js/song-generator.js','utf8'),context);
const generate=context.window.generateSongContent;assert(generate,'generateSongContent fehlt');
const hardstyle=generate({title:'Neonherz',themes:['Gaming'],genres:['Hardstyle'],moods:['Episch'],vocals:['Weiblich'],styles:['Futuristisch'],languages:['Deutsch'],instruments:['Synth'],tempo:['150 BPM'],scenes:['Cyberpunk-Stadt'],soundEffects:['Gewitter']});
assert.equal(hardstyle.title,'Neonherz');assert(hardstyle.lyrics.includes('[Spoken Intro]'));assert(hardstyle.lyrics.includes('[Build-up]'));assert(hardstyle.lyrics.includes('[Final Drop]'));assert(hardstyle.lyrics.includes('Gaming'));assert(hardstyle.lyrics.includes('Cyberpunk-Stadt'));assert(hardstyle.lyrics.includes('Synth'));assert(!/Hier erscheint|später dein Songtext/i.test(hardstyle.lyrics));assert(hardstyle.stylePrompt.includes('150 BPM'));assert(hardstyle.coverPrompt.includes('Gaming'));
const rap=generate({title:'Meine Stadt',themes:['Berlin'],genres:['Deutschrap'],moods:['Motivierend'],vocals:['Rap'],languages:['Deutsch'],instruments:['Piano'],tempo:['90 BPM'],scenes:['Großstadt bei Nacht'],soundEffects:['Regen']});
for(const section of ['[Intro]','[Verse 1]','[Hook]','[Verse 2]','[Bridge]','[Final Hook]','[Outro]'])assert(rap.lyrics.includes(section),section+' fehlt');
console.log('OK full-song-lyrics genre-structures selections prompts');
