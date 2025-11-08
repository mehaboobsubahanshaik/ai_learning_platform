import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import LearnerDashboard from "./pages/LearnerDashboard.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import Profile from "./pages/Profile.jsx";
import VideoPage from "./pages/VideoPage.jsx";
import { useAuth } from "./services/AuthContext.jsx";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={user ? <LearnerDashboard /> : <Navigate to="/login" />} />
          <Route path="/quiz" element={user ? <QuizPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/videos" element={user ? <VideoPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </main>
    </div>
  );
}
