import { Link } from "react-router-dom";
import type { Contact } from "../types/contact";
import { useRole } from "../contexts/RoleContext";

type Props = {
  contacts: Contact[];
  onDelete: (id: number) => void;
  onEdit: (contact: Contact) => void;
};

export default function ContactTable({ contacts, onDelete, onEdit }: Props) {
  if (contacts.length === 0) {
    return (
      <div className="py-16 text-center text-base text-gray-400">
        No contacts found.
      </div>
    );
  }
  const {isManager, isSupervisor} = useRole()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-gray-100 text-sm text-gray-500">
            <th className="px-6 py-4 text-left font-medium">Name</th>
            <th className="px-6 py-4 text-left font-medium">Phone</th>
            <th className="px-6 py-4 text-left font-medium">Email</th>
            <th className="px-6 py-4 text-left font-medium">Status</th>
            <th className="px-6 py-4 text-left font-medium">Created At</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">{contact.username}</td>
              <td className="px-6 py-4 text-gray-500">{contact.phone || "—"}</td>
              <td className="px-6 py-4 text-gray-500">{contact.email || "—"}</td>
              <td className="px-6 py-4">
                <span
                  className={`rounded-full px-3.5 py-1 text-sm font-medium ${
                    contact.is_active
                      ? "bg-green-50 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                  {contact.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {new Date(contact.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })}
              </td>

              {( (isManager || isSupervisor)&& 
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/contacts/${contact.id}`}
                    className="rounded-lg p-2 text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                    title="View"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3C4.5 3 1.73 5.61 1 9c.73 3.39 3.5 6 7 6s6.27-2.61 7-6c-.73-3.39-3.5-6-7-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                    </svg>
                  </Link>
                  <button
                    onClick={() => onEdit(contact)}
                    className="rounded-lg p-2 text-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    title="Edit"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(contact.id)}
                    className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}