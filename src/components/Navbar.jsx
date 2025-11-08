import { Link, useLocation } from "react-router-dom";
import { signOut } from "../services/dbService.js";
import { useAuth } from "../services/authContext.jsx";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    setDarkMode(!darkMode);

    if (darkMode) {
      // 🌞 Light Mode
      root.style.setProperty("--bg", "#faf7ff");
      root.style.setProperty("--card", "rgba(255,255,255,0.7)");
      root.style.setProperty("--soft", "rgba(255,255,255,0.5)");
      root.style.setProperty("--text", "#1a001f");
      root.style.setProperty("--muted", "#4c2e72");
    } else {
      // 🌙 Dark Mode
      root.style.setProperty("--bg", "#1a001f");
      root.style.setProperty("--card", "#2a0032");
      root.style.setProperty("--soft", "#3b004b");
      root.style.setProperty("--text", "#f0e6ff");
      root.style.setProperty("--muted", "#bda4e3");
    }
  };

  const navLink = (to, label, icon) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`sidebar-link ${pathname === to ? "active" : ""}`}
    >
      <span className="icon">{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {!isMobile ? (
        // ✅ Desktop Sidebar
        <aside className="sidebar">
          <div className="sidebar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2> AI Learnig Platform</h2>
            <button className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>

          <nav className="sidebar-nav">
            {navLink("/", "Home", "🏠")}
            {navLink("/dashboard", "Dashboard", "📈")}
            {navLink("/quiz", "Quiz", "🧠")}
            {navLink("/videos", "Videos", "🎥")}
            {navLink("/profile", "Profile", "👤")}
          </nav>

          <div className="sidebar-footer">
            {user ? (
              <button className="btn primary" onClick={signOut}>
                Logout
              </button>
            ) : (
              <Link className="btn primary" to="/login">
                Login
              </Link>
            )}
          </div>
        </aside>
      ) : (
        // ✅ Mobile Navbar
        <header className="mobile-nav">
          <div className="mobile-nav-header">
            <h2>📘 LearnAI</h2>
            <div>
              <button className="theme-toggle" onClick={toggleTheme}>
                {darkMode ? "☀️" : "🌙"}
              </button>
              <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? "✖" : "☰"}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav className="mobile-menu">
              {navLink("/", "Home", "🏠")}
              {navLink("/dashboard", "Dashboard", "📈")}
              {navLink("/quiz", "Quiz", "🧠")}
              {navLink("/videos", "Videos", "🎥")}
              {navLink("/profile", "Profile", "👤")}
              {user ? (
                <button className="btn primary" onClick={signOut}>
                  Logout
                </button>
              ) : (
                <Link className="btn primary" to="/login">
                  Login
                </Link>
              )}
            </nav>
          )}
        </header>
      )}
    </>
  );
}
