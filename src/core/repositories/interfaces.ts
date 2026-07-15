export interface IUserRepository {
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  findAll(filters?: any): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
}

export interface ISessionRepository {
  findByRefreshTokenHash(hash: string): Promise<any>;
  createSession(data: any): Promise<any>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: string): Promise<void>;
}

export interface ITicketRepository {
  findById(id: string): Promise<any>;
  findByTicketNumber(ticketNumber: string): Promise<any>;
  findAll(filters?: any, skip?: number, take?: number): Promise<{ data: any[]; total: number }>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  softDelete(id: string): Promise<any>;
}

export interface ITicketReplyRepository {
  findAllByTicket(ticketId: string): Promise<any[]>;
  create(data: any): Promise<any>;
}

export interface ITicketActivityRepository {
  findAllByTicket(ticketId: string): Promise<any[]>;
  create(data: any): Promise<any>;
}

export interface IAttachmentRepository {
  create(data: any): Promise<any>;
}
