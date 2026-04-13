import AppShell from "../components/Appshell";
import { useDashboardStore } from "../store/useDashboardStore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function HistoryPage() {
  const history = useDashboardStore((s) => s.history);
  const resetDashboard = useDashboardStore((s) => s.resetDashboard);

  const avgSafe =
    history.length > 0
      ? Math.round(history.reduce((a, b) => a + b.safe, 0) / history.length)
      : 0;

  const avgNotSafe =
    history.length > 0
      ? Math.round(history.reduce((a, b) => a + b.notSafe, 0) / history.length)
      : 0;

  async function downloadIncidentExcel(eventItem) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Emergency Report");

    // Column widths
    worksheet.getColumn(1).width = 12; // ID
    worksheet.getColumn(2).width = 28; // Name
    worksheet.getColumn(3).width = 22; // Department
    worksheet.getColumn(4).width = 16; // Status

    // Header banner
    worksheet.mergeCells("A1:D1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "EMERGENCY";
    titleCell.font = {
      name: "Arial",
      bold: true,
      size: 18,
      color: { argb: "FFFFFFFF" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEF4444" },
    };
    worksheet.getRow(1).height = 28;

    // Date row
    worksheet.mergeCells("A2:D2");
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Date: ${eventItem.timestamp}`;
    dateCell.font = { italic: true, size: 11 };
    dateCell.alignment = { horizontal: "center", vertical: "middle" };

    // Duration row
    worksheet.mergeCells("A3:D3");
    const durationCell = worksheet.getCell("A3");
    durationCell.value = `Duration: ${eventItem.duration}`;
    durationCell.font = { italic: true, size: 11 };
    durationCell.alignment = { horizontal: "center", vertical: "middle" };

    // Spacer
    worksheet.addRow([]);

    // Table header
    const headerRow = worksheet.addRow(["ID", "Name", "Department", "Status"]);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };

    // Borders for header
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFBFC7D5" } },
        left: { style: "thin", color: { argb: "FFBFC7D5" } },
        bottom: { style: "thin", color: { argb: "FFBFC7D5" } },
        right: { style: "thin", color: { argb: "FFBFC7D5" } },
      };
    });

    // Data rows
    const rows = eventItem.personnelSnapshot || [];

    rows.forEach((person) => {
      const row = worksheet.addRow([
        person.id || "",
        person.name || "",
        person.dept || "",
        person.status === "SAFE" ? "SAFE" : "NOT SAFE",
      ]);

      // Borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFD9E1F2" } },
          left: { style: "thin", color: { argb: "FFD9E1F2" } },
          bottom: { style: "thin", color: { argb: "FFD9E1F2" } },
          right: { style: "thin", color: { argb: "FFD9E1F2" } },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Color the NAME cell based on status
      const nameCell = row.getCell(2);
      const statusCell = row.getCell(4);

      if (person.status === "SAFE") {
        nameCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF10B981" },
        };
        nameCell.font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };

        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF10B981" },
        };
        statusCell.font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };
      } else {
        nameCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEF4444" },
        };
        nameCell.font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };

        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEF4444" },
        };
        statusCell.font = {
          color: { argb: "FFFFFFFF" },
          bold: true,
        };
      }
    });

    // Freeze header area
    worksheet.views = [{ state: "frozen", ySplit: 5 }];

    // Safe filename
    const safeTimestamp = String(eventItem.timestamp)
      .replace(/[/:,\s]/g, "-")
      .replace(/-+/g, "-");

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Emergency_Report_${safeTimestamp}.xlsx`);
  }

  return (
    <AppShell
      title="Emergency Event Logs"
      subtitle="Historical incident records, duration tracking, and export-ready summaries"
      summaryStats={[
        { value: history.length, label: "TOTAL EVENTS" },
        { value: avgSafe, label: "AVG SAFE", variant: "green" },
        { value: avgNotSafe, label: "AVG NOT SAFE", variant: "red" },
        { value: "LOCAL", label: "STORAGE", variant: "amber" },
      ]}
      actionSlot={
        <button className="top-nav-btn" onClick={resetDashboard}>
          Reset Data
        </button>
      }
    >
      <aside className="panel left-panel">
        <div className="panel-title">History Controls</div>

        <div className="mini-info-card">
          <div className="mini-info-title">How it works</div>
          <div className="mini-info-text">
            Click any incident row to download its Excel report.
          </div>
        </div>
      </aside>

      <section className="panel center-panel">
        <div className="table-card">
          <div className="table-title">Incident History</div>

          <div className="history-table">
            <div className="history-row history-head">
              <div>Timestamp</div>
              <div>Duration</div>
              <div>Safe</div>
              <div>Not Safe</div>
              <div>Export</div>
            </div>

            {history.map((item) => (
              <div
                className="history-row history-row-clickable"
                key={item.id}
                onClick={() => downloadIncidentExcel(item)}
                title="Click to download Excel report"
              >
                <div>{item.timestamp}</div>
                <div>{item.duration}</div>
                <div>{item.safe}</div>
                <div>{item.notSafe}</div>
                <div>
                  <span className="status-chip done">Excel</span>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="metric-card">
                <div className="metric-label">No incidents yet</div>
                <div className="metric-value">
                  Trigger and end an emergency first
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="panel right-panel">
        <div className="panel-title">Latest Snapshot</div>

        <div className="metric-stack">
          {history[0] ? (
            <>
              <div className="metric-card">
                <div className="metric-label">Timestamp</div>
                <div className="metric-value" style={{ fontSize: 18 }}>
                  {history[0].timestamp}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Duration</div>
                <div className="metric-value">{history[0].duration}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Export</div>
                <button
                  className="primary-action-btn"
                  onClick={() => downloadIncidentExcel(history[0])}
                >
                  Download Latest
                </button>
              </div>
            </>
          ) : (
            <div className="metric-card">
              <div className="metric-label">Status</div>
              <div className="metric-value warn-text">No Saved Event</div>
            </div>
          )}
        </div>
      </aside>
    </AppShell>
  );
}