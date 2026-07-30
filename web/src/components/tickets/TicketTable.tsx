'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Lightweight badge helpers (TicketCard no longer exports these)
function PriorityBadge({ priority }: { priority: string }) {
  const variant =
    priority === 'HIGH' || priority === 'URGENT' ? 'priorityHigh' :
    priority === 'MEDIUM' ? 'priorityMedium' : 'priorityLow';
  return <Badge variant={variant as any}>{priority.charAt(0) + priority.slice(1).toLowerCase()}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'OPEN' ? 'statusOpen' :
    status === 'IN_PROGRESS' ? 'statusProgress' :
    status === 'RESOLVED' ? 'statusOnHold' : 'statusClosed';
  const label =
    status === 'OPEN' ? 'Open' :
    status === 'IN_PROGRESS' ? 'In Progress' :
    status === 'RESOLVED' ? 'Resolved' : 'Closed';
  return <Badge variant={variant as any}>{label}</Badge>;
}


interface TicketTableProps {
  tickets: any[];
  agents: any[];
  onTicketUpdate: () => void;
}

export default function TicketTable({ tickets, agents, onTicketUpdate }: TicketTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleReassign = async (ticketId: string, newAssigneeId: string) => {
    setUpdatingId(ticketId);
    try {
      await axios.patch(`/api/tickets/${ticketId}?action=assign`, { assigneeId: newAssigneeId });
      onTicketUpdate();
    } catch (error) {
      console.error('Failed to reassign ticket', error);
      alert('Failed to reassign ticket');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket ID</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/tickets/${ticket.id}`} className="hover:text-brand-purple">
                    {ticket.ticketNumber}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium truncate max-w-xs">
                  {ticket.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {ticket.customer?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <select 
                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-brand-purple sm:text-sm sm:leading-6 disabled:opacity-50"
                    value={ticket.assigneeId || ''}
                    disabled={updatingId === ticket.id}
                    onChange={(e) => handleReassign(ticket.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/tickets/${ticket.id}`} className="text-brand-purple hover:text-brand-purple-hover font-semibold">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            
            {tickets.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Mockup */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{tickets.length}</span> of <span className="font-medium">{tickets.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-brand-purple text-sm font-medium text-white">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
