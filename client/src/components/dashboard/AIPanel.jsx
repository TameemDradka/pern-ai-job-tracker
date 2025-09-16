import { useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function AIPanel() {
  // Textarea bound to jobDescription state
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState([]);
  const [summary, setSummary] = useState("");

  // Touch auth context to ensure token & 401 handling are wired
  const { token } = useAuth(); // eslint-disable-line no-unused-vars

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/ai/extract-skills", { jobDescription });
      setSkills(Array.isArray(res?.skills) ? res.skills : []);
      setSummary(typeof res?.summary === "string" ? res.summary : "");
    } catch (e) {
      // If 401, api.js will trigger global logout handler; for others show inline error
      setError("Couldn't analyze. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setJobDescription("");
    setSkills([]);
    setSummary("");
    setError("");
  };

  return (
    <section className="mt-6 bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-900">
        AI: Extract skills from a Job Description
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Paste a JD and we’ll extract key skills to tailor your resume.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <textarea
          rows={5}
          placeholder="Paste job description here…"
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <div className="flex sm:flex-col gap-2">
          <button
            className={`rounded-lg px-4 py-2 text-white transition-colors ${
              loading || !jobDescription.trim()
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
          <button
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Results */}
      {(summary || skills.length > 0) && (
        <div className="mt-4">
          {summary && (
            <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
          )}
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={`${s}-${idx}`}
                  className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
