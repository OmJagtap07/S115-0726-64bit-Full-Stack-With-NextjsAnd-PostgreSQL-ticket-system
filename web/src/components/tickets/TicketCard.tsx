import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket as TicketIcon, Check, ChevronDown, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TicketDTO, UserDTO, api } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TicketCardProps {
  ticket: TicketDTO;
  agents?: UserDTO[];
  isAdmin?: boolean;
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
}

export function TicketCard({ ticket, agents, isAdmin }: TicketCardProps) {
  const queryClient = useQueryClient();
  const [isAssigningMode, setIsAssigningMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const assignMutation = useMutation({
    mutationFn: (agentId: string) => api.tickets.assign(ticket.id, agentId),
    onSuccess: (data) => {
      // Optimistically update ticket lists
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setToastMessage(`Ticket assigned to ${data.assignee?.name} successfully.`);
      setTimeout(() => setToastMessage(null), 3000);
      setIsAssigningMode(false);
      setSelectedAgent(null);
    }
  });

  const handleConfirmAssign = () => {
    if (selectedAgent) {
      assignMutation.mutate(selectedAgent);
    }
  };

  const priorityVariant = 
    ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'priorityHigh' : 
    ticket.priority === 'MEDIUM' ? 'priorityMedium' : 'priorityLow';
  
  const statusVariant = 
    ticket.status === 'OPEN' ? 'statusOpen' :
    ticket.status === 'IN_PROGRESS' ? 'statusProgress' :
    ticket.status === 'RESOLVED' ? 'statusOnHold' : 'statusClosed';

  const statusLabel = 
    ticket.status === 'OPEN' ? 'Open' :
    ticket.status === 'IN_PROGRESS' ? 'In Progress' :
    ticket.status === 'RESOLVED' ? 'Resolved' : 'Closed';
    
  const priorityLabel = ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase();

  const iconBg = 
    ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'bg-destructive/10 text-destructive' :
    ticket.priority === 'MEDIUM' ? 'bg-warning/20 text-warning' : 
    'bg-success/20 text-success';

  return (
    <div className="relative flex flex-col sm:flex-row gap-4 p-4 mb-3 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow items-start sm:items-center">
      
      {/* Toast Notification (Scoped to Card for simplicity) */}
      {toastMessage && (
        <div className="absolute top-2 right-2 bg-foreground text-background text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg z-10 animate-in fade-in slide-in-from-top-1">
          <Check className="w-3.5 h-3.5 text-success" />
          {toastMessage}
        </div>
      )}

      {/* Icon */}
      <div className={`p-3 rounded-md shrink-0 flex items-center justify-center ${iconBg}`}>
        <TicketIcon className="w-5 h-5" />
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground truncate">
            {ticket.ticketNumber} {ticket.subject}
          </span>
        </div>
        <div className="text-sm text-muted-foreground truncate line-clamp-1">
          {ticket.description}
        </div>
        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
          <span>Customer: <span className="font-medium text-foreground">{ticket.customer?.name}</span></span>
          {ticket.assignee && (
            <span className="flex items-center gap-1.5 border-l border-border pl-3">
              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                {ticket.assignee.name.charAt(0)}
              </span>
              <span className="font-medium text-foreground">{ticket.assignee.name}</span>
            </span>
          )}
        </div>
      </div>

      {/* Meta & Actions */}
      <div className="flex flex-col items-start sm:items-end gap-3 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-between shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <Badge variant={priorityVariant as any}>{priorityLabel}</Badge>
            <Badge variant={statusVariant as any}>{statusLabel}</Badge>
          </div>
          <div className="text-xs text-muted-foreground sm:hidden">
            {timeAgo(ticket.createdAt)}
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-1 w-full sm:w-auto">
          {isAdmin && (
            <div className="flex items-center gap-2">
              {isAssigningMode ? (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <Select value={selectedAgent || ''} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-muted/50 focus:ring-1 transition-all">
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent className="animate-in fade-in zoom-in-95">
                      {agents?.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    className="h-8 text-xs px-3 shadow-sm transition-all" 
                    disabled={!selectedAgent || assignMutation.isPending}
                    onClick={handleConfirmAssign}
                  >
                    {assignMutation.isPending ? "Assigning..." : "Confirm"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-xs hover:bg-muted" onClick={() => { setIsAssigningMode(false); setSelectedAgent(null); }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  variant={ticket.assigneeId ? "outline" : "default"} 
                  size="sm" 
                  className="h-8 text-xs gap-1.5 shadow-sm" 
                  onClick={() => setIsAssigningMode(true)}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {ticket.assigneeId ? "Reassign" : "Assign"}
                </Button>
              )}
            </div>
          )}

          {!isAssigningMode && (
            <>
              <div className="hidden sm:block text-xs text-muted-foreground mr-2">
                {timeAgo(ticket.createdAt)}
              </div>
              <Link href={`/dashboard/tickets/${ticket.id}`} className="text-primary hover:underline text-sm font-semibold shrink-0">
                View Ticket
              </Link>
            </>
          )}
        </div>
      </div>
      
    </div>
  );
}
