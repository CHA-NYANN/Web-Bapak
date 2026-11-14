const $=id=>document.getElementById(id);
const gameRoot=$('game'), set=$('set'), props=$('props'), shade=$('shade');
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,calm()?Math.min(ms,130):ms));
let part=2, frame=0, first=0, seen=new Set(), busy=false;
let room='loft', videoSession=0;
function scene(id){
  gameRoot.dataset.scene=id;
  const overlay=['gallery','ending','screening'].includes(id);
  for(const layer of document.querySelectorAll('.layer')) layer.hidden=layer.id!==id && !(overlay && layer.id==='travel');
  $('travel').inert=overlay;
}
function button(label,cls,action){
  const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.onclick=action;return b;
}
async function move(node,frames,ms,easing='ease-in-out',hold=false){
  const anim=node.animate(frames,{duration:calm()?1:ms,easing,fill:hold?'forwards':'none'});
  await anim.finished;
  return anim;
}
function drawRoom(name){
  room=name;set.className=name;props.replaceChildren();$('friends').hidden=true;
  if(name==='loft'){
    photos[2].forEach((p,i)=>{
      const b=button('Lihat foto: '+p.caption,'wall-print',()=>openAlbum(2,i,b));
      const row=Math.floor(i/6),col=i%6;
      b.style.cssText='left:'+(14+col*12.4)+'%;top:'+(19.4+row*17.1+Math.sin(col*.62)*1.5)+'%;--tilt:'+((i*11)%13-6)+'deg;--delay:'+(-i*.47)+'s';
      const im=new Image();im.src=p.src;im.alt='';b.append(im);props.append(b);
    });
  }else if(name==='salon'){
    const portrait=new Image();
    portrait.className='family-portrait';
    portrait.src='asset/1000265991.jpg.jpeg';
    portrait.alt='Foto keluarga lama di dalam pigura kayu di atas kotatsu';
    props.append(portrait);
    const cam=button('Lihat foto di kamera','film-camera',()=>openAlbum(1,0,cam));
    cam.innerHTML='<span>Lihat kamera</span>';props.append(cam);const door=document.createElement('div');door.className='side-door';props.append(door);
  }else{
    addPetals();
  }
}
async function graduationFlight(){
  const leaf=document.createElement('figure');
  leaf.className='memory-petal';
  const print=new Image();
  leaf.append(print);
  for(const [index,photo] of photos[0].entries()){
    print.src=photo.src;
    print.alt=photo.caption;
    await print.decode().catch(()=>{});
    leaf.classList.toggle('portrait',photo.h>photo.w);
    leaf.style.top=(index%2===0?'44%':'50%');
    props.append(leaf);
    if(calm()){
      await new Promise(resolve=>setTimeout(resolve,3600));
    }else{
      await move(leaf,[
        {transform:'translate(-155%,54%) rotate(-21deg) scale(.38)',opacity:0},
        {transform:'translate(-63%,-43%) rotate(-4deg) scale(.97)',opacity:1,offset:.26},
        {transform:'translate(-38%,-51%) rotate(2deg) scale(1)',opacity:1,offset:.72},
        {transform:'translate(170%,-110%) rotate(19deg) scale(.62)',opacity:0}
      ],5300,'linear');
    }
    leaf.remove();
  }
}
function addPetals(){
  for(let i=0;i<24;i++){const p=document.createElement('i');p.className='loose';p.style.cssText='left:'+((i*13)%80)+'%;top:'+((i*17)%68)+'%;--time:'+(5+i%6)+'s;--delay:-'+i+'s';props.append(p);}
}
async function enterLoft(){
  scene('flight');
  const flight=await move($('atelier'),[{transform:'scale(1)'},{transform:'scale(2.4)',offset:.45},{transform:'scale(26)'}],2150,'cubic-bezier(.5,.03,.72,.99)',true);
  drawRoom('loft');scene('travel');flight.cancel();
  await move(set,[{transform:'scale(.82)',opacity:.1},{transform:'scale(1)',opacity:1}],780);
  props.querySelector('button').focus({preventScroll:true});
}
async function travelTo(next){
  scene('travel');props.inert=true;
  const staircase=next==='salon';
  if(!staircase){const door=props.querySelector('.side-door');if(door)await move(door,[{transform:'scaleX(1)'},{transform:'scaleX(.035)'}],850,'ease-in-out',true);}
  const exit=await move(set,[{transform:'none'},{transform:staircase?'translate(-27%,-18%) scale(1.65) rotate(-1deg)':'translate(-36%,3%) scale(2.1)',opacity:.85,offset:.72},{transform:staircase?'translate(-40%,-48%) scale(2.1)':'translate(-55%,7%) scale(3.2)',opacity:0}],1700,'ease-in',true);
  drawRoom(next);exit.cancel();
  await move(set,[{transform:staircase?'translateY(24%) scale(1.22)':'translateX(12%) scale(.85)',opacity:.2},{transform:'none',opacity:1}],1100);
  if(next==='garden')await move($('scenery'),[{transform:'scale(.96)'},{transform:'scale(1.06)',transformOrigin:'35% 42%'}],1100,'ease-out',true);
  props.inert=false;
  if(next==='garden'){
    await graduationFlight();
    await sitDown();
  }else props.querySelector('button').focus({preventScroll:true});
}
function renderFrame(){
  const group=photos[part],p=group[frame];seen.add(frame);
  $('photo').src=p.src;$('photo').alt=p.caption;$('under-photo').src=group[(frame+1)%group.length].src;
  $('count').textContent=(seen.size===group.length?group.length:((frame-first+group.length)%group.length)+1)+' / '+group.length;
  $('finishAlbum').hidden=seen.size!==group.length;
  $('finishAlbum').textContent=part===1?'Letakkan kamera':'Letakkan foto';
}
async function openAlbum(which,index,trigger){
  if(busy)return;
  busy=true;part=which;first=frame=index;seen=new Set();
  const start=trigger.getBoundingClientRect();
  $('gallery').className='layer gallery '+(part===1?'camera':'paper');renderFrame();scene('gallery');
  const end=$('pile').getBoundingClientRect();
  await move($('pile'),[{transform:'translate('+(start.x+start.width/2-end.x-end.width/2)+'px,'+(start.y+start.height/2-end.y-end.height/2)+'px) scale('+Math.min(.8,start.width/end.width)+')'},{transform:'none'}],550);
  busy=false;$('front').focus({preventScroll:true});
}
async function flip(by){
  if(busy)return;
  if(seen.size===photos[part].length && by===1){await finishAlbum();return;}
  busy=true;const locks=[$('next'),$('prev'),$('front'),$('finishAlbum')];locks.forEach(b=>b.disabled=true);
  const group=photos[part],next=(frame+by+group.length)%group.length,front=$('front');
  try{
    $('under-photo').src=group[next].src;
    await $('under-photo').decode().catch(()=>{});
    if(part===2&&!calm()){
      $('pile').style.setProperty('--direction',by);$('pile').classList.add('handling');
      const out='translate('+by*39+'%,-12%) rotate('+by*12+'deg)';
      const lifted=await move(front,[{transform:'rotate(-2deg)'},{transform:out}],300,'ease-in',true);
      front.style.zIndex='0';lifted.cancel();
      await move(front,[{transform:out},{transform:'rotate(4deg) scale(.96)'}],320);
    }else if(part===1){
      await move($('photo'),[{filter:'brightness(1)'},{filter:'brightness(.08)'}],125);
    }
    frame=next;renderFrame();
    if(part!==2)await move(front,[{opacity:.15},{opacity:1}],220);
  }finally{front.style.zIndex='';$('pile').classList.remove('handling');locks.forEach(b=>b.disabled=false);busy=false;}
}
async function finishAlbum(){
  if(busy||seen.size!==photos[part].length)return;busy=true;
  await travelTo(part===2?'salon':'garden');
  busy=false;
}
async function sitDown(){
  props.replaceChildren();addPetals();scene('travel');
  await move(set,[{transform:'none'},{transform:'translateY(-5%) scale(1.09)',transformOrigin:'45% 75%'}],1700,'ease-in-out',true);
  await pause(1100);
  $('friends').hidden=false;$('friends').classList.remove('giving');$('callout').hidden=false;$('tabletButton').hidden=false;$('envelopeButton').hidden=true;
  await move($('friends'),[{transform:'translateY(16%)',opacity:0},{transform:'none',opacity:1}],850);
  $('tabletButton').focus({preventScroll:true});
}
const video=$('messageVideo'), music=document.querySelector('audio');
async function takeTablet(){
  if(busy)return;busy=true;const token=++videoSession;
  $('callout').hidden=true;
  const push=await move($('friends'),[{transform:'none'},{transform:'scale(7)',transformOrigin:'41.1% 57%'}],1050,'ease-in',true);
  scene('screening');push.cancel();video.hidden=false;$('noVideo').hidden=true;music.pause();
  video.onerror=()=>{if(token!==videoSession)return;video.hidden=true;$('noVideo').hidden=false;$('returnTablet').focus();};
  video.onended=returnTablet;
  video.src='asset/ucapan.mp4';video.load();video.play().catch(()=>{});busy=false;
}
async function returnTablet(){
  if(busy||gameRoot.dataset.scene!=='screening')return;busy=true;videoSession++;
  video.onerror=null;video.onended=null;video.pause();video.removeAttribute('src');video.load();music.play().catch(()=>{});
  scene('travel');$('tabletButton').hidden=true;
  await move($('friends'),[{transform:'scale(7)',transformOrigin:'41.1% 57%'},{transform:'none'}],1000);
  $('friends').classList.add('giving');$('envelopeButton').hidden=false;
  await move($('friends'),[{transform:'none'},{transform:'translateX(-4%) scale(1.12)',transformOrigin:'57% 58%'}],620,'ease-out',true);
  busy=false;$('envelopeButton').focus({preventScroll:true});
}
async function openLetter(){
  if(busy)return;
  busy=true;
  const hand=$('envelopeButton').getBoundingClientRect();
  $('envelopeButton').hidden=true;
  $('friends').classList.add('delivered');
  $('advance').hidden=true;
  scene('ending');
  const envelope=document.querySelector('.letter-envelope');
  const target=envelope.getBoundingClientRect();
  const dx=hand.left+hand.width/2-target.left-target.width/2;
  const dy=hand.top+hand.height/2-target.top-target.height/2;
  await move(envelope,[{transform:`translate(${dx}px,${dy}px) scale(${hand.width/target.width}) rotate(-6deg)`},{transform:'none'}],540);
  await move(envelope.querySelector('.flap'),[{transform:'rotateX(0deg)'},{transform:'rotateX(178deg)'}],460,'ease-in-out',true);
  const letter=document.querySelector('.letter');
  const folds=letter.querySelectorAll('.fold');
  letter.classList.add('unfolding');
  const lower=move(envelope,[{transform:'none',opacity:1},{transform:'translateY(55%)',opacity:0}],650,'ease-in',true);
  await move(letter,[{transform:'translateY(32%) scale(.57)'},{transform:'none'}],660);
  for(const fold of [...folds].slice(1)){
    await move(fold,[{opacity:0,transform:'rotateX(-89deg)'},{opacity:1,transform:'none'}],430,'ease-out',true);
  }
  await lower;
  $('advance').hidden=false;busy=false;$('advance').focus({preventScroll:true});
}
async function closeStory(){
  busy=true;
  await move(document.querySelector('.letter'),[{transform:'none',opacity:1},{transform:'rotateX(65deg) scale(.6)',opacity:0}],420);
  scene('travel');$('friends').classList.remove('delivered');$('friends').hidden=true;
  document.querySelector('.letter').classList.remove('unfolding');
  $('ending').getAnimations({subtree:true}).forEach(anim=>anim.cancel());
  drawRoom('garden');
  await move(set,[{transform:'scale(1.1)'},{transform:'translate(18%,5%) scale(1.45)',opacity:0}],1000);
  drawRoom('salon');props.replaceChildren();
  await move(set,[{opacity:.1,transform:'translateX(12%) scale(1.08)'},{opacity:1,transform:'none'}],800);
  gameRoot.dataset.scene='closing';await pause(1300);
  for(const el of [set,$('scenery'),$('friends')])el.getAnimations().forEach(a=>a.cancel());
  $('enter').disabled=false;scene('arrival');$('enter').focus({preventScroll:true});busy=false;
}
$('tabletButton').onclick=takeTablet;$('returnTablet').onclick=returnTablet;
$('envelopeButton').onclick=openLetter;
$('advance').onclick=()=>{if(!busy)closeStory();};
$('prev').onclick=()=>flip(-1);$('next').onclick=$('front').onclick=()=>flip(1);$('finishAlbum').onclick=finishAlbum;
$('enter').onclick=async()=>{if(busy)return;busy=true;$('enter').disabled=true;scene('opening');await playOpening();await enterLoft();busy=false;};

