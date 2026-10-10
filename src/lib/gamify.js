import { db } from "./db.js"


export const LEVEL_XP=100

/* Judul level: progres terasa seperti petualangan, bukan angka mentah */
const LEVEL_TITLES=["Benih Baru","Tunas Hijau","Daun Muda","Batang Kuat","Tukang Kompos","Koki Sirkular","Penjaga Panen","Arsitek Daur","Master Eco-Enzyme"]
export function getLevelMeta(xp){
  const level=getLevel(xp), progress=xp % LEVEL_XP
  const title=LEVEL_TITLES[Math.min(level-1,LEVEL_TITLES.length-1)]+(level>LEVEL_TITLES.length?" · Legenda RE-PLATE":"")
  return { level, title, progress, needed:LEVEL_XP-progress }
}
/* Event bus: satu addXP menjangkau HUD (denting ring), pop +N, dan overlay
   level-up tanpa prop-drilling. Guard typeof agar aman di non-DOM. */
function emit(name,detail){
  if(typeof window!=="undefined" && typeof window.dispatchEvent==="function")
    window.dispatchEvent(new CustomEvent(name,{detail}))
}
export const emitXP=(detail)=> emit("replate:xp",detail)
/* XP: 10 per entri MBG, 15 per Inno, 20/12/8 per kuis, bonus misi harian.
   Level = LEVEL_XP XP per level. */
export function addXP(amount){
  const from = getXP()
  const cur = from + amount
  localStorage.setItem("replate_xp", String(cur))
  emitXP({ amount, from, to:cur, leveledUp:getLevel(from)!==getLevel(cur) })
  return cur
}
export function getXP(){ return Number(localStorage.getItem("replate_xp")||"0") }
export function getLevel(xp){ return Math.floor(xp/LEVEL_XP)+1 }
export function levelProgress(xp){ return xp % LEVEL_XP }

/* Lencana: satu sumber kebenaran (dipakai Profile + deteksi unlock).
   icon = key ke Icons.jsx, karena gamify.js tidak boleh impor JSX. */
export const BADGES=[
  { k:"Pemula Hijau", desc:"Catat sisa MBG pertamamu", icon:"note", test:()=> db.getAll("mbg_tracker").length>0 },
  { k:"Pelajar Telaten", desc:"Selesaikan 1 modul belajar", icon:"book", test:()=> db.getAll("module_progress").some(p=> p.isCompleted) },
  { k:"Penemu Muda", desc:"Publikasikan 1 produk di Market", icon:"cube", test:()=> db.getAll("marketplace").length>0 },
  { k:"Mahir 3R", desc:"Skor sempurna di semua kuis", icon:"trophy", test:()=> { const s=db.getAll("quiz_scores"); return s.length>=3 && s.filter(x=> x.score>=x.totalQuestions).length>=3 } },
]
export function unlockedBadges(){
  try{ return BADGES.filter(b=> b.test()) }catch{ return [] }
}
/* Panggil dengan Set kunci SEBELUM aksi; kembalikan lencana yang baru terbuka */
export function checkNewBadges(had){
  const now=new Set(unlockedBadges().map(b=> b.k))
  return BADGES.filter(b=> now.has(b.k) && !had.has(b.k))
}
export const emitBadge=(badge)=> emit("replate:badge",{...badge})

const today=()=> new Date().toISOString().slice(0,10)

export function getStreak(){
  const rows = db.getAll("mbg_tracker")
  if(!rows.length) return 0
  const set = new Set(rows.map(r=> (r.date||r.timestamp?.slice(0,10))))
  let s=0, d=new Date()
  for(let i=0;i<60;i++){
    const k=d.toISOString().slice(0,10)
    if(set.has(k)) s++; else if(s>0) break
    d.setDate(d.getDate()-1)
  }
  return s
}
export function todayGoalDone(){
  const t=today()
  return db.getAll("mbg_tracker").some(r=> (r.date||r.timestamp?.slice(0,10))===t)
}

export const DAILY_QUESTS=[
  { id:"log",  label:"Catat sisa MBG",    desc:"Input 1 porsi hari ini", icon:"note" },
  { id:"quiz", label:"Selesaikan 1 kuis", desc:"Kerjakan kuis modul",    icon:"quiz" },
  { id:"lab",  label:"Buat rekomendasi",  desc:"Generate ide di Lab",    icon:"flask" },
]
export function questState(){
  const t=today()
  return {
    log:  db.getAll("mbg_tracker").some(r=> (r.date||r.timestamp?.slice(0,10))===t),
    quiz: db.getAll("quiz_scores").some(s=> (s.completedAt||s.timestamp||"").slice(0,10)===t),
    lab:  db.getAll("inno_history").some(h=> (h.timestamp||h.generatedAt||"").slice(0,10)===t),
  }
}
/* Bonus XP sekali per hari saat ketiga misi selesai -> momen reward */
export function dailyBonusKey(){ return "replate_dailybonus_"+today() }
export function claimDailyBonus(){
  if(localStorage.getItem(dailyBonusKey())==="1") return 0
  localStorage.setItem(dailyBonusKey(),"1")
  return 25
}
