import { TicketStatus, Priority, Role } from '@prisma/client';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TicketDTO {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  customerId: string;
  customer?: UserDTO;
  assigneeId: string | null;
  assignee?: UserDTO | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketReplyDTO {
  id: string;
  ticketId: string;
  userId: string;
  user?: UserDTO;
  message: string;
  isInternal: boolean;
  createdAt: Date;
  attachments?: any[];
}

export interface NotificationDTO {
  id: string;
  userId: string;
  ticketId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AnalyticsOverviewDTO {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  createdToday: number;
  closedToday: number;
  averageResolutionTimeMs: number;
}

// Custom Error Class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fetch Wrapper
async function fetchClient<T>(endpoint: string, options: RequestInit & { returnFullResponse?: boolean } = {}): Promise<T> {
  const { returnFullResponse, ...fetchOptions } = options;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  };

  if (fetchOptions.body instanceof FormData) {
    // Let browser set the Content-Type with boundary
    delete (config.headers as Record<string, string>)['Content-Type'];
  }

  const response = await fetch(`/api${endpoint}`, config);

  // Global 401 Error Handler
  if (response.status === 401) {
    // Clear cookies explicitly if they are accessible, but httpOnly are handled by browser.
    // We redirect to login and show toast logic here.
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      alert("Your session has expired. Please log in again."); // Minimal implementation of the requirement
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'API request failed');
  }

  if (returnFullResponse) {
    return data as T;
  }

  // Next.js API routes often wrap data in { status: 'success', data: ... }
  if (data && data.data !== undefined) {
    return data.data as T;
  }
  
  return data as T;
}

export const api = {
  auth: {
    login: async (credentials: any): Promise<{ status: string, message: string }> => {
      return fetchClient<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    },
    register: async (userData: any): Promise<{ status: string, message: string }> => {
      return fetchClient<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },
    logout: async (): Promise<void> => {
      await fetchClient<any>('/auth/logout', { method: 'POST' });
    },
    me: async (): Promise<UserDTO> => {
      return fetchClient<UserDTO>('/users/me');
    },
    // Server Component Helper
    meServer: async (roleCookieValue?: string): Promise<UserDTO> => {
      // In a strict BFF Next.js app, Server Components shouldn't make HTTP requests to its own /api routes.
      // Instead, they should query the Service directly. However, we'll keep the interface unified.
      // We assume layout.tsx will fetch directly using services eventually, or we just rely on passing mock if no real backend yet.
      // For now, since the Next.js API Routes don't exist yet, we can mock it here for the server ONLY.
      const role = (roleCookieValue || 'CUSTOMER').toUpperCase();
      return {
        id: role === 'ADMIN' ? 'admin1' : 'user1',
        name: role === 'ADMIN' ? 'Admin User' : 'Standard User',
        email: `mock-${role.toLowerCase()}@example.com`,
        role: role
      };
    }
  },
  tickets: {
    create: async (data: any): Promise<TicketDTO> => {
      const t = await fetchClient<any>('/tickets', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return { ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) };
    },
    list: async (params?: { 
      status?: TicketStatus, 
      search?: string, 
      priority?: Priority, 
      assigneeId?: string, 
      page?: number, 
      limit?: number, 
      sortBy?: string, 
      sortOrder?: string,
      customer?: string,
      startDate?: string,
      endDate?: string
    }): Promise<{ data: TicketDTO[], meta: { total: number, page: number, limit: number, totalPages: number } }> => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      if (params?.priority) query.append('priority', params.priority);
      if (params?.assigneeId) query.append('assigneeId', params.assigneeId);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
      if (params?.customer) query.append('customer', params.customer);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);
      const qs = query.toString();
      
      const response = await fetchClient<{ data: any[], meta: any }>(`/tickets${qs ? `?${qs}` : ''}`, { returnFullResponse: true });
      // Parse dates coming back from JSON payload
      return {
        data: response.data.map(t => ({ ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) })),
        meta: response.meta
      };
    },
    get: async (id: string): Promise<TicketDTO> => {
      const t = await fetchClient<any>(`/tickets/${id}`);
      return { ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) };
    },
    getReplies: async (id: string): Promise<TicketReplyDTO[]> => {
      const replies = await fetchClient<any[]>(`/tickets/${id}/replies`);
      return replies.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
    },
    reply: async (id: string, message: string, isInternal: boolean = false, file?: File, shouldFail: boolean = false): Promise<TicketReplyDTO> => {
      if (shouldFail) throw new ApiError(500, "Simulated network failure");
      
      let body: any;
      if (file) {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('isInternal', String(isInternal));
        formData.append('file', file);
        body = formData;
      } else {
        body = JSON.stringify({ message, isInternal });
      }

      const r = await fetchClient<any>(`/tickets/${id}/replies`, {
        method: 'POST',
        body
      });
      return { ...r, createdAt: new Date(r.createdAt) };
    },
    assign: async (id: string, agentId: string): Promise<TicketDTO> => {
      const t = await fetchClient<any>(`/tickets/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assigneeId: agentId })
      });
      return { ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) };
    },
    updateStatus: async (id: string, status: TicketStatus): Promise<TicketDTO> => {
      const t = await fetchClient<any>(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      return { ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) };
    },
    updatePriority: async (id: string, priority: Priority): Promise<TicketDTO> => {
      const t = await fetchClient<any>(`/tickets/${id}/priority`, {
        method: 'PATCH',
        body: JSON.stringify({ priority })
      });
      return { ...t, createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) };
    },
    getSummary: async (): Promise<any> => {
      return fetchClient<any>('/tickets/summary');
    }
  },
  agents: {
    list: async (): Promise<UserDTO[]> => {
      return fetchClient<UserDTO[]>('/users/agents');
    }
  },
  notifications: {
    list: async (): Promise<NotificationDTO[]> => {
      const data = await fetchClient<any[]>('/notifications');
      return data.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }));
    },
    getUnreadCount: async (): Promise<number> => {
      const res = await fetchClient<{ count: number }>('/notifications/unread-count');
      return res.count;
    },
    markAsRead: async (id: string): Promise<NotificationDTO> => {
      const n = await fetchClient<any>(`/notifications/${id}/read`, { method: 'PATCH' });
      return { ...n, createdAt: new Date(n.createdAt) };
    },
    markAllAsRead: async (): Promise<void> => {
      await fetchClient<void>('/notifications/read-all', { method: 'PATCH' });
    }
  },
  analytics: {
    getOverview: async (): Promise<AnalyticsOverviewDTO> => {
      return fetchClient<AnalyticsOverviewDTO>('/analytics/overview');
    },
    getTrends: async (): Promise<any[]> => {
      return fetchClient<any[]>('/analytics/trends');
    },
    getWorkload: async (): Promise<any[]> => {
      return fetchClient<any[]>('/analytics/workload');
    },
    getStatusDistribution: async (): Promise<any[]> => {
      return fetchClient<any[]>('/analytics/status');
    },
    getPriorityDistribution: async (): Promise<any[]> => {
      return fetchClient<any[]>('/analytics/priority');
    }
  }
};
