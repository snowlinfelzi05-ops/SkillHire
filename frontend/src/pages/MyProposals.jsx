import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { toast } from "../utils/toast";
import "./MyProposals.css";

const MyProposals = () => {
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hiring, setHiring] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = (user?.role || user?.user_type || "").toLowerCase();

  const isClient = userRole === "client";
  const isAdmin = userRole === "admin";
  const isClientView = isClient || isAdmin;

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const token = localStorage.getItem("token");

        const url = isClientView
          ? `${API_URL}/proposals/received`
          : `${API_URL}/proposals`;

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch proposals");
        }

        setProposals(data.proposals || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [isClientView]);

  // ACCEPT & HIRE - Project Create
  const handleAcceptAndHire = async (id) => {
    if (
      !window.confirm(
        "Accept & Hire this freelancer? Project will be created! 🚀"
      )
    ) {
      return;
    }

    try {
      setHiring(id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/proposals/${id}/accept`,
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
        toast("✅ Hired Successfully! Project Created!");

        setProposals(
          proposals.map((p) =>
            p.id === id ? { ...p, status: "accepted" } : p
          )
        );

        navigate("/my-projects");
      } else {
        // Fallback: old status API
        const res2 = await fetch(
          `${API_URL}/proposals/${id}/status`,
          {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "accepted" }),
          }
        );

        const data2 = await res2.json();

        if (res2.ok) {
          toast("✅ Hired! Project Created!");
          navigate("/my-projects");
        } else {
          toast(data.message || data2.message || "Failed to hire");
        }
      }
    } catch {
      toast("Error hiring");
    } finally {
      setHiring(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this proposal?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/proposals/${id}/status`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "rejected" }),
        }
      );

      if (res.ok) {
        setProposals(
          proposals.map((p) =>
            p.id === id ? { ...p, status: "rejected" } : p
          )
        );
      }
    } catch {
      toast("Error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="mp-loader-glyph">
          <span className="mp-loader-bar" />
          <span className="mp-loader-core">✉</span>
        </div>

        <h5 className="mt-3 fw-bold mp-loader-text">Loading proposals...</h5>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>

        <Link
          to="/dashboard"
          className="btn btn-primary mt-3"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

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
            onClick={() => navigate("/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/jobs")}
          >
            <span>▣</span>
            {isClient
              ? "My Jobs"
              : isAdmin
              ? "All Jobs"
              : "Find Jobs"}
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/my-projects")}
          >
            <span>▤</span>
            My Projects
          </button>

          <button className="nav-item active">
            <span>✉</span>
            {isClientView
              ? "Received Proposals"
              : "My Proposals"}
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/profile")}
          >
            <span>◯</span>
            Profile
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => navigate("/settings")}
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
          {/* HEADER */}
          <div
            className="d-flex justify-content-between align-items-center mb-4 mp-header"
            style={{
              background: "#ffffff",
              padding: "24px 28px",
              borderRadius: "20px",
              boxShadow: "0 8px 30px rgba(31, 38, 135, 0.06)",
            }}
          >
            <div>
              <div
                className="text-uppercase fw-bold mb-1"
                style={{
                  fontSize: "12px",
                  letterSpacing: "1.5px",
                  color: "#6c5ce7",
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
                {isClientView
                  ? "Proposals Received"
                  : "My Proposals"}
              </h1>

              <p className="text-muted mb-0">
                {isClientView
                  ? "Review and compare proposals from talented freelancers."
                  : "Track and manage your submitted proposals."}
              </p>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <div
                style={{
                  background: "#f0edff",
                  color: "#5a4bcf",
                  borderRadius: "50px",
                  padding: "10px 18px",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                {proposals.length}{" "}
                {proposals.length === 1
                  ? "Proposal"
                  : "Proposals"}
              </div>

              <button
                className="btn btn-outline-dark rounded-pill px-4"
                onClick={() => navigate("/dashboard")}
              >
                ← Dashboard
              </button>
            </div>
          </div>

          {/* INFO BAR */}
          {isClientView && proposals.length > 0 && (
            <div
              className="mb-4 mp-tip"
              style={{
                color: "#fff",
                borderRadius: "18px",
                padding: "18px 22px",
                boxShadow:
                  "0 10px 30px rgba(108, 92, 231, 0.18)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "21px",
                  }}
                >
                  💡
                </div>

                <div>
                  <div
                    className="fw-bold"
                    style={{ fontSize: "15px" }}
                  >
                    Compare proposals before hiring
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.85,
                    }}
                  >
                    Review budget, cover letter and proposal
                    status to choose the right freelancer.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {proposals.length === 0 ? (
            <div
              className="text-center"
              style={{
                background: "#fff",
                borderRadius: "22px",
                padding: "70px 30px",
                boxShadow:
                  "0 8px 30px rgba(31, 38, 135, 0.06)",
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
                📭
              </div>

              <h4 className="mt-4 fw-bold">
                {isClientView
                  ? "No proposals received yet"
                  : "No proposals submitted yet"}
              </h4>

              <p className="text-muted mb-0">
                {isClientView
                  ? "When freelancers apply to your jobs, their proposals will appear here."
                  : "Your submitted proposals will appear here."}
              </p>
            </div>
          ) : (
            /* ================= PROPOSAL CARDS ================= */
            <div className="row g-4 mp-prop-grid">
              {proposals.map((proposal) => {
                const isAccepted =
                  proposal.status === "accepted";

                const isRejected =
                  proposal.status === "rejected";

                const isPending =
                  proposal.status === "pending";

                return (
                  <div
                    key={proposal.id}
                    className="col-md-6 col-xl-4 mp-prop-col"
                  >
                    <div
                      className="h-100 mp-proposal-card"
                    >
                      {/* STATUS TOP LINE */}
                      <div
                        style={{
                          height: "5px",
                          background: isAccepted
                            ? "#00c853"
                            : isRejected
                            ? "#ff1744"
                            : "#ffab00",
                        }}
                      ></div>

                      <div
                        style={{
                          padding: "22px",
                        }}
                      >
                        {/* JOB + STATUS */}
                        <div
                          className="d-flex justify-content-between align-items-start gap-2 mb-3"
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              className="text-uppercase fw-bold mb-1"
                              style={{
                                color: "#8a8794",
                                fontSize: "10px",
                                letterSpacing: "1px",
                              }}
                            >
                              Job Proposal
                            </div>

                            <h5
                              className="fw-bold mb-0"
                              style={{
                                fontSize: "18px",
                                color: "#171321",
                                lineHeight: "1.35",
                              }}
                            >
                              {proposal.job?.title ||
                                "Job Deleted"}
                            </h5>
                          </div>

                          <span
                            className={`badge rounded-pill px-3 py-2 ${
                              isAccepted
                                ? "bg-success"
                                : isRejected
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                            style={{
                              fontSize: "11px",
                              textTransform: "capitalize",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {proposal.status}
                          </span>
                        </div>

                        {/* FREELANCER */}
                        {isClientView && (
                          <div
                            className="d-flex align-items-center gap-3 mb-4"
                            style={{
                              background: "#f7f6ff",
                              padding: "12px 14px",
                              borderRadius: "14px",
                            }}
                          >
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "13px",
                                background:
                                  "linear-gradient(135deg, #6c5ce7, #8e7dff)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "700",
                                fontSize: "17px",
                              }}
                            >
                              {(proposal.freelancer?.name ||
                                proposal.user?.name ||
                                "F")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#8a8794",
                                  marginBottom: "2px",
                                }}
                              >
                                FREELANCER
                              </div>

                              <div
                                className="fw-bold"
                                style={{
                                  color: "#3f347d",
                                  fontSize: "14px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {proposal.freelancer?.name ||
                                  proposal.user?.name ||
                                  "Freelancer"}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* BUDGET COMPARISON */}
                        <div
                          className="row g-2 mb-3"
                        >
                          <div className="col-6">
                            <div
                              style={{
                                background: "#f4fbf7",
                                border: "1px solid #e1f3e8",
                                borderRadius: "14px",
                                padding: "13px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#7b827e",
                                  fontWeight: "600",
                                  textTransform:
                                    "uppercase",
                                }}
                              >
                                Proposed
                              </div>

                              <div
                                className="fw-bold mt-1"
                                style={{
                                  color: "#00a844",
                                  fontSize: "18px",
                                }}
                              >
                                ₹
                                {proposal.proposed_budget}
                              </div>
                            </div>
                          </div>

                          <div className="col-6">
                            <div
                              style={{
                                background: "#f7f7fa",
                                border: "1px solid #ececf1",
                                borderRadius: "14px",
                                padding: "13px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#7b7b85",
                                  fontWeight: "600",
                                  textTransform:
                                    "uppercase",
                                }}
                              >
                                Job Budget
                              </div>

                              <div
                                className="fw-bold mt-1"
                                style={{
                                  color: "#34313d",
                                  fontSize: "18px",
                                }}
                              >
                                ₹{proposal.job?.budget}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* COVER LETTER */}
                        <div className="mb-3">
                          <div
                            className="d-flex align-items-center gap-2 mb-2"
                            style={{
                              color: "#37333f",
                              fontSize: "13px",
                              fontWeight: "700",
                            }}
                          >
                            <span>📝</span>
                            Cover Letter
                          </div>

                          <div
                            style={{
                              background: "#fafafd",
                              border: "1px solid #eeeeF4",
                              borderRadius: "14px",
                              padding: "13px",
                              minHeight: "90px",
                            }}
                          >
                            <p
                              className="small text-muted mb-0"
                              style={{
                                lineHeight: "1.6",
                                display:
                                  "-webkit-box",
                                WebkitLineClamp: 4,
                                WebkitBoxOrient:
                                  "vertical",
                                overflow: "hidden",
                              }}
                            >
                              "
                              {proposal.cover_letter ||
                                "No cover letter provided."}
                              "
                            </p>
                          </div>
                        </div>

                        {/* PROPOSAL ID */}
                        <div
                          className="d-flex justify-content-between align-items-center mb-3"
                          style={{
                            fontSize: "11px",
                            color: "#9a97a3",
                          }}
                        >
                          <span>
                            Proposal ID #{proposal.id}
                          </span>

                          {proposal.job_id && (
                            <span>
                              Job #{proposal.job_id}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div
                        style={{
                          padding: "0 22px 22px",
                        }}
                      >
                        <Link
                          to={`/jobs/${proposal.job_id}`}
                          className="btn btn-outline-primary rounded-pill fw-bold w-100 py-2 mb-2 mp-btn-viewjob"
                          style={{
                            borderColor: "#6c5ce7",
                            color: "#5a4bcf",
                          }}
                        >
                          View Job →
                        </Link>

                        {isClientView && isPending && (
                          <>
                            <button
                              className="btn rounded-pill fw-bold w-100 py-2 mb-2 mp-btn-accept"
                              onClick={() =>
                                handleAcceptAndHire(
                                  proposal.id
                                )
                              }
                              disabled={
                                hiring === proposal.id
                              }
                            >
                              {hiring === proposal.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <>
                                  ✓ Accept & Hire — ₹
                                  {proposal.proposed_budget}
                                </>
                              )}
                            </button>

                            <button
                              className="btn btn-outline-danger rounded-pill fw-bold w-100 py-2 mp-btn-reject"
                              onClick={() =>
                                handleReject(proposal.id)
                              }
                            >
                              ✕ Reject Proposal
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <div
                            className="text-center fw-bold"
                            style={{
                              background: "#eaf9f0",
                              color: "#159447",
                              borderRadius: "50px",
                              padding: "10px",
                              fontSize: "13px",
                            }}
                          >
                            ✅ Hired — Project Created
                          </div>
                        )}

                        {isRejected && (
                          <div
                            className="text-center fw-bold"
                            style={{
                              background: "#fff0f1",
                              color: "#d9303e",
                              borderRadius: "50px",
                              padding: "10px",
                              fontSize: "13px",
                            }}
                          >
                            ❌ Proposal Rejected
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

export default MyProposals;