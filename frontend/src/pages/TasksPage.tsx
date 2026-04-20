import { useCallback, useEffect, useState } from "react";
import { getCurrentUserIdFromToken } from "../api/auth";
import { getContact } from "../api/contacts";
import { createTask, deleteTask, getUserTasks } from "../api/tasks";
import type { Contact } from "../types/contact";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";
import Pagination from "../components/Pagination";




export default function TasksPage() {
  const id = getCurrentUserIdFromToken()
  //const { id } = useParams();

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksCount, setTasksCount] = useState(0);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskPage, setTaskPage] = useState(1);

  const [isDone, setIsDone] = useState<"" | 0 | 1>("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);


  const fetchContact = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getContact(id);
      setContact(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    if (!id) return;
    console.log("id in fetchTasks:", id);

    setTasksLoading(true);
    try {
      const data = await getUserTasks({
        contact: id,
        is_done: (isDone === "" ? undefined : isDone === 1) as any,
        priority: priority || undefined,
        status: status || undefined,
        due_from: dueFrom || undefined,
        due_to: dueTo || undefined,
        page: taskPage,
      });


      setTasks(data.results);
      console.log("Fetched tasks:", data.results);
      setTasksCount(data.count);
    } finally {
      setTasksLoading(false);
    }
  }, [id, isDone, priority, dueFrom, dueTo, taskPage, status]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);


  useEffect(() => {
    if (!id || !contact) return;

    fetchTasks();
  }, [id, contact, fetchTasks]);

  async function handleCreateTask(values: {
    contact: number;
    title: string;
    content: string;
    priority: TaskPriority;
    status: TaskStatus;
    due_date?: string | null;
  }) {
    await createTask(values);
    setTaskPage(1);
    await fetchTasks();
    await fetchContact();
    setIsFormOpen(false);
  }

  async function handleDeleteTask(taskId: number) {
    const ok = window.confirm("Delete this task?");
    if (!ok) return;

    await deleteTask(taskId);
    await fetchTasks();
    await fetchContact();
  }

  function handleResetFilters() {
    setIsDone("");
    setPriority("");
    setStatus("");
    setDueFrom("");
    setDueTo("");
    setTaskPage(1);
  }

  if (loading) {
    return <div className="p-6">Loading Tasks...</div>;
  }

  if (!contact) {
    return <div className="p-6">Contact not found.</div>;
  }


  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <button
            onClick={() => setIsFormOpen(true)}
            className="rounded-lg bg-[#0B1122] px-6 py-3 text-white hover:opacity-90"
          >
            + Add new Task
          </button>
        </div>

        {tasksLoading ? (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            Loading tasks...
          </div>
        ) : (
          <>
            <TaskTable
              tasks={tasks}
              isDone={isDone}
              priority={priority}
              dueFrom={dueFrom}
              dueTo={dueTo}
              onIsDoneChange={(value) => {
                setIsDone(value);
                setTaskPage(1);
              }}
              onPriorityChange={(value) => {
                setPriority(value);
                setTaskPage(1);
              }}
              onDueFromChange={(value) => {
                setDueFrom(value);
                setTaskPage(1);
              }}
              onDueToChange={(value) => {
                setDueTo(value);
                setTaskPage(1);
              }}
              onReset={handleResetFilters}
              onDelete={handleDeleteTask}
            />
            <Pagination
              page={taskPage}
              count={tasksCount}
              onPageChange={setTaskPage}
            />
          </>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Task</h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TaskForm
              contactId={contact.id}
              showTitle={false}
              onSubmit={handleCreateTask}
            />
          </div>
        </div>
      )}
    </div>
  );
}
