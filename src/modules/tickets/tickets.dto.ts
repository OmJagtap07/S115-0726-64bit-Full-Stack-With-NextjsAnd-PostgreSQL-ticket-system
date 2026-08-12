import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(5),
    description: z.string().min(10),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  }),
});

export const replyTicketSchema = z.object({
  body: z.object({
    message: z.string().optional().default(''),
    isInternal: z.preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return Boolean(val);
    }, z.boolean()).default(false),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  }),
});

export const assignTicketSchema = z.object({
  body: z.object({
    assigneeId: z.string().uuid(),
  }),
});

export const updatePrioritySchema = z.object({
  body: z.object({
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  }),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>['body'];
export type ReplyTicketDto = z.infer<typeof replyTicketSchema>['body'];
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>['body'];
export type AssignTicketDto = z.infer<typeof assignTicketSchema>['body'];
export type UpdatePriorityDto = z.infer<typeof updatePrioritySchema>['body'];
