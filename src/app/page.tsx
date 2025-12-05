import { Designer } from '@/components/designer/Designer';
import { Header } from '@/components/layout/Header';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Designer />
      </main>
    </div>
  );
}
