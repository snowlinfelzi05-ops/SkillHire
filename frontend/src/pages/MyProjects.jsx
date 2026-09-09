import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { toast } from "../utils/toast";
import "./MyProjects.css";

const MyProjects = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const userRole = (
    user?.role ||
    user?.user_type ||
    ""
  ).toLowerCase();

  const isClient = userRole === "client";
  const isAdmin = userRole === "admin";

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [updating, setUpdating] = useState(null);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    if (search.trim()) {
      filtered = filtered.filter((p) => {
        const title =
          p.job?.title ||
          p.title ||
          "";

        return title
          .toLowerCase()
          .includes(search.toLowerCase());
      });
    }

    if (status !== "All") {
      filtered = filtered.filter(
        (p) => p.status === status
      );
    }

    setFilteredProjects(filtered);
  }, [search, status, projects]);

  // ================= FETCH PROJECTS =================

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `${API_URL}/projects`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setProjects(data.projects || []);
      setFilteredProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE STATUS =================

  const updateStatus = async (
    projectId,
    newStatus
  ) => {
    try {
      setUpdating(projectId);

      const res = await fetch(
        `${API_URL}/projects/${projectId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  status: data.project.status,
                }
              : p
          )
        );
      } else {
        toast(
          data.message ||
            "Failed to update project status"
        );
      }
    } catch (err) {
      toast(err.message);
    } finally {
      setUpdating(null);
    }
  };

  // ================= PAYMENT =================

  const handlePay = async (projectId) => {
    try {
      setPaying(projectId);

      const res = await fetch(
        `${API_URL}/projects/${projectId}/pay`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  payment_status: "paid",
                }
              : p
          )
        );

        toast("Payment Successful! 💰✅");
      } else {
        toast(
          data.message || "Payment Failed"
        );
      }
    } catch (err) {
      toast("Payment Failed");
    } finally {
      setPaying(null);
    }
  };

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ================= HELPERS =================

  const activeCount = projects.filter(
    (p) => p.status === "active"
  ).length;

  const completedCount = projects.filter(
    (p) => p.status === "completed"
  ).length;

  const cancelledCount = projects.filter(
    (p) => p.status === "cancelled"
  ).length;

  const paidCount = projects.filter(
    (p) => p.payment_status === "paid"
  ).length;

  const pendingPaymentCount = projects.filter(
    (p) =>
      p.status === "completed" &&
      p.payment_status !== "paid"
  ).length;

  const totalBudget = projects.reduce(
    (sum, p) =>
      sum + Number(p.budget || 0),
    0
  );

  const getProgress = (projectStatus) => {
    if (projectStatus === "completed") return 100;
    if (projectStatus === "cancelled") return 0;
    if (projectStatus === "active") return 50;
    return 25;
  };

  const getStatusStyle = (projectStatus) => {
    if (projectStatus === "completed") {
      return {
        background: "#e8fff1",
        color: "#119447",
        dot: "#16a34a",
      };
    }

    if (projectStatus === "cancelled") {
      return {
        background: "#fff0f1",
        color: "#d9303e",
        dot: "#dc3545",
      };
    }

    return {
      background: "#fff6df",
      color: "#a66a00",
      dot: "#f59e0b",
    };
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
        }}
      >
        <div className="mp2-pods">
          <span className="mp2-pod" style={{ background: "#7c6eff" }} />
          <span className="mp2-pod" style={{ background: "#a04bf0" }} />
          <span className="mp2-pod" style={{ background: "#5a4bcf" }} />
        </div>

        <div className="mp2-orb">
          <span className="mp2-dot" style={{ background: "#7c6eff" }} />
          <span className="mp2-dot" style={{ background: "#a04bf0" }} />
          <span className="mp2-dot" style={{ background: "#5a4bcf" }} />
        </div>

        <h5 className="mt-4 fw-bold">
          Loading your projects...
        </h5>

        <p className="text-muted small">
          Preparing your project dashboard
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
      }}
    >
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="dashboard-sidebar">
        <div className="brand">
          <div className="brand-icon">
            S
          </div>

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

          <button
            className="nav-item"
            onClick={() =>
              navigate("/jobs")
            }
          >
            <span>▣</span>
            {isClient
              ? "My Jobs"
              : "Find Jobs"}
          </button>

          <button className="nav-item active">
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
            {isClient
              ? "Proposals"
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
              navigate("/settings")
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

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="dashboard-main">
        <div
          className="dashboard-body"
          style={{
            padding: "32px",
          }}
        >
          {/* ================= HEADER ================= */}

          <div className="mb-4 mp-header">
              <div>
                <div
                  className="text-uppercase fw-bold mb-2"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "1.5px",
                    color: "#817ca0",
                  }}
                >
                  Project Workspace
                </div>

                <h1
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "32px",
                    color: "#24212d",
                  }}
                >
                  My Projects
                </h1>

                <p className="text-muted mb-0">
                  Track your projects, monitor
                  progress and manage payments.
                </p>
              </div>

              <button
                className="btn rounded-pill px-4 fw-bold"
                style={{
                  background: "#fff",
                  border:
                    "1px solid #e5e3ec",
                  color: "#4c4857",
                }}
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                ← Dashboard
              </button>
          </div>

          {/* =====================================================
              STATS
          ====================================================== */}

          <div className="row g-3 mb-4">
            {/* TOTAL */}

            <div className="col-sm-6 col-xl-3">
              <div
                className="h-100 mp-stat"
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow:
                    "0 7px 25px rgba(31,38,135,0.06)",
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div
                      className="text-muted fw-semibold"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      TOTAL PROJECTS
                    </div>

                    <div
                      className="fw-bold mt-2"
                      style={{
                        fontSize: "28px",
                      }}
                    >
                      {projects.length}
                    </div>

                    <small className="text-muted">
                      All projects
                    </small>
                  </div>

                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "14px",
                      background: "#f0edff",
                      color: "#5a4bcf",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    📁
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVE */}

            <div className="col-sm-6 col-xl-3">
              <div
                className="h-100 mp-stat"
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow:
                    "0 7px 25px rgba(31,38,135,0.06)",
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div
                      className="text-muted fw-semibold"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      ACTIVE
                    </div>

                    <div
                      className="fw-bold mt-2"
                      style={{
                        fontSize: "28px",
                        color: "#a66a00",
                      }}
                    >
                      {activeCount}
                    </div>

                    <small className="text-muted">
                      In progress
                    </small>
                  </div>

                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "14px",
                      background: "#fff5dc",
                      color: "#d28a00",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    ⚡
                  </div>
                </div>
              </div>
            </div>

            {/* COMPLETED */}

            <div className="col-sm-6 col-xl-3">
              <div
                className="h-100 mp-stat"
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow:
                    "0 7px 25px rgba(31,38,135,0.06)",
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div
                      className="text-muted fw-semibold"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      COMPLETED
                    </div>

                    <div
                      className="fw-bold mt-2"
                      style={{
                        fontSize: "28px",
                        color: "#119447",
                      }}
                    >
                      {completedCount}
                    </div>

                    <small className="text-muted">
                      Successfully finished
                    </small>
                  </div>

                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "14px",
                      background: "#e8fff1",
                      color: "#119447",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    ✓
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT */}

            <div className="col-sm-6 col-xl-3">
              <div
                className="h-100 mp-stat"
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow:
                    "0 7px 25px rgba(31,38,135,0.06)",
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div
                      className="text-muted fw-semibold"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      PAYMENT
                    </div>

                    <div
                      className="fw-bold mt-2"
                      style={{
                        fontSize: "28px",
                        color:
                          pendingPaymentCount > 0
                            ? "#d97706"
                            : "#119447",
                      }}
                    >
                      {isClient || isAdmin
                        ? pendingPaymentCount
                        : paidCount}
                    </div>

                    <small className="text-muted">
                      {isClient || isAdmin
                        ? "Pending payments"
                        : "Paid projects"}
                    </small>
                  </div>

                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "14px",
                      background:
                        "#eef9ff",
                      color: "#1684b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    💳
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              OVERVIEW BANNER
          ====================================================== */}

          <div
            className="mb-4 mp-banner"
            style={{
              borderRadius: "22px",
              padding: "25px 28px",
              color: "#fff",
              boxShadow:
                "0 12px 35px rgba(90,75,207,0.16)",
            }}
          >
            <div className="row align-items-center g-3">
              <div className="col-lg-8">
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "1.3px",
                    opacity: 0.75,
                  }}
                >
                  PROJECT OVERVIEW
                </div>

                <h4 className="fw-bold mt-2 mb-1">
                  Keep your work moving forward 🚀
                </h4>

                <p
                  className="mb-0"
                  style={{
                    opacity: 0.82,
                    fontSize: "14px",
                  }}
                >
                  You currently have{" "}
                  <strong>{activeCount}</strong>{" "}
                  active project
                  {activeCount !== 1
                    ? "s"
                    : ""}{" "}
                  and{" "}
                  <strong>
                    {completedCount}
                  </strong>{" "}
                  completed.
                </p>
              </div>

              <div className="col-lg-4">
                <div className="d-flex justify-content-lg-end">
                  <div
                    style={{
                      background:
                        "rgba(255,255,255,0.13)",
                      borderRadius: "16px",
                      padding:
                        "15px 20px",
                      minWidth: "190px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        opacity: 0.7,
                      }}
                    >
                      TOTAL PROJECT VALUE
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        fontSize: "23px",
                      }}
                    >
                      ₹
                      {totalBudget.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              FILTER TOOLBAR
          ====================================================== */}

          <div
            className="mb-4 mp-filters"
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "18px",
              boxShadow:
                "0 7px 25px rgba(31,38,135,0.06)",
            }}
          >
            <div className="row g-3 align-items-center">
              <div className="col-lg-5">
                <div
                  className="position-relative"
                >
                  <span
                    className="position-absolute"
                    style={{
                      left: "16px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#9692a0",
                      fontSize: "18px",
                    }}
                  >
                    ⌕
                  </span>

                  <input
                    className="form-control"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search projects..."
                    style={{
                      paddingLeft: "45px",
                      height: "46px",
                      borderRadius: "13px",
                      background:
                        "#f8f8fc",
                      border:
                        "1px solid #ecebf2",
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-7">
                <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
                  {[
                    "All",
                    "active",
                    "completed",
                    "cancelled",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() =>
                        setStatus(item)
                      }
                      className={`btn rounded-pill px-4 mp-chip${
                        status === item
                          ? " active"
                          : ""
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RESULTS HEADER
          ====================================================== */}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">
                Your Projects
              </h5>

              <small className="text-muted">
                Showing{" "}
                <strong>
                  {filteredProjects.length}
                </strong>{" "}
                of {projects.length} projects
              </small>
            </div>

            {cancelledCount > 0 && (
              <span className="text-muted small">
                {cancelledCount} cancelled
              </span>
            )}
          </div>

          {/* =====================================================
              EMPTY STATE
          ====================================================== */}

          {filteredProjects.length === 0 ? (
            <div
              className="text-center"
              style={{
                background: "#fff",
                borderRadius: "22px",
                padding: "65px 25px",
                boxShadow:
                  "0 8px 30px rgba(31,38,135,0.06)",
              }}
            >
              <div
                style={{
                  width: "75px",
                  height: "75px",
                  borderRadius: "22px",
                  background: "#f0edff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  fontSize: "34px",
                }}
              >
                📂
              </div>

              <h4 className="fw-bold mt-4">
                No projects found
              </h4>

              <p className="text-muted">
                {search || status !== "All"
                  ? "Try changing your search or filters."
                  : "Your projects will appear here."}
              </p>

              {(search ||
                status !== "All") && (
                <button
                  className="btn rounded-pill px-4"
                  style={{
                    background: "#5a4bcf",
                    color: "#fff",
                  }}
                  onClick={() => {
                    setSearch("");
                    setStatus("All");
                  }}
                >
                  Clear Filters
                </button>
              )}

              {!search &&
                status === "All" && (
                  <button
                    className="btn rounded-pill px-4"
                    style={{
                      background:
                        "#5a4bcf",
                      color: "#fff",
                    }}
                    onClick={() =>
                      navigate("/jobs")
                    }
                  >
                    Explore Jobs →
                  </button>
                )}
            </div>
          ) : (
            /* =====================================================
               PROJECT CARDS
            ====================================================== */

            <div className="row g-4 mp-project-grid">
              {filteredProjects.map(
                (project) => {
                  const title =
                    project.job?.title ||
                    project.title ||
                    "Untitled Project";

                  const progress =
                    getProgress(
                      project.status
                    );

                  const statusStyle =
                    getStatusStyle(
                      project.status
                    );

                  return (
                    <div
                      key={project.id}
                      className="col-md-6 col-xl-4 mp-project-col"
                    >
                      <div className="h-100 mp-project-card">
                        {/* CARD TOP */}

                        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                          <div
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius:
                                "16px",
                              background:
                                "#f0edff",
                              color:
                                "#5a4bcf",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontWeight:
                                "800",
                              fontSize:
                                "20px",
                              flexShrink: 0,
                            }}
                          >
                            {title
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="d-flex flex-column align-items-end gap-2">
                            <span
                              className="badge rounded-pill px-3 py-2"
                              style={{
                                background:
                                  statusStyle.background,
                                color:
                                  statusStyle.color,
                                textTransform:
                                  "capitalize",
                                fontSize:
                                  "11px",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    statusStyle.dot,
                                }}
                              >
                                ●
                              </span>{" "}
                              {
                                project.status
                              }
                            </span>

                            <span
                              className="badge rounded-pill px-3 py-2"
                              style={{
                                background:
                                  project.payment_status ===
                                  "paid"
                                    ? "#e8fff1"
                                    : "#f5f5f8",
                                color:
                                  project.payment_status ===
                                  "paid"
                                    ? "#119447"
                                    : "#686572",
                                fontSize:
                                  "10px",
                              }}
                            >
                              {project.payment_status ===
                              "paid"
                                ? "✓ Paid"
                                : "○ Payment Pending"}
                            </span>
                          </div>
                        </div>

                        {/* TITLE */}

                        <h5
                          className="fw-bold mb-2 mp-project-title"
                          style={{
                            minHeight:
                              "48px",
                            lineHeight:
                              "1.35",
                          }}
                        >
                          {title}
                        </h5>

                        <div
                          className="text-muted small mb-3"
                        >
                          Project #{project.id}
                        </div>

                        {/* PROGRESS */}

                        <div className="mb-4">
                          <div className="d-flex justify-content-between mb-2">
                            <small className="fw-semibold">
                              Project Progress
                            </small>

                            <small
                              className="fw-bold"
                              style={{
                                color:
                                  "#5a4bcf",
                              }}
                            >
                              {progress}%
                            </small>
                          </div>

                          <div
                            style={{
                              height: "7px",
                              background:
                                "#eeeef4",
                              borderRadius:
                                "20px",
                              overflow:
                                "hidden",
                            }}
                          >
                            <div
                              className="mp-progress-fill"
                              style={{
                                width: `${progress}%`,
                                height: "100%",
                                borderRadius:
                                  "20px",
                                transition:
                                  "width 0.3s ease",
                              }}
                            />
                          </div>
                        </div>

                        {/* PROJECT INFO */}

                        <div
                          style={{
                            background:
                              "#f8f8fc",
                            borderRadius:
                              "16px",
                            padding:
                              "14px",
                            marginBottom:
                              "15px",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small">
                              Budget
                            </span>

                            <strong
                              style={{
                                color:
                                  "#119447",
                                fontSize:
                                  "17px",
                              }}
                            >
                              ₹
                              {Number(
                                project.budget ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small">
                              Client
                            </span>

                            <span
                              className="fw-semibold small text-truncate ms-3"
                              style={{
                                maxWidth:
                                  "150px",
                              }}
                            >
                              {project.client
                                ?.name ||
                                "N/A"}
                            </span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">
                              Freelancer
                            </span>

                            <span
                              className="fw-semibold small text-truncate ms-3"
                              style={{
                                maxWidth:
                                  "150px",
                              }}
                            >
                              {project.freelancer
                                ?.name ||
                                "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* DATES */}

                        <div
                          className="d-flex justify-content-between mb-4"
                          style={{
                            fontSize: "11px",
                            color: "#898592",
                          }}
                        >
                          <div>
                            <div
                              className="fw-bold mb-1"
                              style={{
                                color:
                                  "#66626f",
                              }}
                            >
                              START DATE
                            </div>

                            {project.start_date ||
                              "-"}
                          </div>

                          <div className="text-end">
                            <div
                              className="fw-bold mb-1"
                              style={{
                                color:
                                  "#66626f",
                              }}
                            >
                              END DATE
                            </div>

                            {project.end_date ||
                              "-"}
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="mt-auto">
                          <button
                            className="btn w-100 fw-bold rounded-pill mb-2 mp-btn-view"
                            style={{
                              background:
                                "#5a4bcf",
                              color: "#fff",
                              border: "none",
                              padding:
                                "11px",
                            }}
                            onClick={() =>
                              navigate(
                                `/projects/${project.id}`
                              )
                            }
                          >
                            View Project Details →
                          </button>

                          {/* ACTIVE ACTIONS */}

                          {project.status ===
                            "active" && (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm w-50 rounded-pill fw-bold mp-btn-complete"
                                style={{
                                  background:
                                    "#e8fff1",
                                  color:
                                    "#119447",
                                  border:
                                    "1px solid #c7efd7",
                                }}
                                onClick={() =>
                                  updateStatus(
                                    project.id,
                                    "completed"
                                  )
                                }
                                disabled={
                                  updating ===
                                  project.id
                                }
                              >
                                {updating ===
                                project.id ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  "✓ Complete"
                                )}
                              </button>

                              <button
                                className="btn btn-sm w-50 rounded-pill fw-bold mp-btn-cancel"
                                style={{
                                  background:
                                    "#fff0f1",
                                  color:
                                    "#d9303e",
                                  border:
                                    "1px solid #ffd0d4",
                                }}
                                onClick={() =>
                                  updateStatus(
                                    project.id,
                                    "cancelled"
                                  )
                                }
                                disabled={
                                  updating ===
                                  project.id
                                }
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {/* PAY NOW */}

                          {(isClient ||
                            isAdmin) &&
                            project.status ===
                              "completed" &&
                            project.payment_status !==
                              "paid" && (
                              <button
                                className="btn w-100 rounded-pill fw-bold mt-2 mp-btn-pay"
                                style={{
                                  background:
                                    "#16a34a",
                                  color:
                                    "#fff",
                                  border: "none",
                                  padding:
                                    "11px",
                                }}
                                onClick={() =>
                                  handlePay(
                                    project.id
                                  )
                                }
                                disabled={
                                  paying ===
                                  project.id
                                }
                              >
                                {paying ===
                                project.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    💳 Pay Now ₹
                                    {Number(
                                      project.budget ||
                                        0
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </>
                                )}
                              </button>
                            )}

                          {/* PAID */}

                          {project.payment_status ===
                            "paid" && (
                            <div
                              className="text-center mt-2 rounded-pill fw-bold"
                              style={{
                                background:
                                  "#e8fff1",
                                color:
                                  "#119447",
                                padding:
                                  "10px",
                                fontSize:
                                  "12px",
                              }}
                            >
                              ✓ Payment Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyProjects;