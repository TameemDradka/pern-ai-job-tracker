export default function Sidebar({ open }) {
  return (
    <aside className={`${open ? "block" : "hidden"} lg:block`}>
      <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
        <a className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100" href="#">
          Dashboard <span className="text-xs text-gray-500">Now</span>
        </a>
        <a className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" href="#">Applications</a>
        <a className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" href="#">Analytics</a>
        <a className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" href="#">AI Tools</a>
        <div className="pt-3 border-t">
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Career Fair</div>
          <div className="text-sm text-gray-600">Sept 16–18</div>
        </div>
      </nav>
    </aside>
  );
}