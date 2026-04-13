import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/Appshell";
import { useDashboardStore } from "../store/useDashboardStore";

function useAnimatedNumber(target, duration = 500) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    let frameId;
    const startValue = value;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + (target - startValue) * eased;

      setValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return value;
}

export default function AnalyticsPage() {
  const personnel = useDashboardStore((s) => s.personnel);
  const history = useDashboardStore((s) => s.history);
  const selectedAnalyticsEventId = useDashboardStore(
    (s) => s.selectedAnalyticsEventId
  );
  const setSelectedAnalyticsEventId = useDashboardStore(
    (s) => s.setSelectedAnalyticsEventId
  );

  const civiliansLive = useMemo(
    () => personnel.filter((p) => !p.isRescue),
    [personnel]
  );

  const selectedEvent = useMemo(() => {
    if (selectedAnalyticsEventId === "LIVE") return null;
    return history.find((h) => h.id === selectedAnalyticsEventId) || null;
  }, [history, selectedAnalyticsEventId]);

  const analyticsPeople = useMemo(() => {
    if (!selectedEvent) {
      return civiliansLive.map((p) => ({
        id: p.id,
        name: p.name,
        dept: p.dept,
        role: p.role,
        status: p.status,
      }));
    }
    return selectedEvent.personnelSnapshot || [];
  }, [civiliansLive, selectedEvent]);

  const safeCount = analyticsPeople.filter((p) => p.status === "SAFE").length;
  const notSafeCount = analyticsPeople.length - safeCount;

  const safePercent = analyticsPeople.length
    ? Math.round((safeCount / analyticsPeople.length) * 100)
    : 0;

  const deptStats = useMemo(() => {
    const grouped = [...new Set(analyticsPeople.map((p) => p.dept))];
    return grouped.map((dept) => {
      const people = analyticsPeople.filter((p) => p.dept === dept);
      const safe = people.filter((p) => p.status === "SAFE").length;
      const total = people.length;
      const percent = total ? Math.round((safe / total) * 100) : 0;
      return { dept, safe, total, percent };
    });
  }, [analyticsPeople]);

  const selectedLabel = selectedEvent
    ? `${selectedEvent.timestamp} (${selectedEvent.duration})`
    : "LIVE CURRENT STATE";

  const animatedSafeCount = useAnimatedNumber(safeCount, 500);
  const animatedNotSafeCount = useAnimatedNumber(notSafeCount, 500);
  const animatedSafePercent = useAnimatedNumber(safePercent, 600);

  const donutSize = 150;
  const strokeWidth = 18;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (animatedSafePercent / 100) * circumference;

  return (
    <AppShell
      title="Analytics Overview"
      subtitle="Emergency readiness, personnel safety distribution, and department hotspots"
      summaryStats={[
        { value: analyticsPeople.length, label: "TRACKED" },
        { value: safeCount, label: "SAFE", variant: "green" },
        { value: notSafeCount, label: "NOT SAFE", variant: "red" },
        { value: `${safePercent}%`, label: "READINESS", variant: "amber" },
      ]}
    >
      <aside className="panel left-panel">
        <div className="panel-section">
          <div className="panel-title">Analytics Source</div>

          <label className="field-label">Pick Event</label>
          <select
            className="styled-input"
            value={selectedAnalyticsEventId}
            onChange={(e) => setSelectedAnalyticsEventId(e.target.value)}
          >
            <option value="LIVE">LIVE CURRENT STATE</option>
            {history.map((item) => (
              <option key={item.id} value={item.id}>
                {item.timestamp}
              </option>
            ))}
          </select>
        </div>

        <div className="mini-info-card">
          <div className="mini-info-title">Selected Dataset</div>
          <div className="mini-info-text">{selectedLabel}</div>
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
                    className="bar-fill safe-bar animated-bar"
                    style={{
                      width: `${
                        analyticsPeople.length
                          ? (animatedSafeCount / analyticsPeople.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="bar-value">
                  {Math.round(animatedSafeCount)}
                </div>
              </div>

              <div className="bar-wrap">
                <div className="bar-label">Not Safe</div>
                <div className="bar-track">
                  <div
                    className="bar-fill unsafe-bar animated-bar"
                    style={{
                      width: `${
                        analyticsPeople.length
                          ? (animatedNotSafeCount / analyticsPeople.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="bar-value">
                  {Math.round(animatedNotSafeCount)}
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Safety Distribution (%)</h3>
            <div className="donut-card">
              <div className="svg-donut-wrap">
  <svg
    width={donutSize}
    height={donutSize}
    viewBox={`0 0 ${donutSize} ${donutSize}`}
    className="svg-donut"
  >
    <circle
      className="svg-donut-unsafe"
      cx={donutSize / 2}
      cy={donutSize / 2}
      r={radius}
      strokeWidth={strokeWidth}
      fill="none"
    />
    <circle
      className="svg-donut-progress"
      cx={donutSize / 2}
      cy={donutSize / 2}
      r={radius}
      strokeWidth={strokeWidth}
      fill="none"
      strokeDasharray={circumference}
      strokeDashoffset={dashOffset}
    />
  </svg>
  <div className="svg-donut-center">
    {Math.round(animatedSafePercent)}%
  </div>
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
                  className={`hotspot-fill animated-bar ${
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

          {deptStats.length === 0 && (
            <div className="mini-info-card">
              <div className="mini-info-text">
                No analytics data available yet.
              </div>
            </div>
          )}
        </div>
      </aside>
    </AppShell>
  );
}