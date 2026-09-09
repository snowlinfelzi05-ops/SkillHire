import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./Login.css";
import { toast } from "../utils/toast";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        {/* Left Branding Section */}
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-logo">S</div>

            <h1>SkillHire</h1>

            <p>
              Connect with talented freelancers and discover
              exciting opportunities.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <span>✓</span>
                <p>Find the right skills for your project</p>
              </div>

              <div className="brand-feature">
                <span>✓</span>
                <p>Work with trusted professionals</p>
              </div>

              <div className="brand-feature">
                <span>✓</span>
                <p>Build your freelance career</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="login-section">
          <div className="login-card">

            <div className="mobile-logo">
              <div className="brand-logo">S</div>
              <span>SkillHire</span>
            </div>

            <div className="login-header">
              <span className="welcome-label">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>
                Enter your details to continue to SkillHire.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">

              <div className="login-form-group">
                <label htmlFor="email">Email Address</label>

                <div className="input-wrapper">
                  <span className="input-icon">✉</span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="login-form-group">
                <div className="password-label">
                  <label htmlFor="password">Password</label>
                </div>

                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>New to SkillHire?</span>
            </div>

            <Link to="/register" className="register-button">
              Create a new account
            </Link>

            <p className="login-footer">
              © 2026 SkillHire. All rights reserved.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;