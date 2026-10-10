import { useState, useMemo } from "react"
import { db } from "../lib/db.js"
import { Empty, PageHead, SectionHead } from "../components/UI.jsx"
import { Icons } from "../components/Icons.jsx"
import { useToast } from "../components/Toast.jsx"

const CATS=[
  {k:"semua",label:"Semua"},
  {k:"kulit_buah",label:"Kulit buah"},
  {k:"cangkang_telur",label:"Cangkang telur"},
  {k:"sisa_nasi",label:"Sisa nasi"},
  {k:"sayuran",label:"Sayuran"},
]

export default function Marketplace(){
  const toast=useToast()
  const [rows,setRows]=useState(()=> db.getAll("marketplace"))
  const [q,setQ]=useState("")
  const [filter,setFilter]=useState("semua")
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({productName:"",description:"",rawMaterial:"kulit_buah",valueEstimate:""})

  const filtered=useMemo(()=> rows.filter(r=>{
    const okCat= filter==="semua" || r.category===filter || r.rawMaterial===filter
    const okQ= !q || (r.productName+" "+r.description).toLowerCase().includes(q.toLowerCase())
    return okCat && okQ
  }),[rows,q,filter])

  function submit(e){
    e.preventDefault()
    if(!form.productName.trim() || !form.description.trim()) return toast("Nama dan deskripsi wajib","error")
    db.save("marketplace",{ productName:form.productName.trim(), description:form.description.trim(), rawMaterial:form.rawMaterial, category:form.rawMaterial, valueEstimate:form.valueEstimate.trim()||"-", publishedAt:new Date().toISOString() })
    setRows(db.getAll("marketplace")); setForm({productName:"",description:"",rawMaterial:"kulit_buah",valueEstimate:""}); setShowForm(false); toast("Produk tayang di Market","accent")
  }
  function remove(id){ if(!confirm("Hapus produk?")) return; db.del("marketplace",id); setRows(db.getAll("marketplace")); toast("Produk dihapus","error") }

  return (
    <div className="fade stack-lg page-wrap">
      <PageHead
        title="Market Circular"
        subtitle="Etalase produk olahan limbah MBG, terbit dari Lab Inovasi atau input manual."
        right={<button type="button" className="btn btn-primary btn-sm" onClick={()=> setShowForm(v=>!v)}><Icons.plus width={15} height={15}/>{showForm?"Tutup":"Jual produk"}</button>}
      />

      <div className="row" style={{position:"relative"}}>
        <Icons.search width={17} height={17} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--ink-3)",pointerEvents:"none"}} />
        <input className="input" placeholder="Cari produk..." value={q} onChange={e=> setQ(e.target.value)} style={{flex:1,minWidth:180,paddingLeft:40}} aria-label="Cari produk" />
      </div>

      <div className="row-tight" style={{overflowX:"auto",paddingBottom:2,flexWrap:"nowrap"}}>
        {CATS.map(c=> (
          <button type="button" key={c.k} onClick={()=> setFilter(c.k)} className={"chip"+(filter===c.k?" on chip-leaf":" chip-mute")} style={{whiteSpace:"nowrap",cursor:"pointer"}} aria-pressed={filter===c.k}>{c.label}</button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={submit} className="card fade">
          <span className="eyebrow">Formulir produk</span>
          <div style={{display:"grid",gap:14,marginTop:8}}>
            <div><label className="label" htmlFor="p-name">Nama produk</label><input id="p-name" className="input" value={form.productName} onChange={e=> setForm({...form,productName:e.target.value})} placeholder="Sabun cuci piring kulit jeruk" /></div>
            <div><label className="label" htmlFor="p-desc">Deskripsi</label><textarea id="p-desc" className="input" rows={3} value={form.description} onChange={e=> setForm({...form,description:e.target.value})} placeholder="Jelaskan produk, bahan, dan cara pakainya..." /></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
              <div><label className="label" htmlFor="p-cat">Kategori</label>
                <select id="p-cat" className="input" value={form.rawMaterial} onChange={e=> setForm({...form,rawMaterial:e.target.value})}>
                  {CATS.filter(c=>c.k!=="semua").map(c=> <option key={c.k} value={c.k}>{c.label}</option>)}
                </select>
              </div>
              <div><label className="label" htmlFor="p-val">Estimasi nilai</label><input id="p-val" className="input" value={form.valueEstimate} onChange={e=> setForm({...form,valueEstimate:e.target.value})} placeholder="Rp 15.000" /></div>
            </div>
            <button className="btn btn-primary btn-block" type="submit">Terbitkan produk</button>
          </div>
        </form>
      )}

      <section>
        <SectionHead title="Produk" right={<span className="chip chip-mute">{filtered.length} item</span>} />
        {filtered.length===0 ? (
          <Empty title={rows.length===0?"Belum ada produk":"Tidak ada yang cocok"}>
            {rows.length===0?"Mulai dari Lab Inovasi, lalu publikasikan hasilnya di sini.":"Coba kata kunci atau kategori lain."}
          </Empty>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:14}}>
            {filtered.map(r=> (
              <article key={r.id} className="card" style={{display:"flex",flexDirection:"column",gap:10,padding:16}}>
                <div className="between" style={{flexWrap:"nowrap"}}>
                  <span className="chip chip-leaf"><Icons.cube width={12} height={12}/> {CATS.find(c=>c.k===(r.category||r.rawMaterial))?.label||(r.rawMaterial||"").replace("_"," ")}</span>
                  <button type="button" className="chip chip-mute" onClick={()=> remove(r.id)} aria-label={"Hapus "+r.productName}><Icons.trash width={12} height={12}/></button>
                </div>
                <h3 style={{fontSize:"var(--fs-h3)",lineHeight:1.3}}>{r.productName}</h3>
                <p className="caption" style={{flex:1}}>{r.description}</p>
                <div className="divider" style={{margin:0}} />
                <div className="between" style={{flexWrap:"nowrap"}}>
                  <span className="chip chip-carrot"><Icons.gift width={12} height={12}/> {r.valueEstimate||"-"}</span>
                  <span className="micro"><Icons.clock width={11} height={11} style={{display:"inline",verticalAlign:"-1.5px",marginRight:3}}/>{new Date(r.publishedAt).toLocaleDateString("id-ID")}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
