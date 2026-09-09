import { useEffect, useState } from "react";
import { subscribeToast, dismiss } from "../utils/toast";

const THEMES = {
  success: { background: "#eafff2", border: "#b3ebca", color: "#009b4d", icon: "✅" },
  error: { background: "#fff0f1", border: "#ffc9cc", color: "#d9303e", icon: "⚠️" },
  info: { background: "#eef7ff", border: "#bfe0ff", color: "#2386d9", icon: "ℹ️" },
};

const styles = {
  container: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "380px",
  },
  toast: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "13px 14px",
    borderRadius: "13px",
    border: "1px solid",
    boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1.45,
    animation: "toast-in 0.22s ease",
  },
  close: {
    border: "none",
    background: "transparent",
    fontSize: "16px",
    lineHeight: 1,
    cursor: "pointer",
    opacity: 0.55,
    padding: 0,
    marginLeft: "auto",
  },
};

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast((payload) => {
      setToasts((prev) => {
        if (payload.type === "dismiss") return prev.filter((t) => t.id !== payload.id);
        return [...prev, payload];
      });
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={styles.container}>
      {toasts.map((t) => {
        const theme = THEMES[t.type] || THEMES.info;
        return (
          <div key={t.id} style={{ ...styles.toast, background: theme.background, borderColor: theme.border, color: theme.color }}>
            <span role="img" aria-label={t.type}>{theme.icon}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button aria-label="Close" style={styles.close} onClick={() => dismiss(t.id)}>×</button>
          </div>
        );
      })}
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}