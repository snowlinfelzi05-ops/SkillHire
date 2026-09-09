import { Component } from "react";

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f7fb",
    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
    padding: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #ecebf1",
    borderRadius: "18px",
    padding: "32px",
    textAlign: "center",
    maxWidth: "420px",
    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
  },
  title: { margin: "0 0 8px", fontSize: "20px", fontWeight: 800 },
  text: { margin: "0 0 18px", color: "#777480", fontSize: "13px", lineHeight: 1.55 },
  button: {
    border: "none",
    background: "#5a4bcf",
    color: "#fff",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrap}>
          <div style={styles.card}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.text}>
              An unexpected error occurred. Please refresh the page or head back to the dashboard.
            </p>
            <button style={styles.button} onClick={this.handleReset}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}