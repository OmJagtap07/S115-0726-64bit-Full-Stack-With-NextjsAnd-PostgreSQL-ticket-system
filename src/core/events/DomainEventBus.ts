import { EventEmitter } from 'events';
import { logger } from '../logger/winston';

export interface TicketCreatedPayload {
  ticketId: string;
  companyId: string;
  customerId: string;
  correlationId?: string;
}

export interface UserRegisteredPayload {
  userId: string;
  companyId: string;
  correlationId?: string;
}

export interface SlaBreachedPayload {
  ticketId: string;
  companyId: string;
  policyId: string;
  correlationId?: string;
}

// Map of event names to their payload types
export interface DomainEventsMap {
  'TicketCreated': TicketCreatedPayload;
  'UserRegistered': UserRegisteredPayload;
  'SlaBreached': SlaBreachedPayload;
}

class TypedEventBus extends EventEmitter {
  public emitEvent<K extends keyof DomainEventsMap>(eventName: K, payload: DomainEventsMap[K]): boolean {
    logger.debug(`[DomainEvent] Emitting ${eventName}`, { payload });
    return this.emit(eventName, payload);
  }

  public onEvent<K extends keyof DomainEventsMap>(eventName: K, listener: (payload: DomainEventsMap[K]) => void): this {
    return this.on(eventName, listener);
  }
}

export const DomainEventBus = new TypedEventBus();
