const quackSound = new Audio('assets/quack.mp3');
quackSound.preload = 'auto';

function playQuack() {
  const sound = quackSound.cloneNode();
  sound.volume = 0.7;
  const playback = sound.play();
  if (playback) playback.catch(() => {});
}
