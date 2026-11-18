const $ = (s, r=document) => r.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl = value => { try { const u = new URL(value, location.href); return ["http:","https:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } };
const BASE_PATH = location.pathname.includes("/gta-6-central/") ? "/gta-6-central/" : "./";
let data = null;
async function loadData(){
  let base = {};
  try { const r = await fetch("data/content.json"); if(!r.ok) throw new Error("content fetch failed"); base = await r.json(); }
  catch(e){ console.warn("Using embedded fallback data is not supported when opened as file://. Serve this folder locally or use GitHub Pages.", e); }
  try { const local = localStorage.getItem("gta6central-local-content"); if(local) base = {...base, ...JSON.parse(local)}; } catch(e){ console.warn("Local content override could not be read."); }
  data = base;
  renderAll();
}
function cardLink(url,label="SOURCE ↗"){const link=safeUrl(url);return link?`<a class="textlink" href="${esc(link)}" target="_blank" rel="noopener">${label}</a>`:"";}
function renderCheats(){
 const q=($("#cheatSearch")?.value||"").toLowerCase(), active=$("#cheatFilters .active")?.dataset.filter||"All";
 const rows=(data.cheats||[]).filter(x=>(active==="All"||x.category===active)&&[x.name,x.category,x.effect,x.notes].join(" ").toLowerCase().includes(q));
 $("#cheatGrid").innerHTML=rows.length?rows.map(x=>`<article class="card"><div class="cardtop"><span class="tag">${esc(x.category)}</span><span class="status ${x.status==="Verified"?"ok":""}">${esc(x.status||"Unverified")}</span></div><h3>${esc(x.name)}</h3><p>${esc(x.effect||"Cheat reference")}</p><div class="meta">${esc(x.platform||"Platform not specified")}<br>${x.code?`<b>Input:</b> ${esc(x.code)}`:"No confirmed input listed"}</div><p style="margin-top:10px">${esc(x.notes||"")}</p><div class="links">${cardLink(x.sourceUrl)}</div></article>`).join(""):'<div class="empty">No matching cheat references.</div>';
}
function renderCharacters(){
 const q=($("#characterSearch")?.value||"").toLowerCase();
 const rows=(data.characters||[]).filter(x=>[x.name,x.role,x.summary].join(" ").toLowerCase().includes(q));
 $("#characterGrid").innerHTML=rows.length?rows.map((x,i)=>`<article class="card character-card"><div class="cardtop"><span class="tag">${esc(x.role)}</span><span class="status ok">${esc(x.status||"Profile")}</span></div><h3>${esc(x.name)}</h3><p>${esc(x.summary)}</p><div class="links">${cardLink(x.sourceUrl,"OFFICIAL PROFILE ↗")}</div></article>`).join(""):'<div class="empty">No matching character.</div>';
}
function renderVehicles(){
 const q=($("#vehicleSearch")?.value||"").toLowerCase(), type=$("#vehicleType")?.value||"All";
 const rows=(data.vehicles||[]).filter(x=>(type==="All"||x.type===type)&&[x.name,x.type,x.class,x.specs].join(" ").toLowerCase().includes(q));
 const icons={Car:"🚘",Motorcycle:"🏍️",Boat:"🚤","Off-road":"🚙",Aircraft:"🚁"};
 $("#vehicleGrid").innerHTML=rows.length?rows.map(x=>`<article class="card"><div class="cardtop"><span class="tag">${esc(x.type||"Vehicle")}</span><span class="status">${esc(x.status||"Unverified")}</span></div>${x.imageUrl&&safeUrl(x.imageUrl)?`<img class="vehicle-pic" src="${esc(safeUrl(x.imageUrl))}" alt="${esc(x.name)}" loading="lazy">`:`<div class="vehicle-icon">${icons[x.type]||"🚗"}</div>`}<h3>${esc(x.name)}</h3><p>${esc(x.class||"Class not confirmed")}</p><div class="meta">${esc(x.specs||"Performance details not tested.")}</div><div class="links">${cardLink(x.sourceUrl)}</div></article>`).join(""):'<div class="empty">No matching vehicles.</div>';
}
function renderRegions(){
 const rows=data.regions||[];
 $("#regionNodes").innerHTML=rows.map((x,i)=>`<button class="region-node ${i===0?"active":""}" data-region="${esc(x.id)}"><strong>${esc(x.name)}</strong><small>${esc(x.kind)}</small></button>`).join("");
 const select=id=>{const x=rows.find(z=>z.id===id)||rows[0];if(!x)return;$("#regionNodes").querySelectorAll(".region-node").forEach(b=>b.classList.toggle("active",b.dataset.region===x.id));$("#regionDetail").innerHTML=`<span class="status ok">${esc(x.status||"Region note")}</span><h3>${esc(x.name)}</h3><p>${esc(x.summary)}</p><p class="smallnote">Map pins and exact coordinates: awaiting in-game verification.</p><a class="textlink" href="https://www.rockstargames.com/VI/only-in-leonida" target="_blank" rel="noopener">ROCKSTAR: PEOPLE & PLACES ↗</a>`;};
 $("#regionNodes").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>select(b.dataset.region)));
 if(rows[0])select(rows[0].id);
}
function renderGeneric(target, rows, mode){
 const container=$(target);
 if(!container)return;
 if(!rows?.length){container.innerHTML='<div class="empty">No entries yet. Add items through the content admin.</div>';return;}
 container.innerHTML=rows.map(x=>`<article class="card"><div class="cardtop"><span class="tag">${esc(x.category||mode)}</span><span class="status">${esc(x.status||"Reference")}</span></div><h3>${esc(x.title||x.name)}</h3><p>${esc(x.summary||x.effect||"")}</p>${x.body?`<div class="meta">${esc(x.body)}</div>`:""}${x.date?`<div class="meta">${esc(x.date)} · ${esc(x.source||"Source")}</div>`:""}<div class="links">${cardLink(x.url||x.sourceUrl,mode==="news"?"READ SOURCE ↗":"DETAILS / SOURCE ↗")}</div></article>`).join("");
}
async function renderNews(){
 let news = data.news||[];
 try {const r=await fetch("data/news.json",{cache:"no-store"});if(r.ok){const j=await r.json();if(j.items?.length)news=[...j.items,...news];$("#newsUpdated").textContent=j.updatedAt?`FEED CHECKED ${new Date(j.updatedAt).toLocaleDateString()}`:"NEWS FEED";}}catch(e){$("#newsUpdated").textContent="CURATED FEED";}
 const seen=new Set();news=[...news].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).filter(x=>{const k=x.url||x.title;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,9);
 $("#newsGrid").innerHTML=news.length?news.map(x=>`<article class="card"><div class="cardtop"><span class="tag">${esc(x.official?"ROCKSTAR OFFICIAL":"GAMING COVERAGE")}</span><span class="news-date">${esc(x.date||"Date unavailable")}</span></div><h3>${esc(x.title)}</h3><p>${esc(x.summary||"Open the source for details.")}</p><div class="meta">${esc(x.source||"Publisher")}</div><div class="links">${cardLink(x.url,"OPEN ARTICLE ↗")}</div></article>`).join(""):'<div class="empty">No current news items. Check the official Rockstar Newswire.</div>';
}
function renderAll(){
 renderCheats();renderCharacters();renderVehicles();renderRegions();
 renderGeneric("#guideGrid",data.guides,"guide");renderGeneric("#missionGrid",data.missions,"mission");renderGeneric("#eggGrid",data.easterEggs,"discovery");renderNews();
 $("#year").textContent=new Date().getFullYear();
}
$("#cheatSearch")?.addEventListener("input",renderCheats);
$("#cheatFilters")?.addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;$("#cheatFilters").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderCheats();});
$("#characterSearch")?.addEventListener("input",renderCharacters);
$("#vehicleSearch")?.addEventListener("input",renderVehicles);
$("#vehicleType")?.addEventListener("change",renderVehicles);
$("#menuBtn")?.addEventListener("click",()=>$("#nav").classList.toggle("open"));
$("#nav")?.addEventListener("click",e=>{if(e.target.closest("a"))$("#nav").classList.remove("open");});
if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(()=>{});
loadData();
