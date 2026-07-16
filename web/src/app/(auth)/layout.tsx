import React from 'react';
import { Logo } from '@/components/branding/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="absolute top-8 left-8 z-10">
        <Logo variant="light" size="md" />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
