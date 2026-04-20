import type { Contact, Team } from "../types/contact";

interface TeamDetailsProps {
  team: Team;
  allContacts: Contact[];
  onClose: () => void;
}

export default function TeamDetails({ team, allContacts, onClose }: TeamDetailsProps) {
  const teamContacts = allContacts.filter((contact) => contact.team?.id === team.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{team.department} Department</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Management</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">Manager</span>
                    <span className="text-sm font-medium text-gray-900">{team.manager_username || "Not assigned"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-600 font-medium">Supervisor</span>
                    <span className="text-sm font-medium text-gray-900">{team.supervisor_username || "Not assigned"}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Created</p>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(team.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{teamContacts.length}</div>
              <p className="text-sm text-gray-500 font-medium">Team Members</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Members List
            </h4>
            
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {teamContacts.length > 0 ? (
                <div className="grid gap-3">
                  {teamContacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                    >
                      <img 
                        src={contact.profile_image_url || `https://ui-avatars.com/api/?name=${contact.username}&background=random`} 
                        alt={contact.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{contact.username}</p>
                        <p className="text-xs text-gray-500 truncate">{contact.role || "Member"}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${contact.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} title={contact.is_active ? 'Active' : 'Inactive'} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400">No members assigned to this team yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end border-t border-gray-100 p-6 bg-gray-50/30">
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
