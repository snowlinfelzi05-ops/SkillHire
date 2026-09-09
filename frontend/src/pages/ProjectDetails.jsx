import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import "./ProjectDetails.css";
import { toast } from "../utils/toast";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [message, setMessage] = useState("");
  const [workStatus, setWorkStatus] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProjectDetails();
    fetchWorkUpdates();
    fetchReviews();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(
        `${API_URL}/projects/${id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch project");
      }

      setProject(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkUpdates = async () => {
    try {
      const response = await fetch(
        `${API_URL}/projects/${id}/work-updates`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUpdates(data.updates || []);
      }
    } catch (err) {
      console.error("Work Updates Error:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `${API_URL}/projects/${id}/reviews`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Reviews Error:", err);
    }
  };

  const addWorkUpdate = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast("Please enter a work update.");
      return;
    }

    try {
      setSubmittingUpdate(true);

      const response = await fetch(
        `${API_URL}/projects/${id}/work-updates`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: message,
            status: workStatus || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add work update"
        );
      }

      setUpdates((current) => [data.update, ...current]);
      setMessage("");
      setWorkStatus("");

      toast("Work update added successfully!");
    } catch (err) {
      toast(err.message);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const addReview = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast("Please write a review comment.");
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await fetch(
        `${API_URL}/projects/${id}/reviews`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: Number(rating),
            comment: comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add review"
        );
      }

      setReviews((current) => [data.review, ...current]);
      setRating(5);
      setComment("");

      toast("Review added successfully!");
    } catch (err) {
      toast(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="project-loading">
          <div className="prd-orb">
            <span className="prd-orb-core"></span>
            <span className="prd-orb-sat prd-orb-s1"></span>
            <span className="prd-orb-sat prd-orb-s2"></span>
          </div>
          <h3>Loading project workspace...</h3>
          <p>Please wait while we fetch the project details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-details-page">
        <div className="project-error">
          <div className="error-icon">!</div>
          <h2>Unable to load project</h2>
          <p>{error}</p>

          <button
            className="primary-action"
            onClick={() => navigate("/my-projects")}
          >
            ← Back to My Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <div className="project-error">
          <div className="error-icon">?</div>
          <h2>Project not found</h2>
          <p>The requested project could not be found.</p>

          <button
            className="primary-action"
            onClick={() => navigate("/my-projects")}
          >
            ← Back to My Projects
          </button>
        </div>
      </div>
    );
  }

  const isFreelancer =
    project.freelancer_id === user?.id;

  const isProjectMember =
    project.client_id === user?.id ||
    project.freelancer_id === user?.id;

  const alreadyReviewed = reviews.some(
    (review) => review.reviewer_id === user?.id
  );

  const projectTitle =
    project.job?.title ||
    project.title ||
    "Untitled Project";

  const projectDescription =
    project.job?.description ||
    project.description ||
    "No description available.";

  const getStatusClass = (status) => {
    if (status === "completed") return "completed";
    if (status === "cancelled") return "cancelled";
    if (status === "active") return "active";

    return "pending";
  };

  const getProgress = () => {
    if (project.status === "completed") return 100;
    if (project.status === "cancelled") return 0;
    if (project.status === "active") return 50;

    return 25;
  };

  const progress = getProgress();

  return (
    <div className="project-details-page">

      {/* TOP NAV */}
      <div className="project-topbar">
        <div className="project-topbar-inner">

          <button
            className="back-button"
            onClick={() => navigate("/my-projects")}
          >
            <span>←</span>
            Back to My Projects
          </button>

          <div className="topbar-right">
            <span className="workspace-label">
              Project Workspace
            </span>

            <div className="user-mini">
              <div className="user-mini-avatar">
                {(user?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <span>{user?.name || "User"}</span>
            </div>
          </div>

        </div>
      </div>

      <div className="project-details-wrapper">

        {/* HERO */}
        <section className="project-hero">

          <div className="hero-main">

            <div className="project-breadcrumb">
              Projects
              <span>›</span>
              {projectTitle}
            </div>

            <div className="hero-title-row">
              <div>
                <div className="project-id">
                  PROJECT #{project.id}
                </div>

                <h1>{projectTitle}</h1>

                <p className="hero-description">
                  {projectDescription}
                </p>
              </div>

              <span
                className={`project-status-badge ${getStatusClass(
                  project.status
                )}`}
              >
                <span className="status-dot"></span>
                {project.status || "Pending"}
              </span>
            </div>

          </div>

          {/* PROGRESS */}
          <div className="hero-progress">

            <div className="progress-header">
              <span>Project Progress</span>
              <strong>{progress}%</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="progress-labels">
              <span>Started</span>
              <span>In Progress</span>
              <span>Completed</span>
            </div>

          </div>

        </section>

        {/* SUMMARY CARDS */}
        <section className="project-summary-grid">

          <div className="summary-card">
            <div className="summary-icon budget-icon">
              ₹
            </div>

            <div>
              <span>Project Budget</span>
              <strong>
                ₹{Number(project.budget || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon date-icon">
              ◷
            </div>

            <div>
              <span>Start Date</span>
              <strong>
                {project.start_date || "Not specified"}
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon date-icon">
              ◷
            </div>

            <div>
              <span>End Date</span>
              <strong>
                {project.end_date || "Not specified"}
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon payment-icon">
              ✓
            </div>

            <div>
              <span>Payment Status</span>
              <strong
                className={
                  project.payment_status === "paid"
                    ? "paid-text"
                    : "pending-text"
                }
              >
                {project.payment_status === "paid"
                  ? "Paid"
                  : "Payment Pending"}
              </strong>
            </div>
          </div>

        </section>

        {/* MAIN CONTENT */}
        <div className="project-content-grid">

          {/* LEFT COLUMN */}
          <div className="project-main-column">

            {/* DESCRIPTION */}
            <section className="dashboard-section">

              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    PROJECT OVERVIEW
                  </span>

                  <h2>Project Description</h2>
                </div>
              </div>

              <div className="description-content">
                <p>{projectDescription}</p>
              </div>

            </section>

            {/* PEOPLE */}
            <section className="dashboard-section">

              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    PROJECT MEMBERS
                  </span>

                  <h2>People</h2>
                </div>
              </div>

              <div className="people-grid">

                <div className="person-card">

                  <div className="person-avatar client-avatar">
                    {(project.client?.name || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="person-info">
                    <span>CLIENT</span>
                    <strong>
                      {project.client?.name || "N/A"}
                    </strong>
                    <small>Project Owner</small>
                  </div>

                </div>

                <div className="person-card">

                  <div className="person-avatar freelancer-avatar">
                    {(project.freelancer?.name || "F")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="person-info">
                    <span>FREELANCER</span>
                    <strong>
                      {project.freelancer?.name || "N/A"}
                    </strong>
                    <small>Assigned Freelancer</small>
                  </div>

                </div>

              </div>

            </section>

            {/* WORK UPDATE FORM */}
            {isFreelancer &&
              project.status === "active" && (
                <section className="dashboard-section update-section">

                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">
                        WORKSPACE
                      </span>

                      <h2>Add Work Update</h2>

                      <p>
                        Keep your client updated about your
                        current progress.
                      </p>
                    </div>
                  </div>

                  <form
                    className="work-update-form"
                    onSubmit={addWorkUpdate}
                  >

                    <div className="form-group">
                      <label>Work Update</label>

                      <textarea
                        value={message}
                        onChange={(e) =>
                          setMessage(e.target.value)
                        }
                        placeholder="Describe what you have completed or what you are currently working on..."
                        rows="5"
                      />
                    </div>

                    <div className="form-row">

                      <div className="form-group">
                        <label>Progress Status</label>

                        <select
                          value={workStatus}
                          onChange={(e) =>
                            setWorkStatus(e.target.value)
                          }
                        >
                          <option value="">
                            Select Status
                          </option>

                          <option value="Started">
                            Started
                          </option>

                          <option value="In Progress">
                            In Progress
                          </option>

                          <option value="Completed">
                            Completed
                          </option>
                        </select>
                      </div>

                      <div className="form-action">
                        <button
                          type="submit"
                          className="primary-action"
                          disabled={submittingUpdate}
                        >
                          {submittingUpdate
                            ? "Adding Update..."
                            : "＋ Add Work Update"}
                        </button>
                      </div>

                    </div>

                  </form>

                </section>
              )}

            {/* WORK UPDATES */}
            <section className="dashboard-section">

              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    ACTIVITY
                  </span>

                  <h2>Work Updates</h2>
                </div>

                <span className="count-badge">
                  {updates.length}
                </span>
              </div>

              {updates.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">↗</div>
                  <h3>No work updates yet</h3>
                  <p>
                    Project activity and progress updates
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="timeline">

                  {updates.map((update) => (
                    <div
                      className="timeline-item"
                      key={update.id}
                    >

                      <div className="timeline-marker">
                        ✓
                      </div>

                      <div className="timeline-content">

                        <div className="timeline-top">

                          <div>
                            <strong>
                              {update.user?.name || "User"}
                            </strong>

                            <small>
                              {new Date(
                                update.created_at
                              ).toLocaleString()}
                            </small>
                          </div>

                          {update.status && (
                            <span className="update-status">
                              {update.status}
                            </span>
                          )}

                        </div>

                        <p>{update.message}</p>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </section>

            {/* REVIEW FORM */}
            {isProjectMember &&
              project.status === "completed" &&
              !alreadyReviewed && (
                <section className="dashboard-section review-form-section">

                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">
                        FEEDBACK
                      </span>

                      <h2>Leave a Review</h2>

                      <p>
                        Share your experience working on
                        this project.
                      </p>
                    </div>
                  </div>

                  <form
                    className="review-form"
                    onSubmit={addReview}
                  >

                    <div className="rating-selector">

                      <label>Rating</label>

                      <select
                        value={rating}
                        onChange={(e) =>
                          setRating(e.target.value)
                        }
                      >
                        <option value="5">
                          ⭐⭐⭐⭐⭐ 5 - Excellent
                        </option>

                        <option value="4">
                          ⭐⭐⭐⭐ 4 - Very Good
                        </option>

                        <option value="3">
                          ⭐⭐⭐ 3 - Good
                        </option>

                        <option value="2">
                          ⭐⭐ 2 - Fair
                        </option>

                        <option value="1">
                          ⭐ 1 - Poor
                        </option>
                      </select>

                    </div>

                    <div className="form-group">
                      <label>Comment</label>

                      <textarea
                        value={comment}
                        onChange={(e) =>
                          setComment(e.target.value)
                        }
                        placeholder="Write your review..."
                        rows="4"
                      />
                    </div>

                    <button
                      type="submit"
                      className="primary-action"
                      disabled={submittingReview}
                    >
                      {submittingReview
                        ? "Submitting Review..."
                        : "★ Submit Review"}
                    </button>

                  </form>

                </section>
              )}

            {/* REVIEWS */}
            <section className="dashboard-section">

              <div className="section-heading">
                <div>
                  <span className="section-kicker">
                    FEEDBACK
                  </span>

                  <h2>Reviews & Ratings</h2>
                </div>

                <span className="count-badge">
                  {reviews.length}
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">★</div>
                  <h3>No reviews yet</h3>
                  <p>
                    Reviews from project members will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="reviews-list">

                  {reviews.map((review) => (
                    <div
                      className="review-card"
                      key={review.id}
                    >

                      <div className="review-avatar">
                        {(review.reviewer?.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="review-content">

                        <div className="review-top">

                          <div>
                            <strong>
                              {review.reviewer?.name ||
                                "User"}
                            </strong>

                            <small>
                              {new Date(
                                review.created_at
                              ).toLocaleString()}
                            </small>
                          </div>

                          <span className="review-stars">
                            {"⭐".repeat(
                              Number(review.rating || 0)
                            )}
                          </span>

                        </div>

                        {review.comment && (
                          <p>{review.comment}</p>
                        )}

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </section>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="project-sidebar">

            {/* STATUS CARD */}
            <div className="sidebar-card status-sidebar-card">

              <span className="sidebar-label">
                PROJECT STATUS
              </span>

              <div
                className={`large-status ${getStatusClass(
                  project.status
                )}`}
              >
                <span className="status-dot"></span>
                {project.status || "Pending"}
              </div>

              <div className="sidebar-progress">

                <div className="sidebar-progress-header">
                  <span>Completion</span>
                  <strong>{progress}%</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  ></div>
                </div>

              </div>

            </div>

            {/* PROJECT INFO */}
            <div className="sidebar-card">

              <div className="sidebar-card-title">
                <h3>Project Information</h3>
              </div>

              <div className="info-list">

                <div className="info-item">
                  <span>Project ID</span>
                  <strong>#{project.id}</strong>
                </div>

                <div className="info-item">
                  <span>Budget</span>
                  <strong>
                    ₹{Number(
                      project.budget || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="info-item">
                  <span>Start Date</span>
                  <strong>
                    {project.start_date || "N/A"}
                  </strong>
                </div>

                <div className="info-item">
                  <span>End Date</span>
                  <strong>
                    {project.end_date || "N/A"}
                  </strong>
                </div>

                <div className="info-item">
                  <span>Payment</span>

                  <strong
                    className={
                      project.payment_status === "paid"
                        ? "paid-text"
                        : "pending-text"
                    }
                  >
                    {project.payment_status === "paid"
                      ? "Paid"
                      : "Pending"}
                  </strong>
                </div>

              </div>

            </div>

            {/* QUICK ACTIONS */}
            <div className="sidebar-card">

              <div className="sidebar-card-title">
                <h3>Quick Actions</h3>
              </div>

              <div className="quick-actions">

                <button
                  onClick={() =>
                    navigate("/my-projects")
                  }
                >
                  <span>←</span>
                  My Projects
                </button>

                <button
                  onClick={() =>
                    navigate("/dashboard")
                  }
                >
                  <span>⌂</span>
                  Dashboard
                </button>

                <button
                  onClick={() =>
                    navigate("/profile")
                  }
                >
                  <span>◉</span>
                  My Profile
                </button>

              </div>

            </div>

            {/* MEMBERS */}
            <div className="sidebar-card">

              <div className="sidebar-card-title">
                <h3>Project Members</h3>
              </div>

              <div className="sidebar-member">

                <div className="member-avatar">
                  {(project.client?.name || "C")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <span>Client</span>
                  <strong>
                    {project.client?.name || "N/A"}
                  </strong>
                </div>

              </div>

              <div className="sidebar-member">

                <div className="member-avatar">
                  {(project.freelancer?.name || "F")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <span>Freelancer</span>
                  <strong>
                    {project.freelancer?.name || "N/A"}
                  </strong>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </div>
  );
};

export default ProjectDetails;