// A low-resolution landscape, painted once so every screen can share the same night sky.
(() => {
  const c = document.getElementById('night').getContext('2d');
  let seed = 617;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function rect(x,y,w,h,color) {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
  }
  function disk(cx,cy,r,color) {
    for (let y=-r; y<=r; y++) {
      const w=Math.floor(Math.sqrt(r*r-y*y));
      rect(cx-w,cy+y,w*2+1,1,color);
    }
  }
  function star(x,y,s,color) {
    rect(x-s,y,s*2+1,1,color); rect(x,y-s,1,s*2+1,color);
  }
  function ridge(base,amplitude,freq,phase,color) {
    for(let x=0;x<480;x+=2) {
      const y=base+amplitude*(Math.sin(x*freq+phase)+.39*Math.sin(x*.079+phase)+.2*Math.cos(x*.15));
      rect(x,y,2,270-y,color);
    }
  }
  const gradient=c.createLinearGradient(0,0,0,270);
  ['#101431','#283260','#67547d','#cf8595','#e9a59c'].forEach((color,i)=>gradient.addColorStop(i/4,color));
  c.fillStyle=gradient;c.fillRect(0,0,480,270);
  for(let i=0;i<1900;i++) {
    const x=random()*480;
    const y=130-x*.23+Math.sin(x*.018)*8+(random()+random()-1)*28;
    rect(x,y,random()*4+1,1,'rgba(202,163,223,.12)');
  }
  for(let i=0;i<340;i++) {
    const x=random()*480,y=random()*175;
    if(i%24===0) star(x,y,2,'#ffdfa7'); else rect(x,y,1,1,i%3?'#c5b9d1':'#ffe8d1');
  }
  disk(361,56,24,'#c8a5b3');disk(361,55,23,'#ffdeb1');
  disk(353,48,5,'#f2c79f');disk(366,64,4,'#f3cba5');disk(350,60,2,'#f0c19e');
  for(let i=0;i<34;i++) {
    const x=random()*480,y=82+random()*68,w=7+random()*38;
    rect(x,y,w,2,'#ad80a2');rect(x+3,y-2,w*.6,2,'#bf91a6');
  }
  ridge(157,13,.034,1,'#8f7898');
  ridge(172,16,.024,2,'#665d86');
  ridge(190,14,.032,1,'#474c75');
  function pine(x,y,h,color) {
    rect(x-1,y-h,2,h,color);
    for(let k=0;k<3;k++) {
      const t=y-h+k*h*.19;
      for(let j=0;j<h*.36;j+=2) rect(x-j*.56,t+j,Math.max(1,j*1.12),2,color);
    }
  }
  for(let i=0;i<100;i++) pine(random()*480,192+random()*21,8+random()*15,'#394469');
  // Floating observatory island, with exposed strata and hanging vines.
  for(let x=267;x<467;x++) {
    const t=(x-267)/200;
    const top=190+Math.cos(t*6.28)*5+Math.sin(x*.16)*2;
    const depth=Math.sin(t*Math.PI)*(28+18*Math.sin(t*12)**2+8*Math.cos(x*.24));
    rect(x,top,1,Math.max(1,depth),'#262c4b');
    rect(x,top,1,4,'#89958a');rect(x,top+3,1,4,'#546776');
    if(depth>15)rect(x,top+8,1,3+4*Math.sin(x*.08),'#46516c');
    if(x%11===0 && depth>20)rect(x,top+9,1,depth*.54,'#68637b');
  }
  // An observatory dome with ribs, illuminated windows and the lab annex.
  rect(325,154,69,32,'#313753');rect(330,157,59,28,'#50506a');
  for(let y=0;y<=27;y++){
    const w=Math.floor(Math.sqrt(1-(y/28)**2)*34);
    rect(360-w,152-y,2*w,1,y>16?'#7c859a':'#606a87');
    rect(360-w,152-y,3,1,'#afacb2');
    rect(360-Math.floor(w*.43),152-y,2,1,'#adb0b9');
    rect(360+Math.floor(w*.58),152-y,2,1,'#444e70');
  }
  rect(322,152,76,3,'#b1a2a3');rect(323,155,74,3,'#394361');
  for(let i=0;i<6;i++){rect(333+i*9,163,6,12,'#282d4a');rect(334+i*9,164,4,8,i%2?'#ffc586':'#f3ac79');rect(334+i*9,168,4,1,'#986c6e');}
  rect(391,166,35,21,'#454764');rect(389,163,40,4,'#82819a');
  rect(398,171,17,9,'#f2bd87');rect(405,171,2,9,'#586075');
  for(let i=0;i<6;i++)rect(319-i*2,182+i,72+i*4,1,'#656779');
  for(let i=0;i<12;i++)pine(289+random()*31,187+random()*5,12+random()*14,'#35485c');
  for(let i=0;i<8;i++)pine(431+random()*25,192,16+random()*12,'#344458');
  ridge(250,12,.021,1,'#202940');
  for(let i=0;i<27;i++)pine(i*19+random()*7,267+random()*12,14+random()*26,'#18233c');
})();
