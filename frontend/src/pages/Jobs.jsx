import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { toast } from "../utils/toast";
import "./Jobs.css";

const Jobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("match");

  const token = localStorage.getItem("token");

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const userRole = (
    currentUser?.role ||
    currentUser?.user_type ||
    ""
  ).toLowerCase();

  const isClient = userRole === "client";
  const isAdmin = userRole === "admin";
  const canPostJob = isClient || isAdmin;
  const isFreelancer = !isClient && !isAdmin;

  // ================= USER SKILLS =================

  const userSkillsRaw = currentUser?.skills || "";

  const userSkills = Array.isArray(userSkillsRaw)
    ? userSkillsRaw
        .map((s) => String(s).trim())
        .filter(Boolean)
    : String(userSkillsRaw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const userSkillsLower = userSkills.map((s) =>
    s.toLowerCase()
  );

  // ================= FETCH JOBS =================

  useEffect(() => {
    fetchJobs();
  }, []);

  // ================= FILTER + SORT =================

  useEffect(() => {
    let filtered = [...jobs];

    // Search
    if (search.trim()) {
      const searchValue = search.toLowerCase().trim();

      filtered = filtered.filter((job) => {
        const title = String(job.title || "").toLowerCase();

        const description = String(
          job.description || ""
        ).toLowerCase();

        const skills = Array.isArray(job.skills)
          ? job.skills.join(" ").toLowerCase()
          : String(job.skills || "").toLowerCase();

        return (
          title.includes(searchValue) ||
          description.includes(searchValue) ||
          skills.includes(searchValue)
        );
      });
    }

    // Category
    if (category !== "All") {
      filtered = filtered.filter(
        (job) =>
          String(job.category || "")
            .toLowerCase()
            .includes(category.toLowerCase())
      );
    }

    // Status
    if (statusFilter !== "All") {
      filtered = filtered.filter((job) => {
        const status = String(
          job.status || "open"
        ).toLowerCase();

        return status === statusFilter.toLowerCase();
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "match") {
        return (b.match || 0) - (a.match || 0);
      }

      if (sortBy === "budgetLow") {
        return (
          Number(a.budget || 0) -
          Number(b.budget || 0)
        );
      }

      if (sortBy === "budgetHigh") {
        return (
          Number(b.budget || 0) -
          Number(a.budget || 0)
        );
      }

      if (sortBy === "latest") {
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      return 0;
    });

    setFilteredJobs(filtered);
  }, [
    search,
    category,
    statusFilter,
    sortBy,
    jobs,
  ]);

  // ================= FETCH =================

  const fetchJobs = async () => {
    try {
      const res = await fetch(
        `${API_URL}/jobs`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      const jobList = data.jobs || data || [];

      const withMatch = jobList.map((job) => ({
        ...job,
        match: calculateMatch(job.skills || []),
      }));

      withMatch.sort(
        (a, b) => b.match - a.match
      );

      setJobs(withMatch);
      setFilteredJobs(withMatch);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= MATCH LOGIC =================

  const calculateMatch = (jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) {
      return 75;
    }

    if (userSkillsLower.length === 0) {
      return 50;
    }

    const jobSkillsLower = jobSkills.map((s) =>
      String(s).toLowerCase().trim()
    );

    let matched = 0;

    jobSkillsLower.forEach((js) => {
      if (
        userSkillsLower.some(
          (us) =>
            us === js ||
            us.includes(js) ||
            js.includes(us)
        )
      ) {
        matched++;
      }
    });

    const percent = Math.round(
      (matched / jobSkillsLower.length) * 100
    );

    if (percent === 100) return 100;
    if (percent === 0) return 20;

    return percent;
  };

  const getMatchColor = (match) => {
    if (match >= 80) {
      return {
        bg: "#00c851",
        light: "#e9fff2",
        label: "Perfect Match 🔥",
      };
    }

    if (match >= 50) {
      return {
        bg: "#ffbb33",
        light: "#fff8e6",
        label: "Good Match 👍",
      };
    }

    return {
      bg: "#ff6b6b",
      light: "#fff0f0",
      label: "Low Match",
    };
  };

  // ================= DELETE =================

  const handleDelete = async (jobId, e) => {
    e.stopPropagation();

    if (!window.confirm("Delete this job?")) {
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setJobs((prev) =>
          prev.filter((j) => j.id !== jobId)
        );

        setFilteredJobs((prev) =>
          prev.filter((j) => j.id !== jobId)
        );
      }
    } catch {
      toast("Error deleting job");
    }
  };

  // ================= EDIT =================

  const handleEdit = (jobId, e) => {
    e.stopPropagation();
    navigate(`/edit-job/${jobId}`);
  };

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ================= RESET FILTERS =================

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setStatusFilter("All");
    setSortBy("match");
  };

  // ================= STATS =================

  const totalJobs = jobs.length;

  const openJobs = jobs.filter(
    (job) =>
      String(job.status || "open").toLowerCase() ===
      "open"
  ).length;

  const closedJobs = jobs.filter(
    (job) =>
      String(job.status || "").toLowerCase() ===
      "closed"
  ).length;

  const perfectMatches = jobs.filter(
    (job) => job.match === 100
  ).length;

  const categories = [
    "All",
    "Web Development",
    "Backend Development",
    "Design",
    "Mobile Development",
    "Writing",
  ];

  // ================= LOADING =================

  if (loading) {
    return (
      <div
        className="jf-loader"
        style={{ minHeight: "100vh", background: "#f6f5fc" }}
      >
        <div className="jf-loader-title">
          <span className="jf-sk jf-sk-height" style={{ width: 220 }} />
          <span className="jf-sk jf-sk-height-sm" style={{ width: 320 }} />
        </div>
        <div className="jf-skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div className="jf-skeleton-card" key={i}>
              <div className="jf-sk" style={{ width: "40%", height: 14 }} />
              <div className="jf-sk" style={{ width: "90%", height: 12 }} />
              <div className="jf-sk" style={{ width: "70%", height: 12 }} />
              <div className="jf-sk" style={{ width: "45%", height: 12 }} />
              <div className="jf-sk jf-sk-btn" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="skillhire-dashboard">
      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <span>SkillHire</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button className="nav-item active">
            <span>▣</span>
            {isAdmin
              ? "All Jobs"
              : isClient
              ? "My Jobs"
              : "Find Jobs"}
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/my-projects")
            }
          >
            <span>▤</span>
            My Projects
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/my-proposals")
            }
          >
            <span>✉</span>
            {isClient || isAdmin
              ? "Received Proposals"
              : "My Proposals"}
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>◯</span>
            Profile
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>⚙</span>
            Settings
          </button>

          <button
            className="nav-item logout-nav"
            onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="dashboard-main">
        <div
          className="dashboard-body"
          style={{
            padding: "30px",
            background: "#f7f8fc",
            minHeight: "100vh",
          }}
        >
          {/* ================= HEADER ================= */}

          <div
            className="mb-4 jf-header"
            style={{
              background: "#fff",
              borderRadius: "22px",
              padding: "26px 28px",
              boxShadow:
                "0 10px 35px rgba(31,38,135,0.06)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <div
                  className="text-uppercase fw-bold mb-1"
                  style={{
                    color: "#6c5ce7",
                    fontSize: "11px",
                    letterSpacing: "1.5px",
                  }}
                >
                  SkillHire Marketplace
                </div>

                <h1
                  className="fw-bold mb-1"
                  style={{
                    fontSize: "32px",
                    color: "#171321",
                  }}
                >
                  {isAdmin
                    ? "All Jobs"
                    : isClient
                    ? "My Posted Jobs"
                    : "Available Jobs"}
                </h1>

                <p className="text-muted mb-0">
                  Discover{" "}
                  <strong>{jobs.length}</strong>{" "}
                  opportunities • Your skills:{" "}
                  <b
                    style={{
                      color: "#5a4bcf",
                    }}
                  >
                    {userSkills.join(", ") ||
                      "Add skills in profile"}
                  </b>
                </p>

                {isFreelancer &&
                  userSkills.length === 0 && (
                    <div
                      className="mt-2"
                      style={{
                        color: "#e53935",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      ⚠ Add skills in your profile
                      to improve your match percentage.
                    </div>
                  )}
              </div>

              <div className="d-flex gap-2">
                {canPostJob && (
                  <button
                    className="btn rounded-pill px-4 fw-bold"
                    style={{
                      background: "#5a4bcf",
                      border: "none",
                      color: "#fff",
                    }}
                    onClick={() =>
                      navigate("/post-job")
                    }
                  >
                    + Post a Job
                  </button>
                )}

                <button
                  className="btn btn-outline-dark rounded-pill px-4"
                  onClick={() =>
                    navigate("/dashboard")
                  }
                >
                  ← Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* ================= SUMMARY CARDS ================= */}

          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <div className="jf-summary-card total">
                <div className="jf-stat-icon purple">▣</div>
                <div className="jf-stat-ct">
                  <div className="jf-stat-label">Total Jobs</div>
                  <div className="jf-stat-value">{totalJobs}</div>
                  <div className="jf-stat-tag">Available listings</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="jf-summary-card open">
                <div className="jf-stat-icon blue">✓</div>
                <div className="jf-stat-ct">
                  <div className="jf-stat-label">Open Jobs</div>
                  <div className="jf-stat-value">{openJobs}</div>
                  <div className="jf-stat-tag">Ready for proposals</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="jf-summary-card closed">
                <div className="jf-stat-icon red">×</div>
                <div className="jf-stat-ct">
                  <div className="jf-stat-label">Closed Jobs</div>
                  <div className="jf-stat-value">{closedJobs}</div>
                  <div className="jf-stat-tag">Completed / closed</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div className="jf-summary-card primary">
                <div className="jf-stat-icon perfect">★</div>
                <div className="jf-stat-ct">
                  <div className="jf-stat-label">Perfect Matches</div>
                  <div className="jf-stat-value">{perfectMatches}</div>
                  <div className="jf-stat-tag">100% skill match</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FILTER TOOLBAR ================= */}

          <div
            className="mb-4 jf-filters"
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "20px",
              boxShadow:
                "0 8px 30px rgba(31,38,135,0.06)",
            }}
          >
            <div className="row g-3">
              {/* SEARCH */}

              <div className="col-lg-5">
                <label
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "12px",
                    color: "#55515f",
                  }}
                >
                  SEARCH JOBS
                </label>

                <div className="position-relative">
                  <span
                    className="position-absolute"
                    style={{
                      left: "16px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      fontSize: "19px",
                      color: "#777",
                    }}
                  >
                    ⌕
                  </span>

                  <input
                    className="form-control"
                    style={{
                      paddingLeft: "45px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "#f8f8fc",
                      border:
                        "1px solid #ececf3",
                    }}
                    placeholder="Search by title, skill or description..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>
              </div>

              {/* STATUS */}

              <div className="col-sm-6 col-lg-2">
                <label
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "12px",
                    color: "#55515f",
                  }}
                >
                  STATUS
                </label>

                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  style={{
                    height: "48px",
                    borderRadius: "14px",
                    background: "#f8f8fc",
                  }}
                >
                  <option value="All">
                    All Status
                  </option>
                  <option value="open">
                    Open
                  </option>
                  <option value="closed">
                    Closed
                  </option>
                </select>
              </div>

              {/* SORT */}

              <div className="col-sm-6 col-lg-3">
                <label
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "12px",
                    color: "#55515f",
                  }}
                >
                  SORT BY
                </label>

                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  style={{
                    height: "48px",
                    borderRadius: "14px",
                    background: "#f8f8fc",
                  }}
                >
                  <option value="match">
                    Best Skill Match
                  </option>
                  <option value="latest">
                    Latest Jobs
                  </option>
                  <option value="oldest">
                    Oldest Jobs
                  </option>
                  <option value="budgetLow">
                    Budget: Low → High
                  </option>
                  <option value="budgetHigh">
                    Budget: High → Low
                  </option>
                </select>
              </div>

              {/* RESET */}

              <div className="col-lg-2 d-flex align-items-end">
                <button
                  className="btn w-100 rounded-pill fw-bold"
                  style={{
                    height: "48px",
                    background: "#f0edff",
                    color: "#5a4bcf",
                    border: "none",
                  }}
                  onClick={resetFilters}
                >
                  ↻ Reset Filters
                </button>
              </div>
            </div>

            {/* CATEGORY */}

            <div className="mt-4">
              <div
                className="fw-bold mb-2"
                style={{
                  fontSize: "12px",
                  color: "#55515f",
                }}
              >
                CATEGORY
              </div>

              <div className="d-flex gap-2 overflow-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setCategory(cat)
                    }
                    className={`jf-chip btn rounded-pill px-3 text-nowrap${
                      category === cat
                        ? " active"
                        : ""
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RESULT BAR ================= */}

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <span
                className="fw-bold"
                style={{
                  fontSize: "18px",
                  color: "#171321",
                }}
              >
                Job Opportunities
              </span>

              <span
                className="ms-2"
                style={{
                  color: "#888492",
                  fontSize: "13px",
                }}
              >
                Showing {filteredJobs.length} of{" "}
                {jobs.length}
              </span>
            </div>

            {(search ||
              category !== "All" ||
              statusFilter !== "All") && (
              <button
                className="btn btn-sm rounded-pill"
                onClick={resetFilters}
                style={{
                  background: "#fff",
                  border:
                    "1px solid #e3e3eb",
                  color: "#5a4bcf",
                  fontWeight: "600",
                }}
              >
                Clear active filters
              </button>
            )}
          </div>

          {/* ================= EMPTY FILTER ================= */}

          {filteredJobs.length === 0 ? (
            <div
              className="text-center"
              style={{
                background: "#fff",
                borderRadius: "22px",
                padding: "70px 30px",
                boxShadow:
                  "0 8px 30px rgba(31,38,135,0.06)",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "24px",
                  background: "#f0edff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  fontSize: "36px",
                }}
              >
                🔎
              </div>

              <h4 className="mt-4 fw-bold">
                No jobs found
              </h4>

              <p className="text-muted mb-3">
                Try changing your search or
                filters.
              </p>

              <button
                className="btn rounded-pill px-4 fw-bold"
                style={{
                  background: "#5a4bcf",
                  color: "#fff",
                  border: "none",
                }}
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* ================= JOB CARDS ================= */

            <div className="row g-4 jf-job-grid">
              {filteredJobs.map((job) => {
                const isOwner =
                  currentUser &&
                  String(job.user_id) ===
                    String(currentUser.id);

                const showEditDelete =
                  isOwner || isAdmin;

                const match =
                  job.match ??
                  calculateMatch(
                    job.skills || []
                  );

                const matchInfo =
                  getMatchColor(match);

                const isMatchedSkill = (
                  skill
                ) => {
                  const skillLower =
                    String(skill).toLowerCase();

                  return userSkillsLower.some(
                    (us) =>
                      us === skillLower ||
                      us.includes(skillLower) ||
                      skillLower.includes(us)
                  );
                };

                const jobStatus = String(
                  job.status || "open"
                ).toLowerCase();

                const isOpen =
                  jobStatus === "open";

                return (
                  <div
                    key={job.id}
                    className={`col-md-6 col-xl-4 jf-job-col${
                      match === 100 ? " is-perfect" : ""
                    }`}
                  >
                    <div
                      className="card h-100 border-0 shadow-sm jf-job-card"
                      style={{
                        borderRadius: "20px",
                        overflow: "hidden",
                      }}
                    >
                      {/* MATCH LINE */}

                      <div
                        style={{
                          height: "5px",
                          background:
                            matchInfo.bg,
                        }}
                      ></div>

                      <div className="card-body p-4 d-flex flex-column">
                        {/* TOP */}

                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div
                            className="d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: "50px",
                              height: "50px",
                              background:
                                matchInfo.light,
                              color:
                                matchInfo.bg,
                              borderRadius: "14px",
                              fontSize: "20px",
                            }}
                          >
                            {String(
                              job.title || "J"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="text-end">
                            <span
                              className="badge rounded-pill px-3 py-2 text-white fw-bold"
                              style={{
                                background:
                                  matchInfo.bg,
                                fontSize: "11px",
                              }}
                            >
                              {match}% Match
                            </span>

                            <div
                              className="mt-1"
                              style={{
                                fontSize: "10px",
                                color:
                                  matchInfo.bg,
                                fontWeight: "600",
                              }}
                            >
                              {matchInfo.label}
                            </div>
                          </div>
                        </div>

                        {/* TITLE */}

                        <h5
                          className="fw-bold mb-2"
                          style={{
                            color: "#171321",
                            lineHeight: "1.4",
                          }}
                        >
                          {job.title}
                        </h5>

                        {/* DESCRIPTION */}

                        <p
                          className="text-muted small flex-grow-1"
                          style={{
                            lineHeight: "1.6",
                          }}
                        >
                          {job.description
                            ? job.description.length >
                              100
                              ? `${job.description.substring(
                                  0,
                                  100
                                )}...`
                              : job.description
                            : "No description provided."}
                        </p>

                        {/* STATUS */}

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span
                            className="badge rounded-pill px-3 py-2"
                            style={{
                              background: isOpen
                                ? "#eafff2"
                                : "#fff0f0",
                              color: isOpen
                                ? "#00a651"
                                : "#d9303e",
                              border: `1px solid ${
                                isOpen
                                  ? "#bdeed0"
                                  : "#ffd0d0"
                              }`,
                              textTransform:
                                "capitalize",
                            }}
                          >
                            ●{" "}
                            {job.status ||
                              "Open"}
                          </span>

                          <strong
                            style={{
                              color: "#5a4bcf",
                              fontSize: "19px",
                            }}
                          >
                            ₹{job.budget}
                          </strong>
                        </div>

                        {/* MATCH PROGRESS */}

                        <div className="mb-2">
                          <div className="d-flex justify-content-between mb-1">
                            <small
                              className="fw-bold"
                              style={{
                                color:
                                  matchInfo.bg,
                              }}
                            >
                              Skill Compatibility
                            </small>

                            <small className="text-muted">
                              {match}%
                            </small>
                          </div>

                          <div
                            className="progress"
                            style={{
                              height: "6px",
                              borderRadius: "10px",
                              background: "#eee",
                            }}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${match}%`,
                                background:
                                  matchInfo.bg,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* SKILLS */}

                        <div className="d-flex flex-wrap gap-2 my-3">
                          {(job.skills || [])
                            .slice(0, 3)
                            .map((skill, i) => {
                              const matched =
                                isMatchedSkill(
                                  skill
                                );

                              return (
                                <span
                                  key={i}
                                  className="badge rounded-pill px-3 py-2"
                                  style={{
                                    background:
                                      matched
                                        ? "#e6fff0"
                                        : "#f3f0ff",
                                    color: matched
                                      ? "#00a651"
                                      : "#6c5ce7",
                                    border: `1px solid ${
                                      matched
                                        ? "#00c851"
                                        : "#e0e0ff"
                                    }`,
                                  }}
                                >
                                  {matched
                                    ? "✓ "
                                    : ""}
                                  {skill}
                                </span>
                              );
                            })}

                          {(job.skills || [])
                            .length > 3 && (
                            <span className="badge bg-light text-muted rounded-pill">
                              +
                              {(job.skills || [])
                                .length - 3}
                            </span>
                          )}
                        </div>

                        {/* CATEGORY */}

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span
                            className="badge bg-light text-dark border px-3 py-2 rounded-pill"
                            style={{
                              fontWeight: "600",
                            }}
                          >
                            {job.category ||
                              "General"}
                          </span>

                          {job.created_at && (
                            <small
                              className="text-muted"
                              style={{
                                fontSize: "10px",
                              }}
                            >
                              {new Date(
                                job.created_at
                              ).toLocaleDateString()}
                            </small>
                          )}
                        </div>

                        {/* VIEW */}

                        <button
                          className="btn w-100 fw-bold text-white jf-details-btn"
                          onClick={() =>
                            navigate(
                              `/jobs/${job.id}`
                            )
                          }
                        >
                          View Details →
                        </button>

                        {/* EDIT DELETE */}

                        {showEditDelete && (
                          <div className="d-flex gap-2 mt-2">
                            <button
                              className="btn btn-outline-primary w-50 rounded-pill fw-bold jf-btn-edit"
                              onClick={(e) =>
                                handleEdit(
                                  job.id,
                                  e
                                )
                              }
                            >
                              ✏ Edit
                            </button>

                            <button
                              className="btn btn-outline-danger w-50 rounded-pill fw-bold jf-btn-delete"
                              onClick={(e) =>
                                handleDelete(
                                  job.id,
                                  e
                                )
                              }
                            >
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Jobs;