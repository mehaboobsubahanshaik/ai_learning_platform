//src/componenents/ProgressTracker.jsx
export default function ProgressTracker({ progress=0, streak=0 }){
  return (
    <div className="kpi">
      <div className="small">Progress</div>
      <h3>{progress}%</h3>
      <div className="small">Streak: {streak} day(s)</div>
      <div style={{marginTop:8, background:"#141621", border:"1px solid #232535", borderRadius:999, height:10}}>
        <div style={{width:`${progress}%`, height:"100%", borderRadius:999, background:"var(--brand)"}} />
      </div>
    </div>
  );
}
