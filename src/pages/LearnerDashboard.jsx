import { useEffect, useState } from "react";
import ProgressTracker from "../components/ProgressTracker.jsx";
import { useAuth } from "../services/AuthContext.jsx";
import { getLearningPath, saveLearningPath } from "../services/dbService.js";

export default function LearnerDashboard() {
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load all learning plans
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      const allPlans = await getLearningPath(user.uid);
      if (allPlans?.length > 0) {
        const normalized = allPlans.map((plan, idx) => ({
          id: plan.id || `${idx}`,
          title: plan.title || plan.courseTitle || `Plan ${idx + 1}`,
          days: normalizeDays(plan.days || plan.path || plan),
        }));
        setPaths(normalized);
      } else {
        setPaths([]);
      }
      setLoading(false);
    })();
  }, [user]);

  const normalizeDays = (days) => {
    if (!days) return [];
    if (Array.isArray(days)) {
      return days.map((d, idx) => ({
        day: d.day || idx + 1,
        topic:
          d.topic ||
          d.title ||
          d.name ||
          (typeof d === "string" ? d : `Day ${idx + 1}`),
        done: d.done || false,
      }));
    }
    if (typeof days === "object") {
      return Object.entries(days).map(([key, val], idx) => ({
        day: idx + 1,
        topic: val?.topic || val || key,
        done: val?.done || false,
      }));
    }
    return [];
  };

  // ✅ Toggle a task and persist (auto syncs with Profile)
  const toggle = async (planIdx, dayIdx) => {
    const updated = [...paths];
    const plan = updated[planIdx];
    plan.days[dayIdx].done = !plan.days[dayIdx].done;
    setPaths(updated);

    if (user) {
      await saveLearningPath(user.uid, {
        courseTitle: plan.title,
        days: plan.days,
      });
    }
  };

  if (!user)
    return <div className="container">Please login to see your dashboard.</div>;
  if (loading)
    return <div className="container">Loading your learning path...</div>;

  return (
    <div className="container stack">
      <h2>Your Learning Paths</h2>

      {paths.length > 0 ? (
        paths.map((plan, pIdx) => {
          const days = normalizeDays(plan.days);
          const total = days.length;
          const completed = days.filter((d) => d.done).length;
          const progress = total ? Math.round((completed / total) * 100) : 0;

          return (
            <div key={pIdx} className="card stack">
              <h3>{plan.title}</h3>
              <ProgressTracker
                progress={progress}
                streak={Math.max(1, Math.floor(progress / 20))}
              />

              {days.map((d, dIdx) => (
                <div
                  key={dIdx}
                  className="row"
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>{`Day ${d.day}: ${d.topic}`}</div>
                  <button
                    className={`btn ${d.done ? "primary" : ""}`}
                    onClick={() => toggle(pIdx, dIdx)}
                  >
                    {d.done ? "Completed" : "Mark done"}
                  </button>
                </div>
              ))}
            </div>
          );
        })
      ) : (
        <div className="card">
          <p>No learning paths yet. Try asking the chatbot to create one!</p>
        </div>
      )}
    </div>
  );
}
