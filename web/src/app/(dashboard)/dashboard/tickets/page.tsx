"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, TicketIcon, Clock, CheckCircle2, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { api, UserDTO } from '@/lib/api';
import { TicketStatus, Priority } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Pagination } from '@/components/ui/pagination';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TicketsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TicketStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Current User to determine role
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me()
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.agents.list()
  });

  const { data: ticketsResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['tickets', activeTab, searchQuery, priorityFilter, agentFilter, currentPage, currentUser?.role],
    queryFn: async () => {
      let response = await api.tickets.list({ 
        status: activeTab === 'ALL' ? undefined : activeTab,
        search: searchQuery,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
        assigneeId: agentFilter === 'ALL' ? undefined : (agentFilter === 'UNASSIGNED' ? 'null' : agentFilter),
        page: currentPage,
        limit: itemsPerPage
      });

      return response;
    },
    enabled: !!currentUser // only fetch tickets once we know the role
  });

  // Query to get all tickets for summary counts
  const { data: summaryTickets } = useQuery({
    queryKey: ['summaryTickets', currentUser?.role],
    queryFn: async () => {
      const response = await api.tickets.list();
      return response.data;
    },
    enabled: !!currentUser && currentUser.role === 'CUSTOMER'
  });

  // Derived state for Pagination
  const totalItems = ticketsResponse?.meta?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTickets = ticketsResponse?.data || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, priorityFilter, agentFilter]);

  if (!currentUser) return <LoadingState message="Loading..." />;

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAdmin ? "All Tickets" : "My Tickets"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin 
              ? "Manage all tickets across the system." 
              : "Here are the tickets assigned to you."}
          </p>
        </div>
        <Button className="shrink-0 gap-1.5" onClick={() => router.push('/dashboard/tickets/new')}>
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      {/* Customer Summary Cards */}
      {currentUser.role === 'CUSTOMER' && summaryTickets && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TicketIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <h3 className="text-2xl font-bold text-foreground">{summaryTickets.length}</h3>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open</p>
              <h3 className="text-2xl font-bold text-foreground">
                {summaryTickets.filter(t => t.status === 'OPEN').length}
              </h3>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <h3 className="text-2xl font-bold text-foreground">
                {summaryTickets.filter(t => t.status === 'IN_PROGRESS').length}
              </h3>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              <h3 className="text-2xl font-bold text-foreground">
                {summaryTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Tabs */}
      <div className="flex flex-col space-y-4 border-b border-border pb-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <TabsList className="bg-transparent p-0 gap-2 h-auto flex-nowrap">
              <TabsTrigger 
                value="ALL" 
                className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 text-foreground"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="OPEN" 
                className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 text-foreground"
              >
                Open
              </TabsTrigger>
              <TabsTrigger 
                value="IN_PROGRESS" 
                className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 text-foreground"
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger 
                value="RESOLVED" 
                className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 text-foreground"
              >
                On Hold
              </TabsTrigger>
              <TabsTrigger 
                value="CLOSED" 
                className="rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/50 text-foreground"
              >
                Closed
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              aria-label="Search tickets"
              placeholder="Search by ID, Subject, Customer..." 
              className="pl-9 h-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
            
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={agentFilter} onValueChange={(v) => setAgentFilter(v || 'ALL')}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Agents</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                {agents?.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Ticket List Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <LoadingState message="Fetching tickets..." />
        ) : isError ? (
          <ErrorState 
            title="Failed to load tickets" 
            description="We encountered an error while fetching tickets. Please try again." 
            onRetry={() => refetch()} 
          />
        ) : paginatedTickets.length === 0 ? (
          <EmptyState 
            title={searchQuery || priorityFilter !== 'ALL' || agentFilter !== 'ALL' ? "No matching tickets" : "No tickets found"}
            description="Adjust your filters or search query to find what you're looking for."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery("");
              setActiveTab("ALL");
              setPriorityFilter("ALL");
              setAgentFilter("ALL");
            }}
          />
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {paginatedTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} agents={agents} isAdmin={isAdmin} />
            ))}
            
            {/* Pagination */}
            <div className="mt-8 flex justify-center pb-8">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
