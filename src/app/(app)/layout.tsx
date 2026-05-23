import { BottomNavBar } from '@/components/layout/BottomNavBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative">
      <div className="pb-20">{children}</div>
      <BottomNavBar />
    </div>
  );
}
