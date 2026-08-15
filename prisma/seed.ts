import { Role, TicketStatus, Priority, ActivityType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { prisma } from '../src/core/database/prisma';

async function main() {
  console.log('Cleaning up existing data...');
  await prisma.ticketActivity.deleteMany();
  await prisma.ticketReply.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1 Administrator
  const admin = await prisma.user.create({
    data: {
      email: 'admin@freshworks.com',
      passwordHash,
      name: 'System Admin',
      role: Role.ADMIN,
    }
  });

  // 3 Agents
  const agent1 = await prisma.user.create({
    data: { email: 'shruti@freshworks.com', passwordHash, name: 'Shruti J.', role: Role.AGENT }
  });
  const agent2 = await prisma.user.create({
    data: { email: 'alex@freshworks.com', passwordHash, name: 'Alex Wong', role: Role.AGENT }
  });
  const agent3 = await prisma.user.create({
    data: { email: 'sam@freshworks.com', passwordHash, name: 'Sam Rivera', role: Role.AGENT }
  });

  const agents = [agent1, agent2, agent3];

  // 5 Customers
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const customer = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        passwordHash,
        name: `Customer ${i}`,
        role: Role.CUSTOMER
      }
    });
    customers.push(customer);
  }

  console.log('Seeding 25 tickets...');
  
  const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT];
  const statuses = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.CLOSED];

  for (let i = 1; i <= 25; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const agent = Math.random() > 0.3 ? agents[Math.floor(Math.random() * agents.length)] : null; // 70% chance of being assigned
    const status = agent ? statuses[Math.floor(Math.random() * statuses.length)] : TicketStatus.UNASSIGNED;
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-${1000 + i}`,
        subject: `Issue with service #${i}`,
        description: `This is a detailed description for ticket number ${i}. The customer is experiencing some issues and needs support.`,
        status,
        priority,
        customerId: customer.id,
        assigneeId: agent?.id || null,
      }
    });

    // Seed activity for creation
    await prisma.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        actorId: customer.id,
        type: ActivityType.CREATED,
        details: 'Ticket created by customer',
      }
    });

    // If assigned, create assignment activity
    if (agent) {
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          actorId: admin.id,
          type: ActivityType.ASSIGNED,
          details: `Ticket assigned to ${agent.name}`,
        }
      });

      // Maybe a reply
      await prisma.ticketReply.create({
        data: {
          ticketId: ticket.id,
          userId: agent.id,
          message: `Hello ${customer.name}, I am looking into your issue.`,
        }
      });
      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          actorId: agent.id,
          type: ActivityType.STATUS_CHANGED,
          details: 'Replied to customer',
        }
      });
    }
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
