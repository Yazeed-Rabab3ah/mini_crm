import { useCallback, useEffect, useState } from "react";
import { getContact } from "../api/contacts";
import { useParams } from "react-router-dom";
import type { Contact } from "../types/contact";
import EditContactForm from "../components/EditContactForm";

const fallbackProfile = {
  name: "Unknown Contact",
  email: "No email",
  phone: "No phone",
  notes: "No notes",
  address: "Unknown address",
  coverImage:
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop",
  avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
  team: "Unknown Team",
};

export default function ContactDetailsPage() {
  const { id } = useParams();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchContact = useCallback(async () => {
    if (!id) { setLoading(false); setError("Missing contact id."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await getContact(Number(id));
      setContact(data);
    } catch (err) {
      console.error("Failed to fetch contact:", err);
      setError("Failed to load contact.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchContact(); }, [fetchContact]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#F3F4FF" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
          <p className="text-sm text-gray-400">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#F3F4FF" }}>
        <p className="text-sm text-red-400">{error ?? "Contact not found."}</p>
      </div>
    );
  }

  const displayName = contact.username || fallbackProfile.name;
  const displayEmail = contact.email || fallbackProfile.email;
  const displayPhone = contact.phone || fallbackProfile.phone;
  const displayNotes = contact.notes || fallbackProfile.notes;
  const displayAddress = contact.address || fallbackProfile.address;
  const avatarUrl = contact.profile_image_url || fallbackProfile.avatar;
  const coverUrl = contact.cover_image_url || fallbackProfile.coverImage;
  const teamName = contact.team?.name || fallbackProfile.team;

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans" style={{ backgroundColor: "#F3F4FF" }}>
      {/* Top background */}
      <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden">
        <img
          src={coverUrl}
          alt="cover"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ backgroundColor: "#F3F4FF" }} />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white" style={{ boxShadow: "0 24px 64px rgba(11,17,34,0.13)" }}>

          {/* Cover */}
          <div className="relative h-40 overflow-hidden bg-gray-200">
            <img
              src={coverUrl}
              alt="cover"
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            {/* Fix 1: bg-linear-to-b is not valid Tailwind — use bg-gradient-to-b */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/20" />
          </div>

          <div className="px-8 pb-8">

            {/* Avatar + name */}
            <div className="relative flex items-end gap-4 -mt-10 mb-6">
              {/* 1. Increased -mt to -mt-10 to pull it further up into the cover.
                2. Added 'relative' to ensure it stays above other elements.
                3. Added 'ring' or 'border-4' to create that clean white gap.
              */}
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-sm">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  onError={(e) => { 
                    e.currentTarget.src = "https://ui-avatars.com/api/?name=" + displayName; 
                  }}
                />
              </div>
              
              {/* Text alignment: Ensure it doesn't overlap the circle */}
              <div className="pb-12">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{displayName}</h1>
                <p className="text-sm text-gray-500">{displayNotes}</p>
              </div>
            </div>

            {/* Info grid */}
            {/* Fix 3: duplicate key — "Location" and "Notes" both used displayNotes.
                       Using unique keys and correct values. */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              {[
                { label: "Email", value: displayEmail },
                { label: "Phone", value: displayPhone },
                { label: "Address", value: displayAddress },
                { label: "Team", value: teamName },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</span>
                  <span className="text-sm text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            {/* Fix 4: stats have no visual container — cards get lost without a bg.
                       Added a background panel to group them. */}
            <div className="mb-6 grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 px-4 py-4">
              {[
                { label: "Total tasks", value: contact.total_tasks ?? 0, cls: "text-gray-900" },
                { label: "Open tasks", value: contact.open_tasks ?? 0, cls: "text-amber-500" },
                { label: "Done", value: contact.done_tasks ?? 0, cls: "text-emerald-500" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className={`text-2xl font-semibold ${cls}`}>{value}</span>
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="rounded-xl bg-primary/10 py-2.5 px-18 text-sm font-medium text-primary ring-1 ring-primary hover:bg-primary/20  transition-colors"
              >
                Edit contact
              </button>
            </div>

          </div>
        </div>

        <EditContactForm
          contact={contact}
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSaved={(updatedContact) => {
            setContact(updatedContact);
          }}
        />
      </div>
    </div>
  );
}