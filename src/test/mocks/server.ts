import { setupServer } from 'msw/node';
import { handlers } from './api-mocks';

/**
 * MSW server instance for Node.js test environment
 */
export const server = setupServer(...handlers);
