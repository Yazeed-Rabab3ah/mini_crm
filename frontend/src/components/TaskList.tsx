import type { Task } from "../types/task";

type Props = {
  tasks: Task[];
  onToggleDone: (task: Task) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

function isOverdue(task: Task) {
  if (task.is_done || !task.due_date) return false;

  const today = new Date();
  const due = new Date(task.due_date);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

function priorityBadge(priority: Task["priority"]) {
  if (priority === "high") {
    return "bg-red-100 text-red-700";
  }
  if (priority === "medium") {
    return "bg-yellow-100 text-yellow-700";
  }
  return "bg-blue-100 text-blue-700";
}

export default function TaskList({ tasks, onToggleDone, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-gray-500 shadow-sm">
        No tasks found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const overdue = isOverdue(task);

        return (
          <div
            key={task.id}
            className={`rounded-xl border bg-white p-5 shadow-sm ${
              overdue ? "border-red-300 bg-red-50" : ""
            }`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-lg font-semibold ${
                      task.is_done ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${priorityBadge(task.priority)}`}
                  >
                    {task.priority}
                  </span>

                  {task.is_done && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      done
                    </span>
                  )}

                  {overdue && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                      overdue
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                  </span>
                  <span>
                    Created: {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onToggleDone(task)}
                  className="rounded border px-4 py-2"
                >
                  {task.is_done ? "Mark Pending" : "Mark Done"}
                </button>

                <button
                  onClick={() => onDelete(task.id)}
                  className="rounded border px-4 py-2 text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}