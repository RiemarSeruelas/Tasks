import AppShell from "../components/AppShell";
import { useDashboardStore } from "../store/useDashboardStore";

export default function RescuePage() {
  const rescueTeam = useDashboardStore((s) =>
    s.personnel.filter((p) => p.isRescue)
  );

  return (
    <AppShell
      title="Emergency Response Team"
      subtitle="Authorized rescue and medical support personnel"
      summaryStats={[
        { value: rescueTeam.length, label: "TEAM SIZE" },
        { value: "100%", label: "READY", variant: "green" },
        { value: "LOCAL", label: "DATA", variant: "amber" },
        { value: "24/7", label: "COVERAGE" },
      ]}
    >
      <aside className="panel left-panel">
        <div className="panel-title">Rescue Protocol</div>
        <div className="mini-info-text">
          Rescue personnel are excluded from normal accountability counts.
        </div>
      </aside>

      <section className="panel center-panel">
        <div className="rescue-grid">
          {rescueTeam.map((person) => (
            <div className="rescue-card" key={person.id}>
              <img src={person.img} alt={person.name} className="rescue-avatar" />
              <div className="rescue-name">{person.name}</div>
              <div className="rescue-role">{person.role}</div>
              <div className="rescue-contact">{person.phone}</div>
              <div className="rescue-actions">
                <button className="circle-action-btn">📞</button>
                <button className="circle-action-btn">💬</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="panel right-panel">
        <div className="panel-title">Deployment Status</div>

        <div className="metric-stack">
          <div className="metric-card">
            <div className="metric-label">Medical Support</div>
            <div className="metric-value safe-text">Ready</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Evac Support</div>
            <div className="metric-value safe-text">Ready</div>
          </div>
        </div>
      </aside>
    </AppShell>
  );
}