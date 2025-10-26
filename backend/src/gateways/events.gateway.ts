import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { RedisService } from '../database/redis.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private connectedClients = new Map<string, Socket>();

  constructor(private redis: RedisService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.subscribeToRedis();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // Subscribe to Redis pub/sub for cross-instance communication
  private subscribeToRedis() {
    const channels = [
      'inventory:updated',
      'sale:completed',
      'notification:new',
      'pos:sync',
    ];

    channels.forEach((channel) => {
      this.redis.subscribe(channel, (message) => {
        this.logger.debug(`Received message on ${channel}: ${message}`);
        const data = JSON.parse(message);
        this.server.emit(channel, data);
      });
    });
  }

  // Inventory updates
  emitInventoryUpdate(productId: string, quantity: number) {
    const payload = {
      productId,
      quantity,
      timestamp: new Date().toISOString(),
    };

    // Emit to connected clients
    this.server.emit('inventory:updated', payload);

    // Publish to Redis for other instances
    this.redis.publish('inventory:updated', JSON.stringify(payload));
  }

  // Sale completed
  emitSaleCompleted(transactionId: string, total: number, userId: string) {
    const payload = {
      transactionId,
      total,
      userId,
      timestamp: new Date().toISOString(),
    };

    this.server.emit('sale:completed', payload);
    this.redis.publish('sale:completed', JSON.stringify(payload));
  }

  // New notification
  emitNotification(userId: string, notification: any) {
    const payload = {
      userId,
      notification,
      timestamp: new Date().toISOString(),
    };

    this.server.to(userId).emit('notification:new', payload);
    this.redis.publish('notification:new', JSON.stringify(payload));
  }

  // POS sync events
  emitPosSync(event: string, data: any) {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    this.server.emit('pos:sync', payload);
    this.redis.publish('pos:sync', JSON.stringify(payload));
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'joined-room', data: room };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    return { event: 'left-room', data: room };
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  // Send message to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Send to specific room
  sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
