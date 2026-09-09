import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import "./Register.css";
import { toast } from "../utils/toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "freelancer",
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

    if (formData.password !== formData.password_confirmation) {
      toast("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/register`,
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
        toast(
          data.message ||
            JSON.stringify(data.errors) ||
            "Registration failed"
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast("Registration successful! You are: " + data.user.role);

      window.location.href = "/login";
    } catch (error) {
      console.error("Error:", error);
      toast("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-wrapper">

        {/* Left Branding */}
        <div className="register-brand">
          <div className="register-brand-content">

            <div className="register-brand-logo">S</div>

            <h1>SkillHire</h1>

            <p>
              Build your career, find great talent, and turn
              skills into opportunities.
            </p>

            <div className="register-highlights">

              <div className="register-highlight">
                <div className="highlight-icon">💻</div>
                <div>
                  <h4>For Freelancers</h4>
                  <p>Find projects that match your skills.</p>
                </div>
              </div>

              <div className="register-highlight">
                <div className="highlight-icon">👔</div>
                <div>
                  <h4>For Clients</h4>
                  <p>Hire skilled professionals with confidence.</p>
                </div>
              </div>

              <div className="register-highlight">
                <div className="highlight-icon">⚡</div>
                <div>
                  <h4>Smart Matching</h4>
                  <p>Discover the right skills for every project.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Register Section */}
        <div className="register-section">
          <div className="register-card">

            <div className="register-mobile-logo">
              <div className="register-brand-logo">S</div>
              <span>SkillHire</span>
            </div>

            <div className="register-header">
              <span className="register-label">GET STARTED</span>

              <h2>Create your account</h2>

              <p>
                Join SkillHire and start your journey today.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="register-form"
            >

              {/* Name */}
              <div className="register-form-group">
                <label htmlFor="name">Full Name</label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon">👤</span>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="register-form-group">
                <label htmlFor="email">Email Address</label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon">✉</span>

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

              {/* Password */}
              <div className="register-form-group">
                <label htmlFor="password">Password</label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon">🔒</span>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="register-form-group">
                <label htmlFor="password_confirmation">
                  Confirm Password
                </label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon">🔐</span>

                  <input
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    placeholder="Confirm your password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="register-form-group">
                <label>Join SkillHire as</label>

                <div className="role-options">

                  <label
                    className={`role-option ${
                      formData.role === "freelancer"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="freelancer"
                      checked={formData.role === "freelancer"}
                      onChange={handleChange}
                    />

                    <span className="role-icon">💻</span>

                    <span className="role-content">
                      <strong>Freelancer</strong>
                      <small>Find projects & earn</small>
                    </span>

                    <span className="role-check">
                      {formData.role === "freelancer" ? "✓" : ""}
                    </span>
                  </label>

                  <label
                    className={`role-option ${
                      formData.role === "client"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={formData.role === "client"}
                      onChange={handleChange}
                    />

                    <span className="role-icon">👔</span>

                    <span className="role-content">
                      <strong>Client</strong>
                      <small>Post projects & hire</small>
                    </span>

                    <span className="role-check">
                      {formData.role === "client" ? "✓" : ""}
                    </span>
                  </label>

                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="register-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span>→</span>
                  </>
                )}
              </button>

            </form>

            <div className="register-divider">
              <span>Already a member?</span>
            </div>

            <Link
              to="/login"
              className="login-link-button"
            >
              Sign in to your account
            </Link>

            <p className="register-footer">
              © 2026 SkillHire. All rights reserved.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;