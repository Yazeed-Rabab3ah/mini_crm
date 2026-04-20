import { useState } from "react";
import type { TaskPriority } from "../types/task";

type TaskFormValues = {
  title: string;
  priority: TaskPriority;
  content: string;
  due_date: string;
};

type Props = {
  contactId: number;
  showTitle?: boolean;
  onSubmit: (values: {
    assigned_to_user: number;
    created_by: number,
    title: string;
    priority: TaskPriority;
    status: "assigned";
    due_date?: string | null;
  }) => Promise<void>;
};

export default function TaskForm({ contactId, showTitle = true, onSubmit }: Props) {
  const [form, setForm] = useState<TaskFormValues>({
    title: "",
    priority: "medium",
    content: "",
    due_date: "", 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        created_by:contactId,
        assigned_to_user: contactId,
        title: form.title,
        priority: form.priority,
        due_date: form.due_date || null,
        status: "assigned",
      });

      setForm({
        title: "",
        priority: "medium",
        content: "",
        due_date: "",   
      });
    } catch (err: unknown) {
      const response = (err as { response?: { data?: unknown } })?.response;
      const data = response?.data;
      if (typeof data === "object" && data !== null) {
        const firstKey = Object.keys(data)[0];
        const firstError = (data as Record<string, unknown>)[firstKey];
        if (Array.isArray(firstError) && firstError.length > 0) {
          setError(String(firstError[0]));
        } else {
          setError("Failed to create task");
        }
      } else {
        setError("Failed to create task");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 ">
      {showTitle && <h2 className="text-lg font-semibold">Add New Task</h2>}

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="w-full rounded-lg border p-3"
        required
      />

      <textarea
        name="content"
        value={form.content}
        onChange={handleChange}
        placeholder="Content"
        className="w-full rounded-lg border px-2 py-2"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="rounded-lg border p-3"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
          className="rounded-lg border p-3"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#0B1122] px-4 py-3 text-white disabled:opacity-60 hover:opacity-90"
      >
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}