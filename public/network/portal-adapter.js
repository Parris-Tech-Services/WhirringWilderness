/* Parris Multiverse portal adapter v2.1 */
const PortalAdapter=(()=>{
  const HUB="https://parris-tech-services.github.io/WhirringWilderness/network/portal.html";
  const REGISTRY="https://parris-tech-services.github.io/WhirringWilderness/network/portal-registry.json";
  const NETWORK_SCRIPT="https://parris-tech-services.github.io/WhirringWilderness/network/parris-network.js";
  let GAME_ID="unknown";

  function loadNetwork(){
    if(document.querySelector('script[data-parris-network]')) return;
    const s=document.createElement("script");
    s.src=NETWORK_SCRIPT;s.async=true;s.dataset.parrisNetwork="true";
    (document.head||document.documentElement).appendChild(s);
  }

  function showArrival(){
    const u=new URL(location.href);
    if(!u.searchParams.get("portal")) return;
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
    if(document.getElementById("parris-portal-launcher")||GAME_ID==="unknown") return;
    let registry={};
    try{
      const r=await fetch(REGISTRY,{cache:"no-store"});
      if(!r.ok) return;
      registry=await r.json();
    }catch{return}
    const world=registry[GAME_ID];
    if(!world?.portals?.length) return;

    const launcher=document.createElement("button");
    launcher.id="parris-portal-launcher";
    launcher.type="button";
    launcher.textContent="⬡ Portals";
    Object.assign(launcher.style,{position:"fixed",left:"12px",bottom:"12px",zIndex:"2147483646",padding:"9px 12px",borderRadius:"999px",border:"1px solid rgba(167,139,250,.45)",background:"rgba(24,12,48,.94)",color:"#ede9fe",font:"600 12px system-ui",cursor:"pointer",boxShadow:"0 8px 30px #0006",transition:"bottom .18s ease"});

    const panel=document.createElement("div");
    panel.id="parris-portal-panel";
    panel.hidden=true;
    Object.assign(panel.style,{position:"fixed",left:"12px",bottom:"58px",zIndex:"2147483646",width:"min(320px,calc(100vw - 24px))",maxHeight:"60vh",overflow:"auto",padding:"14px",borderRadius:"16px",border:"1px solid rgba(167,139,250,.35)",background:"rgba(10,5,25,.97)",color:"#ede9fe",boxShadow:"0 18px 50px #0009",font:"13px system-ui",transition:"bottom .18s ease"});
    const title=document.createElement("div");title.textContent="Cross from "+world.label;Object.assign(title.style,{fontWeight:"800",marginBottom:"8px"});
    panel.appendChild(title);
    world.portals.forEach(route=>renderLink(route.to,panel,registry[route.to]?.label||route.to));
    const network=document.createElement("a");network.href="https://parris-tech-services.github.io/WhirringWilderness/network/";network.textContent="View all games & apps →";Object.assign(network.style,{display:"block",marginTop:"10px",color:"#67e8f9",textDecoration:"none",fontWeight:"700"});
    panel.appendChild(network);

    function syncDockPosition(){
      const podcastLauncher=document.getElementById("offline-podcast-launcher");
      const podcastPanel=document.getElementById("offline-podcast-panel");

      if(podcastPanel && !podcastPanel.hidden){
        panel.hidden=true;
        launcher.hidden=true;
        return;
      }

      launcher.hidden=false;
      if(podcastLauncher){
        const rect=podcastLauncher.getBoundingClientRect();
        const podcastVisible=!podcastLauncher.hidden && rect.height>0;
        if(podcastVisible){
          const stackedBottom=Math.max(12,window.innerHeight-rect.top+10);
          launcher.style.bottom=stackedBottom+"px";
          panel.style.bottom=(stackedBottom+46)+"px";
          return;
        }
      }

      launcher.style.bottom="12px";
      panel.style.bottom="58px";
    }

    launcher.addEventListener("click",()=>{panel.hidden=!panel.hidden});
    document.body.append(panel,launcher);
    syncDockPosition();

    const dockObserver=new MutationObserver(syncDockPosition);
    dockObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","style","class"]});
    window.addEventListener("resize",syncDockPosition,{passive:true});
  }

  function init(id){
    if(id) GAME_ID=id;
    const run=()=>{loadNetwork();showArrival();mountPortalMenu()};
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run,{once:true}); else run();
  }

  return{init,trigger,renderLink,setGame:id=>GAME_ID=id};
})();