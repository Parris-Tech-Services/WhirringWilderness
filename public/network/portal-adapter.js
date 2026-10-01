/* Parris Multiverse portal adapter v2.2
 * Cross-app tabs are opt-in per app so they never cover game controls by default.
 */
const PortalAdapter=(()=>{
  const HUB="https://parris-tech-services.github.io/WhirringWilderness/network/portal.html";
  const REGISTRY="https://parris-tech-services.github.io/WhirringWilderness/network/portal-registry.json";
  const NETWORK_SCRIPT="https://parris-tech-services.github.io/WhirringWilderness/network/parris-network.js";
  const SETTINGS_PARAM="parris-settings";
  let GAME_ID="unknown";

  const prefKey=(name)=>`parris-ui:${GAME_ID}:${name}`;
  function getPref(name,defaultValue){
    try{
      const value=localStorage.getItem(prefKey(name));
      if(value===null)return defaultValue;
      return value==="true";
    }catch{return defaultValue}
  }
  function setPref(name,value){
    try{localStorage.setItem(prefKey(name),String(!!value))}catch{}
    document.dispatchEvent(new CustomEvent("parris-ui:preferences-changed",{detail:{appId:GAME_ID,name,value:!!value}}));
  }
  const networkTabsEnabled=()=>getPref("network-tabs",false);
  const podcastsEnabled=()=>getPref("podcasts",true);

  function settingsUrl(){
    const u=new URL(location.href);
    u.searchParams.set(SETTINGS_PARAM,"1");
    u.searchParams.delete("portal");
    u.searchParams.delete("from");
    return u.href;
  }
  function returnUrl(){
    const u=new URL(location.href);
    u.searchParams.delete(SETTINGS_PARAM);
    return u.href;
  }
  function openSettings(){location.href=settingsUrl()}

  function loadNetwork(){
    if(!networkTabsEnabled())return;
    if(document.querySelector('script[data-parris-network]'))return;
    const s=document.createElement("script");
    s.src=NETWORK_SCRIPT;s.async=true;s.dataset.parrisNetwork="true";s.dataset.appId=GAME_ID;
    (document.head||document.documentElement).appendChild(s);
  }

  function showArrival(){
    const u=new URL(location.href);
    if(!u.searchParams.get("portal"))return;
    const from=u.searchParams.get("from")||"another world";
    const box=document.createElement("div");
    box.textContent="⬡ You arrived from "+from.replace(/-/g," ");
    Object.assign(box.style,{position:"fixed",top:"12px",left:"50%",transform:"translateX(-50%)",zIndex:"2147483645",padding:"10px 14px",borderRadius:"999px",border:"1px solid rgba(167,139,250,.5)",background:"rgba(10,5,25,.94)",color:"#ede9fe",font:"italic 14px Georgia,serif",boxShadow:"0 10px 30px #0008",maxWidth:"90vw"});
    document.body.appendChild(box);setTimeout(()=>box.remove(),5000);
    u.searchParams.delete("portal");u.searchParams.delete("from");
    history.replaceState({},"",u.pathname+(u.searchParams.toString()?"?"+u.searchParams.toString():"")+u.hash);
  }

  function trigger(dest){
    location.href=HUB+"?from="+encodeURIComponent(GAME_ID)+"&to="+encodeURIComponent(dest);
  }

  function renderLink(dest,container,label){
    const b=document.createElement("button");b.type="button";
    b.textContent="⬡ "+(label||dest.replace(/-/g," "));
    Object.assign(b.style,{display:"block",width:"100%",textAlign:"left",margin:"6px 0",padding:"10px 12px",border:"1px solid rgba(167,139,250,.35)",borderRadius:"10px",background:"rgba(30,20,60,.9)",color:"#ede9fe",cursor:"pointer",font:"600 13px system-ui"});
    b.addEventListener("click",()=>trigger(dest));container?.appendChild(b);return b;
  }

  async function mountPortalMenu(){
    if(!networkTabsEnabled())return;
    if(document.getElementById("parris-portal-launcher")||GAME_ID==="unknown")return;
    let registry={};
    try{
      const r=await fetch(REGISTRY,{cache:"no-store"});
      if(!r.ok)return;
      registry=await r.json();
    }catch{return}
    const world=registry[GAME_ID];
    if(!world?.portals?.length)return;

    const launcher=document.createElement("button");
    launcher.id="parris-portal-launcher";
    launcher.type="button";
    launcher.textContent="⬡ Portals";
    launcher.setAttribute("aria-label","Open cross-game portals");
    // Keep the launcher above podcast controls if both are enabled.
    Object.assign(launcher.style,{position:"fixed",left:"12px",bottom:"72px",zIndex:"2147483646",padding:"9px 12px",borderRadius:"999px",border:"1px solid rgba(167,139,250,.45)",background:"rgba(24,12,48,.94)",color:"#ede9fe",font:"600 12px system-ui",cursor:"pointer",boxShadow:"0 8px 30px #0006"});

    const panel=document.createElement("div");
    panel.id="parris-portal-panel";
    panel.hidden=true;
    Object.assign(panel.style,{position:"fixed",left:"12px",bottom:"118px",zIndex:"2147483646",width:"min(320px,calc(100vw - 24px))",maxHeight:"60vh",overflow:"auto",padding:"14px",borderRadius:"16px",border:"1px solid rgba(167,139,250,.35)",background:"rgba(10,5,25,.97)",color:"#ede9fe",boxShadow:"0 18px 50px #0009",font:"13px system-ui"});
    const title=document.createElement("div");title.textContent="Cross from "+world.label;Object.assign(title.style,{fontWeight:"800",marginBottom:"8px"});
    panel.appendChild(title);
    world.portals.forEach(route=>renderLink(route.to,panel,registry[route.to]?.label||route.to));

    const links=document.createElement("div");
    Object.assign(links.style,{display:"grid",gap:"6px",marginTop:"10px"});
    const network=document.createElement("a");network.href="https://parris-tech-services.github.io/WhirringWilderness/network/";network.textContent="View all games & apps →";
    const settings=document.createElement("a");settings.href=settingsUrl();settings.textContent="Interface settings →";
    [network,settings].forEach(a=>Object.assign(a.style,{display:"block",color:"#67e8f9",textDecoration:"none",fontWeight:"700"}));
    links.append(network,settings);panel.appendChild(links);

    launcher.addEventListener("click",()=>{panel.hidden=!panel.hidden});
    document.body.append(panel,launcher);
  }

  function prettyAppName(){
    return GAME_ID.split("-").filter(Boolean).map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(" ")||"This app";
  }

  function renderSettingsPage(){
    if(new URL(location.href).searchParams.get(SETTINGS_PARAM)!=="1")return false;
    document.title=prettyAppName()+" · Interface settings";
    const style=document.createElement("style");
    style.textContent=`
      html{color-scheme:dark;background:#090d16}
      body{margin:0;min-height:100vh;background:radial-gradient(circle at 20% 0,#172554 0,transparent 34%),#090d16;color:#f8fafc;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
      .parris-settings{max-width:720px;margin:auto;padding:28px 18px 64px}
      .parris-settings-card{background:rgba(15,23,42,.93);border:1px solid #334155;border-radius:22px;padding:22px;box-shadow:0 24px 70px #0007}
      .parris-settings h1{font-size:clamp(30px,8vw,48px);line-height:1.05;margin:4px 0 10px}
      .parris-settings .eyebrow{color:#67e8f9;text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:800}
      .parris-settings .intro{color:#cbd5e1;margin:0 0 22px}
      .parris-setting{display:flex;gap:14px;align-items:flex-start;padding:16px 0;border-top:1px solid #253247}
      .parris-setting input{width:22px;height:22px;margin-top:2px;accent-color:#8b5cf6;flex:0 0 auto}
      .parris-setting strong{display:block}
      .parris-setting small{display:block;color:#94a3b8;margin-top:3px}
      .parris-settings-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
      .parris-settings-actions a,.parris-settings-actions button{border:1px solid #475569;border-radius:999px;padding:10px 14px;background:#111827;color:#fff;font:700 14px/1.2 system-ui;text-decoration:none;cursor:pointer}
      .parris-settings-actions .primary{background:#7c3aed;border-color:#7c3aed}
      .parris-settings-note{margin-top:16px;color:#94a3b8;font-size:13px}
    `;
    document.head.appendChild(style);

    const main=document.createElement("main");main.className="parris-settings";
    const card=document.createElement("section");card.className="parris-settings-card";
    const eyebrow=document.createElement("div");eyebrow.className="eyebrow";eyebrow.textContent="Interface settings";
    const h1=document.createElement("h1");h1.textContent=prettyAppName();
    const intro=document.createElement("p");intro.className="intro";intro.textContent="Choose which optional cross-app controls appear over this app. These preferences are saved only for this app in this browser.";

    const makeToggle=(name,label,description,defaultValue)=>{
      const row=document.createElement("label");row.className="parris-setting";
      const input=document.createElement("input");input.type="checkbox";input.checked=getPref(name,defaultValue);
      const copy=document.createElement("span");
      const strong=document.createElement("strong");strong.textContent=label;
      const small=document.createElement("small");small.textContent=description;
      copy.append(strong,small);row.append(input,copy);
      input.addEventListener("change",()=>setPref(name,input.checked));
      return row;
    };

    const networkToggle=makeToggle(
      "network-tabs",
      "Show Portals + Parris Network tabs",
      "Off by default in games so navigation never sits over gameplay or other controls.",
      false
    );
    const podcastToggle=makeToggle(
      "podcasts",
      "Show Podcasts tab",
      "On by default where this app includes the podcast launcher.",
      true
    );

    const actions=document.createElement("div");actions.className="parris-settings-actions";
    const back=document.createElement("a");back.className="primary";back.href=returnUrl();back.textContent="← Back to "+prettyAppName();
    const reset=document.createElement("button");reset.type="button";reset.textContent="Reset interface defaults";
    reset.addEventListener("click",()=>{
      try{localStorage.removeItem(prefKey("network-tabs"));localStorage.removeItem(prefKey("podcasts"))}catch{}
      networkToggle.querySelector("input").checked=false;
      podcastToggle.querySelector("input").checked=true;
    });
    actions.append(back,reset);
    const note=document.createElement("p");note.className="parris-settings-note";note.textContent="If both Portals and Podcasts are enabled, the portal control is placed above the podcast control rather than overlapping it.";

    card.append(eyebrow,h1,intro,networkToggle,podcastToggle,actions,note);
    main.appendChild(card);
    document.body.replaceChildren(main);
    return true;
  }

  function init(id){
    if(id)GAME_ID=id;
    if(new URL(location.href).searchParams.get(SETTINGS_PARAM)==="1"){
      const early=document.createElement("style");
      early.textContent="body{visibility:hidden}";
      document.head.appendChild(early);
      const runSettings=()=>{renderSettingsPage();document.body.style.visibility="visible";early.remove()};
      if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",runSettings,{once:true});else runSettings();
      return;
    }
    const run=()=>{showArrival();if(networkTabsEnabled()){loadNetwork();mountPortalMenu()}};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
  }

  return{
    init,
    trigger,
    renderLink,
    setGame:id=>GAME_ID=id,
    openSettings,
    settingsUrl,
    getPreference:getPref,
    setPreference:setPref,
    networkTabsEnabled,
    podcastsEnabled
  };
})();