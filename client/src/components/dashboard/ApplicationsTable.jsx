import { Badge } from "./ui";

export default function ApplicationsTable({ apps, onOpenAdd }) {
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
                  <div className="flex justify-end gap-2">
                    <button className="rounded-md px-2.5 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700">Interview</button>
                    <button className="rounded-md px-2.5 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700">Offer</button>
                    <button className="rounded-md px-2.5 py-1.5 text-xs bg-rose-600 text-white hover:bg-rose-700">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}