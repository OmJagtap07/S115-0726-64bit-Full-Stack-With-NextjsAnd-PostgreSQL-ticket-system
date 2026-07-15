"use client";

import React from 'react';
import { Sidebar, Role } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: Role;
  userName?: string;
  userInitials?: string;
}

export function DashboardLayout({ 
  children, 
  userRole = 'agent',
  userName = 'Shruti J.',
  userInitials = 'SJ'
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentRole={userRole} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={userName} userInitials={userInitials} userRole={userRole === 'customer' ? 'Customer' : userRole === 'agent' ? 'Agent' : 'Admin'} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
