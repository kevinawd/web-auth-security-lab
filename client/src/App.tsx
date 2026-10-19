import Disclaimer from './components/Disclaimer';
import LoginForm from './components/LoginForm';

export default function App() {
  return (
    <div className="flex min-h-full flex-col bg-brand-dark">
      <Disclaimer />
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-16">
        <LoginForm />
      </main>
    </div>
  );
}
