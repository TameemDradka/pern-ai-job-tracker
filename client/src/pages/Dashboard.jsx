import { useState } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import { Card } from "../components/dashboard/ui";
import ApplicationsTable from "../components/dashboard/ApplicationsTable";
import AIPanel from "../components/dashboard/AIPanel";
import AddApplicationModal from "../components/dashboard/AddApplicationModal";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // demo data for shell
  const apps = [
    { id: 1, company: "Amazon", role: "SDE Intern", status: "applied", link: "#", applied_at: "2025-09-10" },
    { id: 2, company: "Google", role: "STEP", status: "interview", link: "#", applied_at: "2025-09-08" },
    { id: 3, company: "Startup X", role: "Full-Stack Intern", status: "offer", link: "#", applied_at: "2025-09-01" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onOpenAdd={() => setAddOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
        <Sidebar open={sidebarOpen} />

        <main className="mt-6 lg:mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Total" value={apps.length} />
            <Card title="Applied" value={apps.filter(a => a.status === "applied").length} />
            <Card title="Interviews" value={apps.filter(a => a.status === "interview").length} />
            <Card title="Offers" value={apps.filter(a => a.status === "offer").length} />
          </div>

          <ApplicationsTable apps={apps} onOpenAdd={() => setAddOpen(true)} />
          <AIPanel />
        </main>
      </div>

      <AddApplicationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}