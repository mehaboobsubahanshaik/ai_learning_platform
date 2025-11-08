import { useEffect, useState } from "react";
import { useAuth } from "../services/authContext.jsx";
import { getLearningPath } from "../services/dbService.js";

export default function Profile() {
  const { user } = useAuth();
  const [path, setPath] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const data = await getLearningPath(user.uid);
      setPath(data || []);

      if (data && data.length > 0) {
        // ✅ Calculate progress across all learning paths
        let totalDays = 0;
        let doneDays = 0;

        data.forEach((plan) => {
          if (plan.days && Array.isArray(plan.days)) {
            totalDays += plan.days.length;
            doneDays += plan.days.filter((d) => d.done).length;
          }
        });

        const pct = totalDays ? Math.round((doneDays / totalDays) * 100) : 0;
        setProgress(pct);
      } else {
        setProgress(0);
      }

      setLoading(false);
    };

    fetchData();

    // ✅ Auto-refresh progress when learner dashboard updates
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return <div className="container">Please login.</div>;
  }

  if (loading) {
    return <div className="container">Loading profile...</div>;
  }

  return (
    <div className="container grid">
      {/* Profile Info */}
      <div className="card">
        <h2>Profile</h2>
        <div className="small">UID</div>
        <div>{user.uid}</div>
        <div className="small" style={{ marginTop: 10 }}>
          Email
        </div>
        <div>{user.email}</div>
      </div>

      {/* Stats */}
      <div className="card">
        <h2>Stats</h2>
        <div className="small">Overall Progress</div>
        <h3>{progress}%</h3>
      </div>

      {/* Recent Path Items */}
      <div className="card">
        <h2>Recent Path Items</h2>
        {path.length ? (
          <ul>
            {path.slice(0, 5).map((p, i) => (
              <li key={i}>
                {p.title || "Untitled"}{" "}
                {p.days?.some((d) => d.done) ? "✅" : ""}
              </li>
            ))}
          </ul>
        ) : (
          <div className="small">No path items found.</div>
        )}
      </div>
    </div>
  );
}
