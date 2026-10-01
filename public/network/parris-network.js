/* Parris Network backlink v1.1
 * When an app id is supplied, this launcher is opt-in for that app.
 */
(()=>{
  if(window.__PARRIS_NETWORK_LINKED__)return;
  const source=document.currentScript;
  const appId=source?.dataset?.appId||document.documentElement.dataset.parrisApp||"";
  if(appId){
    try{
      if(localStorage.getItem("parris-ui:"+appId+":network-tabs")!=="true")return;
    }catch{return}
  }
  window.__PARRIS_NETWORK_LINKED__=true;
  const a=document.createElement("a");
  a.href="https://parris-tech-services.github.io/WhirringWilderness/network/";
  a.textContent="◈ Parris Network";
  a.setAttribute("aria-label","Open the Parris Network");
  Object.assign(a.style,{position:"fixed",right:"12px",bottom:"12px",zIndex:"2147483646",padding:"9px 12px",borderRadius:"999px",border:"1px solid rgba(148,163,184,.35)",background:"rgba(15,23,42,.92)",color:"#f8fafc",font:"600 12px/1.2 system-ui,-apple-system,Segoe UI,sans-serif",textDecoration:"none",boxShadow:"0 8px 30px rgba(15,23,42,.3)",backdropFilter:"blur(8px)"});
  const mount=()=>document.body&&document.body.appendChild(a);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();