import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';  // shadcn helper

export default function Home() {
  return (
    <main className={cn('flex min-h-screen flex-col items-center justify-center p-24 space-y-8')}>
      <h1 className="text-4xl font-bold">Froid360 App Live!</h1>
      <p className="text-lg">Get started by editing src/app/page.tsx - LUIZ 2</p>
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Dashboard Inicial</CardTitle>
          <CardDescription>App com Next.js 15, shadcn e Vercel deploy.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Explorar Features</Button>
        </CardContent>
      </Card>
    </main>
  );
}
