import api from "./client";
import type { Contact, ContactListParams, PaginatedResponse, Team, TeamListParams } from "../types/contact";

export type ContactPayload = {
  username: string;
  phone?: string;
  email?: string;
  address?: string;
  role?: string;
  team?: number | null;
  is_active: boolean;
  notes?: string;
};

export type TeamPayload = {
  name: string;
  department: string;
  manager?: number | null;
  supervisor?: number | null;
};

export async function getContacts(params: ContactListParams) {
  const res = await api.get<PaginatedResponse<Contact>>("/api/contacts/", { params });
  return res.data;
}

export async function getAllContacts() {
  const res = await api.get<Contact[]>("/api/contacts/all/");
  return res.data;
}

export async function getContact(id: number | string) {
  const res = await api.get<Contact>(`/api/contacts/${id}/`);
  return res.data;
}

export async function createContact(data: ContactPayload) {
  const res = await api.post<Contact>("/api/contacts/", data);
  return res.data;
}

export async function updateContact(id: number | string, data: Partial<ContactPayload>) {
  const res = await api.patch<Contact>(`/api/contacts/${id}/`, data);
  return res.data;
}

export async function deleteContact(id: number | string) {
  await api.delete(`/api/contacts/${id}/`);
}
export async function getTeam(id: number | string) {
  const res = await api.get<Team>(`/api/teams/${id}/`);
  return res.data;
}

export async function getTeams(params?: TeamListParams) {
  const res = await api.get<PaginatedResponse<Team>>("/api/teams/", { params });
  return res.data;
}
export async function createTeam(data: TeamPayload) {
  const res = await api.post<Team>("/api/teams/", data);
  return res.data;
}

