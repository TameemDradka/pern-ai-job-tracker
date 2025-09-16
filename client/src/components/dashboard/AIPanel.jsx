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
  const [copied, setCopied] = useState(false);

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
    setCopied(false);
  };

  const handleCopySkills = async () => {
    try {
      const text = (skills || []).join(", ");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // Silently ignore copy errors
    }
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
        {/* word/char count */}
        <div className="sm:col-span-1 text-xs text-gray-500 self-end">
          <span className="tabular-nums">
            {(() => {
              const text = jobDescription || "";
              const words = text.trim() ? text.trim().split(/\s+/).length : 0;
              const chars = text.length;
              return `${words} words · ${chars} characters`;
            })()}
          </span>
        </div>
        <div className="flex sm:flex-col gap-2">
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-white transition-colors ${
              loading || !jobDescription.trim()
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
          >
            {loading && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
                aria-hidden="true"
              />
            )}
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
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Skills</h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySkills}
                    className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
                  >
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={`${s}-${idx}`}
                  className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200"
                >
                  {s}
                </span>
              ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
