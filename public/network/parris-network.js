/* Parris UI shell v2.0
 * Defaults: podcasts OFF, portals OFF, network OFF.
 * If any integration is enabled, one compact launcher owns the UI.
 */
(()=>{
  if(window.__PARRIS_UI_SHELL__) return;
  window.__PARRIS_UI_SHELL__=true;

  const PREF_KEY="parris.ui.preferences.v1";
  const DEFAULTS={podcasts:false,portals:false,network:false};

  function readPrefs(){
    try{
      const saved=JSON.parse(localStorage.getItem(PREF_KEY)||"{}");
      return {...DEFAULTS,...saved};
    }catch{
      return {...DEFAULTS};
    }
  }

  function settingsUrl(){
    const url=new URL(location.href);
    if(url.hostname.endsWith("github.io")){
      const first=url.pathname.split("/").filter(Boolean)[0];
      return first?"/"+first+"/settings.html":"/settings.html";
    }
    return "/settings.html";
  }

  function networkUrl(){
    return "https://parris-tech-services.github.io/WhirringWilderness/network/";
  }

  const prefs=readPrefs();

  // Kill legacy clutter even if an older launcher script renders after this one.
  const style=document.createElement("style");
  style.id="parris-ui-shell-style";
  style.textContent=[
    !prefs.podcasts
      ? "#offline-podcast-launcher,#offline-podcast-panel,[data-josh-podcast-launcher]{display:none!important}"
      : "",
    "#parris-portal-launcher,#parris-portal-panel{display:none!important}",
    "#parris-network-link{display:none!important}",
    "#parris-tools-panel[hidden]{display:none!important}"
  ].join("\n");
  document.head.appendChild(style);

  if(!prefs.podcasts&&!prefs.portals&&!prefs.network) return;

  const launcher=document.createElement("button");
  launcher.id="parris-tools-launcher";
  launcher.type="button";
  launcher.textContent="⋯";
  launcher.setAttribute("aria-label","Open app tools");
  launcher.setAttribute("aria-expanded","false");
  Object.assign(launcher.style,{
    position:"fixed",right:"12px",bottom:"max(12px,env(safe-area-inset-bottom))",
    zIndex:"2147483646",width:"38px",height:"38px",padding:"0",
    borderRadius:"50%",border:"1px solid rgba(148,163,184,.32)",
    background:"rgba(15,23,42,.88)",color:"#f8fafc",
    font:"800 20px/1 system-ui,-apple-system,Segoe UI,sans-serif",
    cursor:"pointer",boxShadow:"0 8px 24px rgba(15,23,42,.28)",
    backdropFilter:"blur(8px)"
  });

  const panel=document.createElement("div");
  panel.id="parris-tools-panel";
  panel.hidden=true;
  Object.assign(panel.style,{
    position:"fixed",right:"12px",bottom:"calc(max(12px,env(safe-area-inset-bottom)) + 46px)",
    zIndex:"2147483646",width:"min(300px,calc(100vw - 24px))",
    maxHeight:"60vh",overflow:"auto",padding:"12px",
    borderRadius:"16px",border:"1px solid rgba(148,163,184,.28)",
    background:"rgba(15,23,42,.97)",color:"#f8fafc",
    boxShadow:"0 18px 50px rgba(0,0,0,.45)",
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
      border:"1px solid rgba(148,163,184,.25)",borderRadius:"10px",
      background:"rgba(30,41,59,.9)",color:"#f8fafc",cursor:"pointer",
      font:"600 13px system-ui,-apple-system,Segoe UI,sans-serif"
    });
    button.addEventListener("click",onClick);
    panel.appendChild(button);
    return button;
  }

  if(prefs.network){
    menuButton("◈ Parris Network",()=>{location.href=networkUrl();});
  }

  if(prefs.podcasts){
    const podcastButton=menuButton("🎧 Podcasts",()=>{
      const legacy=document.getElementById("offline-podcast-launcher");
      if(legacy){
        legacy.click();
        panel.hidden=true;
        launcher.hidden=true;
        return;
      }
      window.dispatchEvent(new CustomEvent("josh-podcast:show"));
    });

    // Keep old standalone podcast button hidden even when podcasts are enabled:
    // the single shell button owns access to it.
    const podcastStyle=document.createElement("style");
    podcastStyle.textContent="#offline-podcast-launcher,[data-josh-podcast-launcher]{display:none!important}";
    document.head.appendChild(podcastStyle);

    const syncPodcastState=()=>{
      const podcastPanel=document.getElementById("offline-podcast-panel");
      if(podcastPanel && !podcastPanel.hidden){
        launcher.hidden=true;
        panel.hidden=true;
      }else{
        launcher.hidden=false;
      }
      podcastButton.disabled=!(document.getElementById("offline-podcast-launcher")||window.JoshPodcastDock);
      podcastButton.style.opacity=podcastButton.disabled?".55":"1";
    };
    new MutationObserver(syncPodcastState).observe(document.documentElement,{
      subtree:true,childList:true,attributes:true,attributeFilter:["hidden","style","class"]
    });
    setTimeout(syncPodcastState,0);
  }

  async function addPortalItems(){
    if(!prefs.portals||!window.PortalAdapter?.getRoutes) return;
    const routes=await window.PortalAdapter.getRoutes();
    if(!routes.length) return;
    const label=document.createElement("div");
    label.textContent="Portals";
    Object.assign(label.style,{margin:"10px 2px 4px",fontSize:"11px",fontWeight:"800",textTransform:"uppercase",letterSpacing:".1em",color:"#c4b5fd"});
    panel.appendChild(label);
    routes.forEach(route=>menuButton("⬡ "+route.label,()=>window.PortalAdapter.trigger(route.to)));
  }

  const settings=document.createElement("a");
  settings.href=settingsUrl();
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