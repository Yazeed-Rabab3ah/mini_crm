import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllContacts, getTeams } from "../api/contacts";
import { createTask } from "../api/tasks";
import type { Contact, Team } from "../types/contact";
import type { TaskPriority } from "../types/task";

type AssignType = "user" | "team";

export default function AssignTaskPage() {
    const navigate = useNavigate();
    
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [dueDate, setDueDate] = useState("");
    const [assignType, setAssignType] = useState<AssignType>("user");
    const [assignedId, setAssignedId] = useState<number | "">("");

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [contactsRes, teamsRes] = await Promise.all([
                    getAllContacts(),
                    getTeams()
                ]);
                // Note: might need pagination handling if there are many contacts/teams. 
                // For a mini CRM, a single page might be sufficient.
                setContacts(contactsRes);
                setTeams(teamsRes.results);
            } catch (error) {
                console.error("Failed to load contacts or teams", error);
                setError("Failed to load users and teams.");
            } finally {
                setLoadingData(false);
            }
        }
        loadData();
    }, []);

    // Reset assigned id when type changes
    useEffect(() => {
        setAssignedId("");
    }, [assignType]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        
        if (!assignedId) {
            setError(`Please select a ${assignType} to assign the task to.`);
            return;
        }

        setSubmitting(true);
        try {
            await createTask({
                title,
                content,
                priority,
                due_date: dueDate || null,
                status: "assigned",
                assigned_to_user: assignType === "user" ? Number(assignedId) : null,
                assigned_to_team: assignType === "team" ? Number(assignedId) : null,
            });
            navigate("/tasks/my-tasks"); // navigate to tasks page after successful creation
        } catch (err: any) {
            const data = err.response?.data;

            const errorMessage =
                data?.detail?.[0] ||
                data?.title?.[0] ||
                data?.due_date?.[0] ||
                data?.assigned_to_user?.[0] ||
                data?.assigned_to_team?.[0] ||
                data?.priority?.[0] ||
                data?.status?.[0] ||
                "Something went wrong";

            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingData) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F3F4FF]"><p className="text-sm text-slate-500">Loading...</p></div>;
    }

    return (
        <div className="min-h-screen bg-[#F3F4FF] px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0" style={{backgroundColor: "#0B1122"}}>
                            <svg className="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeWidth="1.2" />
                                <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-medium text-slate-800 truncate">Assign Task</p>
                            <p className="text-xs text-slate-400">Create a new task</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Describe the task..."
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Priority and Due Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value as TaskPriority)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Assign Type */}
                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-3">Assign To</label>
                        <div className="flex items-center gap-6 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="assignType"
                                    value="user"
                                    checked={assignType === "user"}
                                    onChange={() => setAssignType("user")}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-slate-700">User</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="assignType"
                                    value="team"
                                    checked={assignType === "team"}
                                    onChange={() => setAssignType("team")}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-slate-700">Team</span>
                            </label>
                        </div>

                        {/* Assign Select */}
                        <div>
                            {assignType === "user" ? (
                                <select
                                    value={assignedId}
                                    onChange={e => setAssignedId(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a user...</option>
                                    {contacts.map(c => (
                                        <option key={c.id} value={c.id}>{c.username} {c.team?.name ? `(${c.team.name})` : ''}</option>
                                    ))}
                                </select>
                            ) : (
                                <select
                                    value={assignedId}
                                    onChange={e => setAssignedId(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a team...</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting || !assignedId}
                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "#0B1122" }}
                        >
                            {submitting ? "Assigning..." : "Done"}
                        </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        </div>
    );
}