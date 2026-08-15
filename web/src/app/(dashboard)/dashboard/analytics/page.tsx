"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState } from '@/components/ui/states';
import dynamic from 'next/dynamic';

const AdminCharts = dynamic(() => import('@/components/analytics/AdminCharts'), { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center border rounded-lg bg-card text-muted-foreground animate-pulse">Loading charts...</div> });

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
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Unassigned</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.unassigned || 0}</div></CardContent>
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

      <AdminCharts 
        trends={trends || []}
        statusDist={statusDist || []}
        priorityDist={priorityDist || []}
        workload={workload || []}
      />
    </div>
  );
}
