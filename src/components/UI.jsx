/* RE-PLATE component library — satu set komponen untuk semua layar. */
import { useEffect, useRef, useState } from "react"
import { Icons } from "./Icons.jsx"
import { Confetti } from "./Celebrate.jsx"
import { DAILY_QUESTS, questState, getXP, getLevel, getLevelMeta, addXP, claimDailyBonus, dailyBonusKey } from "../lib/gamify.js"

export function Eyebrow({ children, tone="leaf" }){
  return <span className={"eyebrow"+(tone==="carrot"?" on-carrot":tone==="ink"?" on-ink":"")}>{children}</span>
}
export function SectionHead({ title, right }){
  return <div className="section-head"><h2>{title}</h2>{right}</div>
}
export function PageHead({ title, subtitle, right }){
  return (
    <header style={{marginBottom:"var(--s5)"}}>
      <div className="between" style={{alignItems:"flex-start"}}>
        <div style={{minWidth:0}}>
          <h1>{title}</h1>
          {subtitle && <p className="caption" style={{marginTop:6,maxWidth:"60ch"}}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}
export function Topbar(props){ return <PageHead {...props} /> }

/* Angka naik 0 -> nilai saat muncul: progres terasa hidup (sekali per mount) */
function CountUp({ value }){
  const [n,setN]=useState(0)
  const target=Number(String(value).replace(/[^\d.]/g,""))||0
  const suffix=String(value).replace(/[\d.,\s]/g,"")
  useEffect(()=>{
    let raf=0; const t0=performance.now(), dur=700
    function tick(t){
      const p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3)
      setN(Math.round(target*e))
      if(p<1) raf=requestAnimationFrame(tick)
    }
    raf=requestAnimationFrame(tick)
    return ()=> cancelAnimationFrame(raf)
  },[target])
  return <>{n.toLocaleString("id-ID")}{suffix ? " "+suffix : ""}</>
}
export function StatCard({ label, value, hint, tone="mute" }){
  return <div className={"stat t-"+tone}><div className="k">{label}</div><div className="v"><CountUp value={value} /></div>{hint && <div className="h">{hint}</div>}</div>
}
export function PillStat({ label, value, hint, tone="mute" }){
  const map={green:"leaf",lime:"carrot",orange:"carrot",blue:"sky",red:"tomato",error:"tomato",success:"leaf",info:"sky",accent:"carrot",plum:"plum"}
  return <StatCard label={label} value={value} hint={hint} tone={map[tone]||tone} />
}

export function Progress({ value, tone="leaf", label, style }){
  return (
    <div style={style}>
      {label && <div className="between" style={{marginBottom:6,flexWrap:"nowrap"}}><span className="micro" style={{fontWeight:800}}>{label}</span><span className="num" style={{fontSize:12,color:"var(--ink-2)"}}>{Math.round(value)}%</span></div>}
      <div className="progress-track" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
        <div className={"progress-fill"+(tone!=="leaf"?" t-"+tone:"")} style={{transform:"scaleX("+Math.max(0,Math.min(1,value/100))+")"}} />
      </div>
    </div>
  )
}
export function StepProgress({ total, current }){
  return <div className="steps" aria-label={`Langkah ${current+1} dari ${total}`}>{Array.from({length:total},(_,i)=>(<span key={i} className={i<=current?"on":""} />))}</div>
}

export function Feedback({ type="info", title, children, action }){
  const cls=type==="correct"?"fb fb-ok":type==="wrong"?"fb fb-no":"fb fb-info"
  return (
    <div className={cls} role="status">
      <div style={{flex:1,minWidth:0}}>
        <div className="fb-title">{title}</div>
        {children && <div style={{fontSize:"var(--fs-caption)",marginTop:5,lineHeight:1.6}}>{children}</div>}
        {action && <div style={{marginTop:12}}>{action}</div>}
      </div>
    </div>
  )
}
export function Empty({ title, children }){
  return <div className="empty">{title && <strong>{title}</strong>}{children}</div>
}
export function XPChip({ value }){ return <span className="xp-chip"><Icons.zap width={13} height={13} /> {value} XP</span> }
export function StreakChip({ value, hot }){ return <span className={"streak-chip"+(hot&&value>0?" hot":"")}><Icons.flame width={13} height={13} /> {value} hari</span> }

/* Ring level — HUD progres yang selalu terlihat; memental saat XP masuk */
export function LevelRing({ size=52, onClick }){
  const [hud,setHud]=useState(()=> ({ level:getLevel(getXP()), pct:getLevelMeta(getXP()).progress }))
  const ringRef=useRef(null)
  useEffect(()=>{
    function onXP(e){
      const meta=getLevelMeta(e.detail.to)
      setHud({ level:meta.level, pct:meta.progress })
      const el=ringRef.current
      if(el){ el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump") }
    }
    window.addEventListener("replate:xp",onXP)
    return ()=> window.removeEventListener("replate:xp",onXP)
  },[])
  const level=hud.level, pct=hud.pct
  const r=(size-10)/2, c=2*Math.PI*r
  return (
    <button type="button" ref={ringRef} className="level-ring" onClick={onClick} aria-label={"Level "+level+", "+pct+" dari 100 XP. Buka profil."} style={{width:size,height:size}}>
      <svg width={size} height={size} viewBox={"0 0 "+size+" "+size} style={{position:"absolute"}} aria-hidden="true">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--paper-2)" strokeWidth="6"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--leaf-2)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c*(1-pct/100)} transform={"rotate(-90 "+size/2+" "+size/2+")"} style={{transition:"stroke-dashoffset .35s var(--ease-out)"}}/>
      </svg>
      <span className="lv">{level}</span>
      <span className="tag" aria-hidden="true">LVL</span>
    </button>
  )
}

/* Misi harian — gamifikasi fungsional: goal konkret, progress nyata, reward.
   Quest bisa diklik menuju layarnya; bonus +25 XP diklaim lewat peti emas. */
const QUEST_ROUTE={ log:"dashboard", quiz:"pedagogy", lab:"inno" }
export function Quests({ onNav }){
  const qs=questState()
  const done=DAILY_QUESTS.filter(q=> qs[q.id]).length
  const all=done===DAILY_QUESTS.length
  const bonusTaken0=typeof localStorage!=="undefined" && localStorage.getItem(dailyBonusKey())==="1"
  const [taken,setTaken]=useState(bonusTaken0)
  const canClaim=all && !taken
  const [burst,setBurst]=useState(0)
  function claim(){
    const bonus=claimDailyBonus()
    if(bonus>0){ addXP(bonus); setTaken(true); setBurst(b=> b+1) }
  }
  return (
    <section className="card" aria-label="Misi harian">
      <div className="between" style={{marginBottom:12}}>
        <div>
          <Eyebrow tone="carrot"><Icons.target width={12} height={12} style={{display:"inline",verticalAlign:"-2px",marginRight:4}} />Misi hari ini</Eyebrow>
          <h2 style={{fontSize:"var(--fs-h3)"}}>{all?"Semua misi selesai!":"Quest harian"}</h2>
        </div>
        <span className={all?"chip chip-gold":"chip chip-carrot"}>{done}/{DAILY_QUESTS.length}</span>
      </div>
      <Progress value={done/DAILY_QUESTS.length*100} tone="carrot" style={{marginBottom:12}} />
      <div style={{display:"grid",gap:8}}>
        {DAILY_QUESTS.map(q=>{
          const I=Icons[q.icon]
          const item=(
            <div className={"quest"+(qs[q.id]?" done":"")}>
              <span className="ic"><I width={19} height={19} /></span>
              <span className="tx"><span className="t">{q.label}</span><span className="d">{q.desc}</span></span>
              <span className="cb"><Icons.check width={15} height={15} strokeWidth={3} /></span>
            </div>
          )
          return qs[q.id] || !onNav ? <div key={q.id}>{item}</div> : (
            <button type="button" key={q.id} className="quest-link" onClick={()=> onNav(QUEST_ROUTE[q.id])} aria-label={"Kerjakan: "+q.label}>{item}</button>
          )
        })}
      </div>
      <div style={{marginTop:12}}>
        {canClaim ? (
          <div style={{position:"relative"}}>
            {burst>0 && <Confetti key={burst} />}
            <button type="button" className="chest ready" onClick={claim}><span className="shine" aria-hidden="true" /><Icons.chest width={22} height={22} /> Buka peti: +25 XP</button>
          </div>
        ) : (
          <p className="caption" style={{fontSize:"var(--fs-micro)"}}>
            {all ? "Bonus hari ini sudah diklaim. Lanjutkan streak-nya besok." : "Selesaikan ketiganya untuk membuka peti bonus +25 XP."}
          </p>
        )}
      </div>
    </section>
  )
}
