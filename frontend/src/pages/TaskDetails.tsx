import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getTaskById, updateTask } from "../api/tasks";
import { getContact, getTeam } from "../api/contacts";
import type { Task, TaskPriority } from "../types/task";
import type { Contact, Team } from "../types/contact";
import { useRole } from '../contexts/RoleContext'; 
import { getTaskStatusHistory, createTaskStatusHistory } from "../api/tasks";
import type { TaskStatusHistory } from "../types/task";
import { getCurrentUserIdFromToken } from "../api/auth";
import { TaskStatusHistorySection } from "../components/TaskStatusHistorySection";

export const statusStyles: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  "in-progress": "bg-primary/50 text-primary",
  assigned: "bg-blue-50 text-blue-700",
  submitted: "bg-purple-50 text-purple-700",
  reviewed: "bg-indigo-50 text-indigo-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export function Badge({ label, styleClass }: { label: string; styleClass: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleClass}`}>
      {label}
    </span>
  );
}

export default function TaskDetails() {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdBy, setCreatedBy] = useState<Contact | null>(null);
  const [taskStatusHistory, setTaskStatusHistory] = useState<TaskStatusHistory[]>([]);
  const [assignedToUser, setAssignedToUser] = useState<Contact | null>(null);
  const [assignedToTeam, setAssignedToTeam] = useState<Team | null>(null);
  const {isManager, isSupervisor, isEmployee} = useRole();
  
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    due_date: "",
    priority: "medium" as TaskPriority,
  });
  const [saving, setSaving] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const taskData = await getTaskById(id);
        setTask(taskData);
        if (taskData.created_by) {
          const createdByData = await getContact(taskData.created_by);
          setCreatedBy(createdByData);
        }
        if (taskData.assigned_to_user) {
          const assignedToUserData = await getContact(taskData.assigned_to_user);
          setAssignedToUser(assignedToUserData);
        }
        if (taskData.assigned_to_team) {
          const assignedToTeamData = await getTeam(taskData.assigned_to_team);
          setAssignedToTeam(assignedToTeamData);
        }
        
        setEditForm({
          title: taskData.title,
          content: taskData.content || "",
          due_date: taskData.due_date || "",
          priority: taskData.priority,
        });

        const historyData = await getTaskStatusHistory(id);
        if (Array.isArray(historyData)) {
          setTaskStatusHistory(historyData);
        } else if (historyData && typeof historyData === 'object' && 'results' in historyData) {
          setTaskStatusHistory((historyData as any).results);
        }
        
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Unable to load task details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!task || !id) return;
    setSaving(true);
    let newStatus = task.status;
    let newIsDone = task.is_done;

    if (task.status === "assigned" || task.status === "rejected"){
      newStatus = "submitted";
    }
    else if (task.status === "submitted" ){
      newStatus = "reviewed";
    }
    else if (task.status === "reviewed"){
      newStatus = "approved";
    } 
    else if (task.status === "approved"){
      newIsDone = true;
    }
    try {
      const updatedTask = await updateTask(id, {
        title: editForm.title,
        content: editForm.content,
        due_date: editForm.due_date || null,
        priority: editForm.priority,
        status: newStatus,
        is_done: newIsDone,
      });
      setTask(updatedTask);

      if (newStatus !== task.status) {
        await createTaskStatusHistory({
          task: Number(id),
          name: newStatus,
          created_at: new Date().toISOString(),
          changed_by: Number(getCurrentUserIdFromToken()),
        });
      }

      navigate("/tasks/my-tasks");
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!task || !id) return;
    
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason === null) return; // User cancelled

    setSaving(true);
    try {
      const updatedTask = await updateTask(id, {
        title: editForm.title,
        content: editForm.content,
        due_date: editForm.due_date || null,
        priority: editForm.priority,
        status: "rejected",
        is_done: task.is_done,
      });
      setTask(updatedTask);

      await createTaskStatusHistory({
        task: Number(id),
        name: "rejected",
        rejection_reason: reason,
        created_at: new Date().toISOString(),
        changed_by: Number(getCurrentUserIdFromToken()),
      });

      navigate("/tasks/my-tasks");
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // All fields become read-only and Done is disabled when an employee has already submitted the task
  const isEmployeeSubmitted = isEmployee && task?.status === "submitted";
  // Lock everything for everyone when the task is approved
  const isApproved = task?.status === "approved";
  // Supervisors can only edit when status is assigned, submitted, or rejected
  const supervisorEditableStatuses = ["assigned", "submitted", "rejected"];
  const isSupervisorReadOnly = isSupervisor && !supervisorEditableStatuses.includes(task?.status ?? "");
  const isReadOnly = isEmployeeSubmitted || isApproved || isSupervisorReadOnly;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4FF]">
        <p className="text-sm text-slate-500">Loading task details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4FF]">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4FF]">
        <p className="text-sm text-slate-500">Task not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4FF] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
            <p className="text-xs text-slate-400">Task #{task.id}</p>
          </div>
          <Badge
            label={task.is_done ? "Completed" : "In progress"}
            styleClass={task.is_done ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Read-only Fields */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-600">Task Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <span className="block text-sm font-medium text-slate-400">Created by</span>
                <span className="text-sm text-slate-700">{createdBy ? createdBy.username : "Unknown"}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-400">Assigned to</span>
                <span className="text-sm text-slate-700">
                  {assignedToUser ? `User: ${assignedToUser.username}` 
                  : assignedToTeam ? `Team: ${assignedToTeam.name}` : "Unassigned"}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-400">Status</span>
                <Badge
                  label={task.status}
                  styleClass={statusStyles[task.status?.toLowerCase()] ?? "bg-slate-100 text-slate-600"}
                />
              </div>
            </div>
          </div>

          {/* Status History */}
          <TaskStatusHistorySection historyData={taskStatusHistory} />

          {/* Editable Fields */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-600">Edit Task Details</h3>
            {isReadOnly && (
              <p className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-md">
                {isApproved
                  ? "This task has been approved. No further edits can be made."
                  : isSupervisorReadOnly
                  ? "As a supervisor, you can only edit tasks that are assigned, submitted, or rejected."
                  : "This task has been submitted and is awaiting review. No further edits can be made."}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isReadOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={4}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isReadOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => handleInputChange("due_date", e.target.value)}
                  readOnly={(!isManager && !isSupervisor) || isReadOnly}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${((!isManager && !isSupervisor) || isReadOnly) ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value as TaskPriority)}
                  disabled={(!isManager && !isSupervisor) || isReadOnly}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${((!isManager && !isSupervisor) || isReadOnly) ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || isReadOnly}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#0B1122" }}
                >
                  {saving ? "Saving..." : "Done"}
                </button>
                {(isSupervisor || isManager) && (
                <button
                  onClick={handleReject}
                  disabled={saving || isReadOnly || isApproved  }
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>)}
              </div>
            </div>
          </div>

          
        </div>

      </div>
    </div>
    </div>

  );
}