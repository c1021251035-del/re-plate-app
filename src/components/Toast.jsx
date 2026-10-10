import { createContext, useContext, useState, useCallback } from "react"
const C = createContext(null)
export function ToastProvider({ children }){
  const [toasts,setToasts]=useState([])
  const push=useCallback((msg,variant="success",ms=2600)=>{
    const id=Date.now()+Math.random()
    setToasts(t=> [...t,{id,msg,variant}])
    setTimeout(()=> setToasts(t=> t.filter(x=> x.id!==id)), ms)
  },[])
  return <C.Provider value={push}><>{children}<div className="toast-wrap" aria-live="polite">{toasts.map(t=> <div key={t.id} className={"toast"+(t.variant==="accent"?" on-carrot":t.variant==="gold"?" on-gold":t.variant==="error"?" on-error":"")} role="status">{t.msg}</div>)}</div></></C.Provider>
}
export const useToast=()=> useContext(C)
