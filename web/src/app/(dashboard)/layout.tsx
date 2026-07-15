import React from 'react';
import { headers } from 'next/headers';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const roleHeader = headersList.get('x-user-role');
  
  const user = await api.auth.meServer(roleHeader || undefined);

  return (
    <DashboardLayout userRole={user.role.toLowerCase() as any}>
      {children}
    </DashboardLayout>
  );
}
