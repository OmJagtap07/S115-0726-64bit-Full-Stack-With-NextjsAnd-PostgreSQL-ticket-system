"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, ShieldAlert, MoreHorizontal, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { InviteAgentModal } from '@/components/agents/InviteAgentModal';

export default function AgentsPage() {
  const router = useRouter();

  const { data: currentUser, isLoading: isLoadingMe } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me()
  });

  const { data: agents, isLoading: isLoadingAgents, isError } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.agents.list(),
    enabled: currentUser?.role === 'ADMIN'
  });

  if (isLoadingMe) return <LoadingState message="Verifying access..." />;
  
  if (currentUser?.role !== 'ADMIN') {
    // Route Protection
    router.replace('/unauthorized');
    return null;
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Agent Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage support agents in your organization.
          </p>
        </div>
        <InviteAgentModal />
      </div>

      {/* Agents List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoadingAgents ? (
          <LoadingState message="Fetching agents..." />
        ) : isError || !agents ? (
          <ErrorState title="Failed to load agents" description="Could not load the agents list." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Agent</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Active Tickets</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-foreground">
                      {/* Random mock number for active tickets */}
                      {Math.floor(Math.random() * 5) + 1}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Assign Ticket</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Disable Account</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
