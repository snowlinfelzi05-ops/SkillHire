import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./PostJob.css";
import { toast } from "../utils/toast";

const PostJob = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Web Development",
    budget: "",
    location: "",
    skills: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        budget: Number(form.budget),
        location: form.location,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      const res = await fetch(
        `${API_URL}/jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast("Job Posted Successfully! 🎉");
        navigate("/my-jobs");
      } else {
        toast(data.message || "Failed to post job");
      }
    } catch (err) {
      console.error(err);
      toast("Error posting job");
    } finally {
      setLoading(false);
    }
  };

  const skillCount = form.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean).length;

  return (
    <div className="post-job-page">
      <div className="post-job-wrapper">

        {/* Header */}
        <div className="post-job-header">
          <div>
            <span className="post-job-kicker">
              PROJECT CREATION
            </span>

            <h1>Post a New Job</h1>

            <p>
              Tell freelancers what you need and find the
              right talent for your project.
            </p>
          </div>

          <button
            className="post-job-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        <div className="post-job-layout">

          {/* Main Form */}
          <main className="post-job-card">

            <div className="post-job-card-top"></div>

            <div className="post-job-card-body">

              <div className="form-heading">
                <div className="form-heading-icon">
                  🚀
                </div>

                <div>
                  <span>JOB DETAILS</span>
                  <h2>Create Your Job</h2>
                  <p>
                    Provide clear details to attract the
                    right freelancers.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Job Title */}
                <div className="post-form-group">
                  <label>
                    Job Title
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Need a React Developer"
                    required
                  />

                  <small>
                    Use a clear and specific title for your
                    project.
                  </small>
                </div>

                {/* Description */}
                <div className="post-form-group">
                  <div className="label-row">
                    <label>
                      Project Description
                      <span>*</span>
                    </label>

                    <span>
                      {form.description.length} characters
                    </span>
                  </div>

                  <textarea
                    name="description"
                    rows="6"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your project, requirements, goals and expected deliverables..."
                    required
                  />

                  <small>
                    Give freelancers enough information to
                    understand your project.
                  </small>
                </div>

                {/* Category + Budget */}
                <div className="post-two-column">

                  <div className="post-form-group">
                    <label>
                      Category
                      <span>*</span>
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option>
                        Web Development
                      </option>

                      <option>
                        Backend Development
                      </option>

                      <option>
                        Design
                      </option>

                      <option>
                        Mobile Development
                      </option>

                      <option>
                        Writing
                      </option>

                      <option>
                        Marketing
                      </option>
                    </select>
                  </div>

                  <div className="post-form-group">
                    <label>
                      Budget (₹)
                      <span>*</span>
                    </label>

                    <div className="budget-input">
                      <span>₹</span>

                      <input
                        type="number"
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        placeholder="5000"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                </div>

                {/* Location */}
                <div className="post-form-group">
                  <label>Location</label>

                  <div className="location-input">
                    <span>📍</span>

                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Remote / Chennai"
                    />
                  </div>

                  <small>
                    Mention the preferred work location or
                    use "Remote".
                  </small>
                </div>

                {/* Skills */}
                <div className="post-form-group">
                  <div className="label-row">
                    <label>
                      Required Skills
                      <span>*</span>
                    </label>

                    <span>
                      {skillCount} skill
                      {skillCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <input
                    type="text"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React, Laravel, MySQL"
                    required
                  />

                  <small>
                    Separate multiple skills using commas.
                    Example: React, Node.js, Figma
                  </small>

                  {skillCount > 0 && (
                    <div className="job-skill-preview">
                      {form.skills
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean)
                        .map((skill, index) => (
                          <span key={index}>
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="post-job-footer">

                  <div className="footer-info">
                    <span>✓</span>

                    <p>
                      Your job will be visible to relevant
                      freelancers on SkillHire.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="post-job-submit"
                  >
                    {loading
                      ? "Posting..."
                      : "Post Job 🚀"}
                  </button>

                </div>

              </form>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="post-job-sidebar">

            {/* Tips */}
            <div className="post-side-card">
              <div className="side-icon">
                💡
              </div>

              <span className="side-kicker">
                QUICK TIPS
              </span>

              <h3>
                Write a great job post
              </h3>

              <ul>
                <li>
                  Use a clear and specific job title.
                </li>

                <li>
                  Explain your project requirements clearly.
                </li>

                <li>
                  Add all important technical skills.
                </li>

                <li>
                  Set a realistic project budget.
                </li>

                <li>
                  Mention whether the work is remote.
                </li>
              </ul>
            </div>

            {/* Skill Matching */}
            <div className="post-side-card matching-card">
              <div className="matching-icon">
                ✦
              </div>

              <span className="side-kicker">
                SKILL MATCHING
              </span>

              <h3>
                Find the right freelancer
              </h3>

              <p>
                Your required skills will help SkillHire
                match your project with freelancers who have
                relevant expertise.
              </p>

              <div className="matching-example">
                <span>React</span>
                <span>Laravel</span>
                <span>MySQL</span>
              </div>
            </div>

            {/* Preview */}
            <div className="post-side-card">
              <span className="side-kicker">
                POSTING CHECKLIST
              </span>

              <h3>
                Before you post
              </h3>

              <div className="check-item">
                <span className={form.title ? "checked" : ""}>
                  {form.title ? "✓" : "○"}
                </span>
                <p>Job title</p>
              </div>

              <div className="check-item">
                <span
                  className={
                    form.description ? "checked" : ""
                  }
                >
                  {form.description ? "✓" : "○"}
                </span>
                <p>Description</p>
              </div>

              <div className="check-item">
                <span
                  className={
                    form.budget ? "checked" : ""
                  }
                >
                  {form.budget ? "✓" : "○"}
                </span>
                <p>Budget</p>
              </div>

              <div className="check-item">
                <span
                  className={
                    form.skills ? "checked" : ""
                  }
                >
                  {form.skills ? "✓" : "○"}
                </span>
                <p>Required skills</p>
              </div>
            </div>

          </aside>
        </div>

        <div className="post-job-footer-text">
          SkillHire v1.0 • Find the right talent for your
          project ✨
        </div>

      </div>
    </div>
  );
};

export default PostJob;