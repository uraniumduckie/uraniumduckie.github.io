(() => {
  const pond = document.querySelector('#art-pond');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ducks = Array.from({ length: 30 }, () => {
    const el = new Image();
    el.src = 'assets/duck.png';
    el.className = 'art-duck';
    el.alt = '';
    pond.append(el);
    return {
      el, x: Math.random(), y: Math.random(),
      angle: Math.random() * Math.PI * 2,
      target: Math.random() * Math.PI * 2,
      speed: 12 + Math.random() * 16, turn: 0
    };
  });
  let last = 0;
  function frame(time) {
    const dt = Math.min((time - last) / 1000, 0.05);
    last = time;
    for (const d of ducks) {
      const width = Math.max(1, innerWidth - d.el.offsetWidth);
      const height = Math.max(1, innerHeight - d.el.offsetHeight);
      if (!motion.matches) {
        d.turn -= dt;
        if (d.turn <= 0) {
          d.target = d.angle + (Math.random() - 0.5) * 2;
          d.turn = 1 + Math.random() * 4;
        }
        const delta = Math.atan2(Math.sin(d.target - d.angle), Math.cos(d.target - d.angle));
        d.angle += delta * Math.min(1, dt * 1.4);
        d.x += Math.cos(d.angle) * d.speed * dt / width;
        d.y += Math.sin(d.angle) * d.speed * dt / height;
        if (d.x < 0 || d.x > 1) {
          d.x = Math.max(0, Math.min(1, d.x));
          d.angle = Math.PI - d.angle;
          d.target = d.angle;
        }
        if (d.y < 0 || d.y > 1) {
          d.y = Math.max(0, Math.min(1, d.y));
          d.angle = -d.angle;
          d.target = d.angle;
        }
      }
      d.el.style.transform = `translate(${d.x * width}px, ${d.y * height}px) scaleX(${Math.cos(d.angle) < 0 ? -1 : 1})`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
