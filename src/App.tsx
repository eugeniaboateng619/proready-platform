import { Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { EmployerPortal } from "@/views/EmployerPortal";
import { CandidateWorkspace } from "@/views/CandidateWorkspace";

/** Root application shell. Routes between View A and View B. */
export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/employer" replace />} />
          <Route path="/employer" element={<EmployerPortal />} />
          <Route path="/candidate" element={<CandidateWorkspace />} />
          <Route path="*" element={<Navigate to="/employer" replace />} />
        </Routes>
      </main>
    </div>
  );
}
