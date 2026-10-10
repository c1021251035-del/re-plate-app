const P="replate_"
export const db={
  getAll(k){ try{ const r=localStorage.getItem(P+k); return r?JSON.parse(r):[] }catch{ return [] } },
  save(k,d){ const a=db.getAll(k); const o={...d,id:Date.now()+Math.floor(Math.random()*900),timestamp:new Date().toISOString()}; a.push(o); localStorage.setItem(P+k,JSON.stringify(a)); return o },
  del(k,id){ localStorage.setItem(P+k,JSON.stringify(db.getAll(k).filter(x=>x.id!==id))) },
  set(k,v){ localStorage.setItem(P+k,JSON.stringify(v)) },
  get(k,fb=null){ try{ const r=localStorage.getItem(P+k); return r?JSON.parse(r):fb }catch{ return fb } },
  exportCSV(key,filename){
    const rows=db.getAll(key); if(!rows.length) return false
    const h=Object.keys(rows[0]); const safe=v=> { const s=JSON.stringify(v??""); return /^[=+\-@]/.test(s.replace(/^"/,"")) ? "\"'"+s.slice(1) : s };
    const csv=[h.join(","),...rows.map(r=>h.map(x=> safe(r[x])).join(","))].join("\n")
    const b=new Blob([csv],{type:"text/csv"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=filename; a.click(); URL.revokeObjectURL(u); return true
  }
}
export const profileStore={
  get(){ return db.get("profile",null) },
  save(d){ db.set("profile",{...d,setupDone:true}); return db.get("profile") },
  isSetup(){ const p=db.get("profile",null); return !!(p&&p.setupDone) }
}
