import { useState } from "react";
import { Modal } from "./ui";
import api from "../../lib/api";

export default function AddApplicationModal({ open, onClose, onCreated }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCompany("");
    setRole("");
    setLink("");
    setNotes("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      setError("Company and role are required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        company: company.trim(),
        role: role.trim(),
        link: link.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      const created = await api.post("/applications", payload);
      if (onCreated) onCreated(created);
      reset();
      onClose && onClose();
    } catch (err) {
      setError(err?.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Application">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Company</label>
            <input
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Role</label>
            <input
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Link</label>
          <input
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {error ? (
          <div className="text-sm text-rose-600">{error}</div>
        ) : null}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose && onClose();
            }}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
