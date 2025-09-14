import { IconMenu, IconPlus, IconLogout } from "./icons";

export default function Topbar({ onToggleSidebar, onOpenAdd }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onToggleSidebar} className="lg:hidden rounded-lg p-2 hover:bg-gray-100" aria-label="Toggle sidebar">
            <IconMenu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="font-semibold text-gray-900">Job Tracker</div>
          <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">PERN + Supabase</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                  onClick={onOpenAdd}>
            <IconPlus className="w-5 h-5" /> Add Application
          </button>
          <button title="Sign out" className="rounded-lg p-2 hover:bg-gray-100">
            <IconLogout className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}