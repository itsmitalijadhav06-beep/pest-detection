import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { useRequireAuth } from '@/hooks/useAuth';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  useRequireAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6">{children}</main>
    </div>
  );
};
