import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { toast } from "../utils/toast";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [proposals, setProposals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Accept: "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_URL}/jobs/${id}`,
          { headers }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load job");
        }

        if (!data.job) {
          throw new Error("Job not found");
        }

        setJob(data.job);

        const userStr = localStorage.getItem("user");

        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);

          if (String(user.id) === String(data.job.user_id)) {
            const propRes = await fetch(
              `${API_URL}/jobs/${id}/proposals`,
              { headers }
            );

            const propData = await propRes.json();

            if (propRes.ok) {
              setProposals(propData.proposals || propData || []);
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ================= SUBMIT PROPOSAL =================

  const handleSubmitProposal = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast("Please login");
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(
        `${API_URL}/proposals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_id: Number(id),
            cover_letter: coverLetter,
            proposed_budget: Number(proposedBudget),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to submit proposal"
        );
      }

      toast("Proposal submitted successfully!");

      setCoverLetter("");
      setProposedBudget("");

      navigate("/my-proposals");
    } catch (err) {
      toast(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ================= ACCEPT PROPOSAL =================

  const handleAccept = async (proposalId) => {
    if (
      !window.confirm(
        "Are you sure? This will close the job and reject others!"
      )
    ) {
      return;
    }

    setAcceptingId(proposalId);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/proposals/${proposalId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "accepted",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to accept");
      }

      toast(
        "Freelancer hired successfully! Project created!"
      );

      setProposals((currentProposals) =>
        currentProposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                status: "accepted",
              }
            : {
                ...p,
                status:
                  p.status === "pending"
                    ? "rejected"
                    : p.status,
              }
        )
      );

      setJob((currentJob) => ({
        ...currentJob,
        status: "closed",
      }));
    } catch (err) {
      toast("Error: " + err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div
        className="jd-loader"
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
        }}
      >
        <div className="jd-sk-hero">
          <div className="jd-sk-hero-inner">
            <div className="jd-sk" style={{ width: 180, height: 14 }} />
            <div className="jd-sk" style={{ width: 300, height: 28 }} />
            <div className="jd-sk" style={{ width: 220, height: 14 }} />
          </div>
        </div>
        <div className="jd-sk-body">
          <div className="jd-sk-panel">
            <div className="jd-sk" style={{ width: "100%", height: 14 }} />
            <div className="jd-sk" style={{ width: "90%", height: 12 }} />
            <div className="jd-sk" style={{ width: "95%", height: 12 }} />
            <div className="jd-sk" style={{ width: "60%", height: 12 }} />
          </div>
          <div className="jd-sk-side">
            <div className="jd-sk" style={{ width: 160, height: 14 }} />
            <div className="jd-sk" style={{ width: "80%", height: 12 }} />
            <div className="jd-sk" style={{ width: "70%", height: 40 }} />
          </div>
        </div>
      </div>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
        }}
      >
        <div
          className="text-center"
          style={{
            background: "#fff",
            borderRadius: "22px",
            padding: "50px",
            maxWidth: "500px",
            width: "90%",
            boxShadow:
              "0 10px 35px rgba(31,38,135,0.07)",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "22px",
              background: "#fff0f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontSize: "32px",
            }}
          >
            ⚠️
          </div>

          <h4 className="fw-bold mt-4">
            Unable to load job
          </h4>

          <p className="text-muted">{error}</p>

          <Link
            to="/jobs"
            className="btn rounded-pill px-4 fw-bold"
            style={{
              background: "#5a4bcf",
              color: "#fff",
              border: "none",
            }}
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  // ================= DATA =================

  const skillsArray = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === "string"
    ? job.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const isOwner =
    currentUser &&
    job &&
    String(currentUser.id) === String(job.user_id);

  const isOpen =
    String(job.status || "open").toLowerCase() === "open";

  const acceptedProposal = proposals.find(
    (p) => p.status === "accepted"
  );

  const pendingProposals = proposals.filter(
    (p) => p.status === "pending"
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        paddingBottom: "50px",
      }}
    >
      <div className="container py-4">

        {/* TOP BAR */}

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <button
            className="btn btn-light rounded-pill px-4 fw-semibold"
            style={{
              border: "1px solid #e4e3eb",
            }}
            onClick={() => navigate("/jobs")}
          >
            ← Back to Jobs
          </button>

          <div
            style={{
              fontSize: "13px",
              color: "#85818f",
              fontWeight: "600",
            }}
          >
            SkillHire / Job Details / #{job.id}
          </div>
        </div>

        <div className="row g-4">

          {/* ================= LEFT SIDE ================= */}

          <div className="col-lg-8">

            {/* JOB HERO */}

            <div
              className="mb-4 jd-hero"
              style={{
                borderRadius: "24px",
                padding: "30px",
                color: "#fff",
                boxShadow:
                  "0 15px 40px rgba(90,75,207,0.18)",
              }}
            >
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap jd-hero-inner">

                <div className="d-flex gap-3">
                  <div
                    style={{
                      width: "62px",
                      height: "62px",
                      borderRadius: "18px",
                      background:
                        "rgba(255,255,255,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: "800",
                      flexShrink: 0,
                    }}
                  >
                    {String(job.title || "J")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        opacity: 0.75,
                        fontWeight: "700",
                        marginBottom: "5px",
                      }}
                    >
                      Freelance Opportunity
                    </div>

                    <h1
                      className="fw-bold mb-2"
                      style={{
                        fontSize: "30px",
                        lineHeight: "1.2",
                      }}
                    >
                      {job.title}
                    </h1>

                    <div className="d-flex gap-2 flex-wrap">
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: isOpen
                            ? "#00c853"
                            : "#55515f",
                          color: "#fff",
                        }}
                      >
                        ● {job.status || "open"}
                      </span>

                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background:
                            "rgba(255,255,255,0.16)",
                          color: "#fff",
                        }}
                      >
                        {job.category || "General"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.75,
                      textTransform: "uppercase",
                      fontWeight: "700",
                    }}
                  >
                    Budget
                  </div>

                  <div
                    className="fw-bold"
                    style={{
                      fontSize: "25px",
                    }}
                  >
                    ₹{job.budget}
                  </div>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div
              className="mb-4 jd-card"
              style={{
                background: "#fff",
                borderRadius: "22px",
                padding: "28px",
                boxShadow:
                  "0 8px 30px rgba(31,38,135,0.06)",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    background: "#f0edff",
                    color: "#6c5ce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  📄
                </div>

                <h5 className="fw-bold mb-0">
                  About this project
                </h5>
              </div>

              <p
                className="mb-0"
                style={{
                  color: "#62606b",
                  lineHeight: "1.8",
                  whiteSpace: "pre-line",
                }}
              >
                {job.description ||
                  "No description provided."}
              </p>
            </div>

            {/* PROJECT DETAILS */}

            <div
              className="mb-4 jd-card"
              style={{
                background: "#fff",
                borderRadius: "22px",
                padding: "28px",
                boxShadow:
                  "0 8px 30px rgba(31,38,135,0.06)",
              }}
            >
              <h5 className="fw-bold mb-4">
                Project Details
              </h5>

              <div className="row g-3">

                <div className="col-sm-4">
                  <div
                    style={{
                      background: "#fafafd",
                      border: "1px solid #eeeef4",
                      borderRadius: "16px",
                      padding: "17px",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94919d",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Budget
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        color: "#5a4bcf",
                        fontSize: "20px",
                      }}
                    >
                      ₹{job.budget}
                    </div>
                  </div>
                </div>

                <div className="col-sm-4">
                  <div
                    style={{
                      background: "#fafafd",
                      border: "1px solid #eeeef4",
                      borderRadius: "16px",
                      padding: "17px",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94919d",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Category
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        fontSize: "16px",
                      }}
                    >
                      {job.category || "General"}
                    </div>
                  </div>
                </div>

                <div className="col-sm-4">
                  <div
                    style={{
                      background: "#fafafd",
                      border: "1px solid #eeeef4",
                      borderRadius: "16px",
                      padding: "17px",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94919d",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Location
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        fontSize: "16px",
                      }}
                    >
                      📍 {job.location || "Remote"}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SKILLS */}

            <div
              className="mb-4 jd-card"
              style={{
                background: "#fff",
                borderRadius: "22px",
                padding: "28px",
                boxShadow:
                  "0 8px 30px rgba(31,38,135,0.06)",
              }}
            >
              <h5 className="fw-bold mb-3">
                Required Skills
              </h5>

              {skillsArray.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {skillsArray.map((skill, index) => (
                    <span
                      key={index}
                      className="badge rounded-pill px-4 py-2 jd-skill"
                      style={{
                        background: "#f0edff",
                        color: "#5a4bcf",
                        border: "1px solid #e1ddff",
                        fontSize: "13px",
                      }}
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No specific skills mentioned.
                </p>
              )}
            </div>

            {/* CLIENT */}

            <div
              style={{
                background:
                  "linear-gradient(135deg,#ffffff,#faf9ff)",
                borderRadius: "22px",
                padding: "25px",
                boxShadow:
                  "0 8px 30px rgba(31,38,135,0.06)",
                border: "1px solid #eceaf7",
              }}
              className="jd-card"
            >
              <div className="d-flex align-items-center gap-3 flex-wrap">

                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "18px",
                    background:
                      "linear-gradient(135deg,#6c5ce7,#8e7dff)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "23px",
                    fontWeight: "800",
                  }}
                >
                  {job.user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "C"}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#8d8996",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Posted by
                  </div>

                  <h6 className="fw-bold mb-1">
                    {job.user?.name || "Client"}
                  </h6>

                  <small className="text-muted">
                    {job.user?.email || "Client account"}
                  </small>
                </div>

                <div className="ms-auto">
                  <span
                    className="badge rounded-pill px-3 py-2"
                    style={{
                      background: "#eafff2",
                      color: "#00a651",
                      border: "1px solid #c5efd6",
                    }}
                  >
                    ✓ Verified Client
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}

          <div className="col-lg-4">
            <div
              className="sticky-top"
              style={{ top: "20px" }}
            >

              {/* CLIENT PROPOSALS */}

              {isOwner ? (
                <div
                  className="jd-sidecard"
                  style={{
                    background: "#fff",
                    borderRadius: "22px",
                    padding: "24px",
                    boxShadow:
                      "0 10px 35px rgba(31,38,135,0.07)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="fw-bold mb-0">
                      Received Proposals
                    </h5>

                    <span
                      className="badge rounded-pill"
                      style={{
                        background: "#f0edff",
                        color: "#5a4bcf",
                      }}
                    >
                      {proposals.length}
                    </span>
                  </div>

                  <p className="text-muted small mb-4">
                    Compare freelancers and choose
                    the best fit.
                  </p>

                  {/* SUMMARY */}

                  <div className="row g-2 mb-4">

                    <div className="col-6">
                      <div
                        className="text-center"
                        style={{
                          background: "#fff8e6",
                          borderRadius: "14px",
                          padding: "12px",
                        }}
                      >
                        <div
                          className="fw-bold"
                          style={{
                            fontSize: "20px",
                            color: "#e49b00",
                          }}
                        >
                          {pendingProposals.length}
                        </div>

                        <small className="text-muted">
                          Pending
                        </small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className="text-center"
                        style={{
                          background: "#eafff2",
                          borderRadius: "14px",
                          padding: "12px",
                        }}
                      >
                        <div
                          className="fw-bold"
                          style={{
                            fontSize: "20px",
                            color: "#00a651",
                          }}
                        >
                          {acceptedProposal ? 1 : 0}
                        </div>

                        <small className="text-muted">
                          Hired
                        </small>
                      </div>
                    </div>

                  </div>

                  {/* PROPOSALS */}

                  {proposals.length === 0 ? (
                    <div
                      className="text-center"
                      style={{
                        padding: "35px 15px",
                        background: "#fafafd",
                        borderRadius: "16px",
                      }}
                    >
                      <div style={{ fontSize: "32px" }}>
                        📭
                      </div>

                      <h6 className="fw-bold mt-3">
                        No proposals yet
                      </h6>

                      <p className="text-muted small mb-0">
                        Freelancers who apply will
                        appear here.
                      </p>
                    </div>
                  ) : (
                    proposals.map((prop) => {
                      const accepted =
                        prop.status === "accepted";

                      const rejected =
                        prop.status === "rejected";

                      const pending =
                        prop.status === "pending";

                      return (
                        <div
                          key={prop.id}
                          className="mb-3 jd-proposal-mini"
                          style={{
                            border: accepted
                              ? "2px solid #00c853"
                              : "1px solid #e7e6ee",
                            borderRadius: "18px",
                            padding: "17px",
                            background: accepted
                              ? "#f5fff8"
                              : "#fff",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start gap-2">

                            <div className="d-flex gap-2">
                              <div
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius: "13px",
                                  background: "#f0edff",
                                  color: "#5a4bcf",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "800",
                                }}
                              >
                                {(
                                  prop.user?.name || "F"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <h6 className="fw-bold mb-0">
                                  {prop.user?.name ||
                                    "Freelancer"}
                                </h6>

                                <small className="text-muted">
                                  {prop.user?.email ||
                                    "Freelancer"}
                                </small>
                              </div>
                            </div>

                            <span
                              className="badge rounded-pill"
                              style={{
                                background: accepted
                                  ? "#e6fff0"
                                  : rejected
                                  ? "#fff0f1"
                                  : "#fff5d9",
                                color: accepted
                                  ? "#00a651"
                                  : rejected
                                  ? "#d9303e"
                                  : "#a06d00",
                                textTransform:
                                  "capitalize",
                              }}
                            >
                              {prop.status}
                            </span>
                          </div>

                          {/* PROPOSED BUDGET */}

                          <div
                            className="d-flex justify-content-between align-items-center mt-3 mb-3"
                            style={{
                              background: "#fafafd",
                              borderRadius: "12px",
                              padding: "11px 13px",
                            }}
                          >
                            <span className="text-muted small">
                              Proposed Budget
                            </span>

                            <strong
                              style={{
                                color: "#5a4bcf",
                                fontSize: "17px",
                              }}
                            >
                              ₹{prop.proposed_budget}
                            </strong>
                          </div>

                          {/* COVER LETTER */}

                          <div
                            style={{
                              background: "#fafafd",
                              borderRadius: "12px",
                              padding: "12px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#8b8794",
                                fontWeight: "700",
                                marginBottom: "5px",
                              }}
                            >
                              COVER LETTER
                            </div>

                            <p
                              className="small text-secondary mb-0"
                              style={{
                                lineHeight: "1.55",
                                display: "-webkit-box",
                                WebkitLineClamp: 4,
                                WebkitBoxOrient:
                                  "vertical",
                                overflow: "hidden",
                              }}
                            >
                              "{prop.cover_letter ||
                                "No cover letter provided."}"
                            </p>
                          </div>

                          {/* ACCEPT */}

                          {isOpen && pending && (
                            <button
                              className="btn w-100 mt-3 rounded-pill fw-bold jd-acceptbtn"
                              style={{
                                background: "#00c853",
                                color: "#fff",
                                border: "none",
                                padding: "10px",
                              }}
                              onClick={() =>
                                handleAccept(prop.id)
                              }
                              disabled={
                                acceptingId === prop.id
                              }
                            >
                              {acceptingId === prop.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Hiring...
                                </>
                              ) : (
                                "✓ Accept & Hire"
                              )}
                            </button>
                          )}

                          {accepted && (
                            <div
                              className="text-center fw-bold mt-3"
                              style={{
                                background: "#e6fff0",
                                color: "#00a651",
                                borderRadius: "50px",
                                padding: "10px",
                                fontSize: "13px",
                              }}
                            >
                              ✓ Freelancer Hired
                            </div>
                          )}

                          {rejected && (
                            <div
                              className="text-center fw-bold mt-3"
                              style={{
                                background: "#fff0f1",
                                color: "#d9303e",
                                borderRadius: "50px",
                                padding: "10px",
                                fontSize: "13px",
                              }}
                            >
                              Proposal Rejected
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (

                /* ================= FREELANCER PROPOSAL ================= */

                <div
                  className="jd-sidecard"
                  style={{
                    background: "#fff",
                    borderRadius: "22px",
                    padding: "24px",
                    boxShadow:
                      "0 10px 35px rgba(31,38,135,0.07)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        background: "#f0edff",
                        color: "#5a4bcf",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      🚀
                    </div>

                    <div>
                      <h5 className="fw-bold mb-0">
                        Submit a Proposal
                      </h5>

                      <small className="text-muted">
                        Tell the client why you're
                        the right fit.
                      </small>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {!isOpen ? (
                    <div
                      className="text-center"
                      style={{
                        background: "#fff8e6",
                        border: "1px solid #ffe3a1",
                        borderRadius: "16px",
                        padding: "25px 15px",
                      }}
                    >
                      <div style={{ fontSize: "32px" }}>
                        🔒
                      </div>

                      <h6 className="fw-bold mt-2">
                        This job is closed
                      </h6>

                      <p className="text-muted small mb-0">
                        New proposals are no longer
                        being accepted.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitProposal}>

                      {/* COVER LETTER */}

                      <div className="mb-4">
                        <label className="form-label fw-bold small">
                          Cover Letter
                        </label>

                        <textarea
                          className="form-control"
                          rows="7"
                          value={coverLetter}
                          onChange={(e) =>
                            setCoverLetter(e.target.value)
                          }
                          placeholder="Introduce yourself, explain your experience and tell the client how you can complete this project..."
                          required
                          style={{
                            borderRadius: "14px",
                            background: "#fafafd",
                            border: "1px solid #e8e7ef",
                            resize: "vertical",
                          }}
                        />

                        <div className="text-end mt-1">
                          <small className="text-muted">
                            {coverLetter.length} characters
                          </small>
                        </div>
                      </div>

                      {/* BUDGET */}

                      <div className="mb-4">
                        <label className="form-label fw-bold small">
                          Your Proposed Budget
                        </label>

                        <div className="input-group">
                          <span
                            className="input-group-text"
                            style={{
                              background: "#f0edff",
                              color: "#5a4bcf",
                              border: "1px solid #e1ddff",
                              fontWeight: "700",
                            }}
                          >
                            ₹
                          </span>

                          <input
                            type="number"
                            className="form-control"
                            value={proposedBudget}
                            onChange={(e) =>
                              setProposedBudget(
                                e.target.value
                              )
                            }
                            placeholder="15000"
                            min="1"
                            required
                            style={{
                              background: "#fafafd",
                              border: "1px solid #e8e7ef",
                            }}
                          />
                        </div>

                        <small className="text-muted">
                          Client budget: ₹{job.budget}
                        </small>
                      </div>

                      {/* SUBMIT */}

                      <button
                        type="submit"
                        className="btn w-100 rounded-pill fw-bold jd-submitbtn"
                        style={{
                          background: "linear-gradient(135deg,#6d5ef2,#a04bf0)",
                          color: "#fff",
                          border: "none",
                          padding: "13px",
                          boxShadow:
                            "0 8px 20px rgba(90,75,207,0.18)",
                        }}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Submitting...
                          </>
                        ) : (
                          "🚀 Submit Proposal"
                        )}
                      </button>

                      <div
                        className="text-center mt-3"
                        style={{
                          fontSize: "11px",
                          color: "#94919d",
                        }}
                      >
                        💡 You will be charged a 10%
                        commission after the client
                        accepts your proposal.
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;