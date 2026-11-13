// Full-screen foreground petals. Each depth band moves at a different speed.
async function playOpening() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('gust');
  if (reduced) { await new Promise(resolve=>setTimeout(resolve,1700)); return; }
  const brush=canvas.getContext('2d');
  const petals=Array.from({length:395},(_,i)=>{
    const depth=(i%29)/28;
    return {x:Math.random()*1.4-.2,y:Math.random()*1.95-.22,
      size:.007+depth**3*.12,speed:.16+depth*.21,spin:Math.random()*6.28,
      tint:['#ffdedb','#eeb7ca','#dea5bc','#fbe3df','#c89bae'][i%5]};
  });
  const shape=new Path2D('M0 1 C-.65 .68 -1.04 -.12 -.56 -.76 Q-.28 -1.05 -.03 -.74 Q.21 -1.1 .5 -.84 C1.07 -.47 .86 .29 0 1Z');
  return new Promise(resolve=>{
    let previous=performance.now(), elapsed=0;
    function frame(now){
      const delta=(now-previous)/1000; previous=now;
      // CSS scene choreography uses real elapsed time as well.
      elapsed+=delta;
      if(elapsed>=12.9){brush.clearRect(0,0,canvas.width,canvas.height);resolve();return;}
      const w=canvas.clientWidth,h=canvas.clientHeight,ratio=Math.min(devicePixelRatio||1,1.5);
      if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){
        canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
      }
      brush.setTransform(ratio,0,0,ratio,0,0);brush.clearRect(0,0,w,h);
      for(const p of petals){
        const y=p.y-elapsed*p.speed;
        if(y<-.25||y>1.3)continue;
        const x=p.x+.075*elapsed+.075*Math.sin(p.spin+elapsed*1.1);
        const s=p.size*Math.min(w,h);
        brush.save();brush.translate(x*w,y*h);brush.rotate(p.spin+elapsed*(.38+p.speed));
        brush.scale(s*(.20+.8*Math.abs(Math.cos(p.spin+elapsed))),s);
        brush.fillStyle=p.tint;brush.fill(shape);brush.restore();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
