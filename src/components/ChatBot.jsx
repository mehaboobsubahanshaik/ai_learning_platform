import { useState, useEffect, useRef } from "react";
import { generateLearningPlan } from "../services/aiService.js";
import { useAuth } from "../services/AuthContext.jsx";
import {
  saveChatMessage,
  getChatHistory,
  saveUserQuery,
  saveQuizQuestions,
  saveUserVideos,
  saveLearningPath,
} from "../services/dbService.js";

const YT_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export default function ChatBot() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const history = await getChatHistory(user.uid);
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          { role: "assistant", content: "Hi! Ask me anything about learning, topics, coding, or tech!" },
        ]);
      }
    })();
  }, [user]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Show arrow when user scrolls up
  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
    setShowScrollButton(!atBottom);
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatResponse = (text) => {
    if (!text) return "";

    let cleaned = text;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.days && Array.isArray(parsed.days)) {
          cleaned = parsed.days
            .map((day) => {
              const header = `📅 Day ${day.day} – ${day.topic}`;
              const tasks =
                day.tasks && Array.isArray(day.tasks)
                  ? day.tasks.map((t) => `• ${t}`).join("\n")
                  : "";
              return `${header}\n${tasks}`;
            })
            .join("\n\n");
        }
      }
    } catch (e) {
      cleaned = text
        .replace(/[\[\]{}"]/g, "")
        .replace(/\\n/g, "\n")
        .replace(/\s*:\s*/g, ": ")
        .replace(/\n{2,}/g, "\n\n");
    }

    cleaned = cleaned
      .replace(/courseTitle.*\n?/gi, "")
      .replace(/days.*\n?/gi, "")
      .replace(/day":/gi, "Day ")
      .replace(/topic":/gi, "")
      .replace(/tasks":/gi, "")
      .replace(/^\s*[,{}]+\s*$/gm, "")
      .trim();

    return cleaned;
  };

  const send = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    if (user) {
      await saveChatMessage(user.uid, "user", input);
      await saveUserQuery(user.uid, input);
    }

    setInput("");
    setLoading(true);

    try {
      const plan = await generateLearningPlan(input);
      const formattedResponse = formatResponse(plan.response);
      const botMsg = { role: "assistant", content: formattedResponse };
      setMessages((prev) => [...prev, botMsg]);

      if (user) {
        await saveChatMessage(user.uid, "assistant", formattedResponse);

        if (plan.plan) {
          await saveLearningPath(user.uid, {
            courseTitle: plan.plan.title || "Custom Learning Plan",
            days: plan.plan.days,
          });
        }

        await saveQuizQuestions(user.uid, input, [
          { question: `What did you learn from ${input}?`, options: ["A", "B", "C", "D"], answer: "A" },
        ]);

        const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          input
        )}&key=${YT_KEY}&maxResults=3&type=video`;
        const ytRes = await fetch(ytUrl);
        const ytData = await ytRes.json();

        if (ytData.items?.length > 0) {
          const videos = ytData.items.map((v) => ({
            id: v.id.videoId,
            title: v.snippet.title,
            thumbnail: v.snippet.thumbnails.default.url,
          }));
          await saveUserVideos(user.uid, input, videos);
        }
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Sorry, I couldn’t answer right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ height: "100%" }}>
        <h3>AI Chatbot</h3>
        <p className="small">Please login to start chatting.</p>
      </div>
    );
  }

  return (
    <div
      className="card stack"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <h3>AI Chatbot</h3>

      {/* Chat area */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="stack"
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#0e0f14",
          padding: 12,
          borderRadius: 12,
          marginBottom: 8,
          position: "relative",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              background: m.role === "assistant" ? "#141621" : "#0f1116",
              border: "1px solid #242634",
              padding: 10,
              borderRadius: 10,
              whiteSpace: "pre-line",
              marginBottom: 8,
            }}
          >
            <strong>{m.role === "assistant" ? "Assistant" : "You"}:</strong> {m.content}
          </div>
        ))}
        {loading && <div className="small">Generating…</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          style={{
            position: "absolute",
            bottom: "70px",
            right: "20px",
            background: "#a020f0",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            fontSize: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            transition: "opacity 0.3s ease",
          }}
          title="Scroll to bottom"
        >
          ↓
        </button>
      )}

      {/* Input box */}
      <div className="row" style={{ display: "flex", gap: "8px", width: "100%" }}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{
            flexGrow: 1,
            width: "100%",
            padding: "10px",
          }}
        />
        <button className="btn primary" onClick={send} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
