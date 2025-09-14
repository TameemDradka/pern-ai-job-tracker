export const Badge = ({ status }) => {
  const map = {
    applied: "bg-yellow-100 text-yellow-800",
    interview: "bg-blue-100 text-blue-800",
    offer: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-md ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

export const Card = ({ title, value, hint }) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    {hint && <div className="mt-2 text-xs text-gray-500">{hint}</div>}
  </div>
);

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="rounded-md p-1.5 hover:bg-gray-100">✕</button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
};