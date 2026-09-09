import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { toast } from "../utils/toast";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    location: "",
    skills: "",
  });

  const categories = [
    "Web Development",
    "Backend Development",
    "Frontend Development",
    "Full Stack Development",
    "Design",
    "Mobile Development",
    "Writing",
    "Digital Marketing",
    "Data Science",
    "Other",
  ];

  // ================= FETCH JOB =================

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/jobs/${id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Unable to load job"
        );
      }

      const job = data.job || data;

      setForm({
        title: job.title || "",
        description: job.description || "",
        category: job.category || "",
        budget: job.budget || "",
        location: job.location || "",
        skills: Array.isArray(job.skills)
          ? job.skills.join(", ")
          : job.skills || "",
      });
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Something went wrong while loading the job."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast("Please enter a job title.");
      return;
    }

    if (!form.description.trim()) {
      toast("Please enter a job description.");
      return;
    }

    if (!form.category) {
      toast("Please select a category.");
      return;
    }

    if (!form.budget || Number(form.budget) <= 0) {
      toast("Please enter a valid budget.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        budget: Number(form.budget),
        location: form.location.trim(),
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0),
      };

      const res = await fetch(
        `${API_URL}/jobs/${id}`,
        {
          method: "PUT",
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
        toast("Job updated successfully!");
        navigate("/jobs");
      } else {
        toast(
          data.message ||
            "Job update failed. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      toast(
        "Unable to update job. Please check your server connection."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= SKILLS =================

  const skillList = form.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);

  // ================= LOADING =================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
        }}
      >
        <div className="ej-loader-card">
          <div className="ej-loader-rings">
            <span className="ej-ring ej-ring-a" />
            <span className="ej-ring ej-ring-b" />
            <span className="ej-ring-dot" />
          </div>

          <p className="ej-loader-text">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "35px",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
            boxShadow:
              "0 10px 35px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "#fff0f1",
              color: "#d9303e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
              fontSize: "25px",
            }}
          >
            !
          </div>

          <h5
            style={{
              fontWeight: "800",
            }}
          >
            Unable to load job
          </h5>

          <p
            style={{
              color: "#85818d",
              fontSize: "13px",
            }}
          >
            {error}
          </p>

          <button
            onClick={() => navigate(-1)}
            style={{
              border: "none",
              background: "#5a4bcf",
              color: "#fff",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: "700",
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        fontFamily:
          "'Plus Jakarta Sans', Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        paddingBottom: "50px",
      }}
    >
      {/* ================= TOP HEADER ================= */}

      <header
        style={{
          background: "#fff",
          borderBottom:
            "1px solid #e9e8ef",
          padding: "18px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1050px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg,#5a4bcf,#806eff)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "19px",
              }}
            >
              S
            </div>

            <div>
              <div
                style={{
                  fontWeight: "800",
                  fontSize: "17px",
                  color: "#292731",
                }}
              >
                SkillHire
              </div>

              <div
                style={{
                  color: "#aaa7b2",
                  fontSize: "9px",
                  fontWeight: "700",
                  letterSpacing: "0.7px",
                }}
              >
                FREELANCE PLATFORM
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/jobs")}
            style={{
              border:
                "1px solid #e2e0e9",
              background: "#fff",
              color: "#55515f",
              borderRadius: "10px",
              padding: "9px 15px",
              fontWeight: "700",
              fontSize: "12px",
            }}
          >
            ← Back to Jobs
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          padding: "35px 20px",
        }}
      >
        {/* PAGE TITLE */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              color: "#5a4bcf",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              marginBottom: "7px",
            }}
          >
            JOB MANAGEMENT
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#27252f",
              marginBottom: "6px",
            }}
          >
            Edit Job
          </h1>

          <p
            style={{
              color: "#8c8995",
              fontSize: "13px",
              margin: 0,
            }}
          >
            Update your job details and
            keep your project requirements
            up to date.
          </p>
        </div>

        <div className="row g-4">
          {/* ================= FORM ================= */}

          <div className="col-lg-8">
            <div
              className="ej-card"
              style={{
                background: "#fff",
                borderRadius: "22px",
                border:
                  "1px solid #ecebf1",
                padding: "28px",
                boxShadow:
                  "0 8px 30px rgba(31,38,135,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "25px",
                }}
              >
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
                    fontSize: "19px",
                  }}
                >
                  ✎
                </div>

                <div>
                  <h5
                    style={{
                      margin: 0,
                      fontWeight: "800",
                      fontSize: "16px",
                    }}
                  >
                    Job Information
                  </h5>

                  <small
                    style={{
                      color: "#9996a1",
                      fontSize: "11px",
                    }}
                  >
                    Modify the information
                    below
                  </small>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* TITLE */}

                <div className="mb-4">
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "750",
                      color: "#3b3844",
                      marginBottom: "8px",
                    }}
                  >
                    Job Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Build a React website"
                    required
                    style={{
                      width: "100%",
                      border:
                        "1px solid #e2e0e8",
                      borderRadius: "11px",
                      padding:
                        "12px 14px",
                      outline: "none",
                      fontSize: "13px",
                      color: "#33313b",
                      background: "#fff",
                    }}
                  />
                </div>

                {/* DESCRIPTION */}

                <div className="mb-4">
                  <div
                    className="d-flex justify-content-between"
                  >
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "750",
                        color: "#3b3844",
                        marginBottom: "8px",
                      }}
                    >
                      Job Description
                    </label>

                    <span
                      style={{
                        fontSize: "10px",
                        color: "#aaa7b2",
                      }}
                    >
                      {form.description.length}/1000
                    </span>
                  </div>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your project, requirements, goals and expectations..."
                    rows="7"
                    maxLength="1000"
                    required
                    style={{
                      width: "100%",
                      border:
                        "1px solid #e2e0e8",
                      borderRadius: "11px",
                      padding:
                        "12px 14px",
                      outline: "none",
                      fontSize: "13px",
                      color: "#33313b",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* CATEGORY + BUDGET */}

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "750",
                        color: "#3b3844",
                        marginBottom: "8px",
                      }}
                    >
                      Category
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        border:
                          "1px solid #e2e0e8",
                        borderRadius: "11px",
                        padding:
                          "12px 14px",
                        outline: "none",
                        fontSize: "13px",
                        background: "#fff",
                        color: "#33313b",
                      }}
                    >
                      <option value="">
                        Select Category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category}
                            value={
                              category
                            }
                          >
                            {category}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "750",
                        color: "#3b3844",
                        marginBottom: "8px",
                      }}
                    >
                      Budget
                    </label>

                    <div
                      style={{
                        position:
                          "relative",
                      }}
                    >
                      <span
                        style={{
                          position:
                            "absolute",
                          left: "14px",
                          top: "12px",
                          fontSize:
                            "13px",
                          fontWeight:
                            "700",
                          color:
                            "#777480",
                        }}
                      >
                        ₹
                      </span>

                      <input
                        type="number"
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        placeholder="50000"
                        min="1"
                        required
                        style={{
                          width: "100%",
                          border:
                            "1px solid #e2e0e8",
                          borderRadius:
                            "11px",
                          padding:
                            "12px 14px 12px 32px",
                          outline:
                            "none",
                          fontSize:
                            "13px",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* LOCATION */}

                <div className="mb-4">
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "750",
                      color: "#3b3844",
                      marginBottom: "8px",
                    }}
                  >
                    Location
                    <span
                      style={{
                        fontWeight:
                          "500",
                        color:
                          "#aaa7b2",
                        marginLeft:
                          "5px",
                      }}
                    >
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Remote / Bangalore / Chennai"
                    style={{
                      width: "100%",
                      border:
                        "1px solid #e2e0e8",
                      borderRadius: "11px",
                      padding:
                        "12px 14px",
                      outline: "none",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* SKILLS */}

                <div className="mb-4">
                  <div
                    className="d-flex justify-content-between"
                  >
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "750",
                        color: "#3b3844",
                        marginBottom: "8px",
                      }}
                    >
                      Required Skills
                    </label>

                    <span
                      style={{
                        fontSize: "10px",
                        color: "#5a4bcf",
                        fontWeight: "700",
                      }}
                    >
                      {skillList.length} skills
                    </span>
                  </div>

                  <input
                    type="text"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React, Laravel, MySQL"
                    style={{
                      width: "100%",
                      border:
                        "1px solid #e2e0e8",
                      borderRadius: "11px",
                      padding:
                        "12px 14px",
                      outline: "none",
                      fontSize: "13px",
                    }}
                  />

                  <small
                    style={{
                      display:
                        "block",
                      color:
                        "#aaa7b2",
                      fontSize:
                        "10px",
                      marginTop:
                        "7px",
                    }}
                  >
                    Separate multiple
                    skills using commas.
                  </small>
                </div>

                {/* SKILL PREVIEW */}

                {skillList.length > 0 && (
                  <div
                    style={{
                      background:
                        "#f8f7ff",
                      borderRadius:
                        "12px",
                      padding:
                        "13px",
                      marginBottom:
                        "24px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "10px",
                        fontWeight:
                          "800",
                        color:
                          "#777480",
                        marginBottom:
                          "8px",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.6px",
                      }}
                    >
                      Skill Preview
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap: "6px",
                      }}
                    >
                      {skillList.map(
                        (
                          skill,
                          index
                        ) => (
                          <span
                            key={index}
                            style={{
                              background:
                                "#fff",
                              color:
                                "#5a4bcf",
                              border:
                                "1px solid #e4e0ff",
                              borderRadius:
                                "20px",
                              padding:
                                "5px 10px",
                              fontSize:
                                "10px",
                              fontWeight:
                                "700",
                            }}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* ACTIONS */}

                <div
                  style={{
                    display:
                      "flex",
                    gap: "10px",
                    paddingTop:
                      "5px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      navigate(-1)
                    }
                    disabled={saving}
                    style={{
                      flex: 1,
                      border:
                        "1px solid #dedce5",
                      background:
                        "#fff",
                      color:
                        "#5f5b68",
                      borderRadius:
                        "11px",
                      padding:
                        "12px",
                      fontWeight:
                        "700",
                      fontSize:
                        "12px",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 2,
                      border: "none",
                      background:
                        saving
                          ? "#aaa4d8"
                          : "linear-gradient(135deg,#5a4bcf,#7565ea)",
                      color:
                        "#fff",
                      borderRadius:
                        "11px",
                      padding:
                        "12px",
                      fontWeight:
                        "800",
                      fontSize:
                        "12px",
                      boxShadow:
                        "0 8px 18px rgba(90,75,207,0.18)",
                    }}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          style={{
                            width:
                              "13px",
                            height:
                              "13px",
                          }}
                        />
                        Updating...
                      </>
                    ) : (
                      "✓ Update Job"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ================= SIDE PANEL ================= */}

          <div className="col-lg-4">
            <div
              className="ej-panel"
              style={{
                background:
                  "linear-gradient(145deg,#5a4bcf,#7566e8)",
                borderRadius:
                  "22px",
                padding:
                  "24px",
                color:
                  "#fff",
                marginBottom:
                  "18px",
                position:
                  "relative",
                overflow:
                  "hidden",
              }}
            >
              <div
                style={{
                  position:
                    "absolute",
                  width:
                    "130px",
                  height:
                    "130px",
                  borderRadius:
                    "50%",
                  background:
                    "rgba(255,255,255,0.07)",
                  right:
                    "-50px",
                  top:
                    "-45px",
                }}
              />

              <div
                style={{
                  position:
                    "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    fontSize:
                      "10px",
                    fontWeight:
                      "800",
                    letterSpacing:
                      "1px",
                    opacity:
                      0.7,
                    marginBottom:
                      "10px",
                  }}
                >
                  JOB #{id}
                </div>

                <h5
                  style={{
                    fontWeight:
                      "800",
                    fontSize:
                      "18px",
                    lineHeight:
                      "1.4",
                    marginBottom:
                      "12px",
                  }}
                >
                  Keep your job
                  details updated
                </h5>

                <p
                  style={{
                    fontSize:
                      "11px",
                    lineHeight:
                      "1.7",
                    opacity:
                      0.75,
                    margin: 0,
                  }}
                >
                  Accurate job details
                  help freelancers
                  understand your
                  requirements and
                  submit better
                  proposals.
                </p>
              </div>
            </div>

            {/* CHECKLIST */}

            <div
              className="ej-card ej-checklist"
              style={{
                background:
                  "#fff",
                borderRadius:
                  "20px",
                border:
                  "1px solid #ecebf1",
                padding:
                  "22px",
              }}
            >
              <h6
                style={{
                  fontWeight:
                    "800",
                  fontSize:
                    "14px",
                  marginBottom:
                    "18px",
                }}
              >
                Update Checklist
              </h6>

              {[
                {
                  text: "Job title",
                  done:
                    form.title.trim()
                      .length > 0,
                },
                {
                  text: "Description",
                  done:
                    form.description.trim()
                      .length > 0,
                },
                {
                  text: "Category",
                  done:
                    form.category
                      .length > 0,
                },
                {
                  text: "Budget",
                  done:
                    Number(
                      form.budget
                    ) > 0,
                },
                {
                  text: "Skills",
                  done:
                    skillList.length >
                    0,
                },
              ].map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "10px",
                      marginBottom:
                        "13px",
                    }}
                  >
                    <div
                      style={{
                        width:
                          "23px",
                        height:
                          "23px",
                        borderRadius:
                          "7px",
                        background:
                          item.done
                            ? "#eafff2"
                            : "#f4f3f7",
                        color:
                          item.done
                            ? "#00a651"
                            : "#aaa7b2",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "11px",
                        fontWeight:
                          "800",
                      }}
                    >
                      {item.done
                        ? "✓"
                        : "○"}
                    </div>

                    <span
                      style={{
                        fontSize:
                          "11px",
                        color:
                          item.done
                            ? "#494650"
                            : "#9996a1",
                        fontWeight:
                          item.done
                            ? "600"
                            : "500",
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                )
              )}

              <div
                style={{
                  marginTop:
                    "20px",
                  background:
                    "#f7f6fb",
                  borderRadius:
                    "10px",
                  padding:
                    "11px",
                  fontSize:
                    "10px",
                  color:
                    "#898692",
                  lineHeight:
                    "1.6",
                }}
              >
                💡 Tip: Clear
                requirements usually
                attract more relevant
                freelancers.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= RESPONSIVE ================= */}

      <style>{`
        input:focus,
        textarea:focus,
        select:focus {
          border-color: #8b7ff0 !important;
          box-shadow: 0 0 0 3px rgba(90,75,207,0.08);
        }

        button {
          transition: all 0.2s ease;
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .ej-card {
          transition: all 0.25s ease;
          animation: ejFadeUp 0.5s ease 0.08s both;
        }
        .ej-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(31,38,135,0.11);
          border-color: #e2ddfb;
        }
        .ej-panel {
          animation: ejFadeUp 0.5s ease 0.14s both;
        }
        .ej-panel::after {
          content: "";
          position: absolute;
          top: 0;
          left: -45%;
          height: 100%;
          width: 35%;
          background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%);
          transform: skewX(-18deg);
          animation: ejShine 6s ease-in-out infinite;
        }
        .ej-checklist {
          animation-delay: 0.2s;
        }
        @keyframes ejFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ejShine {
          0%, 55% { left: -45%; }
          100% { left: 145%; }
        }
        .ej-loader-card {
          background: #fff;
          border-radius: 20px;
          padding: 38px 52px;
          text-align: center;
          box-shadow: 0 10px 35px rgba(0,0,0,0.06);
          animation: ejFadeUp 0.4s ease both;
        }
        .ej-loader-rings {
          position: relative;
          width: 74px;
          height: 74px;
          margin: 0 auto;
        }
        .ej-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
        }
        .ej-ring-a { border-top-color: #7c6eff; border-right-color: #7c6eff; animation: ejSpin 0.9s linear infinite; }
        .ej-ring-b { inset: 12px; border-bottom-color: #a04bf0; border-left-color: #a04bf0; animation: ejSpin 1.3s linear infinite reverse; }
        .ej-ring-dot {
          position: absolute;
          top: 50%; left: 50%;
          width: 12px; height: 12px;
          margin: -6px 0 0 -6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c6eff, #a04bf0);
          box-shadow: 0 0 14px rgba(124,110,255,0.8);
          animation: ejPulse 1.2s ease-in-out infinite;
        }
        @keyframes ejSpin { to { transform: rotate(360deg); } }
        @keyframes ejPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.45); opacity: 0.6; }
        }
        .ej-loader-text {
          margin: 18px 0 0;
          color: #777480;
          font-size: 13px;
          letter-spacing: 0.3px;
        }

        @media (max-width: 767px) {
          header {
            padding: 15px 18px !important;
          }

          main {
            padding: 25px 15px !important;
          }

          main h1 {
            font-size: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .row > .col-md-6 {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EditJob;