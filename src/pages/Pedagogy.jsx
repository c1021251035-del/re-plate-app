import { useState, useEffect, useRef } from "react"
import { db } from "../lib/db.js"
import { MODULES } from "../data/fallback.js"
import { PageHead, SectionHead, Progress, Feedback } from "../components/UI.jsx"
import { Confetti } from "../components/Celebrate.jsx"
import { Mascot } from "../components/Mascot.jsx"
import { Icons } from "../components/Icons.jsx"
import { useToast } from "../components/Toast.jsx"
import { addXP, unlockedBadges, checkNewBadges, emitBadge } from "../lib/gamify.js"
/* XP per penyelesaian modul: 20 kuis + 10 baca tuntas terlihat di depan */
const MODULE_XP=30

const STATE_LABEL={locked:"Terkunci",available:"Tersedia",current:"Sedang dipelajari",done:"Selesai",mastered:"Mahir"}

export default function Pedagogy(){
  const toast=useToast()
  const [active,setActive]=useState(MODULES[0].id)
  const [scrollPct,setScrollPct]=useState(0)
  const [answers,setAnswers]=useState({})
  const [showResult,setShowResult]=useState(null)
  const [taking,setTaking]=useState(false)
  const [quizScores,setQuizScores]=useState(()=> {
    const s=db.getAll("quiz_scores"); const m={}; s.forEach(x=> m[x.moduleId]=x); return m
  })
  const contentRef=useRef(null)
  const mod=MODULES.find(m=> m.id===active)
  const curProg=db.getAll("module_progress").find(p=> p.moduleId===active)
  const canQuiz = scrollPct>=90 || curProg?.isCompleted
  const activeIdx=MODULES.findIndex(m=> m.id===active)
  const answeredCount=Object.keys(answers).filter(k=> k.startsWith(active)).length

  function nodeState(i){
    const m=MODULES[i]
    const prog=db.getAll("module_progress").find(p=> p.moduleId===m.id)
    const score=quizScores[m.id]
    const done = !!(prog?.isCompleted && score)
    const available = i===0 || !!db.getAll("module_progress").find(p=> p.moduleId===MODULES[i-1].id)?.isCompleted
    const mastered = done && score?.score===score?.totalQuestions
    if(mastered) return "mastered"
    if(done) return "done"
    if(i===activeIdx) return "current"
    if(available) return "available"
    return "locked"
  }

  useEffect(()=>{
    const el=contentRef.current; if(!el) return
    function onScroll(){
      const st=el.scrollTop, sh=el.scrollHeight - el.clientHeight
      const pct= sh>0 ? Math.round((st/sh)*100) : 100
      const v=pct>100?100:pct
      setScrollPct(v)
      if(v>=90){
        const cur=db.getAll("module_progress")
        if(!cur.find(x=> x.moduleId===active && x.isCompleted)){
          const had=new Set(unlockedBadges().map(b=> b.k))
          const next=cur.filter(x=> x.moduleId!==active)
          next.push({moduleId:active,scrollPercent:v,isCompleted:true,completedAt:new Date().toISOString()})
          db.set("module_progress",next)
          checkNewBadges(had).forEach(b=> setTimeout(()=> emitBadge(b),600))
        }
      }
    }
    el.addEventListener("scroll", onScroll, { passive:true })
    return ()=> el.removeEventListener("scroll", onScroll)
  },[active])

  function selectModule(id){
    setActive(id); setScrollPct(0); setShowResult(null); setTaking(false); setAnswers({})
    contentRef.current?.scrollTo({top:0})
  }

  function submitQuiz(){
    const qs=mod.quiz
    let score=0
    qs.forEach((q,i)=> { if(answers[active+"_"+i]===q.a) score++ })
    const rec={ moduleId:mod.id, moduleName:mod.title, score, totalQuestions:qs.length, completedAt:new Date().toISOString() }
    const had=new Set(unlockedBadges().map(b=> b.k))
    db.save("quiz_scores", rec)
    setQuizScores(prev=> ({...prev,[mod.id]:rec}))
    setShowResult(rec); setTaking(false)
    if(score===qs.length){ addXP(20); toast("Sempurna! +20 XP","gold") }
    else if(score>=Math.ceil(qs.length/2)){ addXP(12); toast("Bagus! +12 XP","accent") }
    else { addXP(8); toast("Belum lolos. Baca lagi lalu ulangi.","error") }
    checkNewBadges(had).forEach(b=> setTimeout(()=> emitBadge(b),900))
  }

  return (
    <div className="fade stack-lg page-wrap">
      <PageHead title="Jalur Belajar" subtitle="Baca materi, pahami, lalu kuis. Setiap modul selesai membuka modul berikutnya." />

      {/* LEARNING PATH */}
      <section style={{minWidth:0}}>
        <SectionHead title="Progres modul" right={<span className="chip chip-gold"><Icons.zap width={12} height={12} /> {MODULE_XP} XP / modul</span>} />
        <div className="card card-pad0">
          <div style={{display:"flex",alignItems:"center",minWidth:520,padding:"18px 16px",overflowX:"auto"}}>
            {MODULES.map((m,i)=>{
              const st=nodeState(i)
              const locked=st==="locked"
              return (
                <div key={m.id} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
                  <button
                    type="button"
                    onClick={()=> !locked && selectModule(m.id)}
                    disabled={locked}
                    aria-label={`${m.title} — ${STATE_LABEL[st]}${locked?", terkunci":""}`}
                    aria-current={active===m.id?"step":undefined}
                    className={"node "+st}
                  >
                    {st==="done"||st==="mastered" ? <Icons.check width={22} height={22} strokeWidth={3}/> : st==="locked" ? <Icons.lock width={20} height={20}/> : String(i+1)}
                  </button>
                  <div style={{flex:1,minWidth:0,paddingLeft:10}}>
                    <div style={{fontWeight:800,fontSize:12.5,lineHeight:1.3,color: active===m.id?"var(--leaf-2)":"var(--ink)"}}>{m.title}</div>
                    <div className="micro" style={{marginTop:1,color:st==="mastered"?"#8E4A0E":undefined}}>{STATE_LABEL[st]}</div>
                  </div>
                  {i<MODULES.length-1 && <div className={"path-line"+(st==="done"||st==="mastered"?" on":"")} style={{marginLeft:10,marginRight:14}} />}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* READ PROGRESS */}
      <div className="panel">
        <div className="between" style={{marginBottom:8,flexWrap:"nowrap"}}>
          <span className="micro" style={{fontWeight:800}}>Progres baca</span>
          <span className="micro" style={{color: canQuiz?"var(--leaf-2)":"var(--ink-2)",fontWeight:800}}>{canQuiz ? "Kuis terbuka · +10 XP baca tuntas" : "Gulir hingga 90% — sekarang "+scrollPct+"%"}</span>
        </div>
        <Progress value={scrollPct} tone={canQuiz?"leaf":"carrot"} />
      </div>

      {/* LESSON READER */}
      <div className="card card-pad0">
        <div ref={contentRef} style={{maxHeight:460,overflowY:"auto",padding:"20px 18px 24px"}}>
          <div className="between" style={{alignItems:"flex-start",marginBottom:16}}>
            <div style={{minWidth:0}}>
              <span className="eyebrow">Modul {activeIdx+1} dari {MODULES.length}</span>
              <h2 style={{marginTop:2}}>{mod.title}</h2>
              <p className="caption" style={{marginTop:5}}>{mod.desc}</p>
            </div>
            <div className={scrollPct>=90?"bubble":""} style={{flexShrink:0}}><Mascot mood={scrollPct>=90?"cheer":"think"} size={56} /></div>
          </div>
          <div style={{display:"grid",gap:14}}>
            {mod.contentSections.map((s,i)=> (
              <section key={i} className={i%2===0?"panel":"card"} style={{padding:"15px 16px"}}>
                <span className="eyebrow" style={{marginBottom:7}}>{s.h}</span>
                {s.p && (
                  <p style={{fontSize:14,lineHeight:1.7,whiteSpace:"pre-wrap",
                    fontFamily:s.mono?"ui-monospace,'Cascadia Code',monospace":"inherit",
                    background:s.mono?"var(--paper-2)":"transparent",
                    padding:s.mono?"11px 13px":"0",
                    borderRadius:s.mono?"var(--r-sm)":"0",
                    border:s.mono?"2px solid var(--line)":"none",
                    color:s.mono?"var(--leaf-2)":"inherit",
                    fontWeight:s.mono?"700":"400"}}>{s.p}</p>
                )}
                {s.ul && <ul style={{marginTop:8,paddingLeft:19,fontSize:14,lineHeight:1.75,display:"grid",gap:6}}>{s.ul.map((x,j)=><li key={j}>{x}</li>)}</ul>}
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* QUIZ */}
      <div className="card">
        <SectionHead title="Kuis modul" right={<span className="chip chip-sky"><Icons.quiz width={12} height={12}/> {mod.quiz.length} soal</span>} />
        {!canQuiz ? (
          <Feedback type="info" title="Kuis masih terkunci">
            Baca materi sampai 90% untuk membuka kuis. Progres baca sekarang: <b>{scrollPct}%</b>.
          </Feedback>
        ) : showResult ? (
          <div className="fade" style={{textAlign:"center",padding:"8px 0 2px",position:"relative",overflow:"hidden"}}>
            {showResult.score===showResult.totalQuestions && <Confetti />}
            <div className={showResult.score===showResult.totalQuestions?"bubble":""}><Mascot mood={showResult.score===showResult.totalQuestions?"cheer":showResult.score>=Math.ceil(showResult.totalQuestions/2)?"happy":"think"} size={76} /></div>
            <div className="num" style={{fontSize:40,lineHeight:1.1,marginTop:8}}>{showResult.score}<span style={{fontSize:20,color:"var(--ink-3)"}}>/{showResult.totalQuestions}</span></div>
            <p className="caption" style={{maxWidth:420,margin:"6px auto 0"}}>
              {showResult.score===showResult.totalQuestions ? "Sempurna! Kamu menguasai materi ini dan modul berikutnya terbuka."
               : showResult.score>=Math.ceil(showResult.totalQuestions/2) ? "Bagus, hampir sempurna. Ulangi kuis untuk meraih status Mahir."
               : "Belum lolos. Baca lagi bagian yang keliru, lalu coba sekali lagi."}
            </p>
            <div className="row-tight" style={{justifyContent:"center",marginTop:18}}>
              <button type="button" className="btn btn-outline" onClick={()=> {setShowResult(null); setTaking(true); setAnswers({})}}>Ulangi kuis</button>
              {activeIdx<MODULES.length-1 && showResult.score>=Math.ceil(showResult.totalQuestions/2) && (
                <button type="button" className="btn btn-primary" onClick={()=> selectModule(MODULES[activeIdx+1].id)}>Modul berikutnya <Icons.arrow/></button>
              )}
            </div>
          </div>
        ) : quizScores[mod.id] && !taking ? (
          <div className="tile tile-leaf" style={{textAlign:"center"}}>
            <span className="eyebrow">Skor terbaik</span>
            <div className="num" style={{fontSize:34,color:"var(--leaf-2)"}}>{quizScores[mod.id].score}<span style={{fontSize:19,color:"var(--ink-3)"}}>/{quizScores[mod.id].totalQuestions}</span></div>
            <div className="micro" style={{marginTop:2}}>{new Date(quizScores[mod.id].completedAt||quizScores[mod.id].timestamp).toLocaleString("id-ID")}</div>
            <button type="button" className="btn btn-carrot" style={{marginTop:14}} onClick={()=> {setAnswers({}); setTaking(true)}}>Ulangi untuk kejar Mahir</button>
          </div>
        ) : (
          <div style={{display:"grid",gap:18}}>
            {mod.quiz.map((q,qi)=> (
              <fieldset key={qi} style={{border:"none",padding:0,minWidth:0}}>
                <legend style={{fontSize:"var(--fs-body)",fontWeight:700,marginBottom:9,lineHeight:1.5,padding:0,width:"100%"}}>
                  <span className="chip chip-leaf" style={{marginRight:7}}>{qi+1}</span>{q.q}
                </legend>
                <div style={{display:"grid",gap:9}}>
                  {q.opts.map((o,oi)=>{
                    const key=active+"_"+qi
                    const sel=answers[key]===oi
                    return (
                      <label key={oi} className={"quiz-opt"+(sel?" sel":"")}>
                        <input type="radio" name={key} checked={sel} onChange={()=> setAnswers(a=> ({...a,[key]:oi}))} style={{position:"absolute",opacity:0,width:1,height:1}} />
                        <span className="mkr" aria-hidden="true">{String.fromCharCode(65+oi)}</span>
                        <span style={{fontSize:14,lineHeight:1.45}}>{o}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ))}
            <div className="between">
              <span className="micro">{answeredCount}/{mod.quiz.length} terjawab</span>
              <button type="button" className="btn btn-primary" onClick={submitQuiz} disabled={answeredCount < mod.quiz.length}>Kirim jawaban</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
