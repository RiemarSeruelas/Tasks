import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialPersonnel } from "../data/mockData";

const nowString = () => new Date().toLocaleString();

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      emergencyActive: false,
      emergencyStartTime: null,
      selectedDepartment: "ALL",
      searchTerm: "",
      personnel: initialPersonnel,
      history: [],

      setDepartmentFilter: (dept) => set({ selectedDepartment: dept }),
      setSearchTerm: (value) => set({ searchTerm: value }),

      toggleEmergency: () => {
        const { emergencyActive, emergencyStartTime, personnel, history } = get();

        if (!emergencyActive) {
          set({
            emergencyActive: true,
            emergencyStartTime: Date.now(),
          });
          return;
        }

        const endTime = Date.now();
        const startTime = emergencyStartTime || endTime;
        const durationSec = Math.floor((endTime - startTime) / 1000);

        const civilians = personnel.filter((p) => !p.isRescue);
        const safe = civilians.filter((p) => p.status === "SAFE").length;
        const notSafe = civilians.filter((p) => p.status !== "SAFE").length;

        const snapshot = {
          id: `evt-${endTime}`,
          timestamp: nowString(),
          duration: `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`,
          safe,
          notSafe,
          personnelSnapshot: civilians.map((p) => ({
            id: p.id,
            name: p.name,
            dept: p.dept,
            role: p.role,
            status: p.status,
          })),
        };

        set({
          emergencyActive: false,
          emergencyStartTime: null,
          history: [snapshot, ...history],
        });
      },

      togglePersonStatus: (personId) => {
        const { personnel } = get();

        set({
          personnel: personnel.map((p) => {
            if (p.id !== personId || p.isRescue) return p;
            return {
              ...p,
              status: p.status === "SAFE" ? "NOT_SAFE" : "SAFE",
            };
          }),
        });
      },

      setPersonStatus: (personId, status) => {
        const { personnel } = get();

        set({
          personnel: personnel.map((p) =>
            p.id === personId ? { ...p, status } : p
          ),
        });
      },

      resetDashboard: () =>
        set({
          emergencyActive: false,
          emergencyStartTime: null,
          selectedDepartment: "ALL",
          searchTerm: "",
          personnel: initialPersonnel,
          history: [],
        }),
    }),
    {
      name: "emergency-dashboard-store",
    }
  )
);