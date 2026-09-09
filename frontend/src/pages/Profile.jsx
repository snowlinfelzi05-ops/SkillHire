import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, getFullResourceUrl } from "../config";
import "./Profile.css";
import { toast } from "../utils/toast";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    headline: "",
    bio: "",
    skills: "",
    experience: "",
    portfolio_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchProfile();
  }, []);

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/storage")) {
      return getFullResourceUrl(url);
    }
    return url;
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.profile) {
        setProfile({
          headline: data.profile.headline || "",
          bio: data.profile.bio || "",
          skills: Array.isArray(data.profile.skills) ? data.profile.skills.join(", ") : data.profile.skills || "",
          experience: data.profile.experience || "",
          portfolio_url: data.profile.portfolio_url || "",
        });
        setPhotoPreview(getFullImageUrl(data.user?.profile_photo_url || data.profile?.profile_photo_url || ""));
      } else if (data.user) {
        setProfile({
          headline: data.user.headline || "",
          bio: data.user.bio || "",
          skills: Array.isArray(data.user.skills) ? data.user.skills.join(", ") : data.user.skills || "",
          experience: data.user.experience || "",
          portfolio_url: data.user.portfolio_url || "",
        });
        setPhotoPreview(getFullImageUrl(data.user?.profile_photo_url || ""));
      }
    } catch (error) {
      console.error("Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Profile photo must be less than 2MB.");
      e.target.value = "";
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photo) return toast("Please select a photo first.");
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("profile_photo", photo);
      const response = await fetch(`${API_URL}/profile/photo`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to upload");
      setPhotoPreview(getFullImageUrl(data.profile_photo_url));
      setPhoto(null);
      const updatedUser = { ...user, profile_photo: data.profile_photo, profile_photo_url: getFullImageUrl(data.profile_photo_url) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast("Profile photo updated successfully! ✨");
    } catch (error) {
      toast(error.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Are you sure you want to delete your profile photo?")) return;
    try {
      setDeletingPhoto(true);
      const response = await fetch(`${API_URL}/profile/photo`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete");
      setPhotoPreview("");
      setPhoto(null);
      const updatedUser = { ...user, profile_photo: null, profile_photo_url: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast("Profile photo deleted successfully!");
    } catch (error) {
      toast(error.message);
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.headline.trim()) return toast("Professional headline is required.");
    try {
      setSaving(true);
      const payload = { ...profile, skills: profile.skills.split(",").map((s) => s.trim()).filter(Boolean) };
      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update");
      toast("Profile updated successfully! ✨");
      const updatedUser = { ...user, ...profile, skills: payload.skills };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      toast(error.message);
    } finally {
      setSaving(false);
    }
  };

  const skillList = profile.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const profileCompletion = Math.min(100, [profile.headline, profile.bio, profile.skills, profile.experience, profile.portfolio_url].filter((i) => i?.trim()).length * 20);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading"><div className="profile-spinner"></div><h3>Loading your profile...</h3></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <div className="profile-page-header">
          <div><span className="page-kicker">ACCOUNT SETTINGS</span><h1>My Profile</h1><p>Build your professional identity and showcase your skills on SkillHire.</p></div>
          <button type="button" className="back-dashboard-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
        </div>
        <section className="profile-hero">
          <div className="profile-hero-left">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {photoPreview ? <img src={photoPreview} alt={user?.name} className="profile-avatar-image" /> : (user?.name || "U").charAt(0).toUpperCase()}
              </div>
              {/* GRADIENT STYLE CAMERA - FINAL */}
              <label htmlFor="profile-photo-input" className="photo-upload-button gradient-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </label>
              <input id="profile-photo-input" type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handlePhotoChange} hidden />
            </div>
            <div className="profile-identity">
              <h2>{user?.name || "User"}</h2>
              <p>{profile.headline || "Add your professional headline"}</p>
              <div className="profile-meta">
                {user?.email && <span>✉ {user.email}</span>}
                {user?.role && <span>● {user.role}</span>}
              </div>
              {photo && (
                <button type="button" className="upload-photo-btn" onClick={handlePhotoUpload} disabled={uploadingPhoto}>
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </button>
              )}
              {!photo && photoPreview && (
                <button type="button" className="upload-photo-btn delete-btn" onClick={handleDeletePhoto} disabled={deletingPhoto} style={{ background: '#ef4444', marginTop: '8px' }}>
                  {deletingPhoto ? "Deleting..." : "🗑 Remove Photo"}
                </button>
              )}
            </div>
          </div>
          <div className="completion-box">
            <div className="completion-top"><span>Profile Completion</span><strong>{profileCompletion}%</strong></div>
            <div className="completion-track"><div className="completion-fill" style={{ width: `${profileCompletion}%` }}></div></div>
            <small>{profileCompletion === 100 ? "Your profile is complete! ✨" : "Complete your profile to stand out."}</small>
          </div>
        </section>

        <div className="profile-content-grid">
          <main className="profile-main-card">
            <div className="card-heading"><div><span className="section-kicker">PROFESSIONAL INFORMATION</span><h2>Profile Details</h2><p>Keep your professional information up to date.</p></div></div>
            <form onSubmit={handleSubmit}>
              <div className="profile-form-group"><label>Professional Headline<span>*</span></label><input type="text" name="headline" value={profile.headline} onChange={handleChange} placeholder="e.g. Full Stack Developer | React & Laravel Expert" required /><small>A strong headline helps clients quickly understand what you do.</small></div>
              <div className="profile-form-group"><div className="label-row"><label>Professional Bio</label><span>{profile.bio.length}/500</span></div><textarea name="bio" value={profile.bio} onChange={(e) => { if (e.target.value.length <= 500) handleChange(e); }} placeholder="Tell clients about your experience..." rows="6" /></div>
              <div className="two-column-fields">
                <div className="profile-form-group"><label>Skills</label><input type="text" name="skills" value={profile.skills} onChange={handleChange} placeholder="React, Laravel, MySQL" /><small>Separate multiple skills using commas.</small></div>
                <div className="profile-form-group"><label>Experience</label><input type="text" name="experience" value={profile.experience} onChange={handleChange} placeholder="Fresher / 2 years / 5+ years" /><small>Mention your professional experience.</small></div>
              </div>
              <div className="profile-form-group"><label>Portfolio URL</label><div className="portfolio-input"><span>🔗</span><input type="url" name="portfolio_url" value={profile.portfolio_url} onChange={handleChange} placeholder="https://your-portfolio.com" /></div></div>
              <div className="form-footer"><p>Your profile information will be visible to relevant SkillHire users.</p><button type="submit" className="save-profile-btn" disabled={saving}>{saving ? "Saving..." : "✓ Save Profile"}</button></div>
            </form>
          </main>
          <aside className="profile-sidebar">
            <div className="profile-side-card"><div className="side-card-heading"><h3>Your Skills</h3><span>{skillList.length}</span></div>{skillList.length === 0 ? <div className="side-empty"><p>Add your skills to improve your Skill Matching score.</p></div> : <div className="skill-tags">{skillList.map((skill, i) => <span key={i}>{skill}</span>)}</div>}</div>
            <div className="profile-side-card tips-card"><div className="tip-icon">✦</div><h3>Profile Tips</h3><ul><li>Use a clear professional headline.</li><li>Add relevant technical skills.</li><li>Write a detailed professional bio.</li><li>Add your portfolio or GitHub link.</li></ul></div>
            <div className="profile-side-card"><div className="side-card-heading"><h3>Account</h3></div><div className="account-info"><div><span>Name</span><strong>{user?.name || "N/A"}</strong></div><div><span>Email</span><strong>{user?.email || "N/A"}</strong></div><div><span>Role</span><strong>{user?.role || user?.user_type || "User"}</strong></div></div></div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Profile;