import { useState, useMemo, useEffect, useRef } from "react"
import { db } from "../lib/db.js"
import { MENU_OPTIONS, MODULES } from "../data/fallback.js"
import { StatCard, Progress, Empty, PageHead, SectionHead, XPChip, StreakChip, Quests } from "../components/UI.jsx"
import { Mascot } from "../components/Mascot.jsx"
import { Icons } from "../components/Icons.jsx"
import { useToast } from "../components/Toast.jsx"
import { getXP, getStreak, addXP, todayGoalDone, claimDailyBonus, questState, unlockedBadges, checkNewBadges, emitBadge } from "../lib/gamify.js"
import { Chart, registerables } from "chart.js"
Chart.register(...registerables)

export default function Dashboard({ onNav }){
  const toast=useToast()
  const [rows,setRows]=useState(()=> db.getAll("mbg_tracker"))
  const [food,setFood]=useState(MENU_OPTIONS[0])
  const [portion,setPortion]=useState("")
  const [waste,setWaste]=useState("")
  const [note,setNote]=useState("")
  const canvasRef=useRef(null)
  const chartRef=useRef(null)
  const todayStr=new Date().toISOString().slice(0,10)
  const xp=getXP(), streak=getStreak()
  const doneToday=todayGoalDone()

  const stats=useMemo(()=>{
    const week=rows.slice(-7)
    const total=week.reduce((s,r)=> s+Number(r.waste_gram||0),0)
    const avg=week.length? Math.round(total/week.length):0
    const products=db.getAll("marketplace").length
    return {total,avg,products}
  },[rows])

  const last7=useMemo(()=>{
    const map={}
    for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.toISOString().slice(0,10); const label=d.toLocaleDateString("id-ID",{weekday:"short"}); map[k]={label,portion:0,waste:0} }
    rows.forEach(r=>{ const k=(r.date||r.timestamp?.slice(0,10)); if(map[k]){ map[k].portion+=Number(r.portion_gram||0); map[k].waste+=Number(r.waste_gram||0) } })
    return Object.values(map)
  },[rows])

  const completedIds=new Set(db.getAll("module_progress").filter(p=> p.isCompleted).map(p=> p.moduleId))
  const scoredIds=new Set(db.getAll("quiz_scores").map(s=> s.moduleId))
  const nextMod = MODULES.find(m=> !completedIds.has(m.id) || !scoredIds.has(m.id)) || MODULES[MODULES.length-1]
  const completedCount = MODULES.filter(m=> completedIds.has(m.id) && scoredIds.has(m.id)).length
  const nextIdx = MODULES.findIndex(m=> m.id===nextMod.id)

  useEffect(()=>{
    const el=canvasRef.current; if(!el) return
    if(chartRef.current) chartRef.current.destroy()
    chartRef.current=new Chart(el,{
      type:"bar",
      data:{ labels:last7.map(x=> x.label), datasets:[
        {label:"Porsi", data:last7.map(x=> x.portion), backgroundColor:"#3FA46D", borderRadius:9, borderSkipped:false, barPercentage:.55, categoryPercentage:.62},
        {label:"Sisa", data:last7.map(x=> x.waste), backgroundColor:"#E4572E", borderRadius:9, borderSkipped:false, barPercentage:.55, categoryPercentage:.62},
      ]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{legend:{position:"bottom",labels:{boxWidth:9,boxHeight:9,font:{size:11,weight:"600"},usePointStyle:true,color:"#4F6457"}}},
        scales:{y:{beginAtZero:true,grid:{color:"#E6DAC2"},ticks:{color:"#5B7165",font:{size:11}}},x:{grid:{display:false},ticks:{color:"#5B7165",font:{size:11}}}} }
    })
    return ()=> chartRef.current?.destroy()
  },[last7])

  /* Klaim bonus misi harian (sekali per hari, idempoten) */
  useEffect(()=>{
    const qs=questState()
    if(qs.log && qs.quiz && qs.lab && claimDailyBonus()>0){
      addXP(25); toast("Peti bonus terbuka! +25 XP","gold")
    }
  },[rows, toast])

  function submit(e){
    e.preventDefault()
    const p=Number(portion), w=Number(waste)
    if(!p || waste==="" || isNaN(w)) return toast("Lengkapi porsi dan sisa")
    if(w>p) return toast("Sisa tidak boleh melebihi porsi","error")
    const had=new Set(unlockedBadges().map(b=> b.k))
    db.save("mbg_tracker",{ date:todayStr, foodName:food, portion_gram:p, waste_gram:w, note:note.trim(), category: w===0?"habis": w<p/2?"sedikit":"banyak" })
    setRows(db.getAll("mbg_tracker")); setPortion(""); setWaste(""); setNote("")
    addXP(10); toast("Tercatat. +10 XP","accent")
    if(streak+1>=3) addXP(5)
    checkNewBadges(had).forEach(b=> setTimeout(()=> emitBadge(b),900))
  }
  function remove(id){ if(!confirm("Hapus entri ini?")) return; db.del("mbg_tracker",id); setRows(db.getAll("mbg_tracker")); toast("Entri dihapus","error") }

  return (
    <div className="fade stack-lg page-wrap">
      <PageHead
        title={"Halo, "+(db.get("profile")?.name || "Pelajar")}
        subtitle={doneToday ? "Misi harian selesai. Lanjutkan belajar atau pantau progresmu." : "Misi hari ini: catat satu porsi MBG (butuh 30 detik)."}
        right={<div className="row-tight"><XPChip value={xp} /><StreakChip value={streak} /></div>}
      />

      {/* LANJUTKAN BELAJAR — apa yang harus dilakukan berikutnya */}
      <section className="tile tile-leaf" style={{borderRadius:"var(--r-xl)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-6,bottom:-14,opacity:.5,pointerEvents:"none"}}><Mascot mood="cheer" size={132} /></div>
        <div style={{position:"relative",maxWidth:"calc(100% - 110px)"}}>
          <span className="eyebrow">Lanjutkan belajar · Modul {nextIdx+1}</span>
          <h2 style={{marginTop:2}}>{nextMod.title}</h2>
          <p className="caption" style={{marginTop:6,maxWidth:46+"ch"}}>{nextMod.desc}</p>
          <div className="row-tight" style={{marginTop:16}}>
            <button type="button" className="btn btn-primary" onClick={()=> onNav && onNav("pedagogy")}>Mulai modul <Icons.arrow /></button>
            <span className="chip chip-leaf">{completedCount}/{MODULES.length} modul</span>
          </div>
          <div style={{marginTop:16,maxWidth:360}}><Progress value={completedCount/MODULES.length*100} label={"Progres jalur belajar"} /></div>
        </div>
      </section>

      {/* MISI HARIAN */}
      <Quests onNav={onNav} />

      {/* INPUT MBG */}
      <div id="mbg-form" className="card">
        <div className="between" style={{marginBottom:4}}>
          <div><span className="eyebrow">Input harian</span><h2>Catat MBG Hari Ini</h2></div>
          {doneToday ? <span className="chip chip-leaf"><Icons.check width={12} height={12} /> Selesai</span> : <span className="chip chip-carrot">+10 XP</span>}
        </div>
        <p className="caption" style={{marginBottom:16}}>Porsi yang diterima dan sisa makanan. Catat jujur, data membantu mengurangi limbah besok.</p>
        <form onSubmit={submit} style={{display:"grid",gap:14}}>
          <div>
            <label className="label" htmlFor="f-food">Menu hari ini</label>
            <select id="f-food" className="input" value={food} onChange={e=> setFood(e.target.value)}>
              {MENU_OPTIONS.map(m=> <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
            <div><label className="label" htmlFor="f-porsi">Porsi diterima (gram)</label><input id="f-porsi" className="input" type="number" min="1" placeholder="300" value={portion} onChange={e=> setPortion(e.target.value)} /></div>
            <div><label className="label" htmlFor="f-sisa">Sisa makanan (gram)</label><input id="f-sisa" className="input" type="number" min="0" placeholder="40" value={waste} onChange={e=> setWaste(e.target.value)} /></div>
          </div>
          <div><label className="label" htmlFor="f-note">Catatan (opsional)</label><textarea id="f-note" className="input" rows={2} placeholder="Alasan sisa, rasa, porsi..." value={note} onChange={e=> setNote(e.target.value)} /></div>
          <button className="btn btn-primary btn-block" disabled={!portion || waste===""} type="submit">Simpan entri</button>
        </form>
      </div>

      {/* STATS */}
      <section>
        <SectionHead title="Ringkasan minggu ini" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
          <StatCard label="Sisa minggu ini" value={stats.total+" g"} hint="7 hari terakhir" tone="tomato" />
          <StatCard label="Rata-rata harian" value={stats.avg+" g"} hint="Per hari" tone="sky" />
          <StatCard label="Produk dibuat" value={String(stats.products)} hint="Marketplace" tone="leaf" />
        </div>
      </section>

      {/* CHART */}
      <div className="card">
        <span className="eyebrow">Analisis</span>
        <h2>Tren 7 Hari</h2>
        <p className="caption" style={{marginTop:4,marginBottom:14}}>Porsi vs sisa. Lihat pola makannya selama seminggu.</p>
        <div style={{height:200}}><canvas ref={canvasRef} aria-label="Grafik batang tren porsi dan sisa 7 hari terakhir" role="img" /></div>
        <table className="sr-only">
          <caption>Data tren 7 hari</caption>
          <thead><tr><th>Hari</th><th>Porsi</th><th>Sisa</th></tr></thead>
          <tbody>{last7.map(x=> <tr key={x.label}><td>{x.label}</td><td>{x.portion}g</td><td>{x.waste}g</td></tr>)}</tbody>
        </table>
      </div>

      {/* HISTORY */}
      <div className="card">
        <SectionHead title="Catatan terbaru" right={rows.length? <span className="chip chip-mute">{rows.length} entri</span> : null} />
        {rows.length===0 ? <Empty title="Belum ada catatan">Mulai dari satu entri hari ini — porsi dan sisanya cukup.</Empty> : (
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Tanggal</th><th>Menu</th><th>Porsi</th><th>Sisa</th><th></th></tr></thead>
              <tbody>
                {rows.slice(-5).reverse().map(r=> (
                  <tr key={r.id}>
                    <td>{r.date||r.timestamp?.slice(0,10)}</td><td style={{fontWeight:600}}>{r.foodName}</td><td>{r.portion_gram}g</td>
                    <td><span className="chip chip-tomato">{r.waste_gram}g</span></td>
                    <td style={{textAlign:"right"}}><button type="button" className="chip chip-mute" onClick={()=> remove(r.id)} aria-label={"Hapus catatan "+r.foodName}>Hapus</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
