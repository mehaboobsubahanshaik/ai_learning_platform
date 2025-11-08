import { useAuth } from "../services/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ChatBot from "../components/ChatBot.jsx";
import VideoCard from "../components/VideoCard.jsx";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="container stack"
      style={{
        width: "100%",
        position: "relative",
        minHeight: "100vh",
        paddingBottom: "2rem",
      }}
    >
      {/* ✅ Chatbot full width */}
      <div style={{ width: "100%", marginBottom: "2rem" }}>
        <ChatBot />
      </div>

      {/* ✅ Login button only when logged out */}
      {!user && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            className="btn primary"
            onClick={() => navigate("/login")}
            style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
          >
            Login
          </button>
        </div>
      )}

      {/* ✅ Optional video section (centered) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "2rem",
        }}
      >
        <VideoCard />
      </div>
    </div>
  );
}
