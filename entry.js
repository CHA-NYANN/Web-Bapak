// Check before mounting the game or loading its photo catalog.
function handheld(nav, display, matches) {
  if (nav.userAgentData?.mobile) return true;
  if (/Android|iPhone|iPod|iPad|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(nav.userAgent)) return true;
  if (/MacIntel/.test(nav.platform) && nav.maxTouchPoints > 1) return true;
  const shortSide = Math.min(display.width, display.height);
  return nav.maxTouchPoints > 0 && shortSide <= 600 &&
    matches('(pointer: coarse)').matches && matches('(hover: none)').matches;
}
async function launch() {
  const gate = document.getElementById('gate');
  if (handheld(navigator, screen, q => window.matchMedia(q))) {
    gate.hidden = false;
    return;
  }
  const music=new Audio('asset/SPYAIR_-_Sakura_Mitsu_Tsuki_Radio_rip_(mp3.pm).mp3');
  music.loop=true;
  music.volume=.55;
  music.preload='auto';
  document.body.append(music);
  const unlock=()=>music.play().then(()=>{
    for(const event of ['pointerdown','click','keydown'])document.removeEventListener(event,unlock,true);
  }).catch(()=>{});
  for(const event of ['pointerdown','click','keydown'])document.addEventListener(event,unlock,true);
  unlock();
  document.body.append(document.getElementById('desktop').content.cloneNode(true));
  for (const file of ['photos.js', 'gerak.js', 'tsuki.js', 'script.js']) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = resolve;
      script.onerror = reject;
      script.src = file;
      document.head.append(script);
    });
  }
}
launch().catch(() => {
  document.querySelector('.game')?.remove();
  const message=document.createElement('p');
  message.textContent='Game belum bisa dimuat. Pastikan semua file game berada dalam satu folder, lalu buka kembali.';
  document.body.append(message);
});
