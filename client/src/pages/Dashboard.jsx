import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import { Card } from "../components/dashboard/ui";
import ApplicationsTable from "../components/dashboard/ApplicationsTable";
import AIPanel from "../components/dashboard/AIPanel";
import AddApplicationModal from "../components/dashboard/AddApplicationModal";
import api from "../lib/api";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Fetch applications on mount
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get("/applications")
      .then((data) => {
        if (!active) return;
        setApps(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Failed to load applications");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Derived counts
  const counts = useMemo(() => {
    return {
      total: apps.length,
      applied: apps.filter((a) => a.status === "applied").length,
      interview: apps.filter((a) => a.status === "interview").length,
      offer: apps.filter((a) => a.status === "offer").length,
    };
  }, [apps]);

  // Create new application (called by modal)
  const handleCreated = (newApp) => {
    setApps((prev) => [newApp, ...prev]);
  };

  // Update status with optimistic UI; returns a promise for the table to manage loading/errors
  const updateStatus = (id, status) => {
    const prevApps = apps;
    const nextApps = apps.map((a) => (a.id === id ? { ...a, status } : a));
    setApps(nextApps);
    return api
      .patch(`/applications/${id}/status`, { status })
      .then((updated) => {
        // ensure we sync with server response in case other fields changed
        setApps((curr) => curr.map((a) => (a.id === id ? { ...a, ...updated } : a)));
      })
      .catch((err) => {
        // rollback
        setApps(prevApps);
        throw err;
      });
  };

  // Delete with optimistic removal; returns a promise
  const deleteApplication = (id) => {
    const prevApps = apps;
    setApps((curr) => curr.filter((a) => a.id !== id));
    return api
      .del(`/applications/${id}`)
      .catch((err) => {
        // rollback
        setApps(prevApps);
        throw err;
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onOpenAdd={() => setAddOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
        <Sidebar open={sidebarOpen} />

        <main className="mt-6 lg:mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Total" value={counts.total} />
            <Card title="Applied" value={counts.applied} />
            <Card title="Interviews" value={counts.interview} />
            <Card title="Offers" value={counts.offer} />
          </div>

          {loading ? (
            <section className="mt-6 bg-white rounded-xl shadow-sm">
              <div className="px-5 py-6 text-gray-600">Loading…</div>
            </section>
          ) : error ? (
            <section className="mt-6 bg-white rounded-xl shadow-sm">
              <div className="px-5 py-6 text-rose-600">{error}</div>
            </section>
          ) : apps.length === 0 ? (
            <section className="mt-6 bg-white rounded-xl shadow-sm">
              <div className="px-5 py-10 text-center">
                <p className="text-gray-600 mb-4">No applications yet</p>
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                  onClick={() => setAddOpen(true)}
                >
                  Add Application
                </button>
              </div>
            </section>
          ) : (
            <ApplicationsTable
              apps={apps}
              onOpenAdd={() => setAddOpen(true)}
              onUpdateStatus={updateStatus}
              onDelete={deleteApplication}
            />
          )}
          <AIPanel />
        </main>
      </div>

      <AddApplicationModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={handleCreated} />
    </div>
  );
}