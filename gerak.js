// Draw petals and short effects in the same coordinate system as the room.
const canvas = document.getElementById('air');
const ctx = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const game = document.getElementById('game');
let sparks = [], last = 0, t = 0, animation = 0;
const petals = Array.from({length:16},(_,i)=>({x:(i*147)%1100,y:(i*43)%350,s:2+i%3}));
function resizeAir(){
  const scale=Math.min(devicePixelRatio||1,2)*canvas.clientWidth/1280;
  canvas.width=Math.max(1,Math.round(1280*scale));canvas.height=Math.max(1,Math.round(720*scale));
  ctx.setTransform(canvas.width/1280,0,0,canvas.height/720,0,0);
}
new ResizeObserver(resizeAir).observe(canvas);
function paint(now){
  const dt=Math.min((now-last)/1000,.06);last=now;t+=dt;
  ctx.clearRect(0,0,1280,720);
  for(const [i,p] of petals.entries()){
    const x=225+(p.x+t*(10+i%5))%845,y=45+(p.y+t*(5+i%4))%320;
    ctx.save();ctx.translate(x,y);ctx.rotate(t*.7+i);
    ctx.fillStyle=i%2?'#f6c1adad':'#f7d5a4a6';ctx.beginPath();ctx.ellipse(0,0,p.s,p.s*.48,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  for(const s of sparks){
    s.life-=dt;s.x+=s.dx*dt;s.y+=s.dy*dt;s.dy+=48*dt;
    ctx.globalAlpha=Math.max(0,s.life);ctx.fillStyle=s.color;ctx.fillRect(s.x,s.y,4,4);
  }
  ctx.globalAlpha=1;sparks=sparks.filter(s=>s.life>0);animation=requestAnimationFrame(paint);
}
function syncMotion(){
  cancelAnimationFrame(animation);ctx.clearRect(0,0,1280,720);last=performance.now();
  if(!motion.matches && !document.hidden)animation=requestAnimationFrame(paint);
}
motion.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncMotion);syncMotion();
function propEffect(name){
  if(motion.matches)return;
  const prop=document.querySelector('#atelier .'+name);
  if(!prop)return;
  const rotations={bouquet:[-4,5,0],'camera-prop':[0,-3,0],gift:[0,4,0]};
  prop.animate(rotations[name].map(a=>({transform:'rotate('+a+'deg)'})),{duration:620,easing:'ease-in-out'});
  const centers={bouquet:[335,504],'camera-prop':[580,556],gift:[765,560]};
  const [x,y]=centers[name];
  for(let i=0;i<22;i++){const a=i*Math.PI/11;sparks.push({x,y,dx:Math.cos(a)*42,dy:Math.sin(a)*44-20,life:1,color:'#ffd897'});}
}
for(const name of ['bouquet','camera-prop','gift']){
  const prop=document.querySelector('#atelier .'+name);
  if(prop)prop.addEventListener('click',()=>propEffect(name));
}
