import { useState } from "react";
import { loginWithEmail, signUpWithEmail } from "../services/authService";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        alert("Login successful!");
      } else {
        await signUpWithEmail(email, password);
        alert("Account created!");
      }
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="container center"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 420,
          width: "100%",
          padding: "2rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          textAlign: "center",
          background: "var(--card)",
          color: "var(--text)",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem" }}>
          {mode === "login" ? "Login" : "Create Account"}
        </h2>

        <div
          className="stack"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "1rem",
            textAlign: "left",
          }}
        >
          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              className="label"
              style={{
                marginBottom: "0.4rem",
                fontWeight: "500",
                fontSize: "0.95rem",
              }}
            >
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                border: "1px solid var(--soft)",
                background: "var(--bg)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              className="label"
              style={{
                marginBottom: "0.4rem",
                fontWeight: "500",
                fontSize: "0.95rem",
              }}
            >
              Password
            </label>
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: "8px",
                border: "1px solid var(--soft)",
                background: "var(--bg)",
                color: "var(--text)",
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="btn primary"
          onClick={submit}
          style={{
            width: "100%",
            marginTop: "1.5rem",
            padding: "0.7rem",
            fontSize: "1rem",
          }}
        >
          {mode === "login" ? "Login" : "Sign Up"}
        </button>

        {/* Mode Switch Button */}
        <button
          className="btn"
          onClick={() =>
            setMode(mode === "login" ? "signup" : "login")
          }
          style={{
            width: "100%",
            marginTop: "0.75rem",
            background: "transparent",
            border: "1px solid var(--muted)",
            color: "var(--text)",
            padding: "0.6rem",
            fontSize: "0.95rem",
          }}
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
