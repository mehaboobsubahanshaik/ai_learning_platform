// src/pages/QuizPage.jsx
import { useEffect, useState } from "react";
import QuizCard from "../components/Quizcard.jsx";
import { useAuth } from "../services/authContext.jsx";
import { getQuizQuestions, saveQuizResult } from "../services/dbService.js";

export default function QuizPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getQuizQuestions(user.uid);
      if (data.length > 0) {
        // take the most recent query’s questions
        setQuestions(data[0].questions || []);
      }
    })();
  }, [user]);

  const onAnswer = async (opt) => {
    if (opt === questions[idx].answer) {
      setScore((s) => s + 1);
    }
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1);
    } else {
      setFinished(true);
      if (user) {
        await saveQuizResult(user.uid, "Custom Quiz", score + (opt === questions[idx].answer ? 1 : 0), questions.length);
      }
    }
  };

  if (!user) {
    return <div className="container"><h3>Please login to take quizzes.</h3></div>;
  }

  if (finished) {
    return (
      <div className="container card">
        <h2>Quiz Completed 🎉</h2>
        <p>Your Score: {score}/{questions.length}</p>
      </div>
    );
  }

  return (
    <div className="container stack">
      {questions.length > 0 ? (
        <>
          <div className="card row" style={{ justifyContent: "space-between" }}>
            <h3>Question {idx + 1} of {questions.length}</h3>
          </div>
          <QuizCard
            question={questions[idx].question}
            options={questions[idx].options}
            onAnswer={onAnswer}
          />
        </>
      ) : (
        <div className="card"><p>No quiz found yet. Try asking ChatBot a topic first!</p></div>
      )}
    </div>
  );
}
