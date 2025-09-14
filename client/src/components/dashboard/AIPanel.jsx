export default function AIPanel() {
  return (
    <section className="mt-6 bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-900">AI: Extract skills from a Job Description</h3>
      <p className="mt-1 text-sm text-gray-600">Paste a JD and we’ll extract key skills to tailor your resume.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <textarea rows={5} placeholder="Paste job description here…"
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="flex sm:flex-col gap-2">
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Analyze</button>
          <button className="rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200">Clear</button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-700">React</span>
        <span className="px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-700">PostgreSQL</span>
        <span className="px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-700">REST APIs</span>
      </div>
    </section>
  );
}