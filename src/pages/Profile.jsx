import { useState } from "react"
import { db, profileStore } from "../lib/db.js"
import { Topbar, Empty, PillStat, Progress, SectionHead, PageHead } from "../components/UI.jsx"
import { Mascot } from "../components/Mascot.jsx"
import { Icons } from "../components/Icons.jsx"
import { useToast } from "../components/Toast.jsx"
import { getXP, getLevelMeta, getStreak, BADGES, foodEnjoyed } from "../lib/gamify.js"

export default function Profile(){
  const toast=useToast()
  const [profile,setProfile]=useState(()=> profileStore.get())
  const [editing,setEditing]=useState(()=> !profileStore.isSetup())
  const [form,setForm]=useState(()=> profileStore.get() || {name:"",class:"X",school:"",region:""})
  const mbg=db.getAll("mbg_tracker")
  const marketplace=db.getAll("marketplace")
  const scores=db.getAll("quiz_scores")
  const totalWaste=mbg.reduce((s,r)=> s+Number(r.waste_gram||0),0)
  const bestScore = scores.length ? Math.max(...scores.map(s=> s.totalQuestions? Math.round(s.score/s.totalQuestions*100):0)) : 0
  const xp=getXP(), snap=getLevelMeta(xp), streak=getStreak()
  const level=snap.level

  const achievements=BADGES.map(b=> ({ ...b, done:(()=>{ try{ return b.test() }catch{ return false } })(), icon:Icons[b.icon]||Icons.trophy }))

  function save(e){
    e.preventDefault()
    if(!form.name.trim() || !form.school.trim()) return toast("Nama & sekolah wajib","error")
    const p=profileStore.save({name:form.name.trim(), class:form.class, school:form.school.trim(), region:form.region.trim(), school_type:"SMA"})
    setProfile(p); setEditing(false); toast("Profil disimpan","accent")
  }

  if(editing){
    return (
      <div className="fade stack-lg page-wrap">
        <PageHead title="Siapa namamu?" subtitle="Lengkapi profil agar perjalanan RE-PLATE bisa dimulai." />
        <div className="tile tile-leaf" style={{textAlign:"center",paddingTop:26,paddingBottom:22,borderRadius:"var(--r-xl)"}}>
          <div className="bubble" style={{display:"inline-block"}}><Mascot mood="wave" size={84} /></div>
          <div style={{fontWeight:800,fontFamily:"var(--font-d)",fontSize:"var(--fs-h3)",marginTop:10}}>Halo! Senang bertemu denganmu</div>
          <div className="caption" style={{marginTop:4}}>Isi data singkat. Tersimpan lokal di perangkatmu, aman.</div>
        </div>
        <form onSubmit={save} className="card" style={{display:"grid",gap:14}}>
          <div><label className="label" htmlFor="pf-name">Nama lengkap</label><input id="pf-name" className="input" value={form.name} onChange={e=> setForm({...form,name:e.target.value})} placeholder="Nama lengkap" /></div>
          <div><label className="label" htmlFor="pf-class">Kelas</label><select id="pf-class" className="input" value={form.class} onChange={e=> setForm({...form,class:e.target.value})}><option value="X">X</option><option value="XI">XI</option><option value="XII">XII</option></select></div>
          <div><label className="label" htmlFor="pf-school">Nama sekolah</label><input id="pf-school" className="input" value={form.school} onChange={e=> setForm({...form,school:e.target.value})} placeholder="SMAN ..." /></div>
          <div><label className="label" htmlFor="pf-region">Asal daerah (opsional)</label><input id="pf-region" className="input" value={form.region} onChange={e=> setForm({...form,region:e.target.value})} placeholder="Pontianak" /></div>
          <button className="btn btn-primary btn-block" type="submit" disabled={!form.name.trim() || !form.school.trim()}>Mulai belajar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="fade stack-lg page-wrap">
      <Topbar title="Profil" subtitle="Pencapaian dan portofoliomu di RE-PLATE."
        right={<button type="button" className="btn btn-outline btn-sm" onClick={()=> {setForm(profileStore.get()||{name:"",class:"X",school:"",region:""}); setEditing(true)}}><Icons.edit width={14} height={14}/> Edit profil</button>} />

      <div className="card between" style={{alignItems:"center"}}>
        <div className="row-tight" style={{gap:14}}>
          <div style={{width:64,height:64,borderRadius:20,background:"var(--leaf-2)",border:"3px solid var(--leaf-deep)",display:"grid",placeItems:"center",color:"#fff",fontWeight:800,fontFamily:"var(--font-d)",fontSize:26,flexShrink:0,boxShadow:"0 5px 0 var(--leaf-deep)"}}>{(profile?.name||"S").charAt(0).toUpperCase()}</div>
          <div style={{minWidth:0}}>
            <h2 style={{fontSize:"var(--fs-h2)"}}>{profile?.name||"-"}</h2>
            <div className="caption" style={{marginTop:3}}>Kelas {profile?.class||"-"} · {profile?.school||"-"}{profile?.region? " · "+profile.region:""}</div>
            <div className="row-tight" style={{marginTop:10}}>
              <span className="xp-chip"><Icons.zap width={13} height={13} /> {xp} XP</span>
              <span className="chip chip-leaf">Level {level}</span>
              <span className="streak-chip"><Icons.flame width={13} height={13} /> {streak} hari</span>
            </div>
          </div>
        </div>
        <div style={{width:"100%",maxWidth:280,marginTop:4}}>
          <Progress value={snap.progress} tone="gold" label={snap.title+" · "+snap.needed+" XP lagi"} />
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
        <PillStat label="Limbah dicatat" value={totalWaste+" g"} tone="tomato" />
        <PillStat label="Porsi dinikmati" value={foodEnjoyed()+" g"} hint="Porsi dikurangi sisa" tone="leaf" />
        <PillStat label="Produk" value={marketplace.length} tone="sky" />
        <PillStat label="Skor kuis" value={bestScore} tone="carrot" />
      </div>

      <section>
        <SectionHead title="Lencana pencapaian" right={<span className="chip chip-gold"><Icons.trophy width={12} height={12}/> {achievements.filter(a=>a.done).length}/{achievements.length}</span>} />
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {achievements.map(a=> {
            const I=a.icon
            return (
              <div key={a.k} className={"badge"+(a.done?" open":" locked")}>
                <div className="medal">
                  <I width={22} height={22} />
                </div>
                <div style={{fontWeight:800,fontFamily:"var(--font-d)",fontSize:"var(--fs-caption)",marginTop:10}}>{a.k}</div>
                <div className="micro" style={{marginTop:4,lineHeight:1.5}}>{a.desc}</div>
                <span className={a.done?"chip chip-gold":"chip chip-mute"} style={{marginTop:10}}>{a.done?<><Icons.check width={11} height={11}/> Tercapai</>:<><Icons.lock width={11} height={11}/> Terkunci</>}</span>
              </div>
            )
          })}
        </div>
      </section>

      <div className="card">
        <SectionHead title="Riwayat aktivitas" />
        <div style={{display:"grid",gap:14}}>
          <div>
            <div className="eyebrow" style={{marginBottom:8}}>MBG Tracker</div>
            {mbg.length===0 ? <Empty title="Belum ada entri">Mulai catat satu porsi hari ini.</Empty> :
              <div style={{display:"grid",gap:8}}>{mbg.slice(-5).reverse().map(r=> (
                <div key={r.id} className="panel" style={{padding:"11px 14px",display:"flex",justifyContent:"space-between",gap:8,fontSize:"var(--fs-caption)"}}>
                  <span style={{fontWeight:700}}>{r.foodName}</span>
                  <span className="micro">{r.date||r.timestamp?.slice(0,10)} · {r.waste_gram}g sisa</span>
                </div>
              ))}</div>}
          </div>
          <div className="divider" style={{margin:0}} />
          <div>
            <div className="eyebrow" style={{marginBottom:8}}>Lab Inovasi</div>
            {db.getAll("inno_history").length===0 ? <Empty title="Belum ada riwayat">Generate rekomendasi pertama di Lab.</Empty> :
              <div style={{display:"grid",gap:8}}>{db.getAll("inno_history").slice(-5).reverse().map(h=> (
                <div key={h.id} className="panel" style={{padding:"11px 14px",fontSize:"var(--fs-caption)"}}>
                  <div style={{fontWeight:700}}>{h.result?.nama_produk||h.wasteType}</div>
                  <div className="micro" style={{marginTop:2}}>{h.wasteType} · {h.weightGram}g</div>
                </div>
              ))}</div>}
          </div>
        </div>
      </div>

      <div className="row-tight">
        <button type="button" className="btn btn-outline btn-sm" onClick={()=> { const ok=db.exportCSV("mbg_tracker","re-plate-mbg.csv"); toast(ok?"CSV diunduh":"Belum ada data") }}><Icons.download width={14} height={14}/> Export CSV</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={()=> { if(confirm("Hapus semua data lokal?")){ localStorage.clear(); location.reload() } }}><Icons.refresh width={14} height={14}/> Reset semua data</button>
      </div>
    </div>
  )
}
