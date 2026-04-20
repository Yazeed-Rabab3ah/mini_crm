import { useState } from "react";
import type { Contact } from "../types/contact";
import type { TeamPayload } from "../api/contacts";

type Props = {
  contacts: Contact[];
  onSubmit: (values: TeamPayload) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
};

export default function TeamForm({ contacts, onSubmit, onCancel, loading: externalLoading }: Props) {
  const [form, setForm] = useState<TeamPayload>({
    name: "",
    department: "it",
    manager: null,
    supervisor: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSubmitting = externalLoading || loading;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: (name === "department" || name === "name") ? value : value ? Number(value) : null,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(form);
    } catch (err: unknown) {
      const response = (err as { response?: { data?: unknown } })?.response;
      const data = response?.data;

      if (typeof data === "object" && data !== null) {
        const firstKey = Object.keys(data)[0];
        const firstValue = (data as Record<string, unknown>)[firstKey];
        let firstError: string | undefined;

        if (Array.isArray(firstValue) && firstValue.length > 0) {
          firstError = String(firstValue[0]);
        }
        setError(firstError || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium">Team Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
          placeholder="Enter team name"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Department</label>
        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
          required
        >
          <option value="it">IT</option>
          <option value="marketing">Marketing</option>
          <option value="finance">Finance</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Manager</label>
        <select
          name="manager"
          value={form.manager || ""}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        >
          <option value="">No Manager</option>
          {contacts
            .filter((c) => c.role?.toLowerCase() === "manager")
            .map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.username}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Supervisor</label>
        <select
          name="supervisor"
          value={form.supervisor || ""}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        >
          <option value="">No Supervisor</option>
          {contacts
            .filter((c) => c.role?.toLowerCase() === "supervisor")
            .map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.username}
              </option>
            ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-[#0B1122] px-4 py-3 text-white disabled:opacity-60 hover:opacity-90"
        >
          {isSubmitting ? "Creating..." : "Create Team"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border px-4 py-3 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
