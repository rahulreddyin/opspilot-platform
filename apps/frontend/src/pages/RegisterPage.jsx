import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  resendRegistrationOtp,
  startRegistration,
  verifyRegistrationOtp,
} from "../api/authApi";

function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("register"); // register | otp
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otpForm, setOtpForm] = useState({
    email: "",
    otpCode: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleOtpChange = (e) => {
    setOtpForm({
      ...otpForm,
      [e.target.name]: e.target.value,
    });
  };

  const extractErrorMessage = (err) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong"
    );
  };

  const handleStartRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: registerForm.name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password,
      };

      const response = await startRegistration(payload);

      setOtpForm({
        email: payload.email,
        otpCode: "",
      });

      setStep("otp");
      setCountdown(60);
      setMessage(response.message || "OTP sent successfully");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        email: otpForm.email.trim().toLowerCase(),
        otpCode: otpForm.otpCode.trim(),
      };

      const response = await verifyRegistrationOtp(payload);

      setMessage(response.message || "Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    setMessage("");

    try {
      const response = await resendRegistrationOtp({
        email: otpForm.email.trim().toLowerCase(),
      });

      setCountdown(60);
      setMessage(response.message || "OTP resent successfully");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f7fb",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {step === "register" ? (
          <>
            <h1 style={{ marginBottom: "24px", fontSize: "42px" }}>Register</h1>

            <form onSubmit={handleStartRegistration}>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                required
                style={inputStyle}
              />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
                style={inputStyle}
              />

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
                style={inputStyle}
              />

              {error ? <p style={errorStyle}>{error}</p> : null}
              {message ? <p style={successStyle}>{message}</p> : null}

              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Sending OTP..." : "Create Account"}
              </button>
            </form>

            <p style={{ marginTop: "18px", color: "#555" }}>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </>
        ) : (
          <>
            <h1 style={{ marginBottom: "10px", fontSize: "42px" }}>Verify Email</h1>
            <p style={{ marginBottom: "20px", color: "#555" }}>
              We sent a 6-digit code to <strong>{otpForm.email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                name="otpCode"
                placeholder="Enter 6-digit OTP"
                value={otpForm.otpCode}
                onChange={handleOtpChange}
                maxLength={6}
                required
                style={inputStyle}
              />

              {error ? <p style={errorStyle}>{error}</p> : null}
              {message ? <p style={successStyle}>{message}</p> : null}

              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Verifying..." : "Verify & Complete Registration"}
              </button>
            </form>

            <div style={{ marginTop: "16px" }}>
              <button
                type="button"
                disabled={countdown > 0 || resending}
                onClick={handleResendOtp}
                style={{
                  ...secondaryButtonStyle,
                  opacity: countdown > 0 || resending ? 0.6 : 1,
                  cursor: countdown > 0 || resending ? "not-allowed" : "pointer",
                }}
              >
                {resending
                  ? "Resending..."
                  : countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : "Resend OTP"}
              </button>
            </div>

            <p style={{ marginTop: "18px", color: "#555" }}>
              Wrong email?{" "}
              <button
                type="button"
                onClick={() => {
                  setStep("register");
                  setOtpForm({ email: "", otpCode: "" });
                  setMessage("");
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Go back
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "16px",
  fontSize: "16px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "14px 16px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  background: "#fff",
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
};

const errorStyle = {
  color: "#dc2626",
  marginTop: "-4px",
  marginBottom: "14px",
  fontSize: "14px",
};

const successStyle = {
  color: "#059669",
  marginTop: "-4px",
  marginBottom: "14px",
  fontSize: "14px",
};

export default RegisterPage;