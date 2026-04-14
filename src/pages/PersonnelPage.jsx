import { useMemo } from "react";
import AppShell from "../components/Appshell";
import { useDashboardStore } from "../store/useDashboardStore";

export default function PersonnelPage() {
  const emergencyActive = useDashboardStore((s) => s.emergencyActive);
  const personnel = useDashboardStore((s) => s.personnel);
  const selectedDepartment = useDashboardStore((s) => s.selectedDepartment);
  const searchTerm = useDashboardStore((s) => s.searchTerm);
  const setDepartmentFilter = useDashboardStore((s) => s.setDepartmentFilter);
  const setSearchTerm = useDashboardStore((s) => s.setSearchTerm);
  const toggleEmergency = useDashboardStore((s) => s.toggleEmergency);
  const togglePersonStatus = useDashboardStore((s) => s.togglePersonStatus);

  const civilians = useMemo(
    () => personnel.filter((p) => !p.isRescue),
    [personnel]
  );

  const filtered = useMemo(() => {
    return civilians.filter((p) => {
      const deptOk =
        selectedDepartment === "ALL" || p.dept === selectedDepartment;

      const search = searchTerm.trim().toLowerCase();
      const textOk =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.role.toLowerCase().includes(search) ||
        p.dept.toLowerCase().includes(search);

      return deptOk && textOk;
    });
  }, [civilians, selectedDepartment, searchTerm]);

  const safeCount = civilians.filter((p) => p.status === "SAFE").length;
  const notSafeCount = civilians.length - safeCount;

  const departments = ["ALL", ...new Set(civilians.map((p) => p.dept))];

  return (
    <AppShell
      title="Personnel Command Center"
      subtitle="Track personnel accountability and update safety states during active incidents"
      summaryStats={[
        { value: civilians.length, label: "TRACKED" },
        { value: safeCount, label: "SAFE", variant: "green" },
        { value: notSafeCount, label: "NOT SAFE", variant: "red" },
        {
          value: emergencyActive ? "ACTIVE" : "STANDBY",
          label: "EMERGENCY",
          variant: "amber",
        },
      ]}
      actionSlot={
        <button
          className={`top-nav-btn ${emergencyActive ? "active" : ""}`}
          onClick={toggleEmergency}
        >
          {emergencyActive ? "End Emergency" : "Trigger Emergency"}
        </button>
      }
    >
      <aside className="panel left-panel">
        <div className="panel-title">Filters</div>

        <div className="panel-section">
          <label className="field-label">Search</label>
          <input
            className="styled-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search personnel..."
          />

          <label className="field-label">Department</label>
          <select
            className="styled-input"
            value={selectedDepartment}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "ALL" ? "All Departments" : dept}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <section className="panel center-panel">
        <div className="table-card">
          <div className="table-title">Personnel Status</div>

          <div className="history-table">
            {filtered.map((person) => (
              <div 
                className="history-row" 
                key={person.id}
                onClick={() => togglePersonStatus(person.id)}
              >
                <div>{person.name}</div>
                <div>{person.dept}</div>
                <div>{person.role}</div>
                <div>
                  <span
                    className={`status-chip ${
                      person.status === "SAFE" ? "done" : ""
                    }`}
                    style={
                      person.status !== "SAFE"
                        ? {
                            background: "rgba(239,68,68,0.12)",
                            color: "#ef4444",
                          }
                        : undefined
                    }
                  >
                    {person.status === "SAFE" ? "SAFE" : "NOT SAFE"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="panel right-panel">
        <div className="panel-title">Potential Risks</div>

        <div className="metric-stack">
          {civilians
            .filter((p) => p.status !== "SAFE")
            .map((p) => (
              <div className="metric-card" key={p.id}>
                <div className="metric-label">{p.dept}</div>
                <div className="metric-value" style={{ fontSize: 18 }}>
                  {p.name}
                </div>
              </div>
            ))}

          {civilians.filter((p) => p.status !== "SAFE").length === 0 && (
            <div className="metric-card">
              <div className="metric-label">Status</div>
              <div className="metric-value safe-text">All Safe</div>
            </div>
          )}
        </div>
      </aside>
    </AppShell>
  );
}