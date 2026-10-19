import Disclaimer from './components/Disclaimer';
import LoginForm from './components/LoginForm';

export default function App() {
  return (
    <div className="flex min-h-full flex-col bg-slate-100 text-slate-900">
      <Disclaimer />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
              L
            </div>
            <h1 className="text-2xl font-bold">Portal de acceso</h1>
            <p className="text-sm text-slate-500">Laboratorio de autenticación web</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-slate-400">
            React + TypeScript + Tailwind → API Express en <span className="font-mono">/api</span>
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-400">
        Entorno de práctica. Los datos introducidos son ficticios y no se almacenan contraseñas.
      </footer>
    </div>
  );
}
