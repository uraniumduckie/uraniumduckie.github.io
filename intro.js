(() => {
  const url = new URL(window.location.href);
  if (url.searchParams.get('skipIntro') === '1') {
    document.querySelector('#duck-intro').remove();
    document.body.classList.remove('intro-active');
    url.searchParams.delete('skipIntro');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    return;
  }

const intro = document.querySelector('#duck-intro');
const introDuck = document.querySelector('#intro-duck');
const page = document.querySelector('main');
const controls = document.querySelector('.controls');
const motionReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let introClicks = 0;

page.inert = true;
controls.inert = true;

introDuck.addEventListener('click', () => {
  playQuack();
  introClicks++;
  intro.dataset.stage = String(introClicks);
  introDuck.setAttribute('aria-label', `Click the duck to enter, ${3 - introClicks} clicks remaining`);

  if (introClicks < 3) {

    return;
  }

  introDuck.disabled = true;

  if (!motionReduced) {
    const flash = document.createElement('div');
    flash.className = 'intro-flash';
    flash.setAttribute('aria-hidden', 'true');
    document.body.append(flash);
    const flashAnimation = flash.animate([
      { opacity: 0 },
      { opacity: 0.9, offset: 0.15 },
      { opacity: 0 }
    ], { duration: 550, easing: 'ease-out' });
    flashAnimation.onfinish = () => flash.remove();
  }

  const rect = introDuck.getBoundingClientRect();
  for (let i = 0; i < 80; i++) {
    const particle = document.createElement('span');
    particle.className = 'intro-particle';
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    particle.style.background = ['#ffe239', '#fffdf0', '#ffffff', '#72d5ed'][i % 4];
    intro.append(particle);
    const angle = Math.random() * Math.PI * 2;
    const distance = 180 + Math.random() * Math.max(innerWidth, innerHeight) * 0.65;
    const animation = particle.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, opacity: 0 }
    ], { duration: motionReduced ? 1 : 850, easing: 'ease-out' });
    animation.onfinish = () => particle.remove();
  }

  setTimeout(() => {
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-complete');
    page.inert = false;
    controls.inert = false;
    const heading = page.querySelector('h1');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    setTimeout(() => intro.remove(), motionReduced ? 0 : 1000);
  }, motionReduced ? 0 : 300);
});

})();
