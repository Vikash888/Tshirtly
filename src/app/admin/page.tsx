'use client';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.email === 'vikashspidey@gmail.com';

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-headline text-primary mb-8">
            Admin Dashboard
          </h1>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                View and manage all customer orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Order management table will be here. Real-time updates from
                Firestore will be implemented.
              </p>
              <Button className="mt-4">Add New Order (Manual)</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
