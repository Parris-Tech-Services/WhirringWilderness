/* Parris UI shell v2.1
 * One control only:
 * - all integrations OFF => a quiet Settings gear
 * - anything enabled => the same control becomes the tools menu
 */
(()=>{
  if(window.__PARRIS_UI_SHELL__) return;
  window.__PARRIS_UI_SHELL__=true;

  const PREF_KEY="parris.ui.preferences.v1";
  const DEFAULTS={podcasts:false,portals:false,network:false};
  const SETTINGS_BASE="https://parris-tech-services.github.io/WhirringWilderness/network/settings.html";
  const NETWORK_URL="https://parris-tech-services.github.io/WhirringWilderness/network/";

  function safeJson(value,fallback){
    try{return JSON.parse(value);}catch{return fallback;}
  }

  function consumeSettingsReturn(){
    const url=new URL(location.href);
    const raw=url.searchParams.get("parrisPrefs");
    if(!raw) return;
    const incoming=safeJson(raw,null);
    if(incoming && typeof incoming==="object"){
      const next={
        podcasts:Boolean(incoming.podcasts),
        portals:Boolean(incoming.portals),
        network:Boolean(incoming.network)
      };
      try{localStorage.setItem(PREF_KEY,JSON.stringify(next));}catch{}
    }
    url.searchParams.delete("parrisPrefs");
    history.replaceState({},"",url.pathname+(url.searchParams.toString()?"?"+url.searchParams.toString():"")+url.hash);
  }

  function readPrefs(){
    try{
      return {...DEFAULTS,...safeJson(localStorage.getItem(PREF_KEY)||"{}",{})};
    }catch{
      return {...DEFAULTS};
    }
  }

  function appLabel(){
    const explicit=document.querySelector('meta[name="parris-app-name"]')?.content;
    if(explicit) return explicit;
    return document.title||location.hostname;
  }

  function settingsUrl(prefs){
    const url=new URL(SETTINGS_BASE);
    url.searchParams.set("app",appLabel());
    url.searchParams.set("return",location.href);
    url.searchParams.set("prefs",JSON.stringify(prefs));
    url.searchParams.set("capabilities",window.PortalAdapter?"podcasts,portals,network":"podcasts,network");
    return url.toString();
  }

  consumeSettingsReturn();
  const prefs=readPrefs();
  const hasEnabled=prefs.podcasts||prefs.portals||prefs.network;

  const style=document.createElement("style");
  style.id="parris-ui-shell-style";
  style.textContent=[
    "#parris-portal-launcher,#parris-portal-panel,#parris-network-link{display:none!important}",
    "#parris-tools-panel[hidden]{display:none!important}",
    !prefs.podcasts
      ? "#offline-podcast-launcher,#offline-podcast-panel,[data-josh-podcast-launcher]{display:none!important}"
      : "#offline-podcast-launcher,[data-josh-podcast-launcher]{display:none!important}"
  ].join("\n");
  document.head.appendChild(style);

  const launcher=document.createElement("button");
  launcher.id="parris-tools-launcher";
  launcher.type="button";
  launcher.textContent=hasEnabled?"⋯":"⚙";
  launcher.setAttribute("aria-label",hasEnabled?"Open app tools":"Open app settings");
  launcher.setAttribute("aria-expanded","false");
  Object.assign(launcher.style,{
    position:"fixed",right:"10px",bottom:"max(10px,env(safe-area-inset-bottom))",
    zIndex:"2147483646",width:"34px",height:"34px",padding:"0",
    borderRadius:"50%",border:"1px solid rgba(148,163,184,.25)",
    background:"rgba(15,23,42,.72)",color:"#f8fafc",
    font:"700 18px/1 system-ui,-apple-system,Segoe UI,sans-serif",
    cursor:"pointer",boxShadow:"0 6px 18px rgba(15,23,42,.22)",
    backdropFilter:"blur(7px)",opacity:hasEnabled?"0.88":"0.58"
  });

  if(!hasEnabled){
    launcher.addEventListener("click",()=>{location.href=settingsUrl(prefs);});
    const mount=()=>document.body.appendChild(launcher);
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount,{once:true});
    else mount();
    return;
  }

  const panel=document.createElement("div");
  panel.id="parris-tools-panel";
  panel.hidden=true;
  Object.assign(panel.style,{
    position:"fixed",right:"10px",bottom:"calc(max(10px,env(safe-area-inset-bottom)) + 42px)",
    zIndex:"2147483646",width:"min(292px,calc(100vw - 20px))",
    maxHeight:"60vh",overflow:"auto",padding:"12px",
    borderRadius:"15px",border:"1px solid rgba(148,163,184,.25)",
    background:"rgba(15,23,42,.97)",color:"#f8fafc",
    boxShadow:"0 18px 48px rgba(0,0,0,.42)",
    font:"13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif"
  });

  const heading=document.createElement("div");
  heading.textContent="App tools";
  Object.assign(heading.style,{fontWeight:"800",margin:"2px 2px 8px"});
  panel.appendChild(heading);

  function menuButton(label,onClick){
    const button=document.createElement("button");
    button.type="button";
    button.textContent=label;
    Object.assign(button.style,{
      display:"block",width:"100%",textAlign:"left",margin:"6px 0",padding:"10px 12px",
      border:"1px solid rgba(148,163,184,.24)",borderRadius:"10px",
      background:"rgba(30,41,59,.9)",color:"#f8fafc",cursor:"pointer",
      font:"600 13px system-ui,-apple-system,Segoe UI,sans-serif"
    });
    button.addEventListener("click",onClick);
    panel.appendChild(button);
    return button;
  }

  if(prefs.network){
    menuButton("◈ Parris Network",()=>{location.href=NETWORK_URL;});
  }

  if(prefs.podcasts){
    const podcastButton=menuButton("🎧 Podcasts",()=>{
      const legacy=document.getElementById("offline-podcast-launcher");
      if(legacy){
        legacy.click();
        panel.hidden=true;
        launcher.hidden=true;
      }else{
        window.dispatchEvent(new CustomEvent("josh-podcast:show"));
      }
    });

    const syncPodcastState=()=>{
      const podcastPanel=document.getElementById("offline-podcast-panel");
      const shouldHide=Boolean(podcastPanel && !podcastPanel.hidden);
      if(launcher.hidden!==shouldHide) launcher.hidden=shouldHide;
      if(shouldHide && !panel.hidden) panel.hidden=true;
      const available=Boolean(document.getElementById("offline-podcast-launcher")||window.JoshPodcastDock);
      if(podcastButton.disabled===available) podcastButton.disabled=!available;
      const wantedOpacity=available?"1":".55";
      if(podcastButton.style.opacity!==wantedOpacity) podcastButton.style.opacity=wantedOpacity;
    };

    const observer=new MutationObserver(syncPodcastState);
    observer.observe(document.documentElement,{
      subtree:true,childList:true,attributes:true,attributeFilter:["hidden"]
    });
    setTimeout(syncPodcastState,0);
  }

  async function addPortalItems(){
    if(!prefs.portals||!window.PortalAdapter?.getRoutes) return;
    const routes=await window.PortalAdapter.getRoutes();
    if(!routes.length) return;
    const label=document.createElement("div");
    label.textContent="Portals";
    Object.assign(label.style,{
      margin:"10px 2px 4px",fontSize:"11px",fontWeight:"800",
      textTransform:"uppercase",letterSpacing:".1em",color:"#c4b5fd"
    });
    panel.insertBefore(label,panel.lastElementChild||null);
    routes.forEach(route=>{
      const button=menuButton("⬡ "+route.label,()=>window.PortalAdapter.trigger(route.to));
      panel.insertBefore(button,panel.lastElementChild||null);
    });
  }

  const settings=document.createElement("a");
  settings.href=settingsUrl(prefs);
  settings.textContent="⚙ Settings";
  Object.assign(settings.style,{
    display:"block",marginTop:"9px",padding:"9px 4px 2px",
    color:"#cbd5e1",textDecoration:"none",fontWeight:"700"
  });
  panel.appendChild(settings);

  launcher.addEventListener("click",()=>{
    panel.hidden=!panel.hidden;
    launcher.setAttribute("aria-expanded",String(!panel.hidden));
  });

  const mount=()=>{
    document.body.append(panel,launcher);
    addPortalItems();
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();