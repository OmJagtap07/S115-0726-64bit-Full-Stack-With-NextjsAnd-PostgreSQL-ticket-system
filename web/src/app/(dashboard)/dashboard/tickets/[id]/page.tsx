"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { TicketStatus } from '@prisma/client';

import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const queryClient = useQueryClient();

  // Queries
  const { data: ticket, isLoading: isLoadingTicket, isError: isErrorTicket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => api.tickets.get(ticketId)
  });


  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me()
  });

  // Local state for Ticket Status to show immediate dropdown change
  const [localStatus, setLocalStatus] = useState<TicketStatus | null>(null);
  const displayStatus = localStatus || ticket?.status;


  const statusMutation = useMutation({
    mutationFn: (newStatus: TicketStatus) => api.tickets.updateStatus(ticketId, newStatus),
    onSuccess: (data) => {
      setLocalStatus(data.status as TicketStatus);
      queryClient.setQueryData(['ticket', ticketId], data);
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] }); // invalidate list
    }
  });

  const handleStatusChange = (newStatus: TicketStatus) => {
    // Optimistic UI update
    setLocalStatus(newStatus);
    statusMutation.mutate(newStatus);
  };

  if (isLoadingTicket) return <LoadingState message="Loading ticket details..." />;
  if (isErrorTicket || !ticket) return <ErrorState title="Ticket Not Found" description="The ticket you are looking for does not exist." onRetry={() => router.push('/dashboard')} />;

  const statusVariant = 
    displayStatus === 'OPEN' ? 'statusOpen' :
    displayStatus === 'IN_PROGRESS' ? 'statusProgress' :
    displayStatus === 'RESOLVED' ? 'statusOnHold' : 'statusClosed';

  const statusLabel = 
    displayStatus === 'OPEN' ? 'Open' :
    displayStatus === 'IN_PROGRESS' ? 'In Progress' :
    displayStatus === 'RESOLVED' ? 'On Hold' : 'Closed';

  const priorityVariant = 
    ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'priorityHigh' : 
    ticket.priority === 'MEDIUM' ? 'priorityMedium' : 'priorityLow';

  const priorityLabel = ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase();

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 sm:m-0 sm:h-auto">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-border bg-card p-4 sm:rounded-t-xl shrink-0">
        <Link href="/dashboard/tickets" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to My Tickets
        </Link>
        
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground font-medium hidden sm:block">Status:</label>
          {currentUser?.role === 'CUSTOMER' ? (
            <Badge variant={statusVariant as any} className="px-2 py-1 h-6">{statusLabel}</Badge>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="gap-2 min-w-[120px] justify-between" disabled={statusMutation.isPending}>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant as any} className="px-1.5 py-0 h-4 min-h-0 text-[10px]" />
                    {statusMutation.isPending ? 'Saving...' : statusLabel}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => handleStatusChange('OPEN')}>Open</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('RESOLVED')}>On Hold</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('CLOSED')}>Closed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden sm:border sm:border-t-0 sm:border-border sm:rounded-b-xl bg-background">
        
        {/* Left Column: Context Sidebar */}
        <div className="w-full lg:w-[340px] xl:w-[400px] border-b lg:border-b-0 lg:border-r border-border bg-muted/20 overflow-y-auto shrink-0 p-5 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm font-semibold text-primary">{ticket.ticketNumber}</span>
              <Badge variant={priorityVariant as any}>{priorityLabel}</Badge>
            </div>
            <h1 className="text-xl font-bold text-foreground leading-tight">
              {ticket.subject}
            </h1>
          </div>

          <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Customer Information</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {ticket.customer?.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">{ticket.customer?.name}</div>
                <div className="text-xs text-muted-foreground">{ticket.customer?.email}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground space-y-2">
            <div className="flex justify-between">
              <span>Created</span>
              <span className="font-medium text-foreground">{ticket.createdAt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span className="font-medium text-foreground">{ticket.updatedAt.toLocaleString()}</span>
            </div>
          </div>
          


        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-w-0 bg-background relative h-full p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Conversation view coming soon</h2>
          <p className="text-sm text-muted-foreground max-w-md">The ability to view replies and respond to tickets will be available in an upcoming update.</p>
        </div>
        
      </div>

    </div>
  );
}
