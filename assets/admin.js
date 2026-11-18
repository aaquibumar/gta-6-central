const $=s=>document.querySelector(s);
let content={};
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function validHttpUrl(s){if(!s)return true;try{return ["http:","https:"].includes(new URL(s).protocol)}catch{return false}}
async function load(){try{const local=localStorage.getItem("gta6central-local-content");if(local)content=JSON.parse(local);else{const r=await fetch("data/content.json");content=await r.json();}}catch(e){$("#jsonMsg").textContent="Could not load content.json. Use the Import button.";content={};}$("#jsonEditor").value=JSON.stringify(content,null,2);}
function save(){localStorage.setItem("gta6central-local-content",JSON.stringify(content));$("#jsonEditor").value=JSON.stringify(content,null,2);}
$("#addEntry").addEventListener("click",()=>{
 const type=$("#kind").value,title=$("#title").value.trim(),category=$("#category").value.trim(),status=$("#status").value.trim()||"Needs verification",summary=$("#summary").value.trim(),source=$("#source").value.trim(),date=$("#date").value,platform=$("#platform").value.trim(),code=$("#code").value.trim();
 if(!title||!summary){$("#formMsg").textContent="Title and summary are required.";return;}
 if(!validHttpUrl(source)){$("#formMsg").textContent="Source must be an http(s) URL.";return;}
 if(!Array.isArray(content[type]))content[type]=[];
 const row={id:(type+"-"+Date.now()),title,category,status,summary};
 if(type==="cheats"){row.name=title;row.effect=summary;row.platform=platform;row.code=status==="Verified"?code:"";row.notes=summary;row.sourceUrl=source;}
 else if(type==="vehicles"){row.name=title;row.type=platform||"Vehicle";row.class=category;row.specs=summary;row.imageUrl="";row.sourceUrl=source;}
 else if(type==="news"){row.source=platform||"Publisher";row.date=date||new Date().toISOString().slice(0,10);row.url=source;row.official=/rockstargames\.com$/i.test(new URL(source).hostname);}
 else {row.body=summary;row.sourceUrl=source;}
 content[type].unshift(row);save();$("#formMsg").textContent="Entry added and saved in this browser.";
 ["title","category","summary","source","date","platform","code"].forEach(id=>$("#"+id).value="");
});
$("#validateSave").addEventListener("click",()=>{try{const parsed=JSON.parse($("#jsonEditor").value);if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Root must be a JSON object.");content=parsed;save();$("#jsonMsg").textContent="Valid JSON saved locally.";}catch(e){$("#jsonMsg").textContent="JSON error: "+e.message;}});
$("#exportJson").addEventListener("click",()=>{try{const parsed=JSON.parse($("#jsonEditor").value);const blob=new Blob([JSON.stringify(parsed,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="content.json";a.click();URL.revokeObjectURL(url);$("#jsonMsg").textContent="Export created. Replace data/content.json in GitHub.";}catch(e){$("#jsonMsg").textContent="Fix JSON before exporting."; }});
$("#resetLocal").addEventListener("click",()=>{localStorage.removeItem("gta6central-local-content");location.reload();});
$("#importJson").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const parsed=JSON.parse(await f.text());if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Root must be an object");content=parsed;save();$("#jsonMsg").textContent="Imported and saved locally.";}catch(err){$("#jsonMsg").textContent="Import failed: "+err.message;}e.target.value="";});
load();
