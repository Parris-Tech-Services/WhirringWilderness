// Offline podcast shell and readable publisher-audio cache.
// Opaque no-CORS audio must not be presented as replayable offline media.
const BASE=new URL('./',self.location.href);
const SLUG=BASE.pathname.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')||'root';
const SHELL_CACHE='podcast-shell-'+SLUG+'-v1';
const AUDIO_PREFIX='podcast-audio-'+SLUG+'-';

self.addEventListener('install',event=>event.waitUntil(
  caches.open(SHELL_CACHE).then(async cache=>{
    try{
      const response=await fetch(BASE.href,{cache:'reload'});
      if(response.ok)await cache.put(BASE.href,response);
    }catch{/* The existing shell may already be cached. */}
  }).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
  if(event.data?.type!=='CACHE_URLS'||!Array.isArray(event.data.urls))return;
  event.waitUntil(caches.open(SHELL_CACHE).then(async cache=>{
    for(const raw of event.data.urls){
      try{
        const url=new URL(raw);
        if(url.origin!==self.location.origin||!url.pathname.startsWith(BASE.pathname))continue;
        const response=await fetch(url.href,{cache:'reload'});
        if(response.ok)await cache.put(url.href,response);
      }catch{/* Keep the current usable offline shell. */}
    }
  }));
});

async function cachedAudio(request){
  const keys=await caches.keys();
  for(const key of keys.filter(k=>k.startsWith(AUDIO_PREFIX))){
    const cached=await(await caches.open(key)).match(request,{ignoreVary:true});
    if(!cached||cached.type==='opaque')continue;
    const blob=await cached.blob();
    if(!blob.size)continue;
    const size=blob.size;
    const type=cached.headers.get('content-type')||blob.type||'audio/mpeg';
    const range=request.headers.get('range');
    const headers={'Content-Type':type,'Accept-Ranges':'bytes'};
    if(!range){
      headers['Content-Length']=String(size);
      return new Response(blob,{status:200,headers});
    }
    const parts=/^bytes=(\d*)-(\d*)$/.exec(range);
    if(!parts||(!parts[1]&&!parts[2])){
      return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
    }
    let start,end;
    if(!parts[1]){
      const suffix=Number(parts[2]);
      start=Math.max(0,size-suffix);
      end=size-1;
    }else{
      start=Number(parts[1]);
      end=parts[2]?Math.min(Number(parts[2]),size-1):size-1;
    }
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||start>end){
      return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
    }
    headers['Content-Range']='bytes '+start+'-'+end+'/'+size;
    headers['Content-Length']=String(end-start+1);
    return new Response(blob.slice(start,end+1,type),{status:206,headers});
  }
  return null;
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  if(request.destination==='audio'){
    event.respondWith((async()=>await cachedAudio(request)||fetch(request))());
    return;
  }
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(BASE.pathname))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok)caches.open(SHELL_CACHE).then(cache=>cache.put(BASE.href,response.clone())).catch(()=>{});
      return response;
    }).catch(()=>caches.open(SHELL_CACHE).then(cache=>cache.match(BASE.href))));
    return;
  }
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{
    if(response.ok)caches.open(SHELL_CACHE).then(cache=>cache.put(request,response.clone())).catch(()=>{});
    return response;
  })));
});
