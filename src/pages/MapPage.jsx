import { useState } from "react";
import AppShell from "../components/Appshell";

export default function MapPage() {
  const [mapImage, setMapImage] = useState(null);
  const [mapName, setMapName] = useState("");

  const handleMapUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setMapImage(loadEvent.target.result);
      setMapName(file.name);
    };
    reader.readAsDataURL(file);
  };
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
          <div className={`map-placeholder ${mapImage ? "has-image" : ""}`}>
            {mapImage ? (
              <img
                className="map-image-preview"
                src={mapImage}
                alt="Uploaded facility map"
              />
            ) : (
              <div>
                <div className="map-title">Facility Evacuation Layout</div>
                <div className="map-subtext">
                  Upload your plant floor plan image here.
                </div>
              </div>
            )}
          </div>

          <div className="map-upload-panel">
            <label className="field-label" htmlFor="map-image-upload">
              Upload Map Image
            </label>
            <input
              id="map-image-upload"
              type="file"
              accept="image/*"
              className="styled-input"
              onChange={handleMapUpload}
            />
            {mapName && (
              <div className="mini-info-text">Showing: {mapName}</div>
            )}
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