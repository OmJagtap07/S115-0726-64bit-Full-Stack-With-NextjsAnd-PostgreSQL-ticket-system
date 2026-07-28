# Testing Guide

This project uses **Vitest** for backend unit and integration testing.

## Running Tests

To run the full test suite:
```bash
npm test
```
*(Ensure you have updated the package.json test script to `vitest run` instead of the default echo).*

## Test Structure

Tests are co-located with their respective modules in `__tests__` directories to follow the modular monolith structure.

- `src/modules/tickets/__tests__/` - Contains ticket creation, assignment, and status tests.
- `src/core/middlewares/__tests__/` - Contains tests for authentication, role validation, and error handlers.

## Writing New Tests

We follow a AAA (Arrange, Act, Assert) pattern. When mocking database calls, we utilize `vitest`'s mocking utilities over the Prisma Client.

Example:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { TicketsService } from '../tickets.service';

describe('TicketsService', () => {
  it('should create a ticket successfully', async () => {
    // Arrange
    const mockData = { subject: 'Test' };
    
    // Act & Assert
    // ...
  });
});
```
