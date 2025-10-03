import React,{useEffect,useMemo,useState}from'react';import{useSwipeable}from'react-swipeable';const FALLBACK='/placeholder.svg';
export function Carousel({urls,alt,index,onIndexChange}){const valid=useMemo(()=> (urls||[]).filter(Boolean),[urls]);const[i,setI]=useState(0);
useEffect(()=>{if(typeof index==='number'&&index>=0)setI(index%(valid.length||1))},[index,valid.length]);
const setAnd=n=>{const len=valid.length||1;const v=((n%len)+len)%len;setI(v);onIndexChange?.(v)};
const swipe=useSwipeable({onSwipedLeft:()=>setAnd(i+1),onSwipedRight:()=>setAnd(i-1),preventScrollOnSwipe:true,trackMouse:true});
const src=valid[i]||FALLBACK;return(<div className='carousel' {...swipe}><button className='nav prev' onClick={()=>setAnd(i-1)} aria-label='Previous'>{'<'}</button>
<img src={src} alt={alt} onError={e=>{e.currentTarget.src=FALLBACK}} loading='lazy'/>
<button className='nav next' onClick={()=>setAnd(i+1)} aria-label='Next'>{'>'}</button></div>);}