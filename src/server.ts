import http from 'http';
import app from './app';
import { config } from './config';
// import { initSocket } from './core/sockets'; // Will implement later

const server = http.createServer(app);

// Initialize Socket.IO
// initSocket(server);

const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.NODE_ENV} mode.`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // TODO: close DB, Redis connections
    process.exit(0);
  });
});
// Trigger tsx watch restart 
// Trigger tsx watch restart 2 
