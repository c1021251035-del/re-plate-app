import { useState } from "react"
import { db } from "../lib/db.js"
import { FALLBACK, WASTE_OPTIONS } from "../data/fallback.js"
import { Topbar, Empty, SectionHead, ExpandList } from "../components/UI.jsx"
import { Mascot } from "../components/Mascot.jsx"
import { Icons } from "../components/Icons.jsx"
import { useToast } from "../components/Toast.jsx"
import { addXP, unlockedBadges, checkNewBadges, emitBadge } from "../lib/gamify.js"

export default function Inno(){
  const toast=useToast()
  const [wasteType,setWasteType]=useState(WASTE_OPTIONS[0].value)
  const [weight,setWeight]=useState("")
  const [note,setNote]=useState("")
  const [loading,setLoading]=useState(false)
  const [result,setResult]=useState(null)
  const [mode,setMode]=useState("offline")
  const [history,setHistory]=useState(()=> db.getAll("inno_history").slice().reverse())
  const hasAI=!!import.meta.env.VITE_OPENROUTER_KEY

  async function generate(){
    if(!weight || Number(weight)<10) return toast("Berat minimal 10 gram","error")
    setLoading(true); setResult(null)
    const key=import.meta.env.VITE_OPENROUTER_KEY
    if(key){
      try{
        const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":"Bearer "+key,"HTTP-Referer":location.origin},
          body:JSON.stringify({
            model:"arcee-ai/trinity-large-preview",
            messages:[
              {role:"system",content:"Kamu ahli ekonomi sirkular. Balas HANYA JSON valid dengan key: nama_produk, tagline, deskripsi, bahan_utama, formula, manfaat(array 3), langkah_singkat(array 3), nilai_ekonomi, sdgs_target. Bahasa Indonesia."},
              {role:"user",content:"Jenis limbah: "+wasteType+", berat: "+weight+" gram, catatan: "+(note||"-")+". Beri rekomendasi produk ekonomi sirkular."}
            ]
          })
        })
        if(!r.ok) throw new Error(String(r.status))
        const j=await r.json()
        const txt=j.choices?.[0]?.message?.content||""
        const m=txt.match(/\{[\s\S]*\}/)
        if(m){ const parsed=JSON.parse(m[0]); setResult(parsed); setMode("online"); db.save("inno_history",{wasteType,weightGram:Number(weight),result:parsed}); setHistory(db.getAll("inno_history").slice().reverse()); addXP(15); setLoading(false); toast("Rekomendasi AI siap. +15 XP","accent"); return }
        throw new Error("parse fail")
      }catch{ /* fallback: pakai database lokal */ }
    }
    await new Promise(r=> setTimeout(r,600))
    const fb=FALLBACK[wasteType]||FALLBACK.default
    setResult(fb); setMode("offline")
    db.save("inno_history",{wasteType,weightGram:Number(weight),result:fb})
    setHistory(db.getAll("inno_history").slice().reverse())
    addXP(15)
    setLoading(false)
    toast("Rekomendasi offline siap. +15 XP","accent")
  }
  function publish(){
    if(!result) return
    const had=new Set(unlockedBadges().map(b=> b.k))
    db.save("marketplace",{ productName:result.nama_produk, description:result.deskripsi, rawMaterial:wasteType, category:wasteType, valueEstimate:result.nilai_ekonomi, publishedAt:new Date().toISOString() })
    toast("Dipublikasikan ke Market. XP tetap.","accent")
    checkNewBadges(had).forEach(b=> setTimeout(()=> emitBadge(b),600))
  }

  const wasteLabel=WASTE_OPTIONS.find(o=> o.value===wasteType)?.label||wasteType

  return (
    <div className="fade stack-lg page-wrap">
      <Topbar
        title="Lab Inovasi"
        subtitle="Ubah sisa MBG jadi produk bernilai. Pilih limbah, berat, lalu buat rekomendasinya."
        right={<span className={mode==="online"?"chip chip-sky":"chip chip-mute"}><Icons.spark width={12} height={12}/> {hasAI ? (mode==="online"?"AI Online":"AI siap") : "Mode offline"}</span>}
      />

      <div className="tile tile-leaf" style={{display:"flex",gap:14,alignItems:"center"}}>
        <Mascot mood="happy" size={54} />
        <p className="caption" style={{flex:1,minWidth:0}}>Pilih jenis limbah dan beratnya. Lab akan merancang produk, formula, langkah pembuatan, sampai nilai ekonominya. Setiap generate <b style={{color:"var(--leaf-2)"}}>+15 XP</b>.</p>
      </div>

      <div className="card">
        <span className="eyebrow">Input limbah</span>
        <div style={{display:"grid",gap:16,marginTop:8}}>
          <div>
            <span className="label" style={{display:"block"}}>Jenis limbah</span>
            <div className="row-tight" role="radiogroup" aria-label="Jenis limbah">
              {WASTE_OPTIONS.map(o=> (
                <button key={o.value} type="button" role="radio" aria-checked={wasteType===o.value}
                  className={"chip"+(wasteType===o.value?" on chip-leaf":" chip-mute")} style={{cursor:"pointer"}}
                  onClick={()=> setWasteType(o.value)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div><label className="label" htmlFor="in-weight">Estimasi berat (gram) · min 10</label><input id="in-weight" className="input" type="number" min="10" placeholder="200" value={weight} onChange={e=> setWeight(e.target.value)} /></div>
          <div><label className="label" htmlFor="in-note">Catatan tambahan (opsional)</label><textarea id="in-note" className="input" rows={2} placeholder="Ada minyak, basah, tercampur..." value={note} onChange={e=> setNote(e.target.value)} /></div>
          <button type="button" className="btn btn-primary btn-block" disabled={loading || !weight} onClick={generate}>
            {loading ? <><span className="spin" /> Menganalisis limbah...</> : <><Icons.spark width={16} height={16}/> Buat rekomendasi · +15 XP</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="fade card" style={{borderColor:"var(--leaf-line)"}}>
          <div className="between" style={{alignItems:"flex-start"}}>
            <div style={{minWidth:0}}>
              <span className="eyebrow">Rekomendasi · {wasteLabel} · {weight}g</span>
              <h2 style={{marginTop:2}}>{result.nama_produk}</h2>
              <p className="caption" style={{fontStyle:"italic",marginTop:3}}>{result.tagline}</p>
            </div>
            <Mascot mood="done" size={52} />
          </div>
          <p style={{fontSize:14,lineHeight:1.7,marginTop:12}}>{result.deskripsi}</p>
          <div style={{display:"grid",gap:10,marginTop:14}}>
            <div className="panel"><div className="label" style={{marginBottom:4}}>Bahan utama</div><div style={{fontSize:14}}>{result.bahan_utama}</div></div>
            <div className="panel"><div className="label" style={{marginBottom:4}}>Formula</div><div style={{fontSize:13.5,fontFamily:"ui-monospace,'Cascadia Code',monospace",color:"var(--leaf-2)",fontWeight:700,lineHeight:1.6}}>{result.formula}</div></div>
            <div className="tile tile-leaf"><div className="label" style={{marginBottom:4}}>Manfaat</div><ul style={{paddingLeft:19,fontSize:14,lineHeight:1.7,display:"grid",gap:4}}>{(result.manfaat||[]).map((m,i)=><li key={i}>{m}</li>)}</ul></div>
            <div className="panel"><div className="label" style={{marginBottom:4}}>Langkah singkat</div><ol style={{paddingLeft:19,fontSize:14,lineHeight:1.7,display:"grid",gap:4}}>{(result.langkah_singkat||[]).map((s,i)=><li key={i}>{s}</li>)}</ol></div>
          </div>
          <div className="row-tight" style={{marginTop:14}}>
            <span className="chip chip-carrot"><Icons.gift width={12} height={12}/> {result.nilai_ekonomi}</span>
            <span className="chip chip-sky"><Icons.leaf width={12} height={12}/> {result.sdgs_target}</span>
          </div>
          <button type="button" className="btn btn-carrot btn-block" style={{marginTop:14}} onClick={publish}><Icons.store width={16} height={16}/> Publikasikan ke Market</button>
        </div>
      )}

      <div className="card">
        <SectionHead title="Riwayat Lab" right={<span className="chip chip-mute">{history.length}</span>} />
        {history.length===0 ? <Empty title="Belum ada riwayat">Generate rekomendasi pertamamu di Lab ini.</Empty> :
          <ExpandList items={history} renderItem={h=> (
            <div className="panel" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"12px 14px"}}>
              <div style={{minWidth:0}}><div style={{fontWeight:700,fontSize:13.5}}>{h.result?.nama_produk||h.wasteType}</div><div className="micro" style={{marginTop:2}}>{h.wasteType} · {h.weightGram}g · {new Date(h.timestamp||h.generatedAt).toLocaleDateString("id-ID")}</div></div>
              <span className="chip chip-leaf">{h.weightGram}g</span>
            </div>
          )} />}
      </div>
    </div>
  )
}
