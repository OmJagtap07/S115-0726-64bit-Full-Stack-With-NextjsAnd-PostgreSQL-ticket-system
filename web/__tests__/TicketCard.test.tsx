import { render, screen } from '@testing-library/react';
import { TicketCard } from '@/components/tickets/TicketCard';
import { vi } from 'vitest';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('TicketCard', () => {
  const mockTicket = {
    id: 'ticket-1',
    ticketNumber: 'TKT-001',
    subject: 'System Issue',
    status: 'OPEN' as any,
    priority: 'HIGH' as any,
    customerId: 'cust-1',
    assigneeId: null,
    customer: { id: 'cust-1', name: 'John Doe', email: 'john@example.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders ticket details correctly', () => {
    render(<TicketCard ticket={mockTicket} isAdmin={false} />);
    
    expect(screen.getByText('TKT-001')).toBeInTheDocument();
    expect(screen.getByText('System Issue')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('shows unassigned status when assigneeId is null', () => {
    render(<TicketCard ticket={mockTicket} isAdmin={false} />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });
});
