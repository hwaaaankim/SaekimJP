(() => {
 'use strict';
 const init = () => {
  const header = document.getElementById('header');
  if (!header) return;
  let queued = false;
  const sync = () => { queued = false; header.classList.toggle('scroll', window.scrollY >= 10); };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(sync); } };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('pageshow', sync);
  window.addEventListener('resize', schedule, {passive:true});
  sync();
 };
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
 else init();
})();
