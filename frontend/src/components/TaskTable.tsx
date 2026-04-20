import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Task, TaskStatus, TaskPriority } from "../types/task";
import { useRole } from "../contexts/RoleContext";

type Tab = TaskStatus | "all";

const MANAGER_TABS: { label: string; value: Tab }[] = [
  { label: "All", value: "all" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Approved", value: "approved" },
];

const SUPERVISOR_TABS: { label: string; value: Tab }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Reviewed", value: "reviewed" },
];

const EMPLOYEE_TABS: { label: string; value: Tab }[] = [
  { label: "Assigned", value: "assigned" },
  { label: "Submitted", value: "submitted" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_STYLES: Record<TaskStatus, string> = {
  assigned:  "bg-blue-50  text-blue-800",
  submitted: "bg-amber-50 text-amber-800",
  reviewed:  "bg-purple-50 text-purple-800",
  approved:  "bg-green-50 text-green-800",
  rejected:  "bg-red-50   text-red-700",
};

const PRIORITY_STYLES = {
  high:   "bg-red-50   text-red-700",
  medium: "bg-amber-50 text-amber-800",
  low:    "bg-green-50 text-green-800",
};

type Props = {
  tasks: Task[];
  onDelete: (id: number) => void;
  isDone?: "" | 0 | 1;
  priority?: TaskPriority | "";
  dueFrom?: string;
  dueTo?: string;
  onIsDoneChange?: (value: "" | 0 | 1) => void;
  onPriorityChange?: (value: TaskPriority | "") => void;
  onDueFromChange?: (value: string) => void;
  onDueToChange?: (value: string) => void;
  onReset?: () => void;
};

export default function TaskTable({
  tasks,
  onDelete,
  isDone = "",
  priority = "",
  dueFrom = "",
  dueTo = "",
  onIsDoneChange,
  onPriorityChange,
  onDueFromChange,
  onDueToChange,
  onReset,
}: Props) {
  const { role, isManager, isSupervisor, isEmployee } = useRole();
  const availableTabs =
    isManager ? MANAGER_TABS :
    isSupervisor ? SUPERVISOR_TABS :
    isEmployee ? EMPLOYEE_TABS :
    [];

  const [activeTab, setActiveTab] = useState<Tab>(availableTabs[0]?.value ?? "assigned");

  useEffect(() => {
    if (!availableTabs.length) {
      return;
    }

    if (!availableTabs.some((tab) => tab.value === activeTab)) {
      setActiveTab(availableTabs[0].value);
    }
  }, [activeTab, availableTabs]);

  const filtered = activeTab === "all" ? tasks : tasks.filter((t) => t.status === activeTab);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

  {/* Filters Bar */}
  <div className="border-b border-gray-200 bg-gray-50 p-6">
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
      <select
        value={isDone}
        onChange={(e) => {
          const value = e.target.value;
          onIsDoneChange?.(value === "" ? "" : Number(value) as 0 | 1);
        }}
        className="rounded-xl border border-gray-300 bg-white p-3 text-base"
      >
        <option value="">All tasks</option>
        <option value="0">Pending</option>
        <option value="1">Done</option>
      </select>

      <select
        value={priority}
        onChange={(e) => onPriorityChange?.(e.target.value as TaskPriority | "")}
        className="rounded-xl border border-gray-300 bg-white p-3 text-base"
      >
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="date"
        value={dueFrom}
        onChange={(e) => onDueFromChange?.(e.target.value)}
        className="rounded-xl border border-gray-300 bg-white p-3 text-base"
      />

      <input
        type="date"
        value={dueTo}
        onChange={(e) => onDueToChange?.(e.target.value)}
        className="rounded-xl border border-gray-300 bg-white p-3 text-base"
      />

      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base hover:bg-gray-100"
      >
        Reset
      </button>
    </div>
  </div>

  {/* Tabs */}
  <div className="flex items-center gap-1 border-b border-gray-200 px-6">
    {availableTabs.length === 0 ? (
      <div className="px-0 py-4 text-base text-gray-500">
        No tabs available for your role.
      </div>
    ) : (
      availableTabs.map((tab) => {
        const count = tab.value === "all" ? tasks.length : tasks.filter((t) => t.status === tab.value).length;

        return (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 border-b-2 px-5 py-4 text-base transition-colors ${
              activeTab === tab.value
                ? "border-gray-900 font-medium text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2.5 py-1 text-sm ${
                activeTab === tab.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })
    )}
  </div>

  {/* Table */}
  {filtered.length === 0 ? (
    <div className="py-16 text-center text-base text-gray-400">
      No tasks in this category.
    </div>
  ) : (
    <table className="w-full text-base">
      <thead>
        <tr className="border-b border-gray-100 text-sm text-gray-500">
          <th className="px-6 py-4 text-left font-medium">Title</th>
          <th className="px-6 py-4 text-left font-medium">Status</th>
          <th className="px-6 py-4 text-left font-medium">Priority</th>
          <th className="px-6 py-4 text-left font-medium">Due date</th>
          <th className="px-6 py-4"></th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((task) => (
          <tr
            key={task.id}
            className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
          >
            {/* Title */}
            <td className="px-6 py-4 font-medium text-gray-900">
              {task.title}
            </td>

            {/* Status badge */}
            <td className="px-6 py-4">
              <span className={`rounded-full px-3.5 py-1 text-sm font-medium capitalize ${STATUS_STYLES[task.status]}`}>
                {task.status}
              </span>
            </td>

            {/* Priority badge */}
            <td className="px-6 py-4">
              <span className={`rounded-full px-3.5 py-1 text-sm font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}>
                {task.priority}
              </span>
            </td>

            {/* Due date */}
            <td className="px-6 py-4 text-gray-500">
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : <span className="text-gray-300">—</span>}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-3">
                <Link
                  to={`/tasks/${task.id}/details`}
                  className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  title="View details"
                >
                  <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3C4.5 3 1.73 5.61 1 9c.73 3.39 3.5 6 7 6s6.27-2.61 7-6c-.73-3.39-3.5-6-7-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                  </svg>
                </Link>
                <button
                  onClick={() => onDelete(task.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Delete task"
                >
                  <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
  );
}