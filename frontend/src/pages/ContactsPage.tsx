import { useCallback, useEffect, useState } from "react";
import { deleteContact, getContacts, getTeams, getAllContacts } from "../api/contacts";
import type { Contact, Team } from "../types/contact";
import ContactFilters from "../components/ContactFilters";
import ContactTable from "../components/ContactTable";
import Pagination from "../components/Pagination";
import ContactForm from "../components/ContactForm";
import TeamForm from "../components/TeamForm";
import { createContact, createTeam, updateContact } from "../api/contacts";

import TeamDetails from "../components/TeamDetails";
import { useRole } from "../contexts/RoleContext";

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "teams">("contacts");

  // Contacts State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<boolean | undefined>(undefined);
  const [contactTeamId, setContactTeamId] = useState<number | undefined>(undefined);
  const [ordering, setOrdering] = useState("-created_at");
  const [contactsPage, setContactsPage] = useState(1);

  // Teams State
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDepartment, setTeamDepartment] = useState<string | undefined>(undefined);

  // Modal States
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const { isManager, isSupervisor } = useRole()

  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const data = await getContacts({
        search: search || undefined,
        is_active: status,
        team: contactTeamId,
        ordering,
        page: contactsPage,
      });
      setContacts(data.results);
      setContactsCount(data.count);
    } finally {
      setLoadingContacts(false);
    }
  }, [search, status, contactTeamId, ordering, contactsPage]);

  const fetchTeams = useCallback(async () => {
    setLoadingTeams(true);
    try {
      const data = await getTeams({
        department: teamDepartment || undefined,
      });
      setTeams(data.results || []);
    } finally {
      setLoadingTeams(false);
    }
  }, [teamDepartment]);

  const fetchAllContacts = useCallback(async () => {
    try {
      const data = await getAllContacts();
      setAllContacts(data);
    } catch (err) {
      console.error("Failed to fetch all contacts", err);
    }
  }, []);

  // Fetch both on mount so switching tabs is instant and heights are stable
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    fetchTeams();
    fetchAllContacts();
  }, [fetchTeams, fetchAllContacts]);

  async function handleDeleteContact(id: number) {
    const ok = window.confirm("Are you sure you want to delete this contact?");
    if (!ok) return;
    await deleteContact(id);
    fetchContacts();
  }

  async function handleCreateContact(values: any) {
    await createContact(values);
    setIsContactModalOpen(false);
    fetchContacts();
  }

  async function handleCreateTeam(values: any) {
    await createTeam(values);
    setIsTeamModalOpen(false);
    fetchTeams();
  }

  async function handleUpdateContact(values: any) {
    if (!editingContact) return;
    await updateContact(editingContact.id, values);
    setEditingContact(null);
    fetchContacts();
  }

  function handleReset() {
    setSearch("");
    setStatus(undefined);
    setContactTeamId(undefined);
    setOrdering("-created_at");
    setContactsPage(1);
  }

  return (
    <div className="mx-auto max-w-5xl w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Directory</h2>
        
        {(isManager || isSupervisor) && (
          activeTab === "contacts" ? (
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="rounded-lg bg-[#0B1122] px-6 py-3 text-white hover:opacity-90"
            >
              + Add new Contact
            </button>
          ) : (
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="rounded-lg bg-[#0B1122] px-6 py-3 text-white hover:opacity-90"
            >
              + Add new Team
            </button>
          )
        )}

      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Filters Bar */}
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          
          {activeTab === "contacts" ? (
            <ContactFilters
              search={search}
              status={status}
              teamId={contactTeamId}
              teams={teams}
              ordering={ordering}
              onSearchChange={(value) => { setSearch(value); setContactsPage(1); }}
              onStatusChange={(value) => { setStatus(value); setContactsPage(1); }}
              onTeamChange={(value) => { setContactTeamId(value); setContactsPage(1); }}
              onOrderingChange={(value) => { setOrdering(value); setContactsPage(1); }}
              onReset={handleReset}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              <select
                value={teamDepartment || ""}
                onChange={(e) => setTeamDepartment(e.target.value || undefined)}
                className="w-full rounded-lg bg-white p-3 outline-none"
              >
                <option value="">All Departments</option>
                <option value="it">IT</option>
                <option value="marketing">Marketing</option>
                <option value="finance">Finance</option>
              </select>

              {/* Spacers to keep the reset button on the right if needed, or just let it follow */}
              <div className="hidden md:block"></div>
              <div className="hidden md:block"></div>

              <button
                onClick={() => setTeamDepartment(undefined)}
                className="rounded-lg bg-white px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 border-b border-gray-200 px-6">
          {(["contacts", "teams"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 border-b-2 px-5 py-4 text-base capitalize transition-colors ${activeTab === tab
                  ? "border-gray-900 font-medium text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
            >
              {tab}
              <span
                className={`rounded-full px-2.5 py-1 text-sm ${activeTab === tab
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500"
                  }`}
              >
                {tab === "contacts" ? contactsCount : teams.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "contacts" ? (
            <div className="bg-white">
              {loadingContacts ? (
                <div className="py-16 text-center text-base text-gray-400">
                  Loading contacts...
                </div>
              ) : contacts.length === 0 ? (
                <div className="py-16 text-center text-base text-gray-400">
                  No contacts found.
                </div>
              ) : (
                <>
                  <ContactTable
                    contacts={contacts}
                    onDelete={handleDeleteContact}
                    onEdit={(contact) => setEditingContact(contact)}
                  />
                  <div className="p-6 border-t border-gray-100">
                    <Pagination page={contactsPage} count={contactsCount} onPageChange={setContactsPage} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white">
              {loadingTeams ? (
                <div className="py-16 text-center text-base text-gray-400">
                  Loading teams...
                </div>
              ) : teams.length === 0 ? (
                <div className="py-16 text-center text-base text-gray-400">
                  No teams found.
                </div>
              ) : (
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm text-gray-500">
                      <th className="px-6 py-4 text-left font-medium">Name</th>
                      <th className="px-6 py-4 text-left font-medium">Department</th>
                      <th className="px-6 py-4 text-left font-medium">Manager</th>
                      <th className="px-6 py-4 text-left font-medium">Supervisor</th>
                      <th className="px-6 py-4 text-left font-medium">Created At</th>
                      <th className="px-6 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr
                        key={team.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{team.name}</td>
                        <td className="px-6 py-4 text-gray-500">{team.department}</td>
                        <td className="px-6 py-4 text-gray-500">{team.manager_username || "—"}</td>
                        <td className="px-6 py-4 text-gray-500">{team.supervisor_username || "—"}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {team.created_at
                            ? new Date(team.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedTeam(team)}
                            className="rounded-lg p-2 text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                            title="View details"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M8 3C4.5 3 1.73 5.61 1 9c.73 3.39 3.5 6 7 6s6.27-2.61 7-6c-.73-3.39-3.5-6-7-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <TeamDetails 
          team={selectedTeam} 
          allContacts={allContacts} 
          onClose={() => setSelectedTeam(null)} 
        />
      )}

      {/* Create Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Contact</h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06z" />
                </svg>
              </button>
            </div>
            <div className="p-0 overflow-auto max-h-[80vh]">
              <ContactForm teams={teams} onSubmit={handleCreateContact} submitText="Create Contact" />
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Create New Team</h3>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06z" />
                </svg>
              </button>
            </div>
            <div className="p-0">
              <TeamForm contacts={allContacts} onSubmit={handleCreateTeam} onCancel={() => setIsTeamModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Contact</h3>
              <button
                onClick={() => setEditingContact(null)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06z" />
                </svg>
              </button>
            </div>
            <div className="p-0 overflow-auto max-h-[80vh]">
              <ContactForm
                teams={teams}
                initialValues={editingContact}
                onSubmit={handleUpdateContact}
                submitText="Update Contact"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}