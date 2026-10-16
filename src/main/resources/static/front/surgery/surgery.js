/* SAEKIM v6. Row alignment and Shared non-zero motion durations; reduced motion uses short fades. */
(()=>{'use strict';
const root=document.querySelector('.sk-surgery');if(!root)return;
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const ease='cubic-bezier(.2,.6,.35,1)';
function duration(kind='panel'){
 const value=getComputedStyle(root).getPropertyValue(`--sk-${kind}-duration`).trim();
 const ms=parseFloat(value)*(value.endsWith('ms')?1:1000);
 return Number.isFinite(ms)&&ms>0?ms:(motion.matches?200:420);
}
const distance=value=>motion.matches?0:value;
const registry=new Map(),groups=[...root.querySelectorAll('[data-tabs]')],main=groups.find(g=>g.dataset.major==='true');

// Match title heights only among cards sharing a visible row. No fixed blank title space.
let alignmentFrame=0;
function scheduleAlignment(){
 cancelAnimationFrame(alignmentFrame);
 alignmentFrame=requestAnimationFrame(()=>{
  const grids=[...root.querySelectorAll('.sk-copy-grid,.sk-case-grid,.sk-material-grid,.sk-age-cards,.sk-rail')];
  const visible=grids.filter(g=>g.offsetWidth&&!g.closest('.is-leaving'));
  const rows=[];
  visible.forEach(grid=>{
   const cards=[...grid.children].map(card=>({card,title:card.querySelector('h4')})).filter(x=>x.title);
   cards.forEach(({title})=>title.style.removeProperty('--sk-card-title-height'));
   rows.push({grid,cards});
  });
  const writes=[];
  rows.forEach(({grid,cards})=>{
   const bands=new Map();
   cards.forEach(x=>{const key=x.card.offsetTop;const band=bands.get(key)||[];band.push(x);bands.set(key,band)});
   bands.forEach(band=>{
    if(band.length<2)return;
    const height=Math.max(...band.map(x=>x.title.offsetHeight));
    band.forEach(x=>writes.push([x.title,height]));
   });
  });
  writes.forEach(([title,height])=>title.style.setProperty('--sk-card-title-height',height+'px'));
 });
}

const scrollJobs=new WeakMap();
function stopScroll(target){const job=scrollJobs.get(target);if(job){cancelAnimationFrame(job.frame);if(target!==window)target.style.scrollSnapType=job.snap;scrollJobs.delete(target)}}
function scrollToValue(target,value){
 stopScroll(target);const horizontal=target!==window,start=horizontal?target.scrollLeft:scrollY;
 const limit=horizontal?target.scrollWidth-target.clientWidth:document.documentElement.scrollHeight-innerHeight;
 const end=Math.max(0,Math.min(value,limit)),ms=duration('scroll');
 const write=v=>{if(horizontal)target.scrollLeft=v;else window.scrollTo({top:v,behavior:'instant'})};
 if(!ms||Math.abs(end-start)<1){write(end);return}
 const job={frame:0,snap:horizontal?target.style.scrollSnapType:''};if(horizontal)target.style.scrollSnapType='none';scrollJobs.set(target,job);
 const began=performance.now();function frame(now){if(scrollJobs.get(target)!==job)return;const t=Math.min(1,(now-began)/ms),smooth=t*t*(3-2*t);write(start+(end-start)*smooth);if(t<1)job.frame=requestAnimationFrame(frame);else{if(horizontal)target.style.scrollSnapType=job.snap;scrollJobs.delete(target)}}job.frame=requestAnimationFrame(frame);
}
window.addEventListener('wheel',()=>stopScroll(window),{passive:true});window.addEventListener('touchstart',()=>stopScroll(window),{passive:true});
document.querySelector('.btn_top')?.setAttribute('aria-label','페이지 맨 위로');
const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:0,rootMargin:'0px 0px -16px 0px'}):null;
function reveal(){
 scheduleAlignment();
 const active=main.querySelector(':scope > .sk-panels > [data-panel]:not([hidden]):not(.is-leaving)');
 if(active&&root.classList.contains('sk-theme-young')){
  // Each procedure and each nested method owns its own sequence, even during crossfades.
  [active,...active.querySelectorAll('[data-panel]')].forEach(panel=>{
   const sections=[...panel.querySelectorAll('.sk-section')].filter(section=>section.closest('[data-panel]')===panel);
   sections.forEach((section,index)=>{
    const number=section.querySelector(':scope > .sk-section-head > .sk-section-no');
    if(number)number.textContent=String(index+1).padStart(2,'0');
   });
  });
 }else{
 if(active)[...active.querySelectorAll('.sk-section')].filter(e=>!e.closest('[hidden]')).forEach((e,i)=>{const n=e.querySelector('.sk-section-no');if(n)n.textContent=String(i+1).padStart(2,'0')});
 }
 root.querySelectorAll('.sk-reveal:not(.is-visible)').forEach(e=>{if(!e.closest('[hidden]')){if(observer&&!motion.matches)observer.observe(e);else e.classList.add('is-visible')}});
}
function cancel(st){
 st.animations.forEach(a=>a.cancel());st.animations=[];
 if(st.leaving){st.leaving.hidden=true;st.leaving.inert=false;st.leaving.classList.remove('is-leaving');st.leaving.removeAttribute('aria-hidden');st.leaving.style.maxHeight='';st.leaving=null}
}
function select(group,index,{focus=false,save=false,scroll=false,animate=true}={}){
 const st=registry.get(group);if(!st)return;index=(index+st.buttons.length)%st.buttons.length;
 if(index===st.index){if(focus)st.buttons[index].focus({preventScroll:true});return}
 cancel(st);const previous=st.panels[st.index],active=st.panels[index],changed=index!==st.index;
 st.buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;st.panels[i].hidden=i!==index});st.index=index;
 const visible=group.getBoundingClientRect();
 if(changed&&previous&&animate&&visible.bottom>0&&visible.top<innerHeight){
  // Crossfade the actual panels. Child reveal/hover transforms remain independent.
  previous.hidden=false;previous.inert=true;previous.classList.add('is-leaving');previous.setAttribute('aria-hidden','true');st.leaving=previous;
  const options={duration:duration('panel'),easing:ease,fill:'both'};
  const exit=previous.animate([{opacity:1},{opacity:0}],options);
  const enter=active.animate([{opacity:0,transform:`translateY(${distance(12)}px)`},{opacity:1,transform:'translateY(0)'}],options);
  st.animations=[exit,enter];
  Promise.all([exit.finished,enter.finished]).then(()=>{if(st.leaving===previous)cancel(st)}).catch(()=>{});
 }
 if(focus)st.buttons[index].focus({preventScroll:true});
 if(save)history.pushState(null,'','#'+(group===main?active.dataset.slug:active.id));
 if(scroll){const top=st.list.getBoundingClientRect().top+scrollY-(innerWidth<=900?90:120);if(scrollY>top+20)scrollToValue(window,top)}
 reveal();requestAnimationFrame(()=>{syncSectionWidths();root.querySelectorAll('[data-carousel]').forEach(updateRail)});
}
groups.forEach(group=>{
 const list=group.querySelector(':scope > [data-tablist]'),wrap=group.querySelector(':scope > .sk-panels');if(!list||!wrap)return;
 const buttons=[...list.querySelectorAll('[data-tab]')],panels=[...wrap.children];if(!buttons.length||buttons.length!==panels.length)return;
 list.setAttribute('role','tablist');registry.set(group,{list,wrap,buttons,panels,index:-1,animations:[],leaving:null});
 buttons.forEach((b,i)=>{
  b.setAttribute('role','tab');b.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',b.id);panels[i].tabIndex=-1;
  b.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();select(group,i,{save:true,scroll:true})});
  b.addEventListener('keydown',e=>{const keys={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:buttons.length-1};if(e.key in keys){e.preventDefault();select(group,keys[e.key],{focus:true,save:true})}else if(e.key===' '){e.preventDefault();select(group,i,{save:true})}});
 });select(group,0,{animate:false});
});
function restore(animate=true){
 let hash;try{hash=decodeURIComponent(location.hash.slice(1))}catch{return}
 if(!hash){select(main,0,{animate});return}
 const target=[...root.querySelectorAll('[data-panel]')].find(p=>p.dataset.slug===hash||p.id===hash);if(!target)return;
 const chain=[];let p=target;while(p){chain.unshift(p);p=p.parentElement?.closest('[data-panel]')}
 chain.forEach(p=>{const g=p.closest('[data-tabs]'),st=registry.get(g);if(st)select(g,st.panels.indexOf(p),{animate})});
}
window.addEventListener('popstate',()=>restore());window.addEventListener('hashchange',()=>restore());restore(false);
root.addEventListener('click',e=>{
 const a=e.target.closest('.sk-related-links a');if(!a)return;const u=new URL(a.href,location.href);
 if(u.pathname===location.pathname&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();history.pushState(null,'',u.hash);restore();scrollToValue(window,main.getBoundingClientRect().top+scrollY-(innerWidth<=900?90:120))}
});
// Equal hero height per page and breakpoint, measured from real localized copy.
let measureWidth=0;function equalizeHeroes(){if(Math.abs(root.clientWidth-measureWidth)<2)return;measureWidth=root.clientWidth;const heroes=[...main.querySelectorAll(':scope > .sk-panels > .sk-tabpanel > .sk-procedure-hero')];const probe=document.createElement('div');Object.assign(probe.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:main.clientWidth+'px',left:'0',top:'0'});probe.setAttribute('aria-hidden','true');probe.inert=true;root.append(probe);let height=0;heroes.forEach(h=>{const c=h.cloneNode(true);c.style.minHeight='';c.style.height='auto';c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));probe.append(c);height=Math.max(height,c.getBoundingClientRect().height);c.remove()});probe.remove();heroes.forEach(h=>h.style.minHeight=Math.ceil(height)+'px')}
// Expand every card rail from its own text alignment to the viewport's right edge.
// Keep the carousel itself at content width so headings and controls do not move.
function syncSectionWidths(){
 const shell=root.querySelector('.sk-shell');
 if(!shell)return;
 const viewport=document.documentElement.clientWidth,rect=shell.getBoundingClientRect();
 root.style.setProperty('--sk-viewport-width',viewport+'px');
 root.style.setProperty('--sk-shell-offset',Math.max(0,rect.left)+'px');
 root.querySelectorAll('.sk-carousel[data-carousel]').forEach(carousel=>{
  if(!carousel.getClientRects().length)return;
  const box=carousel.getBoundingClientRect();
  if(box.width<=0)return;
  carousel.style.setProperty('--sk-carousel-content-width',box.width+'px');
  carousel.style.setProperty('--sk-carousel-rail-width',Math.max(0,viewport-box.left)+'px');
  carousel.style.setProperty('--sk-carousel-end-space',Math.max(0,viewport-box.right)+'px');
 });
}
syncSectionWidths();
let resizeTimer;
function scheduleSectionLayout(){
 clearTimeout(resizeTimer);
 resizeTimer=setTimeout(()=>{syncSectionWidths();equalizeHeroes();scheduleAlignment();root.querySelectorAll('[data-carousel]').forEach(updateRail)},100);
}
if(typeof ResizeObserver!=='undefined'){
 const layoutObserver=new ResizeObserver(scheduleSectionLayout);
 layoutObserver.observe(root);
 const shell=root.querySelector('.sk-shell');if(shell)layoutObserver.observe(shell);
}
window.addEventListener('resize',scheduleSectionLayout,{passive:true});
window.addEventListener('pageshow',scheduleSectionLayout);
document.fonts?.ready.then(()=>{measureWidth=0;syncSectionWidths();equalizeHeroes();scheduleAlignment()});
equalizeHeroes();
function updateRail(carousel){const rail=carousel.querySelector('.sk-rail'),prev=carousel.querySelector('[data-slide="-1"]'),next=carousel.querySelector('[data-slide="1"]');if(!rail||!prev||!next)return;prev.disabled=rail.scrollLeft<=2;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-3}
root.querySelectorAll('[data-carousel]').forEach(carousel=>{
 const rail=carousel.querySelector('.sk-rail');
 carousel.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>{const card=rail.firstElementChild;const stride=(card.offsetWidth+(parseFloat(getComputedStyle(rail).gap)||0));scrollToValue(rail,rail.scrollLeft+stride*Number(button.dataset.slide))}));
 rail.addEventListener('scroll',()=>updateRail(carousel),{passive:true});['touchstart','pointerdown','wheel'].forEach(type=>rail.addEventListener(type,()=>stopScroll(rail),{passive:true}));
 rail.addEventListener('keydown',e=>{if(e.target!==rail||!['ArrowRight','ArrowLeft'].includes(e.key))return;e.preventDefault();carousel.querySelector(`[data-slide="${e.key==='ArrowRight'?1:-1}"]`).click()});updateRail(carousel);
});
// Diagram selection works identically with pointer, keyboard and touch.
root.querySelectorAll('.sk-reason-layout').forEach(diagram=>{
 const buttons=[...diagram.querySelectorAll('button[data-reason]')],label=diagram.querySelector('.sk-donut-label');
 function choose(button){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));diagram.querySelectorAll('.sk-donut-segment').forEach(s=>{s.classList.toggle('is-active',s.dataset.reason===button.dataset.reason);s.classList.toggle('is-muted',s.dataset.reason!==button.dataset.reason)});label.querySelector('span').textContent=button.dataset.name;label.querySelector('strong').replaceChildren(document.createTextNode(button.dataset.percent),Object.assign(document.createElement('small'),{textContent:'%'}))}
 buttons.forEach(b=>b.addEventListener('click',()=>choose(b)));choose(buttons[0]);
});
// Native dialog preserves focus trapping. Each set is explicitly scoped to its content group.
const dialog=root.querySelector('.sk-image-dialog'),stage=dialog.querySelector('.sk-viewer-stage'),prev=dialog.querySelector('.sk-viewer-prev'),next=dialog.querySelector('.sk-viewer-next'),error=dialog.querySelector('.sk-viewer-error');
let opener=null,overflow='',items=[],current=0,loadToken=0,closing=false,viewerAnimations=[];
function cancelViewer(){viewerAnimations.forEach(a=>a.cancel());viewerAnimations=[];stage.querySelectorAll('.sk-viewer-outgoing').forEach(e=>e.remove())}
function syncViewer(){const focused=document.activeElement;prev.disabled=current<=0;next.disabled=current>=items.length-1;if(focused===prev&&prev.disabled)(next.disabled?dialog.querySelector('.sk-dialog-close'):next).focus({preventScroll:true});if(focused===next&&next.disabled)(prev.disabled?dialog.querySelector('.sk-dialog-close'):prev).focus({preventScroll:true});dialog.querySelector('.sk-viewer-count').textContent=`${current+1} / ${items.length}`;dialog.querySelector('.sk-viewer-caption p').textContent=items[current].dataset.caption;}
async function showImage(index,animate=true){
 if(closing||index<0||index>=items.length)return;const direction=index>=current?1:-1;current=index;const token=++loadToken,item=items[index];syncViewer();stage.setAttribute('aria-busy','true');error.hidden=true;
 const image=new Image();image.className='sk-viewer-image';image.alt=item.dataset.caption;image.draggable=false;image.src=item.dataset.image;
 try{await image.decode()}catch(e){if(token!==loadToken||!dialog.open)return;stage.setAttribute('aria-busy','false');error.hidden=false;stage.querySelectorAll('img').forEach(i=>i.remove());return}
 if(token!==loadToken||!dialog.open)return;cancelViewer();const old=stage.querySelector('.sk-viewer-image');stage.setAttribute('aria-busy','false');
 stage.append(image);
 if(old&&animate){old.classList.add('sk-viewer-outgoing');old.setAttribute('aria-hidden','true');const out=old.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${distance(-direction*18)}px)`}],{duration:duration('viewer'),easing:ease});const incoming=image.animate([{opacity:0,transform:`translateX(${distance(direction*18)}px)`},{opacity:1,transform:'translateX(0)'}],{duration:duration('viewer'),easing:ease});viewerAnimations=[out,incoming];out.finished.then(()=>old.remove()).catch(()=>{});}else old?.remove();
 [items[index-1],items[index+1]].filter(Boolean).forEach(b=>{const pre=new Image();pre.src=b.dataset.image});
}
function closeDialog(){if(!dialog.open||closing)return;closing=true;++loadToken;cancelViewer();const finish=()=>{dialog.close();closing=false};dialog.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:`translateY(${distance(8)}px)`}],{duration:duration('viewer'),easing:ease}).finished.then(finish).catch(finish)}
root.addEventListener('click',e=>{
 const b=e.target.closest('[data-image]');if(!b||b.closest('.is-leaving'))return;opener=b;items=[...root.querySelectorAll('[data-image]')].filter(x=>x.dataset.gallery===b.dataset.gallery&&!x.closest('[hidden]'));current=items.indexOf(b);if(current<0){items=[b];current=0}
 closing=false;dialog.querySelector('#sk-viewer-title').textContent=b.dataset.galleryTitle;stage.querySelectorAll('img').forEach(i=>i.remove());dialog.showModal();overflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';showImage(current,false);
 dialog.animate([{opacity:0,transform:`translateY(${distance(8)}px)`},{opacity:1,transform:'translateY(0)'}],{duration:duration('viewer'),easing:ease});
});
prev.addEventListener('click',()=>showImage(current-1));next.addEventListener('click',()=>showImage(current+1));dialog.querySelector('.sk-dialog-close').addEventListener('click',closeDialog);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog()});
dialog.addEventListener('keydown',e=>{if(closing)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showImage(current+(e.key==='ArrowLeft'?-1:1))}else if(e.key==='Home'||e.key==='End'){e.preventDefault();showImage(e.key==='Home'?0:items.length-1)}});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()}});
let touch=null;stage.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});stage.addEventListener('touchmove',e=>{if(e.touches.length!==1)touch=null},{passive:true});stage.addEventListener('touchend',e=>{if(!touch||closing)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)showImage(current+(dx<0?1:-1))},{passive:true});
dialog.addEventListener('close',()=>{++loadToken;cancelViewer();document.documentElement.style.overflow=overflow;opener?.focus({preventScroll:true})});
motion.addEventListener('change',()=>{if(motion.matches){registry.forEach(cancel);root.querySelectorAll('.sk-reveal').forEach(e=>e.classList.add('is-visible'));root.querySelectorAll('.sk-rail').forEach(stopScroll);stopScroll(window);cancelViewer()}});
root.classList.add('sk-ready');reveal();
})();
