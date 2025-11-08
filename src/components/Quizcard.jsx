//src/components/Quizcard.jsx
export default function QuizCard({ question, options, onAnswer }){
  return (
    <div className="card stack">
      <div className="small">Question</div>
      <h3>{question}</h3>
      <div className="stack">
        {options.map((opt, idx)=>(
          <button key={idx} className="btn" onClick={()=>onAnswer(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
