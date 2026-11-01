document.querySelectorAll('.art-reel').forEach((reel, index) => {
  const track = reel.querySelector('.art-track');
  reel.tabIndex = 0;
  reel.setAttribute('role', 'region');
  reel.setAttribute('aria-label', `Art column ${index + 1}. Scroll or use arrow keys to browse.`);

  const sequence = track.querySelector('.art-sequence');
  const duration = [75, 88, 81][index];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let height = 0;
  let position = 0;
  let pendingScroll = 0;
  let lastTime = 0;
  let speedFactor = 1;

  track.style.animation = 'none';

  function measure() {
    const nextHeight = sequence.getBoundingClientRect().height;
    if (!nextHeight) return;
    position = height ? position * nextHeight / height : nextHeight * [0, 0.3, 0.63][index];
    height = nextHeight;
  }

  new ResizeObserver(measure).observe(sequence);
  measure();

  function scrollColumn(pixels) {
    pendingScroll += pixels;
  }

  reel.showArtwork = (image) => {
    const offset = image.getBoundingClientRect().top - sequence.getBoundingClientRect().top;
    position = height - offset + (reel.clientHeight - image.offsetHeight) / 2;
    pendingScroll = 0;
    position = ((position % height) + height) % height;
    track.style.transform = `translate3d(0, ${position - height}px, 0)`;
  };

  function frame(time) {
    const dt = Math.min((time - (lastTime || time)) / 1000, 0.05);
    lastTime = time;
    if (height) {
      // Ease wheel and keyboard input over successive frames, including at the loop seam.
      const step = pendingScroll * (reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 14));
      pendingScroll -= step;
      if (Math.abs(pendingScroll) < 0.01) pendingScroll = 0;
      position -= step;

      const paused = reel.classList.contains('has-selected-artwork')
        || reel.classList.contains('is-browsing')
        || reel.matches(':focus-visible');
      const hovered = matchMedia('(hover: hover)').matches && reel.matches(':hover');
      const targetSpeed = hovered || paused || reducedMotion.matches ? 0 : 1;

      // Ease hover stops and restarts; keep selected artwork fixed in place.
      speedFactor += (targetSpeed - speedFactor) * (1 - Math.exp(-dt * 9));
      if (Math.abs(speedFactor - targetSpeed) < 0.001) speedFactor = targetSpeed;
      if (paused || reducedMotion.matches) speedFactor = 0;
      position += height / duration * speedFactor * dt;

      // Identical adjacent sequences make wrapping visually seamless in either direction.
      position = ((position % height) + height) % height;
      track.style.transform = `translate3d(0, ${position - height}px, 0)`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  reel.addEventListener('wheel', (event) => {
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? reel.clientHeight : 1;
    scrollColumn(event.deltaY * unit);
  }, { passive: false });

  let previousY = null;
  reel.addEventListener('touchstart', (event) => {
    previousY = event.touches[0].clientY;
    reel.classList.add('is-browsing');
  }, { passive: true });

  reel.addEventListener('touchmove', (event) => {
    if (previousY === null) return;
    event.preventDefault();
    const y = event.touches[0].clientY;
    scrollColumn(previousY - y);
    previousY = y;
  }, { passive: false });

  function endTouch() {
    previousY = null;
    reel.classList.remove('is-browsing');
  }
  reel.addEventListener('touchend', endTouch);
  reel.addEventListener('touchcancel', endTouch);

  reel.addEventListener('keydown', (event) => {
    const distances = { ArrowDown: 70, ArrowUp: -70, PageDown: reel.clientHeight * 0.8, PageUp: -reel.clientHeight * 0.8 };
    if (!(event.key in distances)) return;
    event.preventDefault();
    scrollColumn(distances[event.key]);
  });
});
