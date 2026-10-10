import { useState, useMemo, useEffect, useRef } from "react"
import { db } from "../lib/db.js"
import { MODULES } from "../data/fallback.js"
import { Topbar, Empty, PillStat, SectionHead } from "../components/UI.jsx"
import { Icons } from "../components/Icons.jsx"
import { useToast } from "../components/Toast.jsx"
import { Chart, registerables } from "chart.js"
Chart.register(...registerables)

export default function Teacher(){
  const toast=useToast()
  const [feedbacks,setFeedbacks]=useState(()=> db.getAll("feedback"))
  const [toName,setToName]=useState("")
  const [msg,setMsg]=useState("")
  const canvasRef=useRef(null)
  const chartRef=useRef(null)
  const [mbg]=useState(()=> db.getAll("mbg_tracker"))
  const [marketplace]=useState(()=> db.getAll("marketplace"))
  const [scores]=useState(()=> db.getAll("quiz_scores"))
  const [progress]=useState(()=> db.getAll("module_progress"))

  const avgScore = scores.length ? Math.round(scores.reduce((s,x)=> s+Number(x.score),0)/scores.reduce((s,x)=> s+Number(x.totalQuestions||3),0)*100) : 0
  const totalWaste = mbg.reduce((s,r)=> s+Number(r.waste_gram||0),0)

  const students=useMemo(()=>{
    const prof=db.get("profile",null); const map={}
    if(prof?.name) map[prof.name]={name:prof.name,entries:0,totalWaste:0,activeToday:false}
    mbg.forEach(r=>{ const n=prof?.name||"Siswa"; if(!map[n]) map[n]={name:n,entries:0,totalWaste:0,activeToday:false}; map[n].entries++; map[n].totalWaste+=Number(r.waste_gram||0); if((r.date||r.timestamp?.slice(0,10))===new Date().toISOString().slice(0,10)) map[n].activeToday=true })
    if(Object.keys(map).length===0) map["-"]={name:"-",entries:0,totalWaste:0,activeToday:false}
    return Object.values(map)
  },[mbg])

  const last7=useMemo(()=>{
    const map={}; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.toISOString().slice(0,10); map[k]=d.toLocaleDateString("id-ID",{weekday:"short"}) }
    const vals={}; Object.keys(map).forEach(k=> vals[k]=0)
    mbg.forEach(r=>{ const k=(r.date||r.timestamp?.slice(0,10)); if(vals[k]!==undefined) vals[k]+=Number(r.waste_gram||0) })
    return {labels:Object.values(map), values:Object.keys(vals).map(k=> vals[k])}
  },[mbg])

  useEffect(()=>{
    const el=canvasRef.current; if(!el) return
    if(chartRef.current) chartRef.current.destroy()
    chartRef.current=new Chart(el,{
      type:"line",
      data:{labels:last7.labels,datasets:[{label:"Sisa (gram)",data:last7.values,borderColor:"#287A4F",backgroundColor:"rgba(63,164,109,.16)",fill:true,tension:.4,pointRadius:4,pointBackgroundColor:"#287A4F"}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:"#E6DAC2"},ticks:{color:"#5B7165",font:{size:11}}},x:{grid:{display:false},ticks:{color:"#5B7165",font:{size:11}}}}}
    })
    return ()=> chartRef.current?.destroy()
  },[last7])

  function sendFeedback(e){
    e.preventDefault()
    if(!toName.trim() || !msg.trim()) return toast("Nama siswa dan pesan wajib")
    db.save("feedback",{studentName:toName.trim(),teacherName:"Guru",message:msg.trim(),isRead:false})
    setFeedbacks(db.getAll("feedback")); setToName(""); setMsg(""); toast("Feedback terkirim ke siswa!")
  }
  function exportCSV(){ const ok=db.exportCSV("mbg_tracker","re-plate-mbg.csv"); toast(ok ? "CSV diunduh" : "Belum ada data") }

  return (
    <div className="fade stack-lg page-wrap">
      <Topbar title="Ruang Kelas" subtitle="Pantau progres belajar dan limbah siswa RE-PLATE." />

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
        <PillStat label="Total limbah" value={totalWaste+" g"} hint="Semua entri" tone="tomato" />
        <PillStat label="Produk" value={marketplace.length} hint="Market" tone="leaf" />
        <PillStat label="Modul selesai" value={progress.filter(p=> p.isCompleted).length+"/"+MODULES.length} hint="Jalur belajar" tone="carrot" />
        <PillStat label="Rata-rata kuis" value={avgScore+"%"} hint="Semua kuis" tone="sky" />
      </div>

      <div className="card">
        <span className="eyebrow">Tren limbah 7 hari</span>
        <h2 style={{marginBottom:12}}>Sisa harian kelas</h2>
        <div style={{height:200}}><canvas ref={canvasRef} aria-label="Grafik tren limbah 7 hari" /></div>
      </div>

      <div className="card">
        <SectionHead title="Progress siswa" right={<button type="button" className="btn btn-outline btn-sm" onClick={exportCSV}><Icons.download width={14} height={14}/> Export CSV</button>} />
        <div style={{overflowX:"auto"}}>
          <table>
            <thead><tr><th>No</th><th>Nama</th><th>Entri</th><th>Total sisa</th><th>Status</th></tr></thead>
            <tbody>{students.map((s,i)=> (
              <tr key={s.name+i}>
                <td>{i+1}</td><td style={{fontWeight:700}}>{s.name}</td><td>{s.entries}</td><td>{s.totalWaste} g</td>
                <td>{s.activeToday ? <span className="chip chip-leaf"><Icons.check width={11} height={11}/> Aktif hari ini</span> : <span className="chip chip-mute">Belum hari ini</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <SectionHead title="Feedback lounge" right={<span className="chip chip-mute">{feedbacks.length} pesan</span>} />
        <form onSubmit={sendFeedback} style={{display:"grid",gap:12,marginBottom:16}}>
          <div><label className="label" htmlFor="t-name">Kepada (nama siswa)</label><input id="t-name" className="input" value={toName} onChange={e=> setToName(e.target.value)} placeholder="Nama siswa" /></div>
          <div><label className="label" htmlFor="t-msg">Pesan umpan balik</label><textarea id="t-msg" className="input" rows={3} value={msg} onChange={e=> setMsg(e.target.value)} placeholder="Tulis feedback untuk memotivasi siswa..." /></div>
          <button className="btn btn-primary" type="submit" style={{alignSelf:"flex-start"}}>Kirim feedback</button>
        </form>
        <div style={{display:"grid",gap:9}}>
          {feedbacks.length===0 ? <Empty title="Belum ada feedback">Kirim pesan pertama untuk memotivasi siswa.</Empty> :
            feedbacks.slice().reverse().map(f=> (
              <div key={f.id} className="panel">
                <div className="between" style={{flexWrap:"nowrap"}}>
                  <span style={{fontWeight:800,fontSize:13}}>Kepada: {f.studentName}</span>
                  <span className="chip chip-leaf"><Icons.check width={11} height={11}/> Terkirim</span>
                </div>
                <div style={{fontSize:13,marginTop:7,lineHeight:1.6}}>{f.message}</div>
                <div className="micro" style={{marginTop:7}}><Icons.clock width={11} height={11} style={{display:"inline",verticalAlign:"-1.5px",marginRight:3}}/>{new Date(f.timestamp||f.createdAt).toLocaleString("id-ID")}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
