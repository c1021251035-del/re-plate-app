/* Lapisan perayaan RE-PLATE: semua momen reward terpusat di sini.
   Dipicu event "replate:xp" dari gamify.addXP, jadi halaman mana pun
   yang memberi XP otomatis memicu pop + denting ring + overlay level-up.
   Badge dikirim lewat callback onUnlock dari halaman yang tahu konteks. */
import { useEffect, useState } from "react"
import { Icons } from "./Icons.jsx"
import { Mascot } from "./Mascot.jsx"
import { getLevelMeta } from "../lib/gamify.js"

/* Keping konfeti: posisi/rotasi acak sekali per mount, CSS yang menganimasi */
const CONFETTI_COLORS=["#3FA46D","#F08A3E","#F5C242","#4B8FE3","#E4572E","#8B5CB8"]
export function Confetti({ count=14 }){
  const [bits]=useState(()=> Array.from({length:count},()=>({
    cx:(Math.random()*220-110).toFixed(0)+"px",
    cy:(Math.random()*160-40).toFixed(0)+"px",
    cr:(Math.random()*540-270).toFixed(0)+"deg",
    c:CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
    d:(Math.random()*.25).toFixed(2)+"s",
  })))
  return <div className="confetti" aria-hidden="true">{bits.map((b,i)=> <i key={i} style={{"--cx":b.cx,"--cy":b.cy,"--cr":b.cr,background:b.c,animationDelay:b.d}} />)}</div>
}

/* +N XP melayang dari atas setiap ada perolehan XP */
export function XPPop(){
  const [pops,setPops]=useState([])
  useEffect(()=>{
    function onXP(e){
      const id=Date.now()+Math.random()
      setPops(p=> [...p.slice(-2),{id,amount:e.detail.amount}])
      setTimeout(()=> setPops(p=> p.filter(x=> x.id!==id)),1650)
    }
    window.addEventListener("replate:xp",onXP)
    return ()=> window.removeEventListener("replate:xp",onXP)
  },[])
  if(!pops.length) return null
  return (
    <div className="xp-pop-layer" aria-hidden="true">
      {pops.map(p=> <span key={p.id} className="xp-pop"><Icons.zap width={15} height={15} /> +{p.amount} XP</span>)}
    </div>
  )
}

/* Overlay naik level: momen terbesar, maskot cheer + konfeti + judul level */
export function LevelUpOverlay(){
  const [meta,setMeta]=useState(null)
  useEffect(()=>{
    function onXP(e){
      if(e.detail.leveledUp) setMeta(getLevelMeta(e.detail.to))
    }
    window.addEventListener("replate:xp",onXP)
    return ()=> window.removeEventListener("replate:xp",onXP)
  },[])
  useEffect(()=>{
    if(!meta) return
    function onKey(e){ if(e.key==="Escape") setMeta(null) }
    window.addEventListener("keydown",onKey)
    return ()=> window.removeEventListener("keydown",onKey)
  },[meta])
  if(!meta) return null
  return (
    <div className="lvl-veil">
      <div className="lvl-card" role="dialog" aria-modal="true" aria-label={"Naik ke level "+meta.level}>
        <Confetti />
        <div className="bubble" style={{display:"inline-block"}}><Mascot mood="cheer" size={96} /></div>
        <div style={{marginTop:10}}><span className="lvl-kicker"><Icons.star width={12} height={12} /> Naik level</span></div>
        <div className="lvl-num">Level {meta.level}</div>
        <div className="lvl-name">{meta.title}</div>
        <p className="caption" style={{marginTop:8}}>Petualangan sirkularmu makin jauh. Terus catat, belajar, dan berkreasi.</p>
        <button type="button" className="btn btn-gold btn-block" style={{marginTop:16}} onClick={()=> setMeta(null)} autoFocus>Lanjutkan</button>
      </div>
    </div>
  )
}

/* Notifikasi lencana baru: halaman memanggil onUnlock(badge) saat terbuka */
export function BadgeUnlock({ badge, onClose }){
  useEffect(()=>{
    if(!badge) return
    const t=setTimeout(onClose,3200)
    function onKey(e){ if(e.key==="Escape") onClose() }
    window.addEventListener("keydown",onKey)
    return ()=>{ clearTimeout(t); window.removeEventListener("keydown",onKey) }
  },[badge,onClose])
  if(!badge) return null
  const I=badge.icon
  return (
    <div className="lvl-veil">
      <div className="lvl-card" role="dialog" aria-modal="true" aria-label={"Lencana baru: "+badge.k}>
        <Confetti count={10} />
        <div style={{width:64,height:64,margin:"0 auto",borderRadius:20,background:"var(--gold)",border:"3px solid var(--gold-2)",boxShadow:"0 4px 0 var(--gold-2)",display:"grid",placeItems:"center",color:"var(--ink)"}}><I width={30} height={30} /></div>
        <div style={{marginTop:12}}><span className="lvl-kicker"><Icons.trophy width={12} height={12} /> Lencana baru</span></div>
        <div className="lvl-name" style={{fontSize:"var(--fs-h1)"}}>{badge.k}</div>
        <p className="caption" style={{marginTop:6}}>{badge.desc}</p>
        <button type="button" className="btn btn-gold btn-block" style={{marginTop:16}} onClick={onClose}>Keren!</button>
      </div>
    </div>
  )
}
