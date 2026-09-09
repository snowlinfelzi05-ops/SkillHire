import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { toast } from "../utils/toast";
import "./Notifications.css";

const FILTERS = [
  { key: "", label: "All", icon: "🔔" },
  { key: "proposal", label: "Proposals", icon: "📩" },
  { key: "project", label: "Projects", icon: "▤" },
  { key: "job", label: "Jobs", icon: "▣" },
  { key: "payment", label: "Payments", icon: "💰" },
  { key: "review", label: "Reviews", icon: "⭐" },
  { key: "misc", label: "Other", icon: "✦" },
];

const Notifications = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [activeType, setActiveType] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [actionId, setActionId] = useState(null);

  const hasLoadedRef = useRef(false);

  const getMiscType = (notification) => {
    const type = (notification?.type || "").toLowerCase();
    if (type.includes("proposal")) return "proposal";
    if (type.includes("project")) return "project";
    if (type.includes("job")) return "job";
    if (type.includes("payment")) return "payment";
    if (type.includes("review")) return "review";
    return "misc";
  };

  const fetchNotifications = async (targetPage, type, append) => {
    try {
      if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);
      const params = new URLSearchParams({ page: String(targetPage), per_page: "20" });
      if (type) params.set("type", type === "misc" ? "other" : type);
      const response = await fetch(`${API_URL}/notifications?${params.toString()}&t=${Date.now()}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load notifications");
      const items = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications((prev) => (append ? [...prev, ...items] : items));
      setUnreadCount(Number(data.unread_count ?? 0));
      setHasMore(Boolean(data.pagination && targetPage < data.pagination.last_page));
      setPage(targetPage);
    } catch (err) {
      if (targetPage === 1) setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    setNotifications([]);
    setError("");
    fetchNotifications(1, activeType, false);
  }, [activeType]);

  const isUnread = (notification) => notification.is_read === false || notification.is_read === 0 || notification.read_at === null;

  const markAsRead = async (notificationId) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || !isUnread(notification)) return;
    setActionId(notificationId);
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, { method: "PUT", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      setNotifications((prev) => prev.map((item) => item.id === notificationId ? { ...item, is_read: true, read_at: new Date().toISOString() } : item));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (e) { /* silent */ } finally { setActionId(null); }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, { method: "PUT", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      const readTime = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || readTime })));
      setUnreadCount(0);
      toast("All notifications marked as read", "success");
    } catch (e) { /* silent */ }
  };

  const deleteNotification = async (notificationId) => {
    setActionId(notificationId);
    try {
      const notification = notifications.find((item) => item.id === notificationId);
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, { method: "DELETE", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      if (notification && isUnread(notification)) setUnreadCount((prev) => Math.max(prev - 1, 0));
      toast("Notification deleted", "info");
    } catch (e) { /* silent */ } finally { setActionId(null); }
  };

  const openNotification = async (notification) => {
    if (isUnread(notification)) await markAsRead(notification.id);
    const type = (notification?.reference_type || "").toLowerCase();
    const id = notification?.reference_id;
    if (type === "project" && id) return navigate(`/projects/${id}`);
    if (type === "job" && id) return navigate(`/jobs/${id}`);
    if (type === "proposal") return navigate("/my-proposals");
    if (type === "payment") return navigate("/my-projects");
    if (type === "project") return navigate("/my-projects");
    if (type === "job") return navigate("/jobs");
  };

  const getIcon = (notification) => {
    const type = (notification?.type || "").toLowerCase();
    if (type.includes("proposal")) return "📩";
    if (type.includes("success") || type.includes("accepted")) return "✅";
    if (type.includes("payment")) return "💰";
    if (type.includes("review")) return "⭐";
    if (type.includes("project")) return "▤";
    return "🔔";
  };

  const getIconClass = (notification) => {
    const type = (notification?.type || "").toLowerCase();
    if (type.includes("payment")) return "ntf-pay";
    if (type.includes("review")) return "ntf-review";
    if (type.includes("proposal")) return "ntf-proposal";
    if (type.includes("project")) return "ntf-project";
    return "ntf-job";
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Just now";
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };

  return (
    <div className="skillhire-dashboard">
      <aside className="dashboard-sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <span>SkillHire</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate("/dashboard")}><span>⌂</span>Dashboard</button>
          <button className="nav-item" onClick={() => navigate("/jobs")}><span>▣</span>{user?.role === "client" ? "My Jobs" : user?.role === "admin" ? "All Jobs" : "Find Jobs"}</button>
          <button className="nav-item" onClick={() => navigate("/my-projects")}><span>▤</span>My Projects</button>
          <button className="nav-item" onClick={() => navigate("/my-proposals")}><span>✉</span>{user?.role === "client" || user?.role === "admin" ? "Received Proposals" : "My Proposals"}</button>
          <button className="nav-item active"><span>🔔</span>Notifications{unreadCount > 0 && (<b className="ntf-side-badge">{unreadCount > 99 ? "99+" : unreadCount}</b>)}</button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => navigate("/profile")}><span>◯</span>Profile</button>
          <button className="nav-item" onClick={() => navigate("/settings")}><span>⚙</span>Settings</button>
          <button className="nav-item logout-nav" onClick={logout}><span>↪</span>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-body ntf-body">
          <header className="ntf-header">
            <div className="ntf-header-glow" />
            <div className="ntf-header-top">
              <div>
                <div className="ntf-eyebrow">SkillHire · Notification Center</div>
                <h1>Notifications</h1>
                <p>Track platform activity — proposals, projects, payments & more.</p>
              </div>
              <div className="ntf-header-actions">
                {unreadCount > 0 && (
                  <button className="ntf-mark-all" onClick={markAllAsRead}><span>✓✓</span>Mark all as read</button>
                )}
                <button className="ntf-refresh" onClick={() => fetchNotifications(1, activeType, false)} title="Refresh"><span>↻</span>Refresh</button>
              </div>
            </div>

            <div className="ntf-summary-row">
              <div className="ntf-summary-card ntf-total">
                <div className="ntf-summary-icon">🔔</div>
                <div><span>Total</span><strong>{notifications.length}</strong></div>
              </div>
              <div className="ntf-summary-card ntf-unread">
                <div className="ntf-summary-icon">○</div>
                <div><span>Unread</span><strong>{unreadCount}</strong></div>
              </div>
              <div className="ntf-summary-card ntf-read">
                <div className="ntf-summary-icon">✓</div>
                <div><span>Read</span><strong>{Math.max(notifications.length - unreadCount, 0)}</strong></div>
              </div>
            </div>
          </header>

          <div className="ntf-toolbar">
            <div className="ntf-tabs">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key || "all"}
                  className={`ntf-tab ${activeType === filter.key ? "active" : ""}`}
                  onClick={() => setActiveType(filter.key)}
                >
                  <span>{filter.icon}</span>{filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ntf-list">
            {loading ? (
              <div className="ntf-loading">
                <div className="ntf-loader">
                  <div className="ntf-bell">🔔</div>
                  <div className="ntf-wave"><span /><span /><span /><span /></div>
                </div>
                <p>Ringing up your notifications...</p>
              </div>
            ) : error ? (
              <div className="ntf-empty">
                <div className="ntf-empty-icon">⚠️</div>
                <strong>Couldn't load notifications</strong>
                <p>{error}</p>
                <button className="ntf-empty-btn" onClick={() => fetchNotifications(1, activeType, false)}>Try Again</button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="ntf-empty">
                <div className="ntf-empty-icon">🔕</div>
                <strong>No {activeType ? `${FILTERS.find((f) => f.key === activeType)?.label.toLowerCase()} ` : ""}notifications</strong>
                <p>New activity will appear here as soon as it happens.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const unread = isUnread(notification);
                const clickable = Boolean(notification.reference_type || notification.reference_id);
                return (
                  <div
                    key={notification.id}
                    className={`ntf-card ${unread ? "unread" : ""}${clickable ? " clickable" : ""}`}
                    onClick={() => (actionId === notification.id ? null : openNotification(notification))}
                  >
                    <div className={`ntf-card-icon ${getIconClass(notification)}`}>{getIcon(notification)}</div>
                    <div className="ntf-card-main">
                      <div className="ntf-card-top">
                        <div className="ntf-card-type-tag">{getMiscType(notification) === "misc" ? "General" : FILTERS.find((f) => f.key === getMiscType(notification))?.label || "General"}</div>
                        {unread && (<span className="ntf-unread-dot" />)}
                        <span className="ntf-card-time">{formatTime(notification.created_at)}</span>
                      </div>
                      <div className="ntf-card-title">{notification.title || "Notification"}</div>
                      <p>{notification.message || notification.desc || "You have a new notification."}</p>
                    </div>
                    <div className="ntf-card-actions">
                      {unread && (
                        <button
                          className="ntf-action-read"
                          disabled={actionId === notification.id}
                          onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                        >
                          {actionId === notification.id ? "..." : "Mark read"}
                        </button>
                      )}
                      <button
                        className="ntf-action-delete"
                        disabled={actionId === notification.id}
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                      >✕</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {hasMore && !loading && (
            <div className="ntf-load-more">
              <button onClick={() => fetchNotifications(page + 1, activeType, true)} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Load more notifications ↓"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;