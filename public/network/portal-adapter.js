/* Parris Multiverse portal adapter v2.0 */
const PortalAdapter=(()=>{
  const HUB="https://parris-tech-services.github.io/WhirringWilderness/network/portal.html";
  const NETWORK_SCRIPT="https://parris-tech-services.github.io/WhirringWilderness/network/parris-network.js";
  let GAME_ID="unknown";
  function loadNetwork(){if(document.querySelector('script[data-parris-network]'))return;const s=document.createElement("script");s.src=NETWORK_SCRIPT;s.async=true;s.dataset.parrisNetwork="true";(document.head||document.documentElement).appendChild(s)}
  function showArrival(){
    const u=new URL(location.href);if(!u.searchParams.get("portal"))return;
    const from=u.searchParams.get("from")||"another world";
    const box=document.createElement("div");box.textContent="⬡ You arrived from "+from.replace(/-/g," ");
    Object.assign(box.style,{position:"fixed",top:"12px",left:"50%",transform:"translateX(-50%)",zIndex:"2147483645",padding:"10px 14px",borderRadius:"999px",border:"1px solid rgba(167,139,250,.5)",background:"rgba(10,5,25,.94)",color:"#ede9fe",font:"italic 14px Georgia,serif",boxShadow:"0 10px 30px #0008"});
    document.body.appendChild(box);setTimeout(()=>box.remove(),5000);
    u.searchParams.delete("portal");u.searchParams.delete("from");history.replaceState({},"",u.pathname+(u.search?"?"+u.searchParams.toString():"")+u.hash);
  }
  function trigger(dest){location.href=HUB+"?from="+encodeURIComponent(GAME_ID)+"&to="+encodeURIComponent(dest)}
  function renderLink(dest,container){const b=document.createElement("button");b.type="button";b.textContent="⬡ Portal to "+dest.replace(/-/g," ");b.addEventListener("click",()=>trigger(dest));container?.appendChild(b);return b}
  function init(id){if(id)GAME_ID=id;loadNetwork();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",showArrival,{once:true});else showArrival()}
  return{init,trigger,renderLink,setGame:id=>GAME_ID=id};
})();PortalAdapter.init();