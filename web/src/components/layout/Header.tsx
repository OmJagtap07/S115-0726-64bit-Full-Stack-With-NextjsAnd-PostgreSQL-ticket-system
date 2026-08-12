"use client";

import React from 'react';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header({ userName = "User", userInitials = "U", userRole = "Agent" }) {
  const roleBadgeVariant =
    userRole === 'Admin' ? 'statusOpen' :
    userRole === 'Agent' ? 'statusProgress' : 'default';

  return (
    <header className="h-20 bg-background border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        {/* Breadcrumbs or Page Title can go here, managed by layout or page */}
      </div>
      
      <div className="flex items-center gap-6">
        
        <div className="flex items-center gap-3 border-l border-border pl-6">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground leading-none">{userName}</span>
            <Badge variant={roleBadgeVariant as any} className="text-[10px] px-1.5 py-0 h-4 w-fit">
              {userRole}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
