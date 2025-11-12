import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import feedsRouter from './routes/feeds';
import subscriptionsRouter from './routes/subscriptions';
import dataRouter from './routes/data';
import iotRouter from './routes/iot';
import suiService from './services/sui.service';
import walrusService from './services/walrus.service';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/feeds', feedsRouter);
app.use('/api/subscribe', subscriptionsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/data', dataRouter);
app.use('/api/iot', iotRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'IoT Data Marketplace API',
    version: '1.0.0',
    endpoints: {
      feeds: '/api/feeds',
      subscriptions: '/api/subscriptions',
      data: '/api/data',
      websocket: '/ws'
    }
  });
});

// WebSocket handling for real-time data streaming
interface WSClient {
  ws: WebSocket;
  feedId?: string;
  subscriptionId?: string;
  isAlive: boolean;
}

const clients = new Set<WSClient>();

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');

  const client: WSClient = {
    ws,
    isAlive: true
  };

  clients.add(client);

  // Heartbeat
  ws.on('pong', () => {
    client.isAlive = true;
  });

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'subscribe') {
        // Subscribe to a feed
        const { feedId, subscriptionId, consumer } = data;

        // Verify access
        const hasAccess = await suiService.checkAccess(subscriptionId, consumer);

        if (!hasAccess) {
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Access denied. Invalid or expired subscription.'
          }));
          return;
        }

        client.feedId = feedId;
        client.subscriptionId = subscriptionId;

        ws.send(JSON.stringify({
          type: 'subscribed',
          feedId
        }));

        // Send initial data
        const feed = await suiService.getDataFeed(feedId);
        if (feed) {
          const feedData = await walrusService.retrieveData(feed.walrusBlobId);
          ws.send(JSON.stringify({
            type: 'data',
            feedId,
            data: feedData,
            timestamp: Date.now()
          }));
        }
      } else if (data.type === 'unsubscribe') {
        client.feedId = undefined;
        client.subscriptionId = undefined;

        ws.send(JSON.stringify({
          type: 'unsubscribed'
        }));
      }
    } catch (error: any) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(client);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(client);
  });
});

// Heartbeat interval to check connection health
const heartbeatInterval = setInterval(() => {
  clients.forEach((client) => {
    if (!client.isAlive) {
      client.ws.terminate();
      clients.delete(client);
      return;
    }

    client.isAlive = false;
    client.ws.ping();
  });
}, 30000); // 30 seconds

// Broadcast data updates to subscribed clients
export function broadcastDataUpdate(feedId: string, data: any) {
  clients.forEach((client) => {
    if (client.feedId === feedId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'data',
        feedId,
        data,
        timestamp: Date.now()
      }));
    }
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
server.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  IoT Data Marketplace API Server                          ║
║  Version: 1.0.0                                           ║
╠════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${port}                ║
║  WebSocket endpoint: ws://localhost:${port}/ws              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
╚════════════════════════════════════════════════════════════╝
  `);

  console.log('API Endpoints:');
  console.log(`  GET    /health`);
  console.log(`  GET    /api/feeds`);
  console.log(`  POST   /api/feeds`);
  console.log(`  GET    /api/feeds/:id`);
  console.log(`  PUT    /api/feeds/:id/data`);
  console.log(`  POST   /api/subscribe/:feedId`);
  console.log(`  GET    /api/subscriptions/:id`);
  console.log(`  GET    /api/data/:feedId`);
  console.log(`  WS     /ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  clearInterval(heartbeatInterval);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
