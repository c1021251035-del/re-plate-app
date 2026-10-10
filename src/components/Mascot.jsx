/* Maskot RE-PLATE: "Si Daun" — SVG original, bagian dari identitas produk.
   Muncul hanya saat ada fungsi: onboarding, hint, feedback, encouragement, milestone. */

export function Mascot({ mood="happy", size=96 }){
  const faces={
    happy:{ eyes:[[-7,-3],[7,-3]], r:2.3, mouth:"M-7 4 Q0 11 7 4", brows:null },
    cheer:{ eyes:[[-7,-4],[7,-4]], r:2.3, mouth:"M-8 3 Q0 13.5 8 3", brows:["M-11 -8 L-4 -6","M4 -6 L11 -8"] },
    think:{ eyes:[[-6,-2],[8,-2]], r:2.1, mouth:"M-4 6 Q0 7.5 5 5.5", brows:["M-10 -7 L-3 -7.5"] },
    done:{ eyes:[[-7,-3],[7,-3]], r:2.3, mouth:"M-6 4 Q0 10.6 6 4", brows:["M-10 -7 L-4 -7","M4 -7 L10 -7"] },
    wave:{ eyes:[[-7,-3],[7,-3]], r:2.3, mouth:"M-6 5 Q0 12 6 5", brows:null },
    sad:{ eyes:[[-7,-2],[7,-2]], r:2.2, mouth:"M-6 8 Q0 3 6 8", brows:["M-11 -7 L-4 -5","M4 -5 L11 -7"] },
  }
  const f=faces[mood]||faces.happy
  const gid="mg"+mood+size
  return (
    <svg width={size} height={size} viewBox="-45 -45 90 90" role="img" aria-label={"Maskot RE-PLATE, "+(mood==="sad"?"sedih":mood==="done"||mood==="cheer"?"berhasil":mood==="think"?"berpikir":"senang")}>
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#5DB984"/><stop offset="100%" stopColor="#287A4F"/>
        </radialGradient>
      </defs>
      {/* bayangan potongan */}
      <ellipse cx="2" cy="40" rx="27" ry="6" fill="#1F3A2E" opacity=".08"/>
      {/* badan daun */}
      <path d="M0 -34 C 24 -30 36 -8 34 14 C 32 34 14 42 0 42 C -14 42 -32 34 -34 14 C -36 -8 -24 -30 0 -34 Z" fill={`url(#${gid})`} stroke="#1F3A2E" strokeWidth="3"/>
      {/* urat daun */}
      <path d="M0 -26 L0 36" stroke="#CDEBD9" strokeWidth="2.2" opacity=".55" strokeLinecap="round"/>
      <path d="M0 -12 L13 -20 M0 -12 L-13 -20 M0 2 L16 -4 M0 2 L-16 -4 M0 16 L14 12 M0 16 L-14 12" stroke="#CDEBD9" strokeWidth="1.8" opacity=".45" strokeLinecap="round"/>
      {/* tangkai */}
      <path d="M0 -34 Q3 -42 10 -44" stroke="#1F3A2E" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
      <path d="M10 -44 q6 -3 9 1 q-4 5 -9 -1" fill="#3FA46D" stroke="#1F3A2E" strokeWidth="2.2"/>
      {/* wajah */}
      <g transform="translate(0,6)">
        {f.brows && f.brows.map((d,i)=><path key={i} d={d} stroke="#1F3A2E" strokeWidth="2.4" strokeLinecap="round" fill="none"/>)}
        {f.eyes.map(([x,y],i)=>(<g key={i}><circle cx={x} cy={y} r={f.r+1.7} fill="#fff"/><circle cx={x} cy={y} r={f.r} fill="#1F3A2E"/></g>))}
        <path d={f.mouth} stroke="#1F3A2E" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
        {/* pipi */}
        <circle cx="-14" cy="6" r="3.4" fill="#F08A3E" opacity=".55"/>
        <circle cx="14" cy="6" r="3.4" fill="#F08A3E" opacity=".55"/>
      </g>
    </svg>
  )
}
export function MiniMascot({ size=26 }){
  return (
    <svg width={size} height={size} viewBox="-45 -45 90 90" aria-hidden="true">
      <path d="M0 -34 C 24 -30 36 -8 34 14 C 32 34 14 42 0 42 C -14 42 -32 34 -34 14 C -36 -8 -24 -30 0 -34 Z" fill="#3FA46D" stroke="#1F3A2E" strokeWidth="3.4"/>
      <path d="M0 -26 L0 36" stroke="#CDEBD9" strokeWidth="2.6" opacity=".6" strokeLinecap="round"/>
      <g transform="translate(0,8)">
        <circle cx="-8" cy="-3" r="3.1" fill="#fff"/><circle cx="-8" cy="-3" r="1.9" fill="#1F3A2E"/>
        <circle cx="8" cy="-3" r="3.1" fill="#fff"/><circle cx="8" cy="-3" r="1.9" fill="#1F3A2E"/>
        <path d="M-7 6 Q0 12.5 7 6" stroke="#1F3A2E" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  )
}
