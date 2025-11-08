// src/components/VideoCard.jsx
import { useEffect, useState } from "react";

const YT_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export default function VideoCard({ query }) {
  const [video, setVideo] = useState(null);

  useEffect(() => {
    if (!query) return;

    (async () => {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&key=${YT_KEY}&maxResults=1&type=video`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.items?.length > 0) {
          const vid = data.items[0];
          setVideo({
            title: vid.snippet.title,
            url: `https://www.youtube.com/embed/${vid.id.videoId}`,
          });
        }
      } catch (err) {
        console.error("YouTube fetch failed:", err);
      }
    })();
  }, [query]);

  if (!video) return null;

  return (
    <div className="card">
      <div className="small">Recommended Video</div>
      <h3 style={{ marginTop: 4 }}>{video.title}</h3>
      <div
        style={{
          aspectRatio: "16/9",
          background: "#0d0f15",
          border: "1px solid #22242c",
          borderRadius: 12,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <iframe
          src={video.url}
          title={video.title}
          width="100%"
          height="100%"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}
