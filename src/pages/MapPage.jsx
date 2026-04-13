import AppShell from "../components/Appshell";

export default function MapPage() {
  return (
    <AppShell
      title="Evacuation Map"
      subtitle="Facility map, emergency zones, and live evacuation readiness status"
      summaryStats={[
        { value: "4", label: "SAFE ZONES", variant: "green" },
        { value: "2", label: "HIGH RISK", variant: "red" },
        { value: "1", label: "ACTIVE ROUTE", variant: "amber" },
        { value: "100%", label: "MAP READY" },
      ]}
    >
      <aside className="panel left-panel">
        <div className="panel-title">Zone Legend</div>
        <div className="legend-stack">
          <div className="legend-item">
            <span className="legend-square safe-zone" />
            Safe Assembly Zone
          </div>
          <div className="legend-item">
            <span className="legend-square route-zone" />
            Evacuation Route
          </div>
          <div className="legend-item">
            <span className="legend-square risk-zone" />
            High Risk Area
          </div>
        </div>
      </aside>

      <section className="panel center-panel">
        <div className="map-card">
          <div className="map-placeholder">
            <div>
              <div className="map-title">Facility Evacuation Layout</div>
              <div className="map-subtext">
                Replace this placeholder with your plant floor plan image or SVG.
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="panel right-panel">
        <div className="panel-title">Zone Status</div>
        <div className="metric-stack">
          <div className="metric-card">
            <div className="metric-label">Zone A</div>
            <div className="metric-value safe-text">Clear</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Zone B</div>
            <div className="metric-value warn-text">Evacuating</div>
          </div>
        </div>
      </aside>
    </AppShell>
  );
}