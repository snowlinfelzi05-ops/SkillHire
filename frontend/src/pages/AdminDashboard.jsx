import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { styles } from "./adminStyles";
import { toast } from "../utils/toast";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pageNumbers.push(i);
    }
  }

  const finalPages = [];
  pageNumbers.forEach((page, index) => {
    if (index > 0 && page - pageNumbers[index - 1] > 1) {
      finalPages.push("...");
    }
    finalPages.push(page);
  });

  return (
    <div style={styles.pagination}>
      <button
        className="page-button"
        style={{
          ...styles.pageButton,
          ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
        }}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Previous
      </button>

      <div style={styles.pageNumbers}>
        {finalPages.map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} style={styles.pageDots}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className="number-button"
              style={{
                ...styles.numberButton,
                ...(currentPage === page ? styles.numberButtonActive : {}),
              }}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        className="page-button"
        style={{
          ...styles.pageButton,
          ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
        }}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const API =
    import.meta.env.VITE_API_URL ||
    "https://skillhire-production.up.railway.app/api";

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Search & Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");

  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] =
    useState("all");
  const [projectPaymentFilter, setProjectPaymentFilter] =
    useState("all");

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);

  const USERS_PER_PAGE = 10;
  const JOBS_PER_PAGE = 10;
  const PROJECTS_PER_PAGE = 10;

  // Modals
  const [showDetail, setShowDetail] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const [showJobDetail, setShowJobDetail] = useState(false);
  const [detailJob, setDetailJob] = useState(null);

  const [showProjectDetail, setShowProjectDetail] =
    useState(false);
  const [detailProject, setDetailProject] = useState(null);

  // Delete states
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // --------------------------------------------------
  // FETCH ADMIN DATA
  // --------------------------------------------------

  const fetchData = async (showRefreshLoader = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const cacheBust = `?t=${Date.now()}`;

      const [
        statsRes,
        usersRes,
        jobsRes,
        projectsRes,
      ] = await Promise.all([
        fetch(`${API}/admin/stats${cacheBust}`, {
          headers,
        }),
        fetch(`${API}/admin/users${cacheBust}`, {
          headers,
        }),
        fetch(`${API}/admin/jobs${cacheBust}`, {
          headers,
        }),
        fetch(`${API}/admin/projects${cacheBust}`, {
          headers,
        }),
      ]);

      if (
        statsRes.status === 401 ||
        usersRes.status === 401 ||
        jobsRes.status === 401 ||
        projectsRes.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (
        statsRes.status === 403 ||
        usersRes.status === 403 ||
        jobsRes.status === 403 ||
        projectsRes.status === 403
      ) {
        setError(
          "You are not authorized to access the admin dashboard."
        );
        return;
      }

      if (!statsRes.ok) {
        throw new Error(
          "Failed to load admin statistics."
        );
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const jobsData = await jobsRes.json();
      const projectsData = await projectsRes.json();

      setStats(statsData);

      setUsers(
        Array.isArray(usersData)
          ? usersData
          : usersData.users ||
              usersData.data ||
              []
      );

      setJobs(
        Array.isArray(jobsData)
          ? jobsData
          : jobsData.jobs ||
              jobsData.data ||
              []
      );

      setProjects(
        Array.isArray(projectsData)
          ? projectsData
          : projectsData.projects ||
              projectsData.data ||
              []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while loading admin data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --------------------------------------------------
  // RESET PAGINATION
  // --------------------------------------------------

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, userRoleFilter]);

  useEffect(() => {
    setJobPage(1);
  }, [jobSearch, jobStatusFilter]);

  useEffect(() => {
    setProjectPage(1);
  }, [
    projectSearch,
    projectStatusFilter,
    projectPaymentFilter,
  ]);

  // --------------------------------------------------
  // DELETE JOB
  // --------------------------------------------------

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    try {
      setDeletingJobId(jobId);

      const response = await fetch(
        `${API}/admin/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete job."
        );
      }

      setJobs((prev) =>
        prev.filter((job) => job.id !== jobId)
      );

      if (detailJob?.id === jobId) {
        setShowJobDetail(false);
        setDetailJob(null);
      }

      await fetchData(true);

      toast("Job deleted successfully.");
    } catch (err) {
      console.error(err);
      toast(
        err.message || "Failed to delete job."
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    try {
      setDeletingUserId(userId);

      const response = await fetch(
        `${API}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete user."
        );
      }

      setUsers((prev) =>
        prev.filter((user) => user.id !== userId)
      );

      if (detailUser?.id === userId) {
        setShowDetail(false);
        setDetailUser(null);
      }

      await fetchData(true);

      toast("User deleted successfully.");
    } catch (err) {
      console.error(err);
      toast(
        err.message || "Failed to delete user."
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // --------------------------------------------------
  // VIEW HANDLERS
  // --------------------------------------------------

  const handleViewUser = (user) => {
    setDetailUser(user);
    setShowDetail(true);
  };

  const handleViewJob = (job) => {
    setDetailJob(job);
    setShowJobDetail(true);
  };

  const handleViewProject = (project) => {
    setDetailProject(project);
    setShowProjectDetail(true);
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getStatus = (item) => {
    return String(
      item?.status || "pending"
    ).toLowerCase();
  };

  const getRole = (user) => {
    return String(
      user?.role ||
        user?.user_type ||
        "user"
    ).toLowerCase();
  };

  const getUserName = (user) => {
    return (
      user?.name ||
      user?.full_name ||
      user?.username ||
      "Unknown User"
    );
  };

  const getJobTitle = (job) => {
    return (
      job?.title ||
      job?.name ||
      "Untitled Job"
    );
  };

  const getProjectTitle = (project) => {
    return (
      project?.job?.title ||
      project?.title ||
      project?.name ||
      "Untitled Project"
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (date) => {
    if (!date) return "Recently";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Recently";
    }

    const diff =
      Date.now() - parsed.getTime();

    const minutes = Math.floor(
      diff / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days > 1 ? "s" : ""
      } ago`;
    }

    return formatDate(date);
  };

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString(
      "en-IN"
    )}`;
  };

  // --------------------------------------------------
  // FILTER USERS
  // --------------------------------------------------

  const filteredUsers = useMemo(() => {
    const search =
      userSearch.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        getUserName(user)
          .toLowerCase()
          .includes(search) ||
        String(user?.email || "")
          .toLowerCase()
          .includes(search);

      const role = getRole(user);

      const matchesRole =
        userRoleFilter === "all" ||
        role === userRoleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [
    users,
    userSearch,
    userRoleFilter,
  ]);

  // --------------------------------------------------
  // FILTER JOBS
  // --------------------------------------------------

  const filteredJobs = useMemo(() => {
    const search =
      jobSearch.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        getJobTitle(job)
          .toLowerCase()
          .includes(search) ||
        String(job?.description || "")
          .toLowerCase()
          .includes(search) ||
        String(job?.category || "")
          .toLowerCase()
          .includes(search);

      const status = getStatus(job);

      const matchesStatus =
        jobStatusFilter === "all" ||
        status === jobStatusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    jobs,
    jobSearch,
    jobStatusFilter,
  ]);

  // --------------------------------------------------
  // FILTER PROJECTS
  // --------------------------------------------------

  const filteredProjects = useMemo(() => {
    const search =
      projectSearch.trim().toLowerCase();

    return projects.filter(
      (project) => {
        const title =
          getProjectTitle(project);

        const matchesSearch =
          !search ||
          title
            .toLowerCase()
            .includes(search) ||
          String(
            project?.description || ""
          )
            .toLowerCase()
            .includes(search);

        const status =
          getStatus(project);

        const paymentStatus =
          String(
            project?.payment_status ||
              "pending"
          ).toLowerCase();

        const matchesStatus =
          projectStatusFilter ===
            "all" ||
          status ===
            projectStatusFilter;

        const matchesPayment =
          projectPaymentFilter ===
            "all" ||
          paymentStatus ===
            projectPaymentFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPayment
        );
      }
    );
  }, [
    projects,
    projectSearch,
    projectStatusFilter,
    projectPaymentFilter,
  ]);

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const userTotalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        USERS_PER_PAGE
    )
  );

  const jobTotalPages = Math.max(
    1,
    Math.ceil(
      filteredJobs.length /
        JOBS_PER_PAGE
    )
  );

  const projectTotalPages = Math.max(
    1,
    Math.ceil(
      filteredProjects.length /
        PROJECTS_PER_PAGE
    )
  );

  const paginatedUsers =
    filteredUsers.slice(
      (userPage - 1) *
        USERS_PER_PAGE,
      userPage *
        USERS_PER_PAGE
    );

  const paginatedJobs =
    filteredJobs.slice(
      (jobPage - 1) *
        JOBS_PER_PAGE,
      jobPage *
        JOBS_PER_PAGE
    );

  const paginatedProjects =
    filteredProjects.slice(
      (projectPage - 1) *
        PROJECTS_PER_PAGE,
      projectPage *
        PROJECTS_PER_PAGE
    );

  // --------------------------------------------------
  // ANALYTICS
  // --------------------------------------------------

  const userRoleData = useMemo(() => {
    const freelancers =
      users.filter(
        (user) =>
          getRole(user) ===
          "freelancer"
      ).length;

    const clients =
      users.filter(
        (user) =>
          getRole(user) ===
          "client"
      ).length;

    const admins =
      users.filter(
        (user) =>
          getRole(user) ===
          "admin"
      ).length;

    const others = Math.max(
      0,
      users.length -
        freelancers -
        clients -
        admins
    );

    return [
      {
        name: "Freelancers",
        value: freelancers,
      },
      {
        name: "Clients",
        value: clients,
      },
      {
        name: "Admins",
        value: admins,
      },
      ...(others > 0
        ? [
            {
              name: "Others",
              value: others,
            },
          ]
        : []),
    ].filter(
      (item) => item.value > 0
    );
  }, [users]);

  const jobStatusData = useMemo(() => {
    const statusMap = {};

    jobs.forEach((job) => {
      const status =
        getStatus(job).replace(
          "_",
          " "
        );

      const formatted =
        status
          .charAt(0)
          .toUpperCase() +
        status.slice(1);

      statusMap[formatted] =
        (statusMap[formatted] ||
          0) + 1;
    });

    return Object.entries(
      statusMap
    ).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [jobs]);

  const projectStatusData =
    useMemo(() => {
      const statusMap = {};

      projects.forEach(
        (project) => {
          const status =
            getStatus(
              project
            ).replace(
              "_",
              " "
            );

          const formatted =
            status
              .charAt(0)
              .toUpperCase() +
            status.slice(1);

          statusMap[formatted] =
            (statusMap[
              formatted
            ] || 0) + 1;
        }
      );

      return Object.entries(
        statusMap
      ).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
    }, [projects]);

  const monthlyRevenueData =
    useMemo(() => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const currentYear =
        new Date().getFullYear();

      const revenue = months.map(
        (month) => ({
          month,
          revenue: 0,
        })
      );

      projects.forEach(
        (project) => {
          const paymentStatus =
            String(
              project?.payment_status ||
                ""
            ).toLowerCase();

          if (
            paymentStatus !==
              "paid" &&
            paymentStatus !==
              "completed"
          ) {
            return;
          }

          const dateValue =
            project?.paid_at ||
            project?.updated_at ||
            project?.created_at;

          if (!dateValue) return;

          const date =
            new Date(dateValue);

          if (
            Number.isNaN(
              date.getTime()
            ) ||
            date.getFullYear() !==
              currentYear
          ) {
            return;
          }

          revenue[
            date.getMonth()
          ].revenue += Number(
            project?.budget ||
              project?.amount ||
              project?.job
                ?.budget ||
              0
          );
        }
      );

      return revenue;
    }, [projects]);

  const totalRevenue =
    projects.reduce(
      (sum, project) => {
        const paymentStatus =
          String(
            project?.payment_status ||
              ""
          ).toLowerCase();

        if (
          paymentStatus !== "paid" &&
          paymentStatus !==
            "completed"
        ) {
          return sum;
        }

        return (
          sum +
          Number(
            project?.budget ||
              project?.amount ||
              project?.job
                ?.budget ||
              0
          )
        );
      },
      0
    );

  const completedProjects =
    projects.filter(
      (project) =>
        getStatus(project) ===
        "completed"
    ).length;

  const activeProjects =
    projects.filter(
      (project) =>
        getStatus(project) ===
          "active" ||
        getStatus(project) ===
          "in_progress"
    ).length;

  const pendingProjects =
    projects.filter(
      (project) =>
        getStatus(project) ===
        "pending"
    ).length;

  const paidProjects =
    projects.filter(
      (project) =>
        String(
          project?.payment_status ||
            ""
        ).toLowerCase() ===
        "paid"
    ).length;

  // --------------------------------------------------
  // RECENT PLATFORM ACTIVITY
  // --------------------------------------------------

  const recentActivities = useMemo(() => {
    const activities = [];

    users.forEach((user) => {
      const date =
        user?.created_at ||
        user?.updated_at;

      if (!date) return;

      activities.push({
        id: `user-${user.id}`,
        type: "user",
        icon: "♙",
        title: "New user registered",
        description: getUserName(user),
        detail:
          user?.email ||
          "New platform account",
        date,
        badge: getRole(user),
      });
    });

    jobs.forEach((job) => {
      const date =
        job?.created_at ||
        job?.updated_at;

      if (!date) return;

      activities.push({
        id: `job-${job.id}`,
        type: "job",
        icon: "▤",
        title: "New job posted",
        description: getJobTitle(job),
        detail:
          job?.category ||
          "General category",
        date,
        badge: getStatus(job),
      });
    });

    projects.forEach((project) => {
      const createdDate =
        project?.created_at;

      if (createdDate) {
        activities.push({
          id: `project-${project.id}`,
          type: "project",
          icon: "▣",
          title: "Project created",
          description:
            getProjectTitle(project),
          detail:
            project?.client?.name ||
            project?.client_name ||
            "Client project",
          date: createdDate,
          badge: getStatus(project),
        });
      }

      const paymentStatus =
        String(
          project?.payment_status ||
            ""
        ).toLowerCase();

      const paymentDate =
        project?.paid_at;

      if (
        paymentStatus === "paid" &&
        paymentDate
      ) {
        activities.push({
          id: `payment-${project.id}`,
          type: "payment",
          icon: "₹",
          title: "Payment received",
          description:
            getProjectTitle(project),
          detail: formatCurrency(
            project?.budget ||
              project?.amount ||
              project?.job?.budget ||
              0
          ),
          date: paymentDate,
          badge: "paid",
        });
      }
    });

    return activities
      .filter((item) => item.date)
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 10);
  }, [users, jobs, projects]);

  const todayActivityCount =
    useMemo(() => {
      const today =
        new Date();

      return recentActivities.filter(
        (activity) => {
          const date =
            new Date(
              activity.date
            );

          return (
            date.getDate() ===
              today.getDate() &&
            date.getMonth() ===
              today.getMonth() &&
            date.getFullYear() ===
              today.getFullYear()
          );
        }
      ).length;
    }, [recentActivities]);

  const weeklyActivityCount =
    useMemo(() => {
      const now = Date.now();

      const sevenDays =
        7 *
        24 *
        60 *
        60 *
        1000;

      return recentActivities.filter(
        (activity) => {
          const time =
            new Date(
              activity.date
            ).getTime();

          return (
            now - time <=
              sevenDays &&
            now - time >= 0
          );
        }
      ).length;
    }, [recentActivities]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div
          style={
            styles.loadingSpinner
          }
        ></div>

        <h3>
          Loading Admin Dashboard...
        </h3>

        <p>
          Please wait while we
          load your platform data.
        </p>

        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI - PART 2 STARTS HERE
  // --------------------------------------------------

  return (
        <div style={styles.page} className="admin-page">
      {/* ==================================================
          SIDEBAR
      ================================================== */}
      <aside style={styles.sidebar} className="admin-sidebar">
        <div style={styles.logoArea} className="logo-area">
          <div style={styles.logoIcon} className="logo-icon">S</div>

          <div>
            <h2 style={styles.logoText}>
              SkillHire
            </h2>

            <span style={styles.logoSubtext}>
              Admin Panel
            </span>
          </div>
        </div>

        <div style={styles.adminProfile} className="admin-profile">
          <div style={styles.adminAvatar}>
            A
          </div>

          <div>
            <strong style={styles.adminName}>
              Administrator
            </strong>

            <span style={styles.adminRole}>
              Platform Admin
            </span>
          </div>
        </div>

        <nav style={styles.sidebarNav} className="sidebar-nav">
          <div className="sidebar-label">Main Menu</div>

          <button
            style={{
              ...styles.navItem,
              ...styles.navItemActive,
            }}
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <span style={styles.navIcon}>
              ▦
            </span>
            Dashboard
          </button>

          <button
            style={styles.navItem}
            onClick={() =>
              document
                .getElementById(
                  "users-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <span style={styles.navIcon}>
              ♙
            </span>
            Users
          </button>

          <button
            style={styles.navItem}
            onClick={() =>
              document
                .getElementById(
                  "jobs-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <span style={styles.navIcon}>
              ▤
            </span>
            Jobs
          </button>

          <button
            style={styles.navItem}
            onClick={() =>
              document
                .getElementById(
                  "projects-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <span style={styles.navIcon}>
              ▣
            </span>
            Projects
          </button>

          <button
            style={styles.navItem}
            onClick={() =>
              document
                .getElementById(
                  "activity-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <span style={styles.navIcon}>
              ◷
            </span>
            Activity
          </button>
        </nav>

        <div style={styles.sidebarBottom} className="sidebar-bottom">
          <div className="sidebar-label">Account</div>

          <button
            style={styles.navItem}
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span style={styles.navIcon}>
              ↗
            </span>
            Main Dashboard
          </button>

          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            <span style={styles.navIcon}>
              ⇥
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}
      <main style={styles.main} className="admin-main">
        {/* TOPBAR */}
        <header style={styles.topbar} className="topbar">
          <div>
            <p style={styles.breadcrumb} className="breadcrumb">
              Admin / Dashboard
            </p>

            <h1 style={styles.pageTitle} className="page-title">
              Platform Overview
            </h1>

            <p style={styles.pageSubtitle} className="page-subtitle">
              Monitor users, jobs, projects and
              platform activity.
            </p>
          </div>

          <button
            className="refresh-button"
            style={{
              ...styles.refreshButton,
              ...(refreshing
                ? styles.refreshButtonDisabled
                : {}),
            }}
            disabled={refreshing}
            onClick={() =>
              fetchData(true)
            }
          >
            <span
              style={{
                display: "inline-block",
                marginRight: "7px",
                animation: refreshing
                  ? "spin 1s linear infinite"
                  : "none",
              }}
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh Data"}
          </button>
        </header>

        {/* ERROR */}
        {error && (
          <div style={styles.errorBox}>
            <span>⚠</span>
            <div>
              <strong>
                Something went wrong
              </strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* ==================================================
            MAIN STATS
        ================================================== */}
        <section style={styles.statsGrid} className="stats-grid">
          <div style={styles.statCard} className="stat-card">
            <div
              className="stat-tile st-u"
              style={{
                ...styles.statIcon,
                background:
                  "rgba(99, 102, 241, 0.12)",
              }}
            >
              ♙
            </div>

            <div style={styles.statContent}>
              <span style={styles.statLabel}>
                Total Users
              </span>

              <strong style={styles.statValue} className="stat-value">
                {stats?.total_users ??
                  users.length}
              </strong>

              <span
                style={styles.statHint}
              >
                Registered accounts
              </span>
            </div>
          </div>

          <div style={styles.statCard} className="stat-card">
            <div
              className="stat-tile st-j"
              style={{
                ...styles.statIcon,
                background:
                  "rgba(14, 165, 233, 0.12)",
              }}
            >
              ▤
            </div>

            <div style={styles.statContent}>
              <span style={styles.statLabel}>
                Total Jobs
              </span>

              <strong style={styles.statValue} className="stat-value">
                {stats?.total_jobs ??
                  jobs.length}
              </strong>

              <span
                style={styles.statHint}
              >
                Posted opportunities
              </span>
            </div>
          </div>

          <div style={styles.statCard} className="stat-card">
            <div
              className="stat-tile st-p"
              style={{
                ...styles.statIcon,
                background:
                  "rgba(16, 185, 129, 0.12)",
              }}
            >
              ▣
            </div>

            <div style={styles.statContent}>
              <span style={styles.statLabel}>
                Total Projects
              </span>

              <strong style={styles.statValue} className="stat-value">
                {stats?.total_projects ??
                  projects.length}
              </strong>

              <span
                style={styles.statHint}
              >
                Client projects
              </span>
            </div>
          </div>

          <div style={styles.statCard} className="stat-card">
            <div
              className="stat-tile st-r"
              style={{
                ...styles.statIcon,
                background:
                  "rgba(245, 158, 11, 0.12)",
              }}
            >
              ₹
            </div>

            <div style={styles.statContent}>
              <span style={styles.statLabel}>
                Platform Revenue
              </span>

              <strong style={styles.statValue} className="stat-value">
                {formatCurrency(
                  stats?.total_revenue ??
                    totalRevenue
                )}
              </strong>

              <span
                style={styles.statHint}
              >
                Completed payments
              </span>
            </div>
          </div>
        </section>

        {/* ==================================================
            QUICK ANALYTICS
        ================================================== */}
        <section style={styles.quickGrid} className="quick-grid">
          <div style={styles.quickCard} className="quick-card">
            <div
              className="q-tile q-s"
              style={styles.quickIconSuccess}
            >
              ✓
            </div>

            <div>
              <strong>
                {activeProjects}
              </strong>

              <span>
                Active Projects
              </span>
            </div>
          </div>

          <div style={styles.quickCard} className="quick-card">
            <div
              className="q-tile q-b"
              style={styles.quickIconBlue}
            >
              ✓
            </div>

            <div>
              <strong>
                {completedProjects}
              </strong>

              <span>
                Completed Projects
              </span>
            </div>
          </div>

          <div style={styles.quickCard} className="quick-card">
            <div
              className="q-tile q-w"
              style={styles.quickIconWarning}
            >
              ◷
            </div>

            <div>
              <strong>
                {pendingProjects}
              </strong>

              <span>
                Pending Projects
              </span>
            </div>
          </div>

          <div style={styles.quickCard} className="quick-card">
            <div
              className="q-tile q-p"
              style={styles.quickIconPurple}
            >
              ₹
            </div>

            <div>
              <strong>
                {paidProjects}
              </strong>

              <span>
                Paid Projects
              </span>
            </div>
          </div>
        </section>

        {/* ==================================================
            PLATFORM ACTIVITY
        ================================================== */}
        <section
          id="activity-section"
          style={styles.activityGrid} className="activity-grid"
        >
          {/* RECENT ACTIVITY */}
          <div style={styles.activityCard} className="activity-card">
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Recent Platform Activity
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Latest users, jobs, projects
                  and payment updates.
                </p>
              </div>

              <div
                style={styles.liveBadge}
              >
                <span
                  style={styles.liveDot}
                ></span>
                Live
              </div>
            </div>

            {recentActivities.length ===
            0 ? (
              <div
                style={styles.activityEmpty}
              >
                <div
                  style={
                    styles.emptyIcon
                  }
                >
                  ◷
                </div>

                <h3>
                  No recent activity
                </h3>

                <p>
                  New platform activities
                  will appear here.
                </p>
              </div>
            ) : (
              <div
                style={styles.activityList}
              >
                {recentActivities.map(
                  (activity) => {
                    let target = null;

                    if (
                      activity.type ===
                      "user"
                    ) {
                      target = users.find(
                        (user) =>
                          `user-${user.id}` ===
                          activity.id
                      );
                    }

                    if (
                      activity.type ===
                      "job"
                    ) {
                      target = jobs.find(
                        (job) =>
                          `job-${job.id}` ===
                          activity.id
                      );
                    }

                    if (
                      activity.type ===
                        "project" ||
                      activity.type ===
                        "payment"
                    ) {
                      target =
                        projects.find(
                          (project) =>
                            `${activity.type}-${project.id}` ===
                              activity.id ||
                            `project-${project.id}` ===
                              activity.id
                        );
                    }

                    return (
                      <div
                        key={activity.id}
                        style={
                          styles.activityItem
                        }
                      >
                        <div
                          style={{
                            ...styles.activityIcon,
                            ...(activity.type ===
                            "user"
                              ? styles.activityUser
                              : activity.type ===
                                "job"
                              ? styles.activityJob
                              : activity.type ===
                                "payment"
                              ? styles.activityPayment
                              : styles.activityProject),
                          }}
                        >
                          {activity.icon}
                        </div>

                        <div
                          style={
                            styles.activityContent
                          }
                        >
                          <div
                            style={
                              styles.activityTop
                            }
                          >
                            <strong
                              style={
                                styles.activityTitle
                              }
                            >
                              {activity.title}
                            </strong>

                            <span
                              style={
                                styles.activityTime
                              }
                            >
                              {getRelativeTime(
                                activity.date
                              )}
                            </span>
                          </div>

                          <p
                            style={
                              styles.activityDescription
                            }
                          >
                            {activity.description}
                          </p>

                          <div
                            style={
                              styles.activityBottom
                            }
                          >
                            <span
                              style={
                                styles.activityMeta
                              }
                            >
                              {activity.detail}
                            </span>

                            {activity.badge && (
                              <span
                                style={{
                                  ...styles.activityBadge,
                                  ...(activity.type ===
                                  "payment"
                                    ? styles.activityBadgePaid
                                    : {}),
                                }}
                              >
                                {String(
                                  activity.badge
                                )
                                  .replace(
                                    "_",
                                    " "
                                  )
                                  .replace(
                                    /^\w/,
                                    (c) =>
                                      c.toUpperCase()
                                  )}
                              </span>
                            )}

                            {target && (
<button
                              className="view-button"
                              style={
                                styles.viewButton
                              }
                                onClick={() => {
                                  if (
                                    activity.type ===
                                    "user"
                                  ) {
                                    handleViewUser(
                                      target
                                    );
                                  } else if (
                                    activity.type ===
                                    "job"
                                  ) {
                                    handleViewJob(
                                      target
                                    );
                                  } else {
                                    handleViewProject(
                                      target
                                    );
                                  }
                                }}
                              >
                                View
                              </button>
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

          {/* ACTIVITY SUMMARY */}
          <div
            style={
              styles.activitySummaryCard
            }
            className="activity-summary-card"
          >
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Activity Summary
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Quick platform activity
                  overview.
                </p>
              </div>

              <div
                style={styles.summaryIcon}
              >
                ◷
              </div>
            </div>

            <div
              style={
                styles.activitySummaryGrid
              }
            >
              <div
                style={styles.activityMetric}
              >
                <span
                  style={
                    styles.activityMetricLabel
                  }
                >
                  Today
                </span>

                <strong
                  style={
                    styles.activityMetricValue
                  }
                >
                  {todayActivityCount}
                </strong>

                <small>
                  activities
                </small>
              </div>

              <div
                style={styles.activityMetric}
              >
                <span
                  style={
                    styles.activityMetricLabel
                  }
                >
                  Last 7 Days
                </span>

                <strong
                  style={
                    styles.activityMetricValue
                  }
                >
                  {weeklyActivityCount}
                </strong>

                <small>
                  activities
                </small>
              </div>

              <div
                style={styles.activityMetric}
              >
                <span
                  style={
                    styles.activityMetricLabel
                  }
                >
                  Users
                </span>

                <strong
                  style={
                    styles.activityMetricValue
                  }
                >
                  {users.length}
                </strong>

                <small>
                  registered
                </small>
              </div>

              <div
                style={styles.activityMetric}
              >
                <span
                  style={
                    styles.activityMetricLabel
                  }
                >
                  Jobs
                </span>

                <strong
                  style={
                    styles.activityMetricValue
                  }
                >
                  {jobs.length}
                </strong>

                <small>
                  posted
                </small>
              </div>

              <div
                style={styles.activityMetric}
              >
                <span
                  style={
                    styles.activityMetricLabel
                  }
                >
                  Projects
                </span>

                <strong
                  style={
                    styles.activityMetricValue
                  }
                >
                  {projects.length}
                </strong>

                <small>
                  created
                </small>
              </div>

              <div
                style={styles.activityMetric}
              >
                <span
                  style={
                    styles.activityMetricLabel
                  }
                >
                  Payments
                </span>

                <strong
                  style={
                    styles.activityMetricValue
                  }
                >
                  {paidProjects}
                </strong>

                <small>
                  completed
                </small>
              </div>
            </div>

            <div
              style={styles.activityInfoBox}
            >
              <span>ðŸ’¡</span>

              <p>
                Activity data is generated
                automatically from the latest
                users, jobs and projects.
                Click refresh to see the
                newest platform updates.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================
            CHARTS
        ================================================== */}
        <section style={styles.chartGrid} className="chart-grid">
          {/* REVENUE */}
          <div style={styles.chartCard} className="chart-card">
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Revenue Overview
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Monthly platform revenue.
                </p>
              </div>

              <span
                style={styles.chartValue}
              >
                {formatCurrency(
                  totalRevenue
                )}
              </span>
            </div>

            <div style={styles.chartContainer}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={
                    monthlyRevenueData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7c6eff"
                    fill="#7c6eff"
                    fillOpacity={0.12}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* USER DISTRIBUTION */}
          <div style={styles.chartCard} className="chart-card">
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  User Distribution
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Users by platform role.
                </p>
              </div>
            </div>

            <div
              style={
                styles.pieChartContainer
              }
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      userRoleData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {userRoleData.map(
                      (_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#7c6eff",
                              "#8b5cf6",
                              "#a04bf0",
                              "#c084fc",
                            ][
                              index %
                                4
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.legend}>
              {userRoleData.map(
                (item, index) => (
                  <div
                    key={item.name}
                    style={styles.legendItem}
                  >
                    <span
                      style={{
                        ...styles.legendDot,
                        background:
                          [
                            "#6366f1",
                            "#0ea5e9",
                            "#10b981",
                            "#f59e0b",
                          ][
                            index % 4
                          ],
                      }}
                    ></span>

                    <span>
                      {item.name}
                    </span>

                    <strong>
                      {item.value}
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* STATUS CHARTS */}
        <section style={styles.chartGrid} className="chart-grid">
          <div style={styles.chartCard} className="chart-card">
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Job Status
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Current job distribution.
                </p>
              </div>
            </div>

            <div style={styles.chartContainer}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    jobStatusData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#7c6eff"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartCard} className="chart-card">
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Project Status
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Current project distribution.
                </p>
              </div>
            </div>

            <div style={styles.chartContainer}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    projectStatusData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#a04bf0"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ==================================================
            USERS
        ================================================== */}
        <section
          id="users-section"
          style={styles.tableCard}
          className="table-card"
        >
          <div style={styles.tableHeader} className="table-header">
            <div>
              <h2 style={styles.sectionTitle}>
                All Users
              </h2>

              <p
                style={
                  styles.sectionSubtitle
                }
              >
                Manage all registered
                SkillHire users.
              </p>
            </div>

            <div
              style={
                styles.filterContainer
              }
              className="filter-container"
            >
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) =>
                  setUserSearch(
                    e.target.value
                  )
                }
                style={styles.searchInput}
              />

              <select
                value={
                  userRoleFilter
                }
                onChange={(e) =>
                  setUserRoleFilter(
                    e.target.value
                  )
                }
                style={styles.filterSelect}
              >
                <option value="all">
                  All Roles
                </option>

                <option value="freelancer">
                  Freelancer
                </option>

                <option value="client">
                  Client
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>
            </div>
          </div>

          <div
            style={styles.tableWrapper}
            className="table-wrapper"
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={
                        styles.emptyTable
                      }
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(
                    (user) => (
                      <tr key={user.id}>
                        <td>
                          <div
                            style={
                              styles.userCell
                            }
                          >
                            <div
                              style={
                                styles.tableAvatar
                              }
                            >
                              {getUserName(
                                user
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <strong>
                              {getUserName(
                                user
                              )}
                            </strong>
                          </div>
                        </td>

                        <td>
                          {user.email ||
                            "N/A"}
                        </td>

<td>
                          <span
                            style={
                              styles.roleBadge
                            }
                          >
                            {getRole(
                              user
                            )}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            user.created_at
                          )}
                        </td>

                        <td>
                          <div
                            style={
                              styles.actionButtons
                            }
                          >
                            <button
                              style={
                                styles.viewButton
                              }
                              onClick={() =>
                                handleViewUser(
                                  user
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              className="delete-button"
                              style={
                                styles.deleteButton
                              }
                              disabled={
                                deletingUserId ===
                                user.id
                              }
                              onClick={() =>
                                handleDeleteUser(
                                  user.id
                                )
                              }
                            >
                              {deletingUserId ===
                              user.id
                                ? "..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={userPage}
            totalPages={
              userTotalPages
            }
            onPageChange={
              setUserPage
            }
          />
        </section>

        {/* ==================================================
            JOBS
        ================================================== */}
        <section
          id="jobs-section"
          style={styles.tableCard}
          className="table-card"
        >
          <div style={styles.tableHeader} className="table-header">
            <div>
              <h2 style={styles.sectionTitle}>
                Jobs Management
              </h2>

              <p
                style={
                  styles.sectionSubtitle
                }
              >
                Monitor and manage all
                posted jobs.
              </p>
            </div>

            <div
              style={
                styles.filterContainer
              }
              className="filter-container"
            >
              <input
                type="text"
                placeholder="Search jobs..."
                value={jobSearch}
                onChange={(e) =>
                  setJobSearch(
                    e.target.value
                  )
                }
                style={styles.searchInput}
              />

              <select
                value={
                  jobStatusFilter
                }
                onChange={(e) =>
                  setJobStatusFilter(
                    e.target.value
                  )
                }
                style={styles.filterSelect}
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>
          </div>

          <div
            style={styles.tableWrapper}
            className="table-wrapper"
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedJobs.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={
                        styles.emptyTable
                      }
                    >
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map(
                    (job) => (
                      <tr key={job.id}>
                        <td>
                          <div
                            style={
                              styles.jobCell
                            }
                          >
                            <strong>
                              {getJobTitle(
                                job
                              )}
                            </strong>

                            <span>
                              {job.location ||
                                "Remote"}
                            </span>
                          </div>
                        </td>

                        <td>
                          {job.category ||
                            "General"}
                        </td>

                        <td>
                          {formatCurrency(
                            job.budget
                          )}
                        </td>

                        <td>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...styles[
                                `status_${getStatus(
                                  job
                                )}`
                              ],
                            }}
                          >
                            {getStatus(
                              job
                            ).replace(
                              "_",
                              " "
                            )}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            job.created_at
                          )}
                        </td>

                        <td>
                          <div
                            style={
                              styles.actionButtons
                            }
                          >
                            <button
                              className="view-button"
                              style={
                                styles.viewButton
                              }
                              onClick={() =>
                                handleViewJob(
                                  job
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              className="delete-button"
                              style={
                                styles.deleteButton
                              }
                              disabled={
                                deletingJobId ===
                                job.id
                              }
                              onClick={() =>
                                handleDeleteJob(
                                  job.id
                                )
                              }
                            >
                              {deletingJobId ===
                              job.id
                                ? "..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={jobPage}
            totalPages={
              jobTotalPages
            }
            onPageChange={
              setJobPage
            }
          />
        </section>

        {/* ==================================================
            PROJECTS
        ================================================== */}
        <section
          id="projects-section"
          style={styles.tableCard}
          className="table-card"
        >
          <div style={styles.tableHeader} className="table-header">
            <div>
              <h2 style={styles.sectionTitle}>
                Projects Management
              </h2>

              <p
                style={
                  styles.sectionSubtitle
                }
              >
                Monitor client projects,
                payments and progress.
              </p>
            </div>

            <div
              style={
                styles.filterContainer
              }
              className="filter-container"
            >
              <input
                type="text"
                placeholder="Search projects..."
                value={
                  projectSearch
                }
                onChange={(e) =>
                  setProjectSearch(
                    e.target.value
                  )
                }
                style={styles.searchInput}
              />

              <select
                value={
                  projectStatusFilter
                }
                onChange={(e) =>
                  setProjectStatusFilter(
                    e.target.value
                  )
                }
                style={styles.filterSelect}
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <select
                value={
                  projectPaymentFilter
                }
                onChange={(e) =>
                  setProjectPaymentFilter(
                    e.target.value
                  )
                }
                style={styles.filterSelect}
              >
                <option value="all">
                  All Payments
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="pending">
                  Pending
                </option>
              </select>
            </div>
          </div>

          <div
            style={styles.tableWrapper}
            className="table-wrapper"
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Budget</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedProjects.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={
                        styles.emptyTable
                      }
                    >
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map(
                    (project) => {
                      const paymentStatus =
                        String(
                          project?.payment_status ||
                            "pending"
                        ).toLowerCase();

                      return (
                        <tr
                          key={project.id}
                        >
                          <td>
                            <div
                              style={
                                styles.jobCell
                              }
                            >
                              <strong>
                                {getProjectTitle(
                                  project
                                )}
                              </strong>

                              <span>
                                Project #
                                {
                                  project.id
                                }
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...styles[
                                  `status_${getStatus(
                                    project
                                  )}`
                                ],
                              }}
                            >
                              {getStatus(
                                project
                              ).replace(
                                "_",
                                " "
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(paymentStatus ===
                                "paid"
                                  ? styles.status_paid
                                  : styles.status_pending),
                              }}
                            >
                              {paymentStatus}
                            </span>
                          </td>

                          <td>
                            {formatCurrency(
                              project?.budget ||
                                project?.amount ||
                                project?.job
                                  ?.budget ||
                                0
                            )}
                          </td>

                          <td>
                            {formatDate(
                              project.created_at
                            )}
                          </td>

                          <td>
                            <button
                              className="view-button"
                              style={
                                styles.viewButton
                              }
                              onClick={() =>
                                handleViewProject(
                                  project
                                )
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={
              projectPage
            }
            totalPages={
              projectTotalPages
            }
            onPageChange={
              setProjectPage
            }
          />
        </section>
      </main>

      {/* ==================================================
          USER DETAIL MODAL
      ================================================== */}
      {showDetail &&
        detailUser && (
          <div
            style={styles.modalOverlay}
            onClick={() =>
              setShowDetail(false)
            }
          >
            <div
              style={styles.modal}
              className="admin-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div
                style={
                  styles.modalHeader
                }
              >
                <div>
                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    User Details
                  </h2>

                  <p
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Account information
                  </p>
                </div>

                <button
                  style={
                    styles.closeButton
                  }
                  onClick={() =>
                    setShowDetail(false)
                  }
                >
                  ×
                </button>
              </div>

              <div
                style={
                  styles.modalProfile
                }
              >
                <div
                  style={
                    styles.modalAvatar
                  }
                >
                  {getUserName(
                    detailUser
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {getUserName(
                      detailUser
                    )}
                  </h3>

                  <span
                    style={
                      styles.roleBadge
                    }
                  >
                    {getRole(
                      detailUser
                    )}
                  </span>
                </div>
              </div>

              <div
                style={
                  styles.detailGrid
                }
              >
                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Email
                  </span>

                  <strong>
                    {detailUser.email ||
                      "N/A"}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    User ID
                  </span>

                  <strong>
                    #{detailUser.id}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Role
                  </span>

                  <strong>
                    {getRole(
                      detailUser
                    )}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Joined
                  </span>

                  <strong>
                    {formatDateTime(
                      detailUser.created_at
                    )}
                  </strong>
                </div>
              </div>

              <div
                style={
                  styles.modalFooter
                }
              >
                <button
                  className="secondary-button"
                  style={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setShowDetail(false)
                  }
                >
                  Close
                </button>

                <button
                  className="delete-button-large"
                  style={
                    styles.deleteButtonLarge
                  }
                  onClick={() => {
                    setShowDetail(
                      false
                    );
                    handleDeleteUser(
                      detailUser.id
                    );
                  }}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ==================================================
          JOB DETAIL MODAL
      ================================================== */}
      {showJobDetail &&
        detailJob && (
          <div
            style={styles.modalOverlay}
            onClick={() =>
              setShowJobDetail(false)
            }
          >
            <div
              style={styles.modal}
              className="admin-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div
                style={
                  styles.modalHeader
                }
              >
                <div>
                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    Job Details
                  </h2>

                  <p
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Complete job information
                  </p>
                </div>

                <button
                  style={
                    styles.closeButton
                  }
                  onClick={() =>
                    setShowJobDetail(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              <div
                style={
                  styles.detailHero
                }
              >
                <div
                  style={
                    styles.detailHeroIcon
                  }
                >
                  ▤
                </div>

                <div>
                  <h3>
                    {getJobTitle(
                      detailJob
                    )}
                  </h3>

                  <span>
                    Job #{detailJob.id}
                  </span>
                </div>
              </div>

              <div
                style={
                  styles.detailGrid
                }
              >
                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Category
                  </span>

                  <strong>
                    {detailJob.category ||
                      "General"}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Budget
                  </span>

                  <strong>
                    {formatCurrency(
                      detailJob.budget
                    )}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Location
                  </span>

                  <strong>
                    {detailJob.location ||
                      "Remote"}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Status
                  </span>

                  <strong>
                    {getStatus(
                      detailJob
                    )}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Posted
                  </span>

                  <strong>
                    {formatDateTime(
                      detailJob.created_at
                    )}
                  </strong>
                </div>
              </div>

              <div
                style={
                  styles.descriptionBox
                }
              >
                <span>
                  Description
                </span>

                <p>
                  {detailJob.description ||
                    "No description available."}
                </p>
              </div>

              <div
                style={
                  styles.modalFooter
                }
              >
                <button
                  className="secondary-button"
                  style={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setShowJobDetail(
                      false
                    )
                  }
                >
                  Close
                </button>

                <button
                  className="delete-button-large"
                  style={
                    styles.deleteButtonLarge
                  }
                  onClick={() => {
                    setShowJobDetail(
                      false
                    );
                    handleDeleteJob(
                      detailJob.id
                    );
                  }}
                >
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ==================================================
          PROJECT DETAIL MODAL
      ================================================== */}
      {showProjectDetail &&
        detailProject && (
          <div
            style={styles.modalOverlay}
            onClick={() =>
              setShowProjectDetail(
                false
              )
            }
          >
            <div
              style={styles.modal}
              className="admin-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div
                style={
                  styles.modalHeader
                }
              >
                <div>
                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    Project Details
                  </h2>

                  <p
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Project and payment
                    information
                  </p>
                </div>

                <button
                  style={
                    styles.closeButton
                  }
                  onClick={() =>
                    setShowProjectDetail(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              <div
                style={
                  styles.detailHero
                }
              >
                <div
                  style={{
                    ...styles.detailHeroIcon,
                    background:
                      "rgba(16, 185, 129, 0.12)",
                  }}
                >
                  ▣
                </div>

                <div>
                  <h3>
                    {getProjectTitle(
                      detailProject
                    )}
                  </h3>

                  <span>
                    Project #
                    {detailProject.id}
                  </span>
                </div>
              </div>

              <div
                style={
                  styles.detailGrid
                }
              >
                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Status
                  </span>

                  <strong>
                    {getStatus(
                      detailProject
                    )}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Payment
                  </span>

                  <strong>
                    {String(
                      detailProject?.payment_status ||
                        "pending"
                    ).toLowerCase()}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Budget
                  </span>

                  <strong>
                    {formatCurrency(
                      detailProject?.budget ||
                        detailProject?.amount ||
                        detailProject?.job
                          ?.budget ||
                        0
                    )}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Client
                  </span>

                  <strong>
                    {detailProject?.client
                      ?.name ||
                      detailProject?.client_name ||
                      "N/A"}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Freelancer
                  </span>

                  <strong>
                    {detailProject
                      ?.freelancer
                      ?.name ||
                      detailProject?.freelancer_name ||
                      "N/A"}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailItem
                  }
                >
                  <span>
                    Created
                  </span>

                  <strong>
                    {formatDateTime(
                      detailProject.created_at
                    )}
                  </strong>
                </div>
              </div>

              <div
                style={
                  styles.descriptionBox
                }
              >
                <span>
                  Description
                </span>

                <p>
                  {detailProject?.job
                    ?.description ||
                    detailProject?.description ||
                    "No description available."}
                </p>
              </div>

              <div
                style={
                  styles.modalFooter
                }
              >
                <button
                  className="secondary-button"
                  style={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setShowProjectDetail(
                      false
                    )
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ==================================================
          RESPONSIVE STYLES
      ================================================== */}
      <style>{`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family:
      "Plus Jakarta Sans",
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    background: #f3f1fb;
  }

  button,
  input,
  select {
    font-family: inherit;
  }

  button {
    cursor: pointer;
  }

  /* =========================================
     PREMIUM POLISH
  ========================================= */

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes adminFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .admin-sidebar {
    overflow: hidden;
  }

  .admin-sidebar::before {
    content: "";
    position: absolute;
    top: -90px;
    left: -80px;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(129, 140, 248, 0.22), transparent 65%);
    pointer-events: none;
  }

  .admin-sidebar::after {
    content: "";
    position: absolute;
    bottom: -100px;
    right: -90px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 65%);
    pointer-events: none;
  }

  .admin-sidebar > * { position: relative; z-index: 1; }

  .logo-area {
    border-bottom-color: rgba(255, 255, 255, 0.1) !important;
  }

  .sidebar-nav button,
  .sidebar-bottom button {
    transition: all 0.22s ease;
  }

  .sidebar-nav button:hover,
  .sidebar-bottom button:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
    transform: translateX(3px);
  }

  .stat-card,
  .quick-card,
  .activity-card,
  .activity-summary-card,
  .chart-card,
  .table-card {
    animation: adminFadeUp 0.45s ease both;
  }

  .stat-card:nth-child(1) { animation-delay: 0.05s; }
  .stat-card:nth-child(2) { animation-delay: 0.1s; }
  .stat-card:nth-child(3) { animation-delay: 0.15s; }
  .stat-card:nth-child(4) { animation-delay: 0.2s; }

  .stat-card,
  .quick-card,
  .activity-card,
  .activity-summary-card,
  .chart-card,
  .table-card,
  .admin-modal {
    transition: all 0.25s ease;
  }

  .stat-card:hover,
  .quick-card:hover,
  .chart-card:hover,
  .table-card:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 16px 40px rgba(124, 110, 255, 0.14) !important;
    border-color: #ddd6fe !important;
  }

  .activity-card:hover,
  .activity-summary-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 34px rgba(124, 110, 255, 0.12) !important;
    border-color: #ddd6fe !important;
  }

  .refresh-button {
    transition: all 0.22s ease;
  }

  .refresh-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 26px rgba(124, 110, 255, 0.4) !important;
  }

  .view-button:hover,
  .delete-button:hover,
  .page-button:hover,
  .number-button:hover,
  .close-button:hover,
  .secondary-button:hover,
  .delete-button-large:hover {
    transform: translateY(-1px);
  }

  .view-button:hover { box-shadow: 0 6px 14px rgba(124, 110, 255, 0.25) !important; border-color: #7c6eff !important; }
  .delete-button:hover { box-shadow: 0 6px 14px rgba(225, 29, 72, 0.2) !important; border-color: #e11d48 !important; }
  .delete-button-large:hover { box-shadow: 0 8px 18px rgba(225, 29, 72, 0.3) !important; transform: translateY(-2px); }

  .admin-modal {
    animation: adminFadeUp 0.35s ease both;
  }

  .page-title {
    background: linear-gradient(90deg, #1b1e3f, #6d5ef2 55%, #a04bf0);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    width: fit-content;
  }

  #users-section,
  #jobs-section,
  #projects-section {
    scroll-margin-top: 20px;
  }

  /* ---------- SIDEBAR LABELS ---------- */
  .sidebar-label {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.42);
    padding: 18px 13px 8px;
  }

  .sidebar-bottom .sidebar-label {
    padding-top: 10px;
  }

  /* ---------- STAT TILES ---------- */
  .stat-tile {
    border-radius: 14px !important;
    color: #fff !important;
    font-weight: 800 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 18px rgba(124, 110, 255, 0.28);
  }
  .st-u { background: linear-gradient(135deg, #7c6eff, #5a4bcf) !important; box-shadow: 0 8px 18px rgba(124, 110, 255, 0.3) !important; }
  .st-j { background: linear-gradient(135deg, #38bdf8, #0284c7) !important; box-shadow: 0 8px 18px rgba(2, 132, 199, 0.28) !important; }
  .st-p { background: linear-gradient(135deg, #34d399, #059669) !important; box-shadow: 0 8px 18px rgba(5, 150, 105, 0.28) !important; }
  .st-r { background: linear-gradient(135deg, #fbbf24, #d97706) !important; box-shadow: 0 8px 18px rgba(217, 119, 6, 0.3) !important; }
  .stat-tile:hover { transform: scale(1.06) rotate(-3deg); }

  /* ---------- QUICK TILES ---------- */
  .q-tile {
    border-radius: 11px !important;
    color: #fff !important;
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.16);
    transition: all 0.2s ease;
  }
  .q-s { background: linear-gradient(135deg, #34d399, #059669) !important; box-shadow: 0 6px 14px rgba(5, 150, 105, 0.3) !important; }
  .q-b { background: linear-gradient(135deg, #60a5fa, #2563eb) !important; box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3) !important; }
  .q-w { background: linear-gradient(135deg, #fbbf24, #d97706) !important; box-shadow: 0 6px 14px rgba(217, 119, 6, 0.3) !important; }
  .q-p { background: linear-gradient(135deg, #a78bfa, #7c3aed) !important; box-shadow: 0 6px 14px rgba(124, 58, 237, 0.3) !important; }
  .quick-card:hover .q-tile { transform: scale(1.12) rotate(6deg); }

  /* ---------- LIVE DOT PULSE ---------- */
  .live-badge > span {
    animation: livePulse 1.5s ease-in-out infinite;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
    50% { opacity: 0.6; box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
  }

  /* ---------- TABLE POLISH ---------- */
  .table-card table tbody tr {
    transition: background 0.18s ease;
  }
  .table-card table thead th {
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 10px;
    color: #6d5ef2 !important;
    border-bottom: 2px solid #ece8f6 !important;
    padding: 10px 10px !important;
  }
  .table-card table tbody td {
    padding: 12px 10px !important;
    font-size: 11px;
  }
  .table-card table tbody tr:hover {
    background: #faf8ff !important;
  }

  /* ---------- FLOATING GLASS TOPBAR ---------- */
  .topbar {
    position: sticky;
    top: 12px;
    z-index: 40;
    background: rgba(255, 255, 255, 0.82) !important;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(124, 110, 255, 0.16);
    border-radius: 18px;
    padding: 15px 20px;
    margin-bottom: 25px;
    box-shadow: 0 12px 32px rgba(31, 38, 135, 0.1);
  }

  /* =========================================
     LARGE DESKTOP
  ========================================= */

  @media (min-width: 1400px) {
    .admin-main {
      max-width: 1700px;
    }
  }

  /* =========================================
     TABLET / SMALL LAPTOP
  ========================================= */

  @media (max-width: 1100px) {
    .admin-sidebar {
      width: 210px !important;
    }

    .admin-main {
      margin-left: 210px !important;
    }

    .stats-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
    }

    .quick-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
    }

    .chart-grid {
      grid-template-columns: 1fr !important;
    }

    .activity-grid {
      grid-template-columns:
        minmax(0, 1.3fr)
        minmax(260px, 0.7fr) !important;
    }
  }

  /* =========================================
     TABLET
  ========================================= */

  @media (max-width: 900px) {
    .admin-page {
      display: block !important;
    }

    .admin-sidebar {
      position: relative !important;
      width: 100% !important;
      height: auto !important;
      min-height: auto !important;
      padding: 15px 18px !important;
    }

    .admin-main {
      margin-left: 0 !important;
      width: 100% !important;
      padding: 22px !important;
    }

    .logo-area {
      padding-bottom: 15px !important;
    }

    .admin-profile {
      padding: 14px 8px !important;
    }

    .sidebar-nav {
      flex-direction: row !important;
      overflow-x: auto !important;
      padding-bottom: 4px;
      scrollbar-width: thin;
    }

    .sidebar-nav button {
      min-width: max-content;
      width: auto !important;
    }

    .sidebar-bottom {
      margin-top: 10px !important;
      flex-direction: row !important;
    }

    .sidebar-bottom button {
      width: auto !important;
      flex: 1;
    }

    .activity-grid {
      grid-template-columns: 1fr !important;
    }

    .chart-grid {
      grid-template-columns: 1fr !important;
    }

    .stats-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
    }

    .quick-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
    }

    .table-header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }

    .filter-container {
      width: 100% !important;
      display: grid !important;
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .filter-container input,
    .filter-container select {
      width: 100% !important;
    }

    .table-wrapper {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
    }
  }

  /* =========================================
     MOBILE
  ========================================= */

  @media (max-width: 650px) {
    .admin-sidebar {
      padding: 13px !important;
    }

    .admin-main {
      padding: 15px !important;
    }

    .logo-area {
      padding: 0 5px 13px !important;
    }

    .logo-icon {
      width: 38px !important;
      height: 38px !important;
    }

    .admin-profile {
      padding: 12px 5px !important;
    }

    .sidebar-nav {
      gap: 4px !important;
    }

    .sidebar-nav button {
      padding: 9px 11px !important;
      font-size: 11px !important;
    }

    .sidebar-bottom {
      gap: 5px !important;
    }

    .sidebar-bottom button {
      padding: 9px 10px !important;
      font-size: 11px !important;
    }

    /* TOPBAR */

    .topbar {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 14px !important;
    }

    .page-title {
      font-size: 23px !important;
    }

    .page-subtitle {
      font-size: 11px !important;
      line-height: 1.5;
    }

    .refresh-button {
      width: 100% !important;
      justify-content: center;
    }

    /* STATS */

    .stats-grid {
      grid-template-columns: 1fr !important;
      gap: 10px !important;
    }

    .stat-card {
      padding: 15px !important;
    }

    .stat-value {
      font-size: 21px !important;
    }

    /* QUICK STATS */

    .quick-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
    }

    .quick-card {
      padding: 12px !important;
      gap: 8px !important;
    }

    .quick-card strong {
      font-size: 17px !important;
    }

    .quick-card span {
      font-size: 9px !important;
    }

    /* ACTIVITY */

    .activity-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }

    .activity-card,
    .activity-summary-card {
      padding: 15px !important;
    }

    .activity-top {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
    }

    .activity-description {
      max-width: 100% !important;
    }

    .activity-bottom {
      flex-wrap: wrap !important;
    }

    .activity-view-button {
      margin-left: 0 !important;
    }

    .activity-summary-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
    }

    /* CHARTS */

    .chart-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }

    .chart-card {
      padding: 15px !important;
    }

    .chart-container {
      height: 240px !important;
    }

    .pie-chart-container {
      height: 210px !important;
    }

    /* TABLES */

    .table-card {
      padding: 15px !important;
      margin-bottom: 14px !important;
    }

    .table-header {
      gap: 13px !important;
    }

    .filter-container {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      gap: 7px !important;
    }

    .search-input,
    .filter-select {
      width: 100% !important;
    }

    .table {
      min-width: 700px !important;
    }

    /* PAGINATION */

    .pagination {
      flex-wrap: wrap !important;
      gap: 5px !important;
    }

    .page-button {
      font-size: 9px !important;
      padding: 7px 8px !important;
    }

    /* MODAL */

    .modal-overlay {
      padding: 12px !important;
    }

    .modal {
      width: 100% !important;
      max-height: 92vh !important;
      overflow-y: auto !important;
      padding: 17px !important;
      border-radius: 15px !important;
    }

    .modal-title {
      font-size: 16px !important;
    }

    .detail-grid {
      grid-template-columns: 1fr !important;
    }

    .modal-footer {
      flex-direction: column-reverse !important;
    }

    .modal-footer button {
      width: 100% !important;
    }
  }

  /* =========================================
     VERY SMALL MOBILE
  ========================================= */

  @media (max-width: 400px) {
    .admin-main {
      padding: 11px !important;
    }

    .quick-grid {
      grid-template-columns: 1fr !important;
    }

    .activity-summary-grid {
      grid-template-columns: 1fr 1fr !important;
    }

    .activity-item {
      gap: 9px !important;
    }

    .activity-icon {
      width: 34px !important;
      height: 34px !important;
      font-size: 13px !important;
    }

    .activity-title {
      font-size: 11px !important;
    }

    .activity-description {
      font-size: 11px !important;
    }

    .section-title {
      font-size: 14px !important;
    }

    .section-subtitle {
      font-size: 10px !important;
    }
  }
`}</style>
    </div>
  );
};

export default AdminDashboard;
