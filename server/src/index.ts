import dotenv from 'dotenv';
import { createSocketServer } from './server';

// Load environment variables (local dev only - Railway injects these automatically)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../.env' });
}

async function main() {
  try {
    console.log('Starting LocalRoots Chat Server...');

    // Validate required environment variables
    if (!process.env.AUTH_SECRET) {
      throw new Error('AUTH_SECRET is required');
    }

    await createSocketServer();

    console.log('Chat server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
