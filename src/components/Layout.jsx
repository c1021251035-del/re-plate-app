import { useEffect, useRef, useState } from "react"
import { Icons } from "./Icons.jsx"
import { MiniMascot } from "./Mascot.jsx"
import { getXP, getLevelMeta, getStreak } from "../lib/gamify.js"
/* Kartu level sidebar: judul level + XP + progress menuju level berikut */
function SideLevel(){
  const [snap,setSnap]=useState(()=> getLevelMeta(getXP()))
  useEffect(()=>{
    function onXP(e){ setSnap(getLevelMeta(e.detail.to)) }
    window.addEventListener("replate:xp",onXP)
    return ()=> window.removeEventListener("replate:xp",onXP)
  },[])
  return (
    <div className="side-level">
      <div className="k">Level {snap.level} · {snap.title}</div>
      <div className="v">{snap.progress}/100 XP · {snap.needed} lagi naik</div>
      <div className="progress-track" style={{marginTop:8,height:8,background:"rgba(255,255,255,.14)",borderColor:"rgba(255,255,255,.2)"}} role="progressbar" aria-valuenow={snap.progress} aria-valuemin={0} aria-valuemax={100} aria-label={"Progress level "+snap.level}>
        <div className="progress-fill t-gold" style={{transform:"scaleX("+(snap.progress/100)+")"}} />
      </div>
    </div>
  )
}

const ITEMS=[
  {k:"dashboard",label:"Beranda",icon:Icons.home},
  {k:"inno",label:"Lab",icon:Icons.flask},
  {k:"pedagogy",label:"Belajar",icon:Icons.book},
  {k:"marketplace",label:"Market",icon:Icons.store},
  {k:"teacher",label:"Kelas",icon:Icons.chart},
  {k:"profile",label:"Profil",icon:Icons.user},
]

export function Layout({ children, current, onNav }){
  const [hud,setHud]=useState(()=> ({ xp:getXP(), meta:getLevelMeta(getXP()) }))
  const ringRef=useRef(null)
  const streak=getStreak()
  /* HUD mengikuti setiap addXP: angka naik + ring memental */
  useEffect(()=>{
    function onXP(e){
      setHud({ xp:e.detail.to, meta:getLevelMeta(e.detail.to) })
      const el=ringRef.current
      if(el){ el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump") }
    }
    window.addEventListener("replate:xp",onXP)
    return ()=> window.removeEventListener("replate:xp",onXP)
  },[])
  const { xp, meta }=hud
  const level=meta.level, pct=meta.progress
  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Navigasi utama">
        <div className="side-logo">
          <span className="mark"><MiniMascot size={28} /></span>
          <span><span className="side-word">RE-PLATE</span><span className="side-sub">Food Waste Hub</span></span>
        </div>
        {ITEMS.map(it=>{
          const I=it.icon
          const active=current===it.k
          return (
            <button type="button" key={it.k} className={"side-btn"+(active?" on":"")} onClick={()=> onNav(it.k)} aria-current={active?"page":undefined}>
              <I width={19} height={19} />{it.label}
            </button>
          )
        })}
        <div className="side-foot">
          <SideLevel />
          <div className="side-credit">Universitas Tanjungpura<br/>LIDM 2026 · SDGs 12.3</div>
        </div>
      </nav>

      <main className="main">
        <header className="topbar">
          <button type="button" className="tb-brand" onClick={()=> onNav("dashboard")} aria-label="RE-PLATE beranda">
            <span className="tb-mark"><MiniMascot size={24} /></span>
            <span className="tb-word">RE-PLATE</span>
          </button>
          <div className="tb-right">
            <div className="tb-xp">
              <span className="tb-xp-lv">Lv {level}</span>
              <div className="tb-xp-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={"XP menuju level "+(level+1)}>
                <div className="tb-xp-fill" style={{transform:"scaleX("+(pct/100)+")"}} />
              </div>
              <span className="micro num" style={{fontWeight:800,whiteSpace:"nowrap"}}>{xp} XP</span>
            </div>
            <span className={"streak-chip"+(streak>0?" hot":"")} title={streak>0?"Streak "+streak+" hari menyala":"Belum ada streak"}><Icons.flame width={13} height={13} /> {streak}</span>
            <button type="button" ref={ringRef} className="level-ring" onClick={()=> onNav("profile")} aria-label={"Level "+level+", "+pct+" dari 100 XP. Buka profil."}>
              <svg width={52} height={52} viewBox="0 0 52 52" aria-hidden="true" style={{position:"absolute"}}>
                <circle cx="26" cy="26" r="21" fill="none" stroke="var(--paper-2)" strokeWidth="6"/>
                <circle cx="26" cy="26" r="21" fill="none" stroke="var(--leaf-2)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2*Math.PI*21} strokeDashoffset={2*Math.PI*21*(1-pct/100)} transform="rotate(-90 26 26)" style={{transition:"stroke-dashoffset .35s var(--ease-out)"}}/>
              </svg>
              <span className="lv">{level}</span>
              <span className="tag">LVL</span>
            </button>
          </div>
        </header>

        <div className="container">
          {children}
        </div>
        <footer className="page-foot">
          RE-PLATE · Smart Food Waste Hub &amp; Circular Economy<br/>Universitas Tanjungpura · LIDM 2026 · SDGs 12.3
        </footer>
      </main>

      <nav className="bottomnav" aria-label="Navigasi mobile">
        {ITEMS.map(it=>{
          const I=it.icon
          const active=current===it.k
          return (
            <button type="button" key={it.k} className={"navbtn"+(active?" on":"")} onClick={()=> onNav(it.k)} aria-current={active?"page":undefined}>
              <I width={21} height={21} />{it.label}<span className="dot" />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
