const rail = document.createElement('div');
rail.className = 'page-scroll-rail';
const thumb = document.createElement('div');
thumb.className = 'page-scroll-thumb';
rail.append(thumb);
document.body.append(rail);
let drag = null;

function syncScrollbar() {
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  rail.hidden = maxScroll <= 0;
  const travel = Math.max(0, rail.clientHeight - 128);
  thumb.style.top = `${maxScroll > 0 ? scrollY / maxScroll * travel : 0}px`;
}

thumb.addEventListener('pointerdown', (event) => {
  drag = { y: event.clientY, scroll: scrollY };
  thumb.setPointerCapture(event.pointerId);
  event.preventDefault();
});
thumb.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const travel = Math.max(1, rail.clientHeight - 128);
  const range = document.documentElement.scrollHeight - innerHeight;
  scrollTo(0, drag.scroll + (event.clientY - drag.y) / travel * range);
});
function stopDrag() { drag = null; }
thumb.addEventListener('pointerup', stopDrag);
thumb.addEventListener('pointercancel', stopDrag);
rail.addEventListener('wheel', (event) => {
  event.preventDefault();
  scrollBy(0, event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? innerHeight : 1));
}, { passive: false });
addEventListener('scroll', syncScrollbar, { passive: true });
addEventListener('resize', syncScrollbar);
new ResizeObserver(syncScrollbar).observe(document.body);
syncScrollbar();
