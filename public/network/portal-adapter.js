/* Parris Multiverse portal adapter v3.0
 * Portal UI is intentionally NOT rendered here. The shared Parris UI shell
 * owns the single launcher so games never accumulate floating controls.
 */
const PortalAdapter=(()=>{
  const HUB="https://parris-tech-services.github.io/WhirringWilderness/network/portal.html";
  const REGISTRY="https://parris-tech-services.github.io/WhirringWilderness/network/portal-registry.json";
  const SHELL="https://parris-tech-services.github.io/WhirringWilderness/network/parris-network.js?v=2.1";
  let GAME_ID="unknown";
  let registryPromise=null;

  function loadShell(){
    if(document.querySelector('script[data-parris-network]')) return;
    const script=document.createElement("script");
    script.src=SHELL;
    script.async=true;
    script.dataset.parrisNetwork="true";
    (document.head||document.documentElement).appendChild(script);
  }

  function loadRegistry(){
    if(!registryPromise){
      registryPromise=fetch(REGISTRY,{cache:"no-store"})
        .then(response=>{
          if(!response.ok) throw new Error("Portal registry "+response.status);
          return response.json();
        })
        .catch(error=>{
          console.error("Parris portal registry failed",error);
          return {};
        });
    }
    return registryPromise;
  }

  function showArrival(){
    const url=new URL(location.href);
    if(!url.searchParams.get("portal")) return;
    const from=url.searchParams.get("from")||"another world";
    const box=document.createElement("div");
    box.textContent="⬡ You arrived from "+from.replace(/-/g," ");
    Object.assign(box.style,{
      position:"fixed",top:"12px",left:"50%",transform:"translateX(-50%)",
      zIndex:"2147483645",padding:"10px 14px",borderRadius:"999px",
      border:"1px solid rgba(167,139,250,.5)",background:"rgba(10,5,25,.94)",
      color:"#ede9fe",font:"italic 14px Georgia,serif",boxShadow:"0 10px 30px #0008",
      maxWidth:"90vw"
    });
    document.body.appendChild(box);
    setTimeout(()=>box.remove(),5000);
    url.searchParams.delete("portal");
    url.searchParams.delete("from");
    history.replaceState(
      {},
      "",
      url.pathname+(url.searchParams.toString()?"?"+url.searchParams.toString():"")+url.hash
    );
  }

  function trigger(dest){
    location.href=HUB+"?from="+encodeURIComponent(GAME_ID)+"&to="+encodeURIComponent(dest);
  }

  async function getRoutes(){
    const registry=await loadRegistry();
    const world=registry[GAME_ID];
    if(!world?.portals?.length) return [];
    return world.portals.map(route=>({
      to:route.to,
      flavour:route.flavour||"",
      label:registry[route.to]?.label||route.to.replace(/-/g," ")
    }));
  }

  function renderLink(dest,container,label){
    const button=document.createElement("button");
    button.type="button";
    button.textContent="⬡ "+(label||dest.replace(/-/g," "));
    button.addEventListener("click",()=>trigger(dest));
    container?.appendChild(button);
    return button;
  }

  function init(id){
    if(id) GAME_ID=id;
    const run=()=>{showArrival();loadShell();};
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run,{once:true});
    else run();
  }

  return{
    init,
    trigger,
    getRoutes,
    renderLink,
    getGameId:()=>GAME_ID,
    setGame:id=>{GAME_ID=id;}
  };
})();