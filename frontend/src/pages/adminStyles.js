// Centralized inline styles for the Admin Dashboard.
// Extracted from AdminDashboard.jsx to keep the component manageable.

export const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f1fb",
    color: "#172033",
  },

  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "250px",
    background:
      "linear-gradient(180deg, #1b1e3f 0%, #232659 55%, #2a1b5e 100%)",
    color: "#fff",
    padding: "24px 16px",
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "10px 0 34px rgba(34, 27, 95, 0.22)",
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 10px 24px",
    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
  },

  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #7c6eff, #a04bf0)",
    fontWeight: 800,
    fontSize: "20px",
    boxShadow:
      "0 8px 18px rgba(124, 110, 255, 0.45)",
  },

  logoText: {
    margin: 0,
    fontSize: "21px",
    fontWeight: 800,
  },

  logoSubtext: {
    display: "block",
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },

  adminProfile: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "20px 10px",
  },

  adminAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #6d5ef2, #a04bf0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    boxShadow:
      "0 0 0 3px rgba(124,110,255,0.22)",
  },

  adminName: {
    display: "block",
    fontSize: "13px",
  },

  adminRole: {
    display: "block",
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "2px",
  },

  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#aeb9cb",
    padding: "12px 13px",
    borderRadius: "10px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    fontSize: "13px",
    transition: "0.2s",
  },

  navItemActive: {
    background:
      "linear-gradient(135deg, #7c6eff, #a04bf0)",
    color: "#fff",
    boxShadow:
      "0 6px 16px rgba(124, 110, 255, 0.38)",
  },

  navIcon: {
    width: "22px",
    textAlign: "center",
    fontSize: "16px",
  },

  sidebarBottom: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background:
      "rgba(239,68,68,0.08)",
    color: "#fca5a5",
    padding: "12px 13px",
    borderRadius: "10px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    fontSize: "13px",
  },

  main: {
    marginLeft: "250px",
    padding: "28px",
    minHeight: "100vh",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  breadcrumb: {
    margin: "0 0 6px",
    color: "#8b7cf8",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  },

  pageTitle: {
    margin: 0,
    fontSize: "27px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },

  pageSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  refreshButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #6d5ef2, #a04bf0)",
    color: "#fff",
    padding: "11px 17px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    boxShadow:
      "0 8px 20px rgba(124, 110, 255, 0.3)",
  },

  refreshButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "16px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #ece8f6",
    borderRadius: "16px",
    padding: "19px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 8px 24px rgba(124, 110, 255, 0.07)",
  },

  statIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: 700,
    flexShrink: 0,
  },

  statContent: {
    minWidth: 0,
  },

  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "4px",
  },

  statValue: {
    display: "block",
    fontSize: "23px",
    fontWeight: 800,
  },

  statHint: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    marginTop: "3px",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },

  quickCard: {
    background: "#fff",
    border: "1px solid #ece8f6",
    borderRadius: "14px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow:
      "0 6px 18px rgba(124, 110, 255, 0.05)",
  },

  quickCardStrong: {
    display: "block",
  },

  quickIconSuccess: {
    width: "35px",
    height: "35px",
    borderRadius: "10px",
    background: "#ecfdf5",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  quickIconBlue: {
    width: "35px",
    height: "35px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  quickIconWarning: {
    width: "35px",
    height: "35px",
    borderRadius: "10px",
    background: "#fffbeb",
    color: "#d97706",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  quickIconPurple: {
    width: "35px",
    height: "35px",
    borderRadius: "10px",
    background: "#f5f3ff",
    color: "#7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  activityGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.6fr) minmax(300px, 0.8fr)",
    gap: "18px",
    marginBottom: "20px",
  },

  activityCard: {
    background: "#fff",
    border: "1px solid #ece8f6",
    borderRadius: "16px",
    padding: "20px",
    boxShadow:
      "0 8px 24px rgba(124, 110, 255, 0.07)",
  },

  activitySummaryCard: {
    background:
      "linear-gradient(145deg, #ffffff, #faf9ff)",
    border: "1px solid #ece8f6",
    borderRadius: "16px",
    padding: "20px",
    boxShadow:
      "0 8px 24px rgba(124, 110, 255, 0.07)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
    color: "#172033",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
  },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#ecfdf5",
    color: "#059669",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
  },

  liveDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#10b981",
  },

  activityList: {
    display: "flex",
    flexDirection: "column",
  },

  activityItem: {
    display: "flex",
    gap: "13px",
    padding: "13px 0",
    borderBottom:
      "1px solid #eef2f7",
  },

  activityIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontWeight: 800,
    fontSize: "15px",
  },

  activityUser: {
    background: "#eae6ff",
    color: "#6d5ef2",
  },

  activityJob: {
    background: "#eff6ff",
    color: "#0284c7",
  },

  activityProject: {
    background: "#ecfdf5",
    color: "#059669",
  },

  activityPayment: {
    background: "#fffbeb",
    color: "#d97706",
  },

  activityContent: {
    flex: 1,
    minWidth: 0,
  },

  activityTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  activityTitle: {
    fontSize: "12px",
    color: "#334155",
  },

  activityDescription: {
    margin: "4px 0",
    color: "#172033",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  activityTime: {
    color: "#94a3b8",
    fontSize: "10px",
    whiteSpace: "nowrap",
  },

  activityBottom: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  activityMeta: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  activityBadge: {
    background: "#f1f5f9",
    color: "#64748b",
    borderRadius: "20px",
    padding: "3px 7px",
    fontSize: "9px",
    fontWeight: 700,
  },

  activityBadgePaid: {
    background: "#ecfdf5",
    color: "#059669",
  },

  activityViewButton: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    color: "#6d5ef2",
    fontSize: "10px",
    fontWeight: 700,
    padding: "3px 5px",
  },

  summaryIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#eae6ff",
    color: "#6d5ef2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  activitySummaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "10px",
  },

  activityMetric: {
    background: "#f8fafc",
    border: "1px solid #edf1f6",
    borderRadius: "11px",
    padding: "13px",
  },

  activityMetricLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    marginBottom: "5px",
  },

  activityMetricValue: {
    display: "block",
    color: "#172033",
    fontSize: "21px",
    fontWeight: 800,
  },

  activityMetricSmall: {
    color: "#94a3b8",
    fontSize: "9px",
  },

  activityInfoBox: {
    marginTop: "14px",
    background: "#f5f3ff",
    border: "1px solid #e9e5ff",
    borderRadius: "11px",
    padding: "12px",
    display: "flex",
    gap: "9px",
    alignItems: "flex-start",
  },

  activityEmpty: {
    textAlign: "center",
    padding: "35px 10px",
    color: "#94a3b8",
  },

  emptyIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
    color: "#64748b",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "20px",
  },

  chartCard: {
    background: "#fff",
    border: "1px solid #ece8f6",
    borderRadius: "16px",
    padding: "20px",
    minWidth: 0,
    boxShadow:
      "0 8px 24px rgba(124, 110, 255, 0.07)",
  },

  chartContainer: {
    width: "100%",
    height: "280px",
  },

  pieChartContainer: {
    width: "100%",
    height: "230px",
  },

  chartValue: {
    color: "#6d5ef2",
    fontSize: "15px",
    fontWeight: 800,
  },

  legend: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "9px",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#64748b",
    fontSize: "11px",
  },

  legendDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
  },

  tableCard: {
    background: "#fff",
    border: "1px solid #ece8f6",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow:
      "0 8px 24px rgba(124, 110, 255, 0.07)",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "18px",
  },

  filterContainer: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  searchInput: {
    width: "190px",
    border:
      "1px solid #dfe5ee",
    outline: "none",
    borderRadius: "9px",
    padding: "9px 11px",
    fontSize: "11px",
    color: "#334155",
    background: "#fff",
  },

  filterSelect: {
    border:
      "1px solid #dfe5ee",
    outline: "none",
    borderRadius: "9px",
    padding: "9px 10px",
    fontSize: "11px",
    color: "#475569",
    background: "#fff",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "760px",
  },

  tableAvatar: {
    width: "33px",
    height: "33px",
    borderRadius: "9px",
    background:
      "linear-gradient(135deg, #7c6eff, #a04bf0)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
    boxShadow:
      "0 4px 10px rgba(124, 110, 255, 0.28)",
  },

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  jobCell: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  roleBadge: {
    display: "inline-block",
    background: "#eae6ff",
    color: "#6d5ef2",
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "capitalize",
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "capitalize",
    background: "#f1f5f9",
    color: "#64748b",
  },

  status_active: {
    background: "#ecfdf5",
    color: "#059669",
  },

  status_completed: {
    background: "#eff6ff",
    color: "#2563eb",
  },

  status_pending: {
    background: "#fffbeb",
    color: "#d97706",
  },

  status_in_progress: {
    background: "#f3f0ff",
    color: "#7c3aed",
  },

  status_cancelled: {
    background: "#fff1f2",
    color: "#e11d48",
  },

  status_paid: {
    background: "#ecfdf5",
    color: "#059669",
  },

  status_rejected: {
    background: "#fff1f2",
    color: "#e11d48",
  },

  actionButtons: {
    display: "flex",
    gap: "6px",
  },

  viewButton: {
    border: "1px solid #e0e7ff",
    background: "#eae6ff",
    color: "#6d5ef2",
    padding: "6px 9px",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: 700,
  },

  deleteButton: {
    border: "1px solid #fee2e2",
    background: "#fff1f2",
    color: "#e11d48",
    padding: "6px 9px",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: 700,
  },

  emptyTable: {
    textAlign: "center",
    padding: "35px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "18px",
  },

  pageButton: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    padding: "7px 10px",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: 600,
  },

  pageButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  pageNumbers: {
    display: "flex",
    gap: "4px",
  },

  numberButton: {
    minWidth: "29px",
    height: "29px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: 600,
  },

  numberButtonActive: {
    background: "linear-gradient(135deg, #7c6eff, #a04bf0)",
    color: "#fff",
    borderColor: "#7c6eff",
  },

  pageDots: {
    padding: "7px 3px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f3f1fb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#334155",
  },

  loadingSpinner: {
    width: "38px",
    height: "38px",
    border:
      "4px solid #ebe7fb",
    borderTop:
      "4px solid #7c6eff",
    borderRadius: "50%",
    animation:
      "spin 0.8s linear infinite",
    marginBottom: "15px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15, 23, 42, 0.62)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 100,
  },

  modal: {
    width: "560px",
    maxWidth: "100%",
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    boxShadow:
      "0 25px 70px rgba(15,23,42,0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
  },

  modalSubtitle: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
  },

  closeButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "21px",
    lineHeight: 1,
  },

  modalProfile: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "17px",
  },

  modalAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #7c6eff, #a04bf0)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 800,
    boxShadow:
      "0 8px 20px rgba(124, 110, 255, 0.35)",
  },

  detailHero: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "16px",
  },

  detailHeroIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#eae6ff",
    color: "#6d5ef2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 800,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "10px",
    marginBottom: "16px",
  },

  detailItem: {
    background: "#f8fafc",
    border: "1px solid #edf1f6",
    borderRadius: "10px",
    padding: "11px",
  },

  detailItemSpan: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
    marginBottom: "4px",
  },

  detailItemStrong: {
    display: "block",
    color: "#334155",
    fontSize: "11px",
    wordBreak: "break-word",
  },

  descriptionBox: {
    background: "#f8fafc",
    borderRadius: "11px",
    padding: "13px",
    marginBottom: "16px",
  },

  descriptionBoxSpan: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 700,
    marginBottom: "6px",
  },

  descriptionBoxP: {
    margin: 0,
    color: "#475569",
    fontSize: "11px",
    lineHeight: 1.7,
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    paddingTop: "4px",
  },

  secondaryButton: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    padding: "9px 14px",
    borderRadius: "9px",
    fontSize: "11px",
    fontWeight: 700,
  },

  deleteButtonLarge: {
    border: "none",
    background: "#e11d48",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "9px",
    fontSize: "11px",
    fontWeight: 700,
  },
};
