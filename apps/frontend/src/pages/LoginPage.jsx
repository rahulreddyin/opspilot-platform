import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { saveAuth } from "../utils/auth";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      saveAuth(data);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes floatOne {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(45px, -35px) scale(1.08); }
            100% { transform: translate(0, 0) scale(1); }
          }

          @keyframes floatTwo {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-45px, 35px) scale(1.1); }
            100% { transform: translate(0, 0) scale(1); }
          }

          @keyframes gridFade {
            0% { opacity: 0.22; }
            50% { opacity: 0.38; }
            100% { opacity: 0.22; }
          }
        `}
      </style>

      <div style={gridOverlayStyle} />
      <div style={orbOneStyle} />
      <div style={orbTwoStyle} />
      <div style={orbThreeStyle} />

      <div style={loginWrapStyle}>
        <div style={brandOutsideStyle}>OpsPilot</div>

        <div style={cardStyle}>
          <h1 style={titleStyle}>Sign in</h1>
          <p style={subtitleStyle}>Access your workspace</p>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleLogin}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              style={inputStyle}
            />

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={registerTextStyle}>
            Don’t have an account?{" "}
            <Link to="/register" style={registerLinkStyle}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(120deg, #f8fafc, #eef2ff, #f1f5f9, #e0f2fe)",
  backgroundSize: "320% 320%",
  animation: "gradientMove 14s ease infinite",
};

const gridOverlayStyle = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
  animation: "gridFade 6s ease-in-out infinite",
};

const orbOneStyle = {
  position: "absolute",
  width: "420px",
  height: "420px",
  borderRadius: "999px",
  background: "rgba(37, 99, 235, 0.20)",
  top: "10%",
  left: "14%",
  filter: "blur(55px)",
  animation: "floatOne 9s ease-in-out infinite",
};

const orbTwoStyle = {
  position: "absolute",
  width: "380px",
  height: "380px",
  borderRadius: "999px",
  background: "rgba(14, 165, 233, 0.22)",
  right: "14%",
  bottom: "10%",
  filter: "blur(60px)",
  animation: "floatTwo 11s ease-in-out infinite",
};

const orbThreeStyle = {
  position: "absolute",
  width: "260px",
  height: "260px",
  borderRadius: "999px",
  background: "rgba(100, 116, 139, 0.20)",
  right: "35%",
  top: "18%",
  filter: "blur(48px)",
  animation: "floatOne 13s ease-in-out infinite",
};

const loginWrapStyle = {
  width: "100%",
  maxWidth: "390px",
  position: "relative",
  zIndex: 2,
};

const brandOutsideStyle = {
  textAlign: "center",
  fontSize: "30px",
  fontWeight: "800",
  color: "#111827",
  marginBottom: "22px",
  letterSpacing: "-0.04em",
};

const cardStyle = {
  width: "100%",
  backgroundColor: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(22px)",
  padding: "38px",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.85)",
  boxShadow: "0 24px 70px rgba(15,23,42,0.16)",
  boxSizing: "border-box",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "800",
  margin: "0 0 6px 0",
  color: "#111827",
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "24px",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  marginBottom: "7px",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  marginBottom: "15px",
  fontSize: "14px",
  boxSizing: "border-box",
  backgroundColor: "rgba(255,255,255,0.88)",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#6b7280",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "6px",
};

const errorStyle = {
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "14px",
  fontSize: "13px",
};

const registerTextStyle = {
  marginTop: "20px",
  fontSize: "13px",
  textAlign: "center",
  color: "#64748b",
};

const registerLinkStyle = {
  color: "#111827",
  fontWeight: "700",
};

export default LoginPage;