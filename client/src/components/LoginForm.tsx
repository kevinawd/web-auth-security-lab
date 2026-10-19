import { useState, type FormEvent } from 'react';
import { login } from '../lib/api';
import type { LoginResponse } from '../types';

const DEMO_CREDENTIALS = { identifier: 'ana@demo.local', password: 'Demo1234' };

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoginResponse | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setNetworkError(null);

    try {
      const data = await login(identifier, password);
      setResult(data);
    } catch {
      setNetworkError(
        'No se pudo contactar con el servidor. ¿Está el backend corriendo en el puerto 3000?'
      );
    } finally {
      setLoading(false);
    }
  }

  function fillDemoCredentials() {
    setIdentifier(DEMO_CREDENTIALS.identifier);
    setPassword(DEMO_CREDENTIALS.password);
  }

  return (
    <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
            Correo o usuario
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ana@demo.local"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña ficticia
          </label>
          <div className="mt-1 flex rounded-lg border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-l-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded-r-lg px-3 text-xs font-medium text-slate-500 hover:text-slate-800"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Enviando…' : 'Ingresar'}
        </button>
      </form>

      <button
        type="button"
        onClick={fillDemoCredentials}
        className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
      >
        Usar credenciales de demostración
      </button>

      {networkError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {networkError}
        </p>
      )}

      {result && (
        <div
          role="status"
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            result.ok
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <p className="font-medium">{result.message}</p>
          {result.ok && result.user && (
            <p className="mt-1 text-emerald-700">
              Bienvenida/o de nuevo: <span className="font-mono">{result.user.email}</span>
            </p>
          )}
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-1 list-inside list-disc">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
