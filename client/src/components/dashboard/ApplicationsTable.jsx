import { useState } from "react";
import { Badge } from "./ui";

export default function ApplicationsTable({ apps, onOpenAdd, onUpdateStatus, onDelete }) {
  const [busyId, setBusyId] = useState(null);
  const [errorById, setErrorById] = useState({});

  const run = async (id, fn) => {
    setBusyId(id);
    setErrorById((e) => ({ ...e, [id]: "" }));
    try {
      await fn();
    } catch (err) {
      setErrorById((e) => ({ ...e, [id]: err?.message || "Action failed" }));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (id) => {
    if (window.confirm("Delete this application? This cannot be undone.")) {
      run(id, () => onDelete(id));
    }
  };
  return (
    <section className="mt-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-base font-semibold text-gray-900">Recent Applications</h2>
        <button className="sm:hidden inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                onClick={onOpenAdd}>
          Add
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Applied</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {apps.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">{a.company}</td>
                <td className="px-5 py-3">{a.role}</td>
                <td className="px-5 py-3"><Badge status={a.status} /></td>
                <td className="px-5 py-3 text-gray-600">{a.applied_at}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      className="rounded-md px-2.5 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => run(a.id, () => onUpdateStatus(a.id, "interview"))}
                      disabled={busyId === a.id}
                    >
                      Interview
                    </button>
                    <button
                      className="rounded-md px-2.5 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      onClick={() => run(a.id, () => onUpdateStatus(a.id, "offer"))}
                      disabled={busyId === a.id}
                    >
                      Offer
                    </button>
                    <button
                      className="rounded-md px-2.5 py-1.5 text-xs bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                      onClick={() => run(a.id, () => onUpdateStatus(a.id, "rejected"))}
                      disabled={busyId === a.id}
                    >
                      Reject
                    </button>
                    <button
                      className="ml-3 rounded-md px-2.5 py-1.5 text-xs bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => confirmDelete(a.id)}
                      disabled={busyId === a.id}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                  {errorById[a.id] ? (
                    <div className="mt-1 text-xs text-rose-600 text-right">{errorById[a.id]}</div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
