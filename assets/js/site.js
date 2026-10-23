document.documentElement.classList.add('js');
const revealItems=document.querySelectorAll('.reveal');
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -30px 0px'});
 revealItems.forEach((item,index)=>{if(item.classList.contains('card'))item.style.transitionDelay=`${index%3*90}ms`;observer.observe(item)});
}else revealItems.forEach(item=>item.classList.add('visible'));
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.querySelectorAll('.card').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--x',`${x*100}%`);card.style.setProperty('--y',`${y*100}%`);card.style.transform=`perspective(900px) translateY(-6px) rotateX(${(.5-y)*2}deg) rotateY(${(x-.5)*2}deg)`});card.addEventListener('pointerleave',()=>{card.style.transform='';card.style.removeProperty('--x');card.style.removeProperty('--y')})})}
