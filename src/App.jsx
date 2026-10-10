import { useState, useEffect } from "react"
import { profileStore } from "./lib/db.js"
import { ToastProvider } from "./components/Toast.jsx"
import { Layout } from "./components/Layout.jsx"
import { Mascot } from "./components/Mascot.jsx"
import { Icons } from "./components/Icons.jsx"
import { XPPop, LevelUpOverlay, BadgeUnlock } from "./components/Celebrate.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Inno from "./pages/Inno.jsx"
import Pedagogy from "./pages/Pedagogy.jsx"
import Marketplace from "./pages/Marketplace.jsx"
import Teacher from "./pages/Teacher.jsx"
import Profile from "./pages/Profile.jsx"

/* Jembatan lencana global: halaman mana pun yang membuka lencana baru
   cukup dispatch event replate:badge, overlay muncul dari sini. */
function BadgeBridge(){
  const [badge,setBadge]=useState(null)
  useEffect(()=>{
    function onBadge(e){
      const I=Icons[e.detail.icon]||Icons.trophy
      setBadge({ ...e.detail, icon:I })
    }
    window.addEventListener("replate:badge",onBadge)
    return ()=> window.removeEventListener("replate:badge",onBadge)
  },[])
  return <BadgeUnlock badge={badge} onClose={()=> setBadge(null)} />
}

function Onboarding({ onDone }){
  const [step,setStep]=useState(0)
  const [form,setForm]=useState({name:"",class:"X",school:"",region:""})
  const slides=[
    { title:"Sisa makanan jadi masa depan", body:"RE-PLATE mengajakmu mengubah sisa MBG jadi produk bernilai, sambil belajar ekonomi sirkular.", mood:"wave" },
    { title:"Belajar sambil bermain", body:"Jalur modul, kuis, XP, dan lencana menemani progresmu. Catat satu sisa setiap hari untuk jaga streak.", mood:"cheer" },
    { title:"Siapa namamu?", body:"Lengkapi profil singkat untuk mulai petualangan ini.", mood:"happy", isForm:true },
  ]
  const s=slides[step]
  function submit(e){
    e.preventDefault()
    if(!form.name.trim() || !form.school.trim()) return
    profileStore.save({name:form.name.trim(), class:form.class, school:form.school.trim(), region:form.region.trim(), school_type:"SMA"})
    onDone()
  }
  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:20,
      background:"linear-gradient(160deg,#1F3B2E 0%,#287A4F 70%,#3FA46D 100%)",
      backgroundImage:"linear-gradient(160deg,#1F3B2E 0%,#287A4F 70%,#3FA46D 100%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23F5C242' opacity='.16'/%3E%3C/svg%3E\")",
      backgroundSize:"auto, 26px 26px"}}>
      <div className="fade" style={{maxWidth:460,width:"100%",background:"var(--paper)",border:"3px solid var(--gold-2)",borderRadius:26,padding:26,boxShadow:"0 8px 0 var(--gold-2),0 18px 0 rgba(0,0,0,.22)"}}>
        <div style={{display:"flex",justifyContent:"center"}}>
          <div className={step===2?"":"bubble"} style={{display:"inline-block"}}><Mascot mood={s.mood} size={104} /></div>
        </div>
        <div style={{textAlign:"center",marginTop:12}}>
          <h1 style={{fontSize:23}}>{s.title}</h1>
          <p style={{fontSize:13,color:"var(--ink-2)",marginTop:8,lineHeight:1.6}}>{s.body}</p>
        </div>
        {s.isForm ? (
          <form onSubmit={submit} style={{display:"grid",gap:10,marginTop:18}}>
            <div><label className="label" htmlFor="o-name">Nama lengkap</label><input id="o-name" className="input" value={form.name} onChange={e=> setForm({...form,name:e.target.value})} placeholder="Nama lengkap" /></div>
            <div><label className="label" htmlFor="o-class">Kelas</label><select id="o-class" className="input" value={form.class} onChange={e=> setForm({...form,class:e.target.value})}><option value="X">X</option><option value="XI">XI</option><option value="XII">XII</option></select></div>
            <div><label className="label" htmlFor="o-school">Nama sekolah</label><input id="o-school" className="input" value={form.school} onChange={e=> setForm({...form,school:e.target.value})} placeholder="SMAN ..." /></div>
            <div><label className="label" htmlFor="o-region">Asal daerah (opsional)</label><input id="o-region" className="input" value={form.region} onChange={e=> setForm({...form,region:e.target.value})} placeholder="Pontianak" /></div>
            <button className="btn btn-primary btn-block" type="submit" disabled={!form.name.trim() || !form.school.trim()} style={{marginTop:4}}>Mulai belajar</button>
          </form>
        ) : (
          <div style={{display:"grid",gap:8,marginTop:18}}>
            <button type="button" className="btn btn-primary btn-block" onClick={()=> setStep(step+1)}>Lanjut <Icons.arrow width={16} height={16}/></button>
            <button type="button" className="btn btn-ghost btn-block" onClick={()=> setStep(2)} style={{fontSize:12}}>Lewati, langsung isi profil</button>
          </div>
        )}
        <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:16}}>
          {slides.map((_,i)=> (
            <span key={i} aria-hidden="true" style={{width:22,height:8,borderRadius:99,background: i===step?"var(--leaf)":"var(--line-2)",transform:i===step?"scaleX(1)":"scaleX(.36)",transformOrigin:"0 50%",transition:"transform .2s var(--ease-bounce),background .2s"}} />
          ))}
        </div>
        <div style={{textAlign:"center",fontSize:10,color:"var(--ink-3)",marginTop:14}}>Universitas Tanjungpura · LIDM 2026 · SDGs 12.3</div>
      </div>
    </div>
  )
}

export default function App(){
  const [ready,setReady]=useState(()=> profileStore.isSetup())
  const [tab,setTab]=useState("dashboard")
  useEffect(()=>{
    const allowed=["dashboard","inno","pedagogy","marketplace","teacher","profile"]
    const h=(location.hash||"#dashboard").replace("#","")
    if(allowed.includes(h)) setTab(h)
    function onHash(){ const hh=(location.hash||"#dashboard").replace("#",""); if(allowed.includes(hh)) setTab(hh) }
    addEventListener("hashchange", onHash)
    return ()=> removeEventListener("hashchange", onHash)
  },[])
  function nav(k){ setTab(k); location.hash=k; window.scrollTo({top:0,behavior:"smooth"}) }
  if(!ready) return <ToastProvider><Onboarding onDone={()=> setReady(true)} /></ToastProvider>
  return (
    <ToastProvider>
      <XPPop />
      <LevelUpOverlay />
      <BadgeBridge />
      <Layout current={tab} onNav={nav}>
        {tab==="dashboard" && <Dashboard onNav={nav} />}
        {tab==="inno" && <Inno />}
        {tab==="pedagogy" && <Pedagogy />}
        {tab==="marketplace" && <Marketplace />}
        {tab==="teacher" && <Teacher />}
        {tab==="profile" && <Profile />}
      </Layout>
    </ToastProvider>
  )
}
