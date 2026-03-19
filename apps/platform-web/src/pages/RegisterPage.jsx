import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(formData);
      navigate("/login");
    } catch (error) {
      console.log("REGISTER ERROR:", error);
      console.log("REGISTER ERROR RESPONSE:", error.response);
      console.log("REGISTER ERROR DATA:", error.response?.data);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "#1f2937",
          }}
        >
          Register
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p
              style={{
                color: "red",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: loading ? "#93c5fd" : "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p
          style={{
            marginTop: "18px",
            fontSize: "15px",
            color: "#374151",
          }}
        >
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;