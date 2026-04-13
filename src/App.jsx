import { BrowserRouter, Routes, Route } from "react-router-dom";
import PersonnelPage from "./pages/PersonnelPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import HistoryPage from "./pages/HistoryPage";
import MapPage from "./pages/MapPage";
import RescuePage from "./pages/RescuePage";
import "./styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PersonnelPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/rescue" element={<RescuePage />} />
      </Routes>
    </BrowserRouter>
  );
}