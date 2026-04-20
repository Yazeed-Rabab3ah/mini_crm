import type { TaskPriority } from "../types/task";

type Props = {
  isDone: "" | 0 | 1;
  priority: TaskPriority | "";
  dueFrom: string;
  dueTo: string;
  onIsDoneChange: (value: "" | 0 | 1) => void;
  onPriorityChange: (value: TaskPriority | "") => void;
  onDueFromChange: (value: string) => void;
  onDueToChange: (value: string) => void;
  onReset: () => void;
};

export default function TaskFilters({
  isDone,
  priority,
  dueFrom,
  dueTo,
  onIsDoneChange,
  onPriorityChange,
  onDueFromChange,
  onDueToChange,
  onReset,
}: Props) {
  return (
    <div className="grid gap-4 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-5">
      <select
        value={isDone}
        onChange={(e) => {
          const value = e.target.value;
          onIsDoneChange(value === "" ? "" : Number(value) as 0 | 1);
        }}
        className="rounded-lg border p-3"
      >
        <option value="">All tasks</option>
        <option value="0">Pending</option>
        <option value="1">Done</option>
      </select>

      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as TaskPriority | "")}
        className="rounded-lg border p-3"
      >
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="date"
        value={dueFrom}
        onChange={(e) => onDueFromChange(e.target.value)}
        className="rounded-lg border p-3"
      />

      <input
        type="date"
        value={dueTo}
        onChange={(e) => onDueToChange(e.target.value)}
        className="rounded-lg border p-3"
      />

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border px-4 py-3"
      >
        Reset
      </button>
    </div>
  );
}