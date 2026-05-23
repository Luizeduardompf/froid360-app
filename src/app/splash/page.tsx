import Link from 'next/link';

export default function SplashPage() {
  return (
    <main className="min-h-screen bg-primary flex flex-col items-center justify-between px-8 py-16 max-w-[430px] mx-auto">
      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <span className="text-white text-4xl font-medium select-none">F</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-medium text-white tracking-tight">Froid.app</h1>
          <p className="text-white/75 text-sm mt-2 font-normal">Sua clínica no bolso</p>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full space-y-3 pb-safe">
        <Link
          href="/login"
          className="block w-full bg-white text-primary text-center py-4 rounded-2xl font-medium text-base shadow-md hover:bg-white/95 active:scale-[0.98] transition-all"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="block w-full bg-white/15 text-white text-center py-4 rounded-2xl font-medium text-base border border-white/25 hover:bg-white/20 active:scale-[0.98] transition-all"
        >
          Criar conta
        </Link>
        <p className="text-center text-white/50 text-xs pt-2">
          Para psicólogos registrados no CFP
        </p>
      </div>
    </main>
  );
}
