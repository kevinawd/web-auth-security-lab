import { useState, type FormEvent } from 'react';
import { login } from '../lib/api';
import type { LoginResponse } from '../types';
import ServiceFooter from './ServiceFooter';

const INPUT_CLASS =
  'h-9 w-full rounded-[3px] border border-slate-300 bg-white px-2 text-sm text-slate-900 ' +
  'focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
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

  return (
    <div className="w-full max-w-[430px] min-h-[500px] bg-brand px-8 pb-10 pt-16 text-white shadow-2xl">
      <form onSubmit={handleSubmit} className="" noValidate>
        <div>
          <label htmlFor="identifier" className="mb-1 block text-[18px] font-semibold mt-4">
            Correo electrónico
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-[18px] font-semibold mt-4">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex items-center justify-between pt-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded-none border border-white bg-white accent-white"
            />
            Permanezca conectado
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-[3px] border border-white px-8 py-1.5 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Enviando…' : 'Iniciar sesión'}
          </button>
        </div>

        <div className="text-[18px]">
          <a href="#" className="underline underline-offset-2 hover:text-white/80">
            ¿Olvidó la contraseña?
          </a>
        </div>
      </form>

      {networkError && (
        <p className="mt-4 rounded-[3px] bg-black/25 px-3 py-2 text-sm" role="alert">
          {networkError}
        </p>
      )}

      {result && (
        <div
          role="status"
          className="mt-4 rounded-[3px] bg-black/25 px-3 py-2 text-sm"
        >
          <p className="font-semibold">{result.message}</p>
          {result.ok && result.user && (
            <p className="mt-1">
              Bienvenida/o de nuevo:{' '}
              <span className="font-mono">{result.user.email}</span>
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

      <ServiceFooter />
    </div>
  );
}
