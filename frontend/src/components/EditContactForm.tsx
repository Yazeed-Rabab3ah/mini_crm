import { useEffect, useState } from "react";
import { updateContact } from "../api/contacts";
import type { Contact } from "../types/contact";

type EditContactModalProps = {
  contact: Contact;
  open: boolean;
  onClose: () => void;
  onSaved: (updatedContact: Contact) => void;
};

export default function EditContactForm({ contact, open, onClose, onSaved }: EditContactModalProps) {
  const [formData, setFormData] = useState({
    email: contact.email || "",
    phone: contact.phone || "",
    address: contact.address || "",
    notes: contact.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormData({
      email: contact.email || "",
      phone: contact.phone || "",
      address: contact.address || "",
      notes: contact.notes || "",
    });
    setError(null);
  }, [contact, open]);

  if (!open) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const updated = await updateContact(contact.id, {
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      console.error("Failed to update contact:", err);
      setError("Unable to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit contact</h2>
            <p className="text-sm text-gray-500">Update email, phone, address, or notes.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="space-y-4">
          {[
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "address", label: "Address", type: "text" },
            { name: "notes", label: "Notes", type: "text" },
          ].map((field) => (
            <label key={field.name} className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{field.label}</span>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={(event) => setFormData(prev => ({
                  ...prev,
                  [field.name]: event.target.value,
                }))}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary/300 focus:ring-2 focus:ring-primary/100"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: "#0B1122" }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
