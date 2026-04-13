import { Link, useLocation } from "react-router-dom";
import { useDashboardStore } from "../store/useDashboardStore";

export default function AppShell({
  title,
  subtitle,
  summaryStats = [],
  actionSlot = null,
  children,
}) {
  const location = useLocation();
  const theme = useDashboardStore((s) => s.theme);
  const toggleTheme = useDashboardStore((s) => s.toggleTheme);

  const navItems = [
    { label: "Personnel", path: "/" },
    { label: "Analytics", path: "/analytics" },
    { label: "History", path: "/history" },
    { label: "Evac Map", path: "/map" },
    { label: "Rescue Team", path: "/rescue" },
  ];

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-card">
            <div className="brand-icon">🛡️</div>
            <div className="brand-text">
              <div className="brand-title">EMERGENCY DASHBOARD</div>
              <div className="brand-subtitle">Safety Monitoring System</div>
            </div>
          </div>

          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="top-nav-link">
              <button
                className={`top-nav-btn ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                {item.label}
              </button>
            </Link>
          ))}
        </div>

        <div className="topbar-right">
          {actionSlot}

          <button className="top-nav-btn" onClick={toggleTheme}>
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>

          <div className="admin-chip">Admin</div>
        </div>
      </header>

      <section className="summary-strip">
        <div className="summary-left">
          <div className="summary-badge">⚠️</div>
          <div>
            <div className="summary-title">{title}</div>
            <div className="summary-subtitle">{subtitle}</div>
          </div>
          <div className="live-badge">SYSTEM READY</div>
        </div>

        <div className="summary-stats">
          {summaryStats.map((stat, idx) => (
            <div key={idx} className={`summary-stat ${stat.variant || ""}`}>
              <div className="summary-value">{stat.value}</div>
              <div className="summary-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <main className="workspace">{children}</main>
    </div>
  );
}