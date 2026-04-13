import { useMemo } from "react";
import AppShell from "../components/Appshell";
import { useDashboardStore } from "../store/useDashboardStore";

export default function AnalyticsPage() {
  const personnel = useDashboardStore((s) => s.personnel);

  const civilians = useMemo(
    () => personnel.filter((p) => !p.isRescue),
    [personnel]
  );

  const safeCount = civilians.filter((p) => p.status === "SAFE").length;
  const notSafeCount = civilians.length - safeCount;
  const safePercent = civilians.length
    ? Math.round((safeCount / civilians.length) * 100)
    : 0;

  const deptStats = useMemo(() => {
    const grouped = [...new Set(civilians.map((p) => p.dept))];
    return grouped.map((dept) => {
      const people = civilians.filter((p) => p.dept === dept);
      const safe = people.filter((p) => p.status === "SAFE").length;
      const total = people.length;
      const percent = total ? Math.round((safe / total) * 100) : 0;
      return { dept, safe, total, percent };
    });
  }, [civilians]);

  return (
    <AppShell
      title="Analytics Overview"
      subtitle="Emergency readiness, personnel safety distribution, and department hotspots"
      summaryStats={[
        { value: civilians.length, label: "TRACKED" },
        { value: safeCount, label: "SAFE", variant: "green" },
        { value: notSafeCount, label: "NOT SAFE", variant: "red" },
        { value: `${safePercent}%`, label: "READINESS", variant: "amber" },
      ]}
    >
      <aside className="panel left-panel">
        <div className="panel-section">
          <div className="panel-title">Live Summary</div>
        </div>

        <div className="mini-info-card">
          <div className="mini-info-title">Summary</div>
          <div className="mini-info-text">
            This page now reads live data from the shared dashboard store.
          </div>
        </div>
      </aside>

      <section className="panel center-panel">
        <div className="two-chart-grid">
          <div className="chart-card">
            <h3>Personnel Status Count</h3>
            <div className="fake-chart">
              <div className="bar-wrap">
                <div className="bar-label">Safe</div>
                <div className="bar-track">
                  <div
                    className="bar-fill safe-bar"
                    style={{
                      width: `${civilians.length ? (safeCount / civilians.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="bar-value">{safeCount}</div>
              </div>

              <div className="bar-wrap">
                <div className="bar-label">Not Safe</div>
                <div className="bar-track">
                  <div
                    className="bar-fill unsafe-bar"
                    style={{
                      width: `${civilians.length ? (notSafeCount / civilians.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="bar-value">{notSafeCount}</div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Safety Distribution (%)</h3>
            <div className="donut-card">
              <div
                className="fake-donut"
                style={{
                  background: `conic-gradient(#16b364 0 ${safePercent}%, #ef4444 ${safePercent}% 100%)`,
                }}
              >
                <div className="fake-donut-inner">{safePercent}%</div>
              </div>
              <div className="donut-legend">
                <div>
                  <span className="legend-dot safe" /> Safe
                </div>
                <div>
                  <span className="legend-dot unsafe" /> Not Safe
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="panel right-panel">
        <div className="panel-title">Department Safety Status</div>

        <div className="hotspot-list">
          {deptStats.map((item) => (
            <div key={item.dept} className="hotspot-item">
              <div className="hotspot-head">
                <span>{item.dept}</span>
                <span>{item.percent}%</span>
              </div>
              <div className="hotspot-track">
                <div
                  className={`hotspot-fill ${
                    item.percent === 100
                      ? "good"
                      : item.percent >= 50
                      ? "warn"
                      : "bad"
                  }`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </AppShell>
  );
}