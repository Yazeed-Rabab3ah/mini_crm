import type { TaskStatusHistory } from '../types/task';
import { Badge, statusStyles } from '../pages/TaskDetails';
import { useState, useEffect } from 'react';
import { getContact } from '../api/contacts';
import type { Contact } from '../types/contact';

export function TaskStatusHistorySection({ historyData }: { historyData: TaskStatusHistory[] }) {
  const [contacts, setContacts] = useState<Record<number, Contact>>({});

  useEffect(() => {
    const fetchContacts = async () => {
      const newContacts: Record<number, Contact> = { ...contacts };
      let updated = false;

      for (const history of historyData) {
        if (history.changed_by && !newContacts[history.changed_by]) {
          try {
            const contact = await getContact(history.changed_by);
            newContacts[history.changed_by] = contact;
            updated = true;
          } catch (e) {
            console.error("Failed to fetch contact", e);
          }
        }
      }

      if (updated) {
        setContacts(newContacts);
      }
    };

    fetchContacts();
  }, [historyData]);

  return (
    <div className="border-t border-slate-200 pt-6 space-y-1">
      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4">
        Status History
      </h3>

      {historyData.length > 0 ? (
        <div className="relative">
          <div className="absolute left-[13px] top-2 bottom-2 w-px bg-slate-200" />

          <div className="space-y-5">
            {historyData.map((history) => {
              const key = history.name?.toLowerCase();
              const dotStyles: Record<string, string> = {
                assigned: "border-blue-400",
                submitted: "border-purple-400",
                reviewed: "border-indigo-400",
                approved: "border-emerald-500",
                rejected: "border-red-400",
                pending:  "border-amber-500",
              };
              const iconStyles: Record<string, string> = {
                assigned: "text-blue-500",
                submitted: "text-purple-500",
                reviewed: "text-indigo-500",
                approved: "text-emerald-500",
                rejected: "text-red-500",
                pending:  "text-amber-500",
              };

              return (
                <div key={history.id} className="flex gap-4 relative">
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center bg-white z-10
                      ${dotStyles[key ?? ""] ?? "border-slate-300"}`}
                  >
                    {key === "approved" && (
                      <svg className={`w-3 h-3 ${iconStyles[key]}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    )}
                    {key === "rejected" && (
                      <svg className={`w-3 h-3 ${iconStyles[key]}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="3" x2="9" y2="9" /><line x1="9" y1="3" x2="3" y2="9" />
                      </svg>
                    )}
                    {key !== "approved" && key !== "rejected" && (
                      <svg className={`w-3 h-3 ${iconStyles[key ?? ""] ?? "text-slate-400"}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="6" cy="6" r="4" />
                        <line x1="4" y1="6" x2="8" y2="6" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge
                        label={history.name}
                        styleClass={statusStyles[key ?? ""] ?? "bg-slate-100 text-slate-600"}
                      />
                      <span className="text-xs text-slate-500">
                        {history.changed_by && contacts[history.changed_by] 
                          ? `by ${contacts[history.changed_by].username}` 
                          : "System"}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
                        {new Date(history.created_at).toLocaleString()}
                      </span>
                    </div>
                    {history.note && (
                      <p className="text-sm text-slate-500 mt-1">{history.note}</p>
                    )}
                    {history.rejection_reason && (
                      <p className="text-sm text-red-600 mt-1">
                        <span className="font-semibold text-red-700">Reason:</span> {history.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No status history available.</p>
      )}
    </div>
  );
}
