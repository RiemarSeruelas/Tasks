import { useMemo, useState } from "react";
import AppShell from "../components/Appshell";
import { useDashboardStore } from "../store/useDashboardStore";

export default function RescuePage() {
  const personnel = useDashboardStore((s) => s.personnel);
  const addRescuePersonnel = useDashboardStore((s) => s.addRescuePersonnel);
  const removeRescuePersonnel = useDashboardStore((s) => s.removeRescuePersonnel);
  const updateRescuePersonnel = useDashboardStore((s) => s.updateRescuePersonnel);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    dept: "EMERGENCY",
    phone: "",
    email: "",
    time: "08:00A",
    timeIn: "08:00",
    timeOut: "17:00",
    img: "",
  });

  const rescueTeam = useMemo(
    () => personnel.filter((p) => p.isRescue),
    [personnel]
  );

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (formData.name && formData.role) {
      if (editingId) {
        updateRescuePersonnel(editingId, formData);
        setEditingId(null);
      } else {
        addRescuePersonnel(formData);
      }
      setFormData({
        name: "",
        role: "",
        dept: "EMERGENCY",
        phone: "",
        email: "",
        time: "08:00A",
        timeIn: "08:00",
        timeOut: "17:00",
        img: "",
      });
      setShowForm(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          img: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPerson = (person) => {
    setFormData({
      name: person.name,
      role: person.role,
      dept: person.dept,
      phone: person.phone,
      email: person.email,
      time: person.time || "08:00A",
      timeIn: person.timeIn || "08:00",
      timeOut: person.timeOut || "17:00",
      img: person.img || "",
    });
    setEditingId(person.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: "",
      role: "",
      dept: "EMERGENCY",
      phone: "",
      email: "",
      time: "08:00A",
      timeIn: "08:00",
      timeOut: "17:00",
      img: "",
    });
  };

  const handleOpenDetails = (person) => {
    setSelectedPerson(person);
  };

  const handleCloseDetails = () => {
    setSelectedPerson(null);
  };

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
        
        <div className="mini-info-card add-personnel-card">
          <div className="mini-info-title">
            {editingId ? "Edit Personnel" : "Add Personnel"}
          </div>
          <button
            className="primary-action-btn"
            onClick={() => (showForm ? handleCancelEdit() : setShowForm(true))}
          >
            {showForm ? "Cancel" : "+ Add Member"}
          </button>

          {showForm && (
            <form onSubmit={handleAddPerson} className="rescue-form">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="styled-input"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="role"
                placeholder="Role"
                className="styled-input"
                value={formData.role}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="dept"
                placeholder="Department"
                className="styled-input"
                value={formData.dept}
                onChange={handleInputChange}
              />
              <div className="time-inputs">
                <div className="time-field">
                  <label>From</label>
                  <input
                    type="time"
                    name="timeIn"
                    className="styled-input"
                    value={formData.timeIn}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="time-field">
                  <label>Until</label>
                  <input
                    type="time"
                    name="timeOut"
                    className="styled-input"
                    value={formData.timeOut}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                className="styled-input"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="styled-input"
                value={formData.email}
                onChange={handleInputChange}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="styled-input"
                style={{ height: "auto", cursor: "pointer" }}
              />
              {formData.img && (
                <img
                  src={formData.img}
                  alt="Preview"
                  className="image-preview"
                />
              )}
              <button type="submit" className="primary-action-btn">
                {editingId ? "Update Member" : "Add to Team"}
              </button>
            </form>
          )}
        </div>
      </aside>

      <section className="panel center-panel">
        <div className="rescue-grid">
          {rescueTeam.map((person) => (
            <div
              className="rescue-card"
              key={person.id}
              onClick={() => handleOpenDetails(person)}
            >
              <div className="rescue-card-row">
                <img
                  src={person.img || `https://i.pravatar.cc/150?u=${person.id}`}
                  alt={person.name}
                  className="rescue-avatar"
                />
                <div>
                  <div className="rescue-name">{person.name}</div>
                  <div className="rescue-meta-row">
                    <span className="rescue-badge">{person.dept}</span>
                    <span className="rescue-time-chip">
                      {person.timeIn && person.timeOut
                        ? `${person.timeIn} - ${person.timeOut}`
                        : person.time}
                    </span>
                  </div>
                  <div className="rescue-role">{person.role}</div>
                  <div className="rescue-contact">{person.email || person.phone}</div>
                </div>
              </div>
              <div className="rescue-actions">
                <button
                  className="circle-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  📞
                </button>
                <button
                  className="circle-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  💬
                </button>
                <button
                  className="circle-action-btn edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPerson(person);
                  }}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="circle-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRescuePersonnel(person.id);
                  }}
                  style={{ background: "#ef4444" }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedPerson && (
        <div className="detail-modal-overlay" onClick={handleCloseDetails}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={handleCloseDetails}
              aria-label="Close details"
            >
              ×
            </button>
            <div className="detail-header">
              <img
                src={selectedPerson.img || `https://i.pravatar.cc/150?u=${selectedPerson.id}`}
                alt={selectedPerson.name}
                className="detail-avatar"
              />
              <div>
                <div className="detail-title">{selectedPerson.name}</div>
                <div className="detail-subtitle">{selectedPerson.role}</div>
              </div>
            </div>
            <div className="detail-meta-row">
              <span className="detail-badge">{selectedPerson.dept}</span>
              <span className="detail-time-chip">
                {selectedPerson.timeIn && selectedPerson.timeOut
                  ? `${selectedPerson.timeIn} - ${selectedPerson.timeOut}`
                  : selectedPerson.time}
              </span>
            </div>
            <div className="detail-list">
              <div>
                <div className="detail-label">Email</div>
                <div>{selectedPerson.email || "—"}</div>
              </div>
              <div>
                <div className="detail-label">Phone</div>
                <div>{selectedPerson.phone || "—"}</div>
              </div>
              <div>
                <div className="detail-label">Department</div>
                <div>{selectedPerson.dept}</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="metric-card">
            <div className="metric-label">Communication</div>
            <div className="metric-value safe-text">Online</div>
          </div>
        </div>
      </aside>
    </AppShell>
  );
}