const lightbox = document.querySelector('.art-lightbox');
const enlargedImage = lightbox.querySelector('img');
let activeArtwork = null;
let closing = false;

function openArtwork(image) {
  activeArtwork = image;
  image.closest('.art-reel').classList.add('has-selected-artwork');
  enlargedImage.src = image.src;
  enlargedImage.alt = image.alt;
  document.body.classList.add('lightbox-open');
  lightbox.showModal();

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const start = image.getBoundingClientRect();
    requestAnimationFrame(() => {
      const end = enlargedImage.getBoundingClientRect();
      enlargedImage.animate([
        { transform: `translate(${start.left + start.width / 2 - end.left - end.width / 2}px, ${start.top + start.height / 2 - end.top - end.height / 2}px) scale(${start.width / end.width})`, opacity: 0.6 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 }
      ], { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    });
  }
}

document.querySelectorAll('.art-slot img').forEach((image) => {
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `Enlarge ${image.alt}`);
  image.addEventListener('click', () => openArtwork(image));
  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openArtwork(image);
    }
  });
});

async function closeArtwork() {
  if (closing || !lightbox.open) return;
  closing = true;

  if (activeArtwork && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Start from the current visual position, even if opening is still in progress.
    const current = enlargedImage.getBoundingClientRect();
    enlargedImage.getAnimations().forEach((animation) => animation.cancel());
    const base = enlargedImage.getBoundingClientRect();
    const target = activeArtwork.getBoundingClientRect();
    const transformFor = (rect) => `translate(${rect.left + rect.width / 2 - base.left - base.width / 2}px, ${rect.top + rect.height / 2 - base.top - base.height / 2}px) scale(${rect.width / base.width})`;
    lightbox.classList.add('is-closing');
    const animation = enlargedImage.animate([
      { transform: transformFor(current), opacity: 1 },
      { transform: transformFor(target), opacity: 0.82 }
    ], { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
    await animation.finished.catch(() => {});
    lightbox.close();
    animation.cancel();
  } else {
    lightbox.close();
  }
}

lightbox.querySelector('.lightbox-close').addEventListener('click', closeArtwork);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeArtwork();
});
lightbox.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeArtwork();
});
lightbox.addEventListener('close', () => {
  lightbox.classList.remove('is-closing');
  closing = false;
  document.body.classList.remove('lightbox-open');
  if (activeArtwork) activeArtwork.closest('.art-reel').classList.remove('has-selected-artwork');
  if (activeArtwork) activeArtwork.focus({ preventScroll: true });
});

document.querySelector('#gallery-random').addEventListener('click', () => {
  const artworks = [...document.querySelectorAll('.art-sequence:not([aria-hidden]) img')];
  const image = artworks[Math.floor(Math.random() * artworks.length)];
  if (!image) return;
  image.closest('.art-reel').showArtwork(image);
  openArtwork(image);
});
