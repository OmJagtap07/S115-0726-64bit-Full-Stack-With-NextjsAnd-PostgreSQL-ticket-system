"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, TicketIcon, Clock, CheckCircle2, Activity, AlertCircle, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { api, UserDTO, TicketStatus, Priority } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketCard } from '@/components/tickets/TicketCard';
import { Pagination } from '@/components/ui/pagination';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function SummaryCard({ title, count, icon }: { title: string, count: number, icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count ?? 0}</div>
      </CardContent>
    </Card>
  )
}

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

  const { data: summary } = useQuery({
    queryKey: ['tickets-summary', currentUser?.role],
    queryFn: () => api.tickets.getSummary(),
    enabled: !!currentUser
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
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      return response;
    },
    enabled: !!currentUser // only fetch tickets once we know the role
  });


  const totalPages = ticketsResponse?.meta?.totalPages || 0;
  const paginatedTickets = ticketsResponse?.data || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, priorityFilter, agentFilter]);

  if (!currentUser) return <LoadingState message="Loading..." />;

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6">
      
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
        {!isAdmin && (
          <Button className="shrink-0 gap-1.5" onClick={() => router.push('/dashboard/tickets/new')}>
            <Plus className="w-4 h-4" />
            New Ticket
          </Button>
        )}
      </div>


      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin ? (
            <>
              <SummaryCard title="Total Open Tickets" count={summary.totalOpen} icon={<TicketIcon className="w-5 h-5 text-primary" />} />
              <SummaryCard title="Unassigned Tickets" count={summary.unassigned} icon={<AlertCircle className="w-5 h-5 text-destructive" />} />
              <SummaryCard title="Assigned Tickets" count={summary.assigned} icon={<UserCheck className="w-5 h-5 text-primary" />} />
            </>
          ) : currentUser?.role === 'AGENT' ? (
            <>
              <SummaryCard title="My Open Tickets" count={summary.myOpen} icon={<TicketIcon className="w-5 h-5 text-primary" />} />
              <SummaryCard title="In Progress" count={summary.inProgress} icon={<Activity className="w-5 h-5 text-primary" />} />
              <SummaryCard title="Resolved Today" count={summary.resolvedToday} icon={<CheckCircle2 className="w-5 h-5 text-primary" />} />
            </>
          ) : (
            <>
              <SummaryCard title="My Tickets" count={summary.myTickets} icon={<TicketIcon className="w-5 h-5 text-primary" />} />
              <SummaryCard title="Open Requests" count={summary.openRequests} icon={<Activity className="w-5 h-5 text-primary" />} />
              <SummaryCard title="Recently Resolved" count={summary.recentlyResolved} icon={<CheckCircle2 className="w-5 h-5 text-primary" />} />
            </>
          )}
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
                Resolved
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

        <div className="flex items-center gap-3 mt-4 lg:mt-0">
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

          {isAdmin && (
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
          )}
        </div>
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
