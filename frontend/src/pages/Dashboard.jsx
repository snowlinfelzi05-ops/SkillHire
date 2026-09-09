import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { toast } from "../utils/toast";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const userRole = (user?.role || user?.user_type || "").toLowerCase();
  const isClient = userRole === "client";
  const isAdmin = userRole === "admin";
  const isFreelancer = !isClient && !isAdmin;

  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastUnreadRef = useRef(0);

  useEffect(() => { lastUnreadRef.current = unreadCount; }, [unreadCount]);

  const [introLeaving, setIntroLeaving] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  useEffect(() => {
    const fade = setTimeout(() => setIntroLeaving(true), 4000);
    const remove = setTimeout(() => setIntroGone(true), 4550);
    return () => { clearTimeout(fade); clearTimeout(remove); };
  }, []);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    Promise.allSettled([fetchMyJobs(), fetchMyProposals(), fetchMyProjects(), fetchNotifications()]);
  }, []);

  const getHeaders = () => ({ Accept: "application/json", Authorization: `Bearer ${token}` });
  const getArray = (data, key) => {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await fetch(`${API_URL}/notifications?t=${Date.now()}`, { headers: getHeaders(), cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return;
      const notificationData = getArray(data, "notifications");
      setNotifications(notificationData);
      const unread = notificationData.filter((n) => n.is_read === false || n.is_read === 0 || n.read_at === null).length;
      setUnreadCount(unread);
    } catch (e) { console.error(e); } finally { setNotificationLoading(false); }
  };

  useEffect(() => {
    if (!token) return;
    const pollNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications/unread-count?t=${Date.now()}`, { headers: getHeaders(), cache: "no-store" });
        const data = await response.json();
        if (!response.ok) return;
        const count = Number(data?.unread_count ?? 0);
        if (count > lastUnreadRef.current) {
          lastUnreadRef.current = count;
          toast("You have a new notification", "info");
          fetchNotifications();
        }
      } catch { /* silent poll */ }
    };
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const isNotificationUnread = (notification) => notification.is_read === false || notification.is_read === 0 || notification.read_at === null;

  const markAsRead = async (notificationId) => {
    try {
      const notification = notifications.find((item) => item.id === notificationId);
      if (!notification || !isNotificationUnread(notification)) return;
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, { method: "PUT", headers: { ...getHeaders(), "Content-Type": "application/json" } });
      if (!response.ok) return;
      setNotifications((prev) => prev.map((item) => item.id === notificationId ? { ...item, is_read: true, read_at: new Date().toISOString() } : item));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, { method: "PUT", headers: { ...getHeaders(), "Content-Type": "application/json" } });
      if (!response.ok) return;
      const readTime = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || readTime })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const notification = notifications.find((item) => item.id === notificationId);
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, { method: "DELETE", headers: getHeaders() });
      if (!response.ok) return;
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      if (notification && isNotificationUnread(notification)) setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (e) { console.error(e); }
  };

  const formatNotificationTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Just now";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (notification) => {
    const type = (notification?.type || "").toLowerCase();
    if (type.includes("proposal")) return "📩";
    if (type.includes("success") || type.includes("accepted")) return "✅";
    if (type.includes("payment")) return "💰";
    if (type.includes("review")) return "⭐";
    return "🔔";
  };

  const openNotification = async (notification) => {
    if (isNotificationUnread(notification)) await markAsRead(notification.id);
    setShowNotifications(false);
    const type = (notification?.reference_type || "").toLowerCase();
    const id = notification?.reference_id;
    if (type === "project" && id) return navigate(`/projects/${id}`);
    if (type === "job" && id) return navigate(`/jobs/${id}`);
    if (type === "proposal") return navigate("/my-proposals");
    if (type === "payment") return navigate("/my-projects");
    if (type === "project") return navigate("/my-projects");
    if (type === "job") return navigate("/jobs");
  };

  const fetchMyJobs = async () => {
    try {
      setLoadingJobs(true);
      const endpoint = isClient ? "my-jobs" : "jobs";
      const response = await fetch(`${API_URL}/${endpoint}?t=${Date.now()}`, { headers: getHeaders(), cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return;
      setJobs(getArray(data, "jobs"));
    } catch (e) { console.error(e); } finally { setLoadingJobs(false); }
  };

  const fetchMyProposals = async () => {
    try {
      const endpoint = isClient || isAdmin ? "proposals/received" : "proposals";
      const response = await fetch(`${API_URL}/${endpoint}?t=${Date.now()}`, { headers: getHeaders(), cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return;
      setProposals(getArray(data, "proposals"));
    } catch (e) { console.error(e); }
  };

  const fetchMyProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects?t=${Date.now()}`, { headers: getHeaders(), cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return;
      setProjects(getArray(data, "projects"));
    } catch (e) { console.error(e); }
  };

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };

  const go = (path) => { setMobileMenuOpen(false); navigate(path); };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out SkillHire — Hire Smarter. Build Faster.\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return jobs;
    return jobs.filter((job) => {
      const title = job.title?.toLowerCase() || "";
      const description = job.description?.toLowerCase() || "";
      const skills = Array.isArray(job.skills) ? job.skills.join(" ").toLowerCase() : String(job.skills || "").toLowerCase();
      return title.includes(query) || description.includes(query) || skills.includes(query);
    });
  }, [jobs, searchQuery]);

  const completedProjects = projects.filter((p) => String(p.status || "").toLowerCase() === "completed").length;
  const activeProjects = projects.filter((p) => ["active", "in_progress", "ongoing"].includes(String(p.status || "").toLowerCase())).length;
  const pendingProposals = proposals.filter((p) => String(p.status || "").toLowerCase() === "pending").length;
  const acceptedProposals = proposals.filter((p) => ["accepted", "approved"].includes(String(p.status || "").toLowerCase())).length;
  const rejectedProposals = proposals.filter((p) => ["rejected", "declined"].includes(String(p.status || "").toLowerCase())).length;

  const estimatedRevenue = proposals.reduce((sum, p) => sum + (Number(p.budget) || Number(p.job?.budget) || Number(p.project?.budget) || 0), 0) + projects.reduce((sum, p) => sum + (Number(p.budget) || Number(p.value) || 0), 0);
  const formatINR = (value) => Number(value || 0).toLocaleString("en-IN");
  const chartBars = [36, 48, 42, 62, 54, 74, 88];
  const cmdMetrics = isAdmin ? [
    { key: "revenue", icon: "💰", label: "Total Revenue", value: `₹${formatINR(estimatedRevenue)}`, hint: "+12% this month" },
    { key: "users", icon: "👥", label: "New Users", value: String(jobs.length + proposals.length), hint: "Active on platform" },
    { key: "approvals", icon: "⏳", label: "Pending Approvals", value: String(pendingProposals), hint: "Awaiting review" },
  ] : isClient ? [
    { key: "revenue", icon: "💰", label: "Total Spend", value: `₹${formatINR(estimatedRevenue)}`, hint: "Across all proposals" },
    { key: "users", icon: "👥", label: "New Applications", value: String(proposals.length), hint: `${pendingProposals} pending` },
    { key: "approvals", icon: "⏳", label: "Pending Approvals", value: String(pendingProposals), hint: "Awaiting your review" },
  ] : [
    { key: "revenue", icon: "💰", label: "Earnings", value: `₹${formatINR(estimatedRevenue)}`, hint: "Across your bids" },
    { key: "users", icon: "👥", label: "Applications", value: String(proposals.length), hint: `${pendingProposals} in review` },
    { key: "approvals", icon: "⏳", label: "Active Work", value: String(activeProjects), hint: "Projects in progress" },
  ];
  const ccEyebrow = isAdmin ? "Admin Command Center" : isClient ? "Client Command Center" : "Freelancer Command Center";
  const ccTitle = isAdmin ? (<><span>Platform</span> Command Center</>) : (<><span>Your</span> Command Center</>);
  const ccSub = isAdmin ? "Revenue, growth and approvals — everything across SkillHire, at a glance." : isClient ? "Your hiring pipeline and project health, at a glance." : "Your applications, active work and earnings, at a glance.";
  const chartLabel = isAdmin ? "Growth" : "Activity";

  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    const fields = [user.name, user.email, user.headline, user.bio, user.skills, user.experience, user.portfolio_url];
    const completed = fields.filter((f) => f !== null && f !== undefined && String(f).trim() !== "" && !(Array.isArray(f) && f.length === 0)).length;
    return Math.min(Math.round((completed / fields.length) * 100), 100);
  }, [user]);

  const recentJobs = filteredJobs.slice(0, 5);
  const recentProjects = [...projects].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)).slice(0, 4);
  const recentProposals = [...proposals].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)).slice(0, 4);

  const getStatusClass = (status) => {
    const v = String(status || "pending").toLowerCase();
    if (["completed", "accepted", "approved", "paid"].includes(v)) return "status-success";
    if (["active", "open", "in_progress", "ongoing"].includes(v)) return "status-primary";
    if (["rejected", "declined", "closed", "cancelled"].includes(v)) return "status-danger";
    return "status-warning";
  };

  const getProjectProgress = (project) => {
    const progress = Number(project?.progress ?? project?.completion_percentage ?? project?.percentage ?? 0);
    if (progress > 0) return Math.min(progress, 100);
    const status = String(project?.status || "").toLowerCase();
    if (status === "completed") return 100;
    if (status === "active" || status === "ongoing") return 60;
    if (status === "in_progress") return 45;
    return 15;
  };

  const quickActions = isClient ? [
    { title: "Post a Job", description: "Find the right freelancer", icon: "＋", action: () => navigate("/post-job") },
    { title: "My Jobs", description: "Manage your job posts", icon: "▣", action: () => navigate("/jobs") },
    { title: "Proposals", description: "Review freelancer proposals", icon: "✉", action: () => navigate("/my-proposals") },
    { title: "Projects", description: "Track active projects", icon: "▤", action: () => navigate("/my-projects") },
  ] : [
    { title: "Find Jobs", description: "Explore new opportunities", icon: "⌕", action: () => navigate("/jobs") },
    { title: "My Proposals", description: "Track your applications", icon: "✉", action: () => navigate("/my-proposals") },
    { title: "My Projects", description: "Manage your work", icon: "▤", action: () => navigate("/my-projects") },
    { title: "My Profile", description: "Improve your profile", icon: "◯", action: () => navigate("/profile") },
  ];

  return (
    <div className={`skillhire-dashboard${introGone ? " cc-revealed" : ""}`}>
      {!introGone && (
        <div className={`nl-overlay${introLeaving ? " nl-leaving" : ""}`}>
          <div className="nl-stage">
            <div className="nl-logo">S</div>
            <div className="nl-ring">{[...Array(12)].map((_, i) => (<span key={i} className="nl-dot" style={{ "--i": i }} />))}</div>
            <div className="nl-copy"><div className="nl-name">SkillHire</div><div className="nl-tagline">Hire Smarter. Build Faster.</div></div>
          </div>
        </div>
      )}
      {mobileMenuOpen && (<div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />)}
      <aside className={`skillhire-sidebar${mobileMenuOpen ? " mobile-open" : ""}`}>
        <div className="sidebar-brand" onClick={() => go("/dashboard")} style={{ cursor: "pointer" }}><div className="brand-logo">S</div><div><div className="brand-name">SkillHire</div><div className="brand-subtitle">FREELANCE PLATFORM</div></div></div>
        <div className="sidebar-label">MAIN MENU</div>
        <nav className="sidebar-nav">
          <button className="sidebar-nav-item active" onClick={() => go("/dashboard")}><span className="nav-icon">⌂</span><span>Dashboard</span></button>
          <button className="sidebar-nav-item" onClick={() => go("/jobs")}><span className="nav-icon">▣</span><span>{isClient ? "My Jobs" : "Find Jobs"}</span></button>
          <button className="sidebar-nav-item" onClick={() => go("/my-projects")}><span className="nav-icon">▤</span><span>My Projects</span></button>
          <button className="sidebar-nav-item" onClick={() => go("/my-proposals")}><span className="nav-icon">✉</span><span>{isClient ? "Proposals" : "My Proposals"}</span></button>
          {isAdmin && (<button className="sidebar-nav-item admin-nav" onClick={() => go("/admin")}><span className="nav-icon">♛</span><span>Admin Panel</span></button>)}
          <button className="sidebar-nav-item" onClick={() => go("/notifications")}><span className="nav-icon">🔔</span><span>Notifications</span>{unreadCount > 0 && (<span className="sidebar-nav-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>)}</button>
          <button className="sidebar-nav-item" onClick={() => go("/profile")}><span className="nav-icon">◯</span><span>Profile</span></button>
          <button className="sidebar-nav-item" onClick={() => go("/settings")}><span className="nav-icon">⚙</span><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user-mini"><div className="mini-avatar">{(user?.name || "U").charAt(0).toUpperCase()}</div><div className="mini-user-info"><strong>{user?.name || "User"}</strong><span>{isClient ? "Client" : isAdmin ? "Admin" : "Freelancer"}</span></div></div>
          <button className="logout-button" onClick={logout}><span>↪</span><span>Logout</span></button>
        </div>
      </aside>

      <main className="skillhire-main">
        <header className="dashboard-topbar">
          <div className="topbar-heading"><h1>Dashboard</h1><p>Welcome back, <strong>{user?.name || "User"}</strong></p></div>
          <div className="topbar-actions">
            <button className="menu-toggle" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu"><span>{mobileMenuOpen ? "✕" : "☰"}</span></button>
            <div className="dashboard-search"><span>⌕</span><input type="text" placeholder={isClient ? "Search your jobs..." : "Search jobs, skills..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />{searchQuery && (<button className="search-clear" onClick={() => setSearchQuery("")}>×</button>)}</div>
            <div className="notification-wrapper">
              <button className="notification-button" onClick={() => setShowNotifications((prev) => !prev)}><span>🔔</span>{unreadCount > 0 && (<span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>)}</button>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header"><div><h3>Notifications</h3><p>{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</p></div>{unreadCount > 0 && (<button onClick={markAllAsRead} className="mark-all-button">Mark all read</button>)}</div>
                  <div className="notification-list">
                    {notificationLoading ? (<div className="notification-empty"><div className="notification-spinner" /><p>Loading...</p></div>) : notifications.length === 0 ? (<div className="notification-empty"><div className="empty-notification-icon">🔕</div><strong>No notifications</strong><p>New activity will appear here.</p></div>) : (notifications.map((notification) => { const unread = isNotificationUnread(notification); return (<div key={notification.id} className={`notification-item ${unread ? "unread" : ""} ${notification.reference_type ? "clickable" : ""}`} onClick={() => openNotification(notification)}><div className="notification-icon">{getNotificationIcon(notification)}</div><div className="notification-content"><div className="notification-title-row"><strong>{notification.title || "Notification"}</strong>{unread && (<span className="unread-dot" />)}</div><p>{notification.message || notification.desc || "You have a new notification."}</p><div className="notification-bottom"><span>{formatNotificationTime(notification.created_at)}</span>{unread && (<button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}>Mark as read</button>)}</div></div><button className="notification-delete" title="Delete" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>×</button></div>); }))}
                  </div>
                  <div className="notification-footer"><button className="view-all-button" onClick={() => { setShowNotifications(false); navigate("/notifications"); }}>View All</button><button onClick={() => setShowNotifications(false)}>Close</button></div>
                </div>
              )}
            </div>
            <button className="wa-share-button" onClick={shareOnWhatsApp} title="Share SkillHire on WhatsApp"><span>💬</span><b>Share</b></button>
            <button className="topbar-profile" onClick={() => navigate("/profile")}><div className="topbar-avatar">{(user?.name || "U").charAt(0).toUpperCase()}</div><div className="topbar-profile-info"><strong>{user?.name || "User"}</strong><span>{isClient ? "Client" : isAdmin ? "Admin" : "Freelancer"}</span></div><span className="profile-arrow">▾</span></button>
          </div>
        </header>

        <div className="dashboard-content">
          {isAdmin && (<div className="admin-banner"><div className="admin-banner-icon">♛</div><div className="admin-banner-content"><strong>Admin Mode Active</strong><span>Manage users, projects, proposals and platform activity.</span></div><button onClick={() => navigate("/admin")}>Open Admin Panel →</button></div>)}

          <section className="cc-hero">
            <div className="cc-glow cc-glow-a" />
            <div className="cc-glow cc-glow-b" />
            <div className="cc-main">
              <div className="cc-eyebrow">{ccEyebrow}</div>
              <h2>{ccTitle}</h2>
              <p>{ccSub}</p>
              <div className="cc-metrics">
                {cmdMetrics.map((metric) => (<div key={metric.key} className="cc-metric"><div className={`cc-metric-icon ${metric.key}`}>{metric.icon}</div><div><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.hint}</small></div></div>))}
              </div>
            </div>
            <div className="cc-chart">
              <div className="cc-chart-head"><span>{chartLabel}</span><strong>▲ 24%</strong></div>
              <div className="cc-bars">{chartBars.map((b, i) => (<span key={i} className="cc-bar" style={{ height: `${b}%`, "--i": i }} />))}</div>
              <div className="cc-foot">Last 7 weeks</div>
            </div>
          </section>

          <section className="dashboard-stats">
            <div className="stat-card"><div className="stat-icon purple">▣</div><div className="stat-content"><span>{isClient ? "TOTAL JOBS" : "AVAILABLE JOBS"}</span><strong>{jobs.length}</strong><small>{isClient ? "Jobs you've posted" : "Opportunities available"}</small></div></div>
            <div className="stat-card"><div className="stat-icon blue">✉</div><div className="stat-content"><span>TOTAL PROPOSALS</span><strong>{proposals.length}</strong><small>{pendingProposals > 0 ? `${pendingProposals} pending review` : "No pending proposals"}</small></div></div>
            <div className="stat-card"><div className="stat-icon green">✓</div><div className="stat-content"><span>ACTIVE PROJECTS</span><strong>{activeProjects}</strong><small>Currently in progress</small></div></div>
            <div className="stat-card"><div className="stat-icon orange">★</div><div className="stat-content"><span>COMPLETED</span><strong>{completedProjects}</strong><small>Successfully completed</small></div></div>
          </section>

          <section className="quick-actions-section">
            <div className="section-heading"><div><h3>Quick Actions</h3><p>Get where you need to go faster.</p></div></div>
            <div className="quick-actions-grid">{quickActions.map((action, index) => (<button key={index} className="quick-action-card" onClick={action.action}><div className="quick-action-icon">{action.icon}</div><div className="quick-action-content"><strong>{action.title}</strong><span>{action.description}</span></div><span className="quick-action-arrow">→</span></button>))}</div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-panel jobs-panel">
              <div className="panel-header"><div><h3>{isClient ? "My Recent Jobs" : "Latest Opportunities"}</h3><p>{searchQuery ? `${filteredJobs.length} matching jobs` : "Recently available activity"}</p></div><button onClick={() => navigate("/jobs")}>View All →</button></div>
              {loadingJobs ? (<div className="dashboard-loading"><div className="db-eq"><span /><span /><span /><span /></div><span>Loading jobs...</span></div>) : recentJobs.length === 0 ? (<div className="dashboard-empty"><div className="empty-icon">📭</div><strong>No jobs found</strong><p>{searchQuery ? "Try different keyword." : isClient ? "Post your first job." : "New opportunities will appear here."}</p>{!searchQuery && (<button onClick={() => navigate(isClient ? "/post-job" : "/jobs")}>{isClient ? "Post a Job" : "Explore Jobs"}</button>)}</div>) : (<div className="jobs-list">{recentJobs.map((job) => (<div key={job.id} className="job-list-item" onClick={() => navigate(`/jobs/${job.id}`)}><div className="job-avatar">{(job.title || "J").charAt(0).toUpperCase()}</div><div className="job-info"><strong>{job.title || "Untitled Job"}</strong><p>{job.description?.substring(0, 90) || "No description."}</p><div className="job-meta"><span>₹{Number(job.budget || 0).toLocaleString("en-IN")}</span>{job.skills && (<span>{Array.isArray(job.skills) ? job.skills.slice(0, 2).join(" • ") : String(job.skills).substring(0, 35)}</span>)}</div></div><div className="job-right"><span className={`status-badge ${getStatusClass(job.status)}`}>{job.status || "Open"}</span><span className="job-arrow">→</span></div></div>))}</div>)}
            </div>
            <div className="dashboard-panel proposal-panel">
              <div className="panel-header"><div><h3>Proposal Overview</h3><p>Track your proposal activity</p></div><button onClick={() => navigate("/my-proposals")}>View →</button></div>
              <div className="proposal-summary">
                <div className="proposal-summary-card"><div className="proposal-summary-icon pending">⏳</div><div><span>Pending</span><strong>{pendingProposals}</strong></div></div>
                <div className="proposal-summary-card"><div className="proposal-summary-icon accepted">✓</div><div><span>Accepted</span><strong>{acceptedProposals}</strong></div></div>
                <div className="proposal-summary-card"><div className="proposal-summary-icon rejected">×</div><div><span>Rejected</span><strong>{rejectedProposals}</strong></div></div>
              </div>
              <div className="proposal-progress-section"><div className="progress-heading"><span>Success overview</span><strong>{proposals.length > 0 ? `${Math.round((acceptedProposals / proposals.length) * 100)}%` : "0%"}</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: proposals.length > 0 ? `${Math.min((acceptedProposals / proposals.length) * 100, 100)}%` : "0%" }} /></div><p>Accepted proposals out of total submissions.</p></div>
            </div>
          </section>

          <section className="dashboard-grid second-grid">
            <div className="dashboard-panel projects-panel">
              <div className="panel-header"><div><h3>Active Projects</h3><p>Keep track of ongoing work</p></div><button onClick={() => navigate("/my-projects")}>View All →</button></div>
              {recentProjects.length === 0 ? (<div className="dashboard-empty compact"><div className="empty-icon">📁</div><strong>No projects yet</strong><p>Your projects will appear here.</p><button onClick={() => navigate("/my-projects")}>View Projects</button></div>) : (<div className="project-list">{recentProjects.map((project) => { const progress = getProjectProgress(project); return (<div key={project.id} className="project-item"><div className="project-top"><div className="project-avatar">{(project.title || project.name || "P").charAt(0).toUpperCase()}</div><div className="project-info"><strong>{project.title || project.name || "Untitled Project"}</strong><span>{project.client?.name || project.user?.name || project.freelancer?.name || "Project"}</span></div><span className={`status-badge ${getStatusClass(project.status)}`}>{project.status || "Pending"}</span></div><div className="project-progress"><div className="progress-heading"><span>Progress</span><strong>{progress}%</strong></div><div className="progress-track"><div className="progress-fill project-progress-fill" style={{ width: `${progress}%` }} /></div></div></div>); })}</div>)}
            </div>
            <div className="dashboard-panel profile-panel">
              <div className="panel-header"><div><h3>Profile Strength</h3><p>Complete your profile to stand out</p></div><button onClick={() => navigate("/profile")}>Edit →</button></div>
              <div className="profile-strength"><div className="profile-progress-circle"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" className="circle-background" /><circle cx="60" cy="60" r="50" className="circle-progress" style={{ strokeDasharray: `${profileCompletion * 3.14} 314` }} /></svg><div className="circle-value"><strong>{profileCompletion}%</strong><span>Complete</span></div></div><div className="profile-strength-content"><strong>{profileCompletion >= 80 ? "Great profile!" : profileCompletion >= 50 ? "Almost there!" : "Complete your profile"}</strong><p>Add more information to improve your visibility and opportunities.</p><button onClick={() => navigate("/profile")}>Complete Profile →</button></div></div>
              <div className="profile-checklist"><div><span>{user?.name ? "✓" : "○"}</span>Basic information</div><div><span>{user?.headline ? "✓" : "○"}</span>Headline</div><div><span>{user?.bio ? "✓" : "○"}</span>Bio / Description</div><div><span>{user?.skills ? "✓" : "○"}</span>Skills</div></div>
            </div>
          </section>

          <section className="dashboard-panel recent-proposals-panel">
            <div className="panel-header"><div><h3>Recent Proposals</h3><p>Latest proposal activity</p></div><button onClick={() => navigate("/my-proposals")}>View All →</button></div>
            {recentProposals.length === 0 ? (<div className="dashboard-empty horizontal-empty"><div className="empty-icon">✉</div><div><strong>No proposals yet</strong><p>Submit proposals to jobs that match your skills.</p></div><button onClick={() => navigate("/jobs")}>Find Jobs</button></div>) : (<div className="recent-proposals-list">{recentProposals.map((proposal) => (<div key={proposal.id} className="recent-proposal-item"><div className="proposal-avatar">✉</div><div className="recent-proposal-info"><strong>{proposal.job?.title || proposal.project?.title || proposal.title || "Job Proposal"}</strong><span>{proposal.cover_letter ? proposal.cover_letter.substring(0, 75) : proposal.message ? proposal.message.substring(0, 75) : "Proposal submitted successfully."}</span></div><span className={`status-badge ${getStatusClass(proposal.status)}`}>{proposal.status || "Pending"}</span><button className="proposal-view-button" onClick={() => navigate("/my-proposals")}>View</button></div>))}</div>)}
          </section>

          {isFreelancer && (<section className="skill-match-banner"><div className="skill-match-left"><div className="skill-match-icon">✦</div><div><div className="skill-match-label">SMART SKILL MATCHING</div><h3>Find projects that match your skills</h3><p>SkillHire helps you discover relevant opportunities based on your profile.</p></div></div><div className="skill-match-score"><strong>95%</strong><span>Skill Match</span></div><button onClick={() => navigate("/jobs")}>Explore Jobs →</button></section>)}

          <section className="notification-summary-panel"><div className="notification-summary-left"><div className="notification-summary-icon">🔔</div><div><strong>{unreadCount > 0 ? `${unreadCount} new notifications` : "You're all caught up"}</strong><span>Stay updated with proposals, projects and work activity.</span></div></div><button onClick={() => setShowNotifications(true)}>View Notifications →</button></section>
        </div>
      </main>

    </div>
  );
};

export default Dashboard;

