export async function renderPage(page, size = 1440) {
  const canvas = document.createElement('canvas'); canvas.width=size; canvas.height=Math.round(size*4/3);
  const ctx=canvas.getContext('2d');const scale=size/480;
  let bg=page.background||'#ffffff';
  if(page.gradient){const angle=(page.gradientAngle??135)*Math.PI/180;bg=ctx.createLinearGradient(size/2-Math.sin(angle)*size/2,canvas.height/2+Math.cos(angle)*canvas.height/2,size/2+Math.sin(angle)*size/2,canvas.height/2-Math.cos(angle)*canvas.height/2);bg.addColorStop(0,page.background||'#15171e');bg.addColorStop(1,page.backgroundEnd||'#211317');}
  ctx.fillStyle=bg;ctx.fillRect(0,0,size,canvas.height);
  const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';const timer=setTimeout(()=>reject(new Error('Immagine non disponibile')),15000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(new Error('Immagine non caricata'));};img.src=src;});
  const drawImage=(img,x,y,w,h,fit='contain')=>{const ratio=fit==='cover'?Math.max(w/img.width,h/img.height):Math.min(w/img.width,h/img.height);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();if(fit==='fill')ctx.drawImage(img,x,y,w,h);else ctx.drawImage(img,x+(w-img.width*ratio)/2,y+(h-img.height*ratio)/2,img.width*ratio,img.height*ratio);ctx.restore();};
  if(!page.blank&&page.src)drawImage(await load(page.src),0,0,size,canvas.height);
  for(const item of page.elements||[]){
    if(item.hidden)continue;
    const x=item.x/100*size,y=item.y/100*canvas.height,w=item.width/100*size,h=(item.height||0)/100*canvas.height;
    ctx.save();ctx.globalAlpha=item.opacity??1;ctx.translate(x+w/2,y+h/2);ctx.rotate((item.rotation||0)*Math.PI/180);ctx.translate(-w/2,-h/2);
    const ellipse=item.type==='shape'&&item.shape==='ellipse';
    const path=()=>{ctx.beginPath();if(ellipse)ctx.ellipse(w/2,h/2,w/2,h/2,0,0,Math.PI*2);else if(item.radius&&ctx.roundRect)ctx.roundRect(0,0,w,h,item.radius*scale);else ctx.rect(0,0,w,h);};
    if(item.background&&item.background!=='transparent'){path();ctx.fillStyle=item.background;ctx.fill();}
    if(item.type==='image'){const img=await load(item.src);drawImage(img,0,0,w,h||w/img.width*img.height,item.fit);}
    else if(['video','audio'].includes(item.type)){ctx.fillStyle='#e7e3e7';ctx.fillRect(0,0,w,h||40*scale);ctx.fillStyle='#852233';ctx.font=`${10*scale}px Arial`;ctx.fillText(item.type==='video'?'▷ Video interattivo':'♫ Audio interattivo',10*scale,20*scale);}
    else if(item.type!=='shape'){
      const fontSize=(item.fontSize||24)*scale,lineHeight=fontSize*(item.lineHeight||1.35);
      ctx.font=`${item.italic?'italic ':''}${item.bold?'700':'400'} ${fontSize}px ${item.fontFamily==='Georgia'?'Georgia':item.fontFamily==='Courier'?'Courier New':item.fontFamily||'Arial'}`;
      ctx.letterSpacing=(item.letterSpacing||0)*scale+'px';ctx.fillStyle=item.color||'#222222';ctx.textBaseline='top';ctx.textAlign=item.align||'left';
      let lineY=(lineHeight-fontSize)/2;const textX=ctx.textAlign==='center'?w/2:ctx.textAlign==='right'?w:0;
      for(const paragraph of (item.text||'').split('\n')){let line='';const draw=()=>{ctx.fillText(line,textX,lineY);if(item.underline){const width=ctx.measureText(line).width;ctx.fillRect(textX-(ctx.textAlign==='center'?width/2:ctx.textAlign==='right'?width:0),lineY+fontSize,width,Math.max(1,scale*.5));}lineY+=lineHeight;};for(const char of paragraph){if(line&&ctx.measureText(line+char).width>w){draw();line='';}line+=char;}draw();}
    }
    if(item.borderWidth){path();ctx.strokeStyle=item.borderColor||'#852233';ctx.lineWidth=item.borderWidth*scale;ctx.stroke();}
    ctx.restore();
  }
  return canvas.toDataURL('image/jpeg',size<400?.8:.94);
}
