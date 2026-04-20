import { useState } from "react";
import type { Team } from "../types/contact";


type ContactFormValues = {
  username: string;
  phone: string;
  email: string;
  is_active: boolean;
  role: string;
  team: number | "";
  notes: string;
};

type Props = {
  initialValues?: any; // Using any for easier mapping from Contact object
  onSubmit: (values: ContactFormValues) => Promise<void>;
  submitText?: string;
  teams: Team[];
};

export default function ContactForm({
  initialValues,
  onSubmit,
  submitText = "Save",
  teams,
}: Props) {
  const [form, setForm] = useState<ContactFormValues>({
    username: initialValues?.username || "",
    phone: initialValues?.phone || "",
    email: initialValues?.email || "",
    is_active: false,
    role: initialValues?.role || "employee",
    team: initialValues?.team?.id || initialValues?.team || "",
    notes: initialValues?.notes || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: name === "team" ? (val === "" ? "" : Number(val)) : val,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(form);
      console.log(form);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="Enter username"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Team</label>
          <select
            name="team"
            value={form.team}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          >
            <option value="">No Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="Enter phone"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="Enter email"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="min-h-[120px] w-full rounded-lg border p-3"
          placeholder="Enter notes"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#0B1122] px-4 py-3 text-white disabled:opacity-60 hover:opacity-90"
      >
        {loading ? "Saving..." : submitText}
      </button>
    </form>
  );
}
