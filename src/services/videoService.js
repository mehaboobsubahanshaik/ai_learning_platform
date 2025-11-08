// videoService.js
import axios from "axios";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY; // store safely in .env
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export async function getRecommendedVideos(prompt) {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: "snippet",
        q: prompt,
        maxResults: 6,
        type: "video",
        key: API_KEY,
      },
    });
    return response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error("YouTube API error:", error.response?.data || error.message);
    throw new Error("YouTube API call failed. Check permissions or quota.");
  }
}
