import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./Settings.css";
import { toast } from "../utils/toast";

const Settings = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.new !== passwordForm.confirm) {
      toast("New password and confirmation must match.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: passwordForm.current,
            new_password: passwordForm.new,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast("Password changed successfully! ✅");

        setPasswordForm({
          current: "",
          new: "",
          confirm: "",
        });
      } else {
        toast(data.message || "Failed");
      }
    } catch {
      toast("Error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
      if (
        !window.confirm(
          "Are you sure you want to permanently delete this account?"
        )
      ) {
      return;
    }

    const password = window.prompt(
      "Please enter your password to confirm account deletion."
    );
    if (password === null || password.trim() === "") {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/account`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.message || "Unable to delete account");
        return;
      }

      toast("Account deleted");
      handleLogout();
    } catch {
      toast("Unable to delete account");
    }
  };

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || "S";

  const userRole =
    user?.role || user?.user_type || "Client";

  return (
    <div className="settings-page">
      <div className="settings-wrapper">

        {/* Header */}
        <div className="settings-header">
          <div>
            <span className="settings-kicker">
              ACCOUNT CONTROL
            </span>

            <h1>Settings</h1>

            <p>
              Manage your account, security and preferences
              from one place.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="settings-back-btn"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Settings Layout */}
        <div className="settings-grid">

          {/* Main Content */}
          <main className="settings-main">

            {/* Account Information */}
            <section className="settings-card account-card">
              <div className="settings-card-top"></div>

              <div className="settings-card-body">

                <div className="settings-section-heading">
                  <div className="settings-section-icon">
                    👤
                  </div>

                  <div>
                    <span>ACCOUNT</span>
                    <h2>Account Information</h2>
                    <p>
                      Your basic SkillHire account details.
                    </p>
                  </div>
                </div>

                <div className="account-profile">
                  <div className="settings-avatar">
                    {userInitial}
                  </div>

                  <div className="account-profile-info">
                    <h3>{user?.name || "User"}</h3>

                    <p>
                      {user?.email || "email@example.com"}
                    </p>

                    <div className="account-badges">
                      <span className="role-badge">
                        {userRole}
                      </span>

                      <span className="member-badge">
                        ● Active Member
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="edit-profile-btn"
                >
                  Edit Profile
                  <span>→</span>
                </Link>
              </div>
            </section>

            {/* Change Password */}
            <section className="settings-card">
              <div className="settings-card-body">

                <div className="settings-section-heading">
                  <div className="settings-section-icon security-icon">
                    🔒
                  </div>

                  <div>
                    <span>SECURITY</span>
                    <h2>Change Password</h2>
                    <p>
                      Keep your account secure with a strong
                      password.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handlePasswordChange}
                  className="password-form"
                >

                  <div className="settings-input-group">
                    <label>
                      Current Password
                    </label>

                    <input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="password-row">

                    <div className="settings-input-group">
                      <label>
                        New Password
                      </label>

                      <input
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            new: e.target.value,
                          })
                        }
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <div className="settings-input-group">
                      <label>
                        Confirm New Password
                      </label>

                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirm: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                  </div>

                  <div className="password-footer">
                    <div className="password-tip">
                      <span>💡</span>
                      <p>
                        Use a strong password with a mix of
                        letters, numbers and symbols.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="update-password-btn"
                    >
                      {loading
                        ? "Updating..."
                        : "Update Password"}
                    </button>
                  </div>

                </form>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="settings-card danger-card">
              <div className="settings-card-body">

                <div className="settings-section-heading danger-heading">
                  <div className="settings-section-icon danger-icon">
                    ⚠️
                  </div>

                  <div>
                    <span>DANGER ZONE</span>
                    <h2>Account Actions</h2>
                    <p>
                      These actions can affect your account
                      permanently.
                    </p>
                  </div>
                </div>

                {/* Logout */}
                <div className="danger-action logout-action">
                  <div className="danger-action-info">
                    <div className="danger-action-icon">
                      ↪
                    </div>

                    <div>
                      <h3>Logout</h3>
                      <p>
                        Sign out from your current SkillHire
                        session.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </div>

                {/* Delete */}
                <div className="danger-action delete-action">
                  <div className="danger-action-info">
                    <div className="danger-action-icon delete-icon">
                      ×
                    </div>

                    <div>
                      <h3>Delete Account</h3>
                      <p>
                        Permanently delete your SkillHire
                        account and data.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    className="delete-btn"
                  >
                    Delete Account
                  </button>
                </div>

              </div>
            </section>

          </main>

          {/* Sidebar */}
          <aside className="settings-sidebar">

            {/* Security Status */}
            <div className="settings-side-card security-status-card">
              <div className="status-icon">
                🔐
              </div>

              <h3>Account Security</h3>

              <p>
                Your account is protected with authenticated
                access.
              </p>

              <div className="security-status">
                <span className="status-dot"></span>
                <strong>Security Active</strong>
              </div>
            </div>

            {/* Quick Links */}
            <div className="settings-side-card">
              <div className="side-card-title">
                <span>QUICK LINKS</span>
                <h3>Manage Account</h3>
              </div>

              <div className="settings-quick-links">

                <Link to="/profile">
                  <span className="quick-link-icon">
                    👤
                  </span>

                  <div>
                    <strong>My Profile</strong>
                    <small>
                      Update your professional details
                    </small>
                  </div>

                  <span>→</span>
                </Link>

                <Link to="/dashboard">
                  <span className="quick-link-icon">
                    📊
                  </span>

                  <div>
                    <strong>Dashboard</strong>
                    <small>
                      View your SkillHire activity
                    </small>
                  </div>

                  <span>→</span>
                </Link>

              </div>
            </div>

            {/* Privacy */}
            <div className="settings-side-card privacy-card">
              <div className="privacy-icon">
                ✓
              </div>

              <h3>Privacy & Safety</h3>

              <p>
                Your account information is only used to
                provide SkillHire services.
              </p>
            </div>

          </aside>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <span>SkillHire v1.0</span>
          <span>•</span>
          <span>Secure & Private 🔒</span>
          <span>•</span>
          <span>Made with ❤️</span>
        </div>

      </div>
    </div>
  );
};
export default Settings;