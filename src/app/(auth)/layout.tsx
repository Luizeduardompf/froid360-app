export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto">
      {children}
    </div>
  );
}
