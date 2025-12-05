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

export default function MyDesignsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your space...</p>
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
            My Saved Designs
          </h1>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Your Collection</CardTitle>
              <CardDescription>
                Edit, duplicate, or delete your saved T-shirt designs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                A grid of saved designs will be displayed here, fetched from
                Firestore.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/')}
              >
                Start a New Design
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
