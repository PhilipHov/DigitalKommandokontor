import { Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "./pages/Products";
import LoginPage from "./pages/Login";
import PlanLog from "./pages/PlanLog";
import PlanTransport from "./pages/PlanTransport";
import PlanUddannelse from "./pages/PlanUddannelse";
import PlanPSN from "./pages/PlanPSN";

export type Org = "UAFD" | "HKO" | "OTHER";
const ORG_KEY = "planops_org";
export const setOrg = (org: Org) => localStorage.setItem(ORG_KEY, org);
export const getOrg = (): Org => (localStorage.getItem(ORG_KEY) as Org) || "UAFD";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/apps" element={<ProductsPage />} />
      <Route path="/app/planlog" element={<PlanLog />} />
      <Route path="/app/plantransport" element={<PlanTransport />} />
      <Route path="/app/planuddannelse" element={<PlanUddannelse />} />
      <Route path="/app/planpsn" element={<PlanPSN />} />
      <Route path="/planlog" element={<Navigate to="/app/planlog" replace />} />
      <Route path="/plantransport" element={<Navigate to="/app/plantransport" replace />} />
      <Route path="/planuddannelse" element={<Navigate to="/app/planuddannelse" replace />} />
      <Route path="/planpsn" element={<Navigate to="/app/planpsn" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

