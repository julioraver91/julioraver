document.documentElement.classList.add('js');
const revealItems=document.querySelectorAll('.reveal');
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -30px 0px'});
 revealItems.forEach((item,index)=>{if(item.classList.contains('card'))item.style.transitionDelay=`${index%3*90}ms`;observer.observe(item)});
}else revealItems.forEach(item=>item.classList.add('visible'));
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.querySelectorAll('.card').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--x',`${x*100}%`);card.style.setProperty('--y',`${y*100}%`);card.style.transform=`perspective(900px) translateY(-6px) rotateX(${(.5-y)*2}deg) rotateY(${(x-.5)*2}deg)`});card.addEventListener('pointerleave',()=>{card.style.transform='';card.style.removeProperty('--x');card.style.removeProperty('--y')})})}


// Floating video galleries: center the active clip and show its adjacent previews.
document.querySelectorAll('[data-carousel]').forEach(carousel=>{
 const slides=[...carousel.querySelectorAll('[data-slide]')];
 const dots=[...carousel.querySelectorAll('[data-dot]')];
 const count=carousel.querySelector('[data-count]');
 if(!slides.length)return;
 let current=0;
 let dragStart=null;
 let suppressSlideClickUntil=0;
 const viewport=carousel.querySelector('.pb-viewport');
 const capturePoster=video=>{
  if(video.dataset.posterReady||video.readyState<2||!video.videoWidth||!video.videoHeight)return;
  try{
   const canvas=document.createElement('canvas');
   canvas.width=Math.min(video.videoWidth,480);
   canvas.height=Math.round(canvas.width*video.videoHeight/video.videoWidth);
   canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
   video.poster=canvas.toDataURL('image/jpeg',.78);
   video.dataset.posterReady='true';
   video.pause();
   video.preload='none';
   video.load();
  }catch(error){video.dataset.posterError='true'}
 };
 slides.forEach(slide=>{
  const video=slide.querySelector('video');
  if(!video)return;
  video.addEventListener('loadedmetadata',()=>{
   if(!video.dataset.posterReady&&Number.isFinite(video.duration)&&video.duration>.4){
    video.addEventListener('seeked',()=>capturePoster(video),{once:true});
    video.currentTime=Math.min(video.duration*.15,1);
   }
  });
  video.addEventListener('loadeddata',()=>{if(!video.seeking)capturePoster(video)});
 });
 const show=index=>{
  current=(index+slides.length)%slides.length;
  const previous=(current-1+slides.length)%slides.length;
  const next=(current+1)%slides.length;
  slides.forEach((slide,i)=>{
   const video=slide.querySelector('video');
   const active=i===current;
   const visible=active||i===previous||i===next;
   slide.classList.remove('is-current','is-prev','is-next');
   slide.hidden=!visible;
   slide.setAttribute('aria-hidden',String(!active));
   if(video){
    video.controls=active;
    video.tabIndex=active?0:-1;
    if(visible&&!video.dataset.posterReady){video.preload='auto';if(video.readyState===0)video.load()}
    else if(!active){video.pause();video.preload='none';if(video.dataset.posterReady&&video.readyState>0)video.load()}
   }
   if(active)slide.classList.add('is-current');
   else if(i===previous)slide.classList.add('is-prev');
   else if(i===next)slide.classList.add('is-next');
  });
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
  if(count)count.textContent=`${current+1} / ${slides.length}`;
  carousel.classList.toggle('is-intro',current===0);
 };
 carousel.querySelector('[data-prev]')?.addEventListener('click',()=>show(current-1));
 carousel.querySelector('[data-next]')?.addEventListener('click',()=>show(current+1));
 dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.dot))));
 slides.forEach((slide,i)=>slide.addEventListener('click',()=>{
  if(Date.now()<suppressSlideClickUntil)return;
  if(i!==current)show(i);
 }));
 if(viewport){
  viewport.addEventListener('pointerdown',event=>{
   if(event.pointerType==='mouse'&&event.button!==0)return;
   if(event.target.closest('button,a,input,select,textarea'))return;
   dragStart={x:event.clientX,y:event.clientY,id:event.pointerId};
   viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('click',event=>{
   if(Date.now()<suppressSlideClickUntil){event.preventDefault();event.stopPropagation()}
  },true);
  const finishDrag=event=>{
   if(!dragStart||event.pointerId!==dragStart.id)return;
   const dx=event.clientX-dragStart.x;
   const dy=event.clientY-dragStart.y;
   dragStart=null;
   viewport.classList.remove('is-dragging');
   if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.2)return;
   event.preventDefault();
   suppressSlideClickUntil=Date.now()+500;
   show(dx<0?current+1:current-1);
  };
  window.addEventListener('pointerup',finishDrag);
  window.addEventListener('pointercancel',()=>{dragStart=null;viewport.classList.remove('is-dragging')});
 }
 carousel.addEventListener('keydown',event=>{
  if(event.target.closest('video'))return;
  if(event.key==='ArrowLeft'){event.preventDefault();show(current-1)}
  if(event.key==='ArrowRight'){event.preventDefault();show(current+1)}
 });
 show(0);
});


// Site-wide WhatsApp shortcut.
if(!document.querySelector('.whatsapp-float')){
 const whatsapp=document.createElement('a');
 whatsapp.className='whatsapp-float';
 whatsapp.href='https://wa.me/525662919301?text=Hola%2C%20me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20sus%20servicios.';
 whatsapp.target='_blank';
 whatsapp.rel='noopener noreferrer';
 whatsapp.setAttribute('aria-label','Escríbenos por WhatsApp');
 whatsapp.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.471-.149-.67.149-.198.297-.768.967-.942 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.735.98.997-3.644-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.438-9.884 9.893-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.441 9.883-9.895 9.883m8.413-18.293A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.334.157 11.89c0 2.096.547 4.142 1.588 5.945L.05 24l6.309-1.655a11.87 11.87 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.893-11.89a11.82 11.82 0 0 0-3.477-8.414"/></svg>';
 document.body.appendChild(whatsapp);
}
