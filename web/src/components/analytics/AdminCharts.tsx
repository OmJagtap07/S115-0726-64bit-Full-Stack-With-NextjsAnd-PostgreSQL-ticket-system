"use client";

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface ChartProps {
  trends: any[];
  statusDist: any[];
  priorityDist: any[];
  workload: any[];
}

export default function AdminCharts({ trends, statusDist, priorityDist, workload }: ChartProps) {
  return (
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
  );
}
