import { SlotState } from './GroupBuffService';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function upsertUser(handle: string) {
  return request<{ id: string; handle: string }>(`/users`, {
    method: 'POST',
    body: JSON.stringify({ handle }),
  });
}

export async function getSlots(handle: string): Promise<SlotState[]> {
  const data = await request<any[]>(`/team/slots/${encodeURIComponent(handle)}`);
  return data.map(s => ({
    ...s,
    expiresAt: s.expiresAt ? new Date(s.expiresAt).getTime() : undefined,
  }));
}

export async function setInvite(args: { handle: string; set: string; invitedId: string }) {
  await request(`/team/slots`, { method: 'POST', body: JSON.stringify(args) });
}

export async function acceptSlot(args: { invitedHandle: string; set: string }) {
  await request(`/team/slots/accept`, { method: 'POST', body: JSON.stringify({ handle: args.invitedHandle, set: args.set }) });
}

export async function revokeSlot(args: { handle: string; set: string }) {
  await request(`/team/slots/revoke`, { method: 'POST', body: JSON.stringify(args) });
}

export type RentalListing = { id: string; userId: string; message: string; rate?: string; expiresAt?: string; createdAt: string };

export async function getListings(): Promise<RentalListing[]> {
  return request<RentalListing[]>(`/rental-board`);
}

export async function postListing(args: { handle: string; message: string; rate?: string }) {
  return request<RentalListing>(`/rental-board`, { method: 'POST', body: JSON.stringify(args) });
}

export async function deleteListing(id: string) {
  await request(`/rental-board/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function saveEquippedSets(args: { handle: string; sets: string[] }) {
  await request(`/equipped-sets`, { method: 'POST', body: JSON.stringify(args) });
}

export async function getEquippedSets(handle: string): Promise<string[]> {
  const res = await request<{ sets?: string[] }>(`/equipped-sets/${encodeURIComponent(handle)}`);
  return res?.sets || [];
}

export const groupApi = {
  upsertUser,
  getSlots,
  setInvite,
  acceptSlot,
  revokeSlot,
  getListings,
  postListing,
  deleteListing,
  saveEquippedSets,
  getEquippedSets,
};
