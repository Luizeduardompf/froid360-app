import { createServerComponentClient } from '@/lib/supabase';  // Server client sync
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UserTest {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default async function Home() {
  const supabase = createServerComponentClient();  // Sync server client (cookies getAll/setAll)
  const { data: usersTest, error } = await supabase
    .from('users_test')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);  // Query simples (tabela test)

  if (error) {
    console.error('Supabase error:', error);  // Debug (remova prod)
    return <div>Error loading data</div>;
  }

  return (
    <main className={cn('flex min-h-screen flex-col items-center justify-center p-24 space-y-8')}>
      <h1 className="text-4xl font-bold">Froid360 App Live!</h1>
      <p className="text-lg">Get started by editing src/app/page.tsx - LUIZ</p>
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Supabase Test</CardTitle>
          <CardDescription>Query users_test table ({usersTest?.length || 0} rows).</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {usersTest?.map((user: UserTest) => (
              <li key={user.id} className="text-sm">
                {user.name} ({user.email}) - {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </li>
            )) || <li>No data</li>}
          </ul>
          <Button className="w-full mt-4">Explorar Features</Button>
        </CardContent>
      </Card>
    </main>
  );
}
