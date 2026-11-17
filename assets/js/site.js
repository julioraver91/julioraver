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
 };
 carousel.querySelector('[data-prev]')?.addEventListener('click',()=>show(current-1));
 carousel.querySelector('[data-next]')?.addEventListener('click',()=>show(current+1));
 dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.dot))));
 slides.forEach((slide,i)=>slide.addEventListener('click',()=>{if(i!==current)show(i)}));
 carousel.addEventListener('keydown',event=>{
  if(event.target.closest('video'))return;
  if(event.key==='ArrowLeft'){event.preventDefault();show(current-1)}
  if(event.key==='ArrowRight'){event.preventDefault();show(current+1)}
 });
 show(0);
});
