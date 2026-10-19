import type { LoginResponse } from '../types';

// Con el proxy de desarrollo de Vite, la base puede quedar vacía (mismo origen).
// Si pruebas contra el backend directamente, define VITE_API_BASE_URL=http://127.0.0.1:3000
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export async function login(identifier: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });

  const data = (await response.json().catch(() => ({}))) as Partial<LoginResponse>;

  if (!response.ok) {
    return {
      ok: false,
      message: data.message ?? `Error ${response.status}`,
      errors: data.errors
    };
  }

  return {
    ok: Boolean(data.ok),
    message: data.message ?? 'Respuesta sin mensaje',
    user: data.user
  };
}
