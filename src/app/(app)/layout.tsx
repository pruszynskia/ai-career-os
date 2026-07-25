import { Sidebar } from '@/widgets/nav/sidebar';
import { Screen } from '@/shared/ui/primitives';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <Screen>{children}</Screen>
    </div>
  );
}
