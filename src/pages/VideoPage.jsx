// VideoPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../services/authContext.jsx";
import {
  getUserQueries,
  getUserVideos,
  saveUserVideos,
  fetchYouTubeVideos,
} from "../services/dbService.js";

export default function VideoPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const storedVideos = await getUserVideos(user.uid);
      if (storedVideos.length > 0) {
        // ✅ Show last saved videos
        setVideos(storedVideos[0].videos);
      } else {
        // ✅ fallback: get last user query & fetch YouTube videos
        const queries = await getUserQueries(user.uid);
        if (queries.length === 0) return;

        const latestQuery = queries[0].query;
        const ytVideos = await fetchYouTubeVideos(latestQuery);

        if (ytVideos.length > 0) {
          await saveUserVideos(user.uid, latestQuery, ytVideos);
          setVideos(ytVideos);
        }
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="container">
        <h3>Please login to view recommended videos.</h3>
      </div>
    );
  }

  return (
    <div className="container grid">
      {videos.length > 0 ? (
        videos.map((v) => (
          <div key={v.id} className="card">
            <h3>{v.title}</h3>
            <div
              style={{
                aspectRatio: "16/9",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${v.id}`}
                title={v.title}
                width="100%"
                height="100%"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="card">
          <p>No videos yet. Ask ChatBot something first!</p>
        </div>
      )}
    </div>
  );
}
