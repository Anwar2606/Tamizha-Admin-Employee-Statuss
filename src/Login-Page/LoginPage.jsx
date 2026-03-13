// src/pages/Login.js
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import companyLogo from "../assets/Tss-logo.png";
import bgImage from "../assets/login-background.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  // Show intro screen for 4 seconds
 useEffect(() => {
  const timer = setTimeout(() => {
    setShowIntro(false);
  }, 6000); // 6 seconds

  return () => clearTimeout(timer);
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid email or password!");
    }
  };

  // INTRO SCREEN
  if (showIntro) {
    return (
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "60px", fontWeight: "bold", letterSpacing: "2px" }}>
          Attendance Software
        </h1>

        <p style={{ fontSize: "28px", marginTop: "20px" }}>
          Created by Our Ex MD
        </p>

        <h2 style={{ fontSize: "40px", color: "#00eaff", marginTop: "10px" }}>
          Anwar
        </h2>
      </div>
    );
  }

  // LOGIN PAGE
  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="card shadow-lg p-4 bg-white bg-opacity-90"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="text-center mb-3">
          <img src={companyLogo} alt="Company Logo" style={{ width: "120px" }} />
        </div>

        <h2 className="text-center fw-bold text-dark">Login</h2>

        <form onSubmit={handleLogin} className="mt-3">
          <div className="mb-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              placeholder="Enter your password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
