(() => {
  const image = document.querySelector('.about-managed-banner .about-banner-image');
  if (!image) return;
  const fallback = '/front/images/main/6.png';
  function restore() {
    if (image.getAttribute('src') !== fallback) image.src = fallback;
  }
  image.addEventListener('error', restore);
  if (image.complete && !image.naturalWidth) restore();
})();
