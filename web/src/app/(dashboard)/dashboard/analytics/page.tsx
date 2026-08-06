"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState } from '@/components/ui/states';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboardPage() {
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me()
  });

  const { data: overview, isLoading: isOverviewLoading, isError: isOverviewError } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.analytics.getOverview(),
    enabled: currentUser?.role === 'ADMIN'
  });

  const { data: trends } = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => api.analytics.getTrends(),
    enabled: currentUser?.role === 'ADMIN'
  });

  const { data: workload } = useQuery({
    queryKey: ['analytics-workload'],
    queryFn: () => api.analytics.getWorkload(),
    enabled: currentUser?.role === 'ADMIN'
  });

  const { data: statusDist } = useQuery({
    queryKey: ['analytics-status'],
    queryFn: () => api.analytics.getStatusDistribution(),
    enabled: currentUser?.role === 'ADMIN'
  });

  const { data: priorityDist } = useQuery({
    queryKey: ['analytics-priority'],
    queryFn: () => api.analytics.getPriorityDistribution(),
    enabled: currentUser?.role === 'ADMIN'
  });

  if (isUserLoading) return <LoadingState message="Loading..." />;
  
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <h2 className="text-xl font-semibold text-destructive">Unauthorized: Admins only.</h2>
      </div>
    );
  }

  if (isOverviewLoading) return <LoadingState message="Loading analytics data..." />;
  if (isOverviewError) return <ErrorState title="Error" description="Failed to load analytics data" />;

  const formatHours = (ms: number) => {
    if (!ms) return '0 hrs';
    return (ms / (1000 * 60 * 60)).toFixed(1) + ' hrs';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System-wide ticket metrics and trends.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total Tickets</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.total || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Open Tickets</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.open || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">In Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.inProgress || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Resolved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.resolved || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Closed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.closed || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Created Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.createdToday || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Closed Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.closedToday || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Avg. Resolution Time</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatHours(overview?.averageResolutionTimeMs || 0)}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader><CardTitle>Ticket Volume Trend (Last 30 Days)</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {trends && trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No trend data available</div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {statusDist && statusDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {statusDist.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader><CardTitle>Priority Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {priorityDist && priorityDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} label>
                    {priorityDist.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Agent Workload */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader><CardTitle>Agent Workload (Assigned Tickets)</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {workload && workload.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workload} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="agentName" type="category" tick={{fontSize: 12}} width={100} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No workload data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
