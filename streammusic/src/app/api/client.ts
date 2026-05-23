// ─────────────────────────────────────────────────────────────────────────────
// src/app/api/client.ts
// Centralized API client — connects React frontend to Laravel backend
// Usage: import { api } from '@/app/api/client';
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ── Token storage ─────────────────────────────────────────────────────────────
export const tokenStorage = {
  get: (): string | null => localStorage.getItem('auth_token'),
  set: (token: string)   => localStorage.setItem('auth_token', token),
  clear: ()              => localStorage.removeItem('auth_token'),
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T = unknown>(
  method: string,
  endpoint: string,
  body?: object | FormData,
  requiresAuth = true,
): Promise<T> {
  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    tokenStorage.clear();
    window.location.href = '/login';
    throw new Error('Unauthenticated');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? 'Request failed');
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Convenience methods ───────────────────────────────────────────────────────
export const api = {
  get:    <T>(url: string, auth = true)                     => request<T>('GET',    url, undefined, auth),
  post:   <T>(url: string, body?: object | FormData, auth = true) => request<T>('POST',   url, body, auth),
  put:    <T>(url: string, body?: object | FormData, auth = true)      => request<T>('PUT',    url, body, auth),
  delete: <T>(url: string, auth = true)                     => request<T>('DELETE', url, undefined, auth),
};

// ── Typed API calls ───────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string; nom?: string; prenom?: string; dateN?: string }) =>
    api.post<{ user: ApiUser; token: string }>('/register', data, false),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: ApiUser; token: string }>('/login', data, false),

  logout: () => api.post('/logout'),

  me: () => api.get<ApiUser>('/user'),
};

export const songsApi = {
  list:           ()           => api.get<Paginated<ApiSong>>('/songs', false),
  get:            (id: number) => api.get<ApiSong>(`/songs/${id}`, false),
  search:         (q: string)  => api.get<{ songs: ApiSong[]; artists: ApiArtist[]; albums: ApiAlbum[] }>(`/search?q=${encodeURIComponent(q)}`, false),
  play:           (id: number) => api.post(`/songs/${id}/play`),
  rate:           (id: number, note: number) => api.post(`/songs/${id}/rate`, { note }),
  myRating:       (id: number) => api.get<{ note: number }>(`/songs/${id}/rating`),
  upload:         (form: FormData) => api.post<ApiSong>('/songs', form),
  update:         (id: number, data: Partial<ApiSong>) => api.put<ApiSong>(`/songs/${id}`, data),
  delete:         (id: number) => api.delete(`/songs/${id}`),
};

export const playlistsApi = {
  list:       () => api.get<ApiPlaylist[]>('/playlists'),
  create:     (titre: string) => api.post<ApiPlaylist>('/playlists', { titre }),
  update:     (id: number, titre: string) => api.put<ApiPlaylist>(`/playlists/${id}`, { titre }),
  delete:     (id: number) => api.delete(`/playlists/${id}`),
  addSong:    (playlistId: number, song_id: number) => api.post(`/playlists/${playlistId}/songs`, { song_id }),
  removeSong: (playlistId: number, songId: number)  => api.delete(`/playlists/${playlistId}/songs/${songId}`),
};

export const albumsApi = {
  list:    () => api.get<Paginated<ApiAlbum>>('/albums', false),
  get:     (id: number) => api.get<ApiAlbum>(`/albums/${id}`, false),
  create:  (data: { titre: string; dateSortie: string }) => api.post<ApiAlbum>('/albums', data),
  update:  (id: number, data: Partial<ApiAlbum>)         => api.put<ApiAlbum>(`/albums/${id}`, data),
  delete:  (id: number) => api.delete(`/albums/${id}`),
  addSong: (albumId: number, songId: number) => api.post(`/albums/${albumId}/songs/${songId}`),
  removeSong: (albumId: number, songId: number) => api.delete(`/albums/${albumId}/songs/${songId}`),
};

export const artistsApi = {
  list:          () => api.get<Paginated<ApiArtist>>('/artists', false),
  get:           (id: number) => api.get<ApiArtist>(`/artists/${id}`, false),
  becomeArtist:  (nomArtiste: string) => api.post('/artist/create', { nomArtiste }),
  updateProfile: (data: { nomArtiste?: string; bio?: string }) => api.put('/artist/profile', data),
};

export const adminApi = {
  dashboard:      () => api.get<AdminStats>('/admin/dashboard'),
  users:          () => api.get<Paginated<ApiUser>>('/admin/users'),
  activateUser:   (id: number) => api.put(`/admin/users/${id}/activate`),
  deactivateUser: (id: number) => api.put(`/admin/users/${id}/deactivate`),
  artists:        () => api.get<Paginated<ApiArtist>>('/admin/artists'),
  suspendArtist:  (id: number) => api.put(`/admin/artists/${id}/suspend`),
  deleteSong:     (id: number) => api.delete(`/admin/songs/${id}`),
  deleteAlbum:    (id: number) => api.delete(`/admin/albums/${id}`),
  songs: () => api.get<any>('/songs'),
};

// ── Response types ────────────────────────────────────────────────────────────
export interface ApiUser {
  id: number;
  username: string;
  nom: string | null;
  prenom: string | null;
  email: string;
  photo: string | null;
  dateN: string | null;
  compteActif: boolean;
  role: 'listener' | 'artist' | 'admin';
  artistProfile?: ApiArtist;
}

export interface ApiSong {
  id: number;
  titre: string;
  duree: string;
  fichier: string;
  nombreEcoutes: number;
  cover: string | null;
  album_id: number | null;
  artist_id: number;
  artist?: ApiArtist;
  album?: ApiAlbum;
}

export interface ApiAlbum {
  id: number;
  titre: string;
  dateSortie: string;
  cover: string | null;
  artist_id: number;
  artist?: ApiArtist;
  songs?: ApiSong[];
}

export interface ApiArtist {
  id: number;
  user_id: number;
  nomArtiste: string;
  bio: string | null;
  photo: string | null;
  user?: ApiUser;
  songs?: ApiSong[];
  albums?: ApiAlbum[];
}

export interface ApiPlaylist {
  id: number;
  titre: string;
  dateCreation: string;
  listener_id: number;
  cover: string | null;
  songs?: ApiSong[];
}

export interface AdminStats {
  total_users: number;
  total_artists: number;
  total_songs: number;
  total_albums: number;
  total_plays: number;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
