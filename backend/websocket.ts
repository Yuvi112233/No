import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import liveViewersService from './services/liveViewersService';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAuthenticated?: boolean;
}

interface WebSocketMessage {
  type: string;
  userId?: string;
  salonId?: string;
  data?: any;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      ws.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', (code, reason) => {
        console.log('🔌 WebSocket client disconnected:', {
          userId: ws.userId,
          code,
          reason: reason.toString(),
          timestamp: new Date().toISOString()
        });
        
        if (ws.userId) {
          // Clean up viewer tracking
          const remainingViewers = liveViewersService.removeUser(ws.userId);
          console.log('👥 User removed from viewer tracking:', ws.userId);
          
          // Remove from clients map
          this.clients.delete(ws.userId);
          console.log('📊 Active WebSocket clients:', this.clients.size);
        }
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });

      // Send connection confirmation
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'WebSocket connection established' 
      }));
    });

    console.log('🚀 WebSocket server initialized on /ws');
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'authenticate':
        this.authenticateClient(ws, message);
        break;
      
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      case 'salon_view_start':
        this.handleSalonViewStart(ws, message);
        break;

      case 'salon_view_end':
        this.handleSalonViewEnd(ws, message);
        break;

      default:
        console.log('🔄 Unknown WebSocket message type:', message.type);
    }
  }

  private authenticateClient(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    try {
      if (!message.userId) {
        console.log('❌ Authentication failed: No user ID provided');
        ws.send(JSON.stringify({ 
          type: 'auth_error', 
          message: 'User ID required' 
        }));
        return;
      }

      // Check if user already has a connection
      const existingConnection = this.clients.get(message.userId);
      if (existingConnection && existingConnection !== ws) {
        console.log('⚠️ User already has an active connection, closing old one:', message.userId);
        existingConnection.close(1000, 'New connection established');
        this.clients.delete(message.userId);
      }

      // Store authenticated client
      ws.userId = message.userId;
      ws.isAuthenticated = true;
      this.clients.set(message.userId, ws);
      
      console.log('✅ WebSocket client authenticated:', {
        userId: message.userId,
        totalClients: this.clients.size,
        timestamp: new Date().toISOString()
      });
      
      ws.send(JSON.stringify({ 
        type: 'authenticated', 
        message: 'Successfully authenticated',
        userId: message.userId
      }));
    } catch (error) {
      console.error('❌ Authentication error:', error);
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        message: 'Authentication failed' 
      }));
    }
  }

  // Broadcast queue update to all connected clients
  broadcastQueueUpdate(salonId: string, data: any) {
    const message = JSON.stringify({
      type: 'queue_update',
      salonId,
      data,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
        client.send(message);
      }
    });
  }

  // Broadcast when a new customer joins the queue
  broadcastQueueJoin(salonId: string, queueData: any) {
    const message = JSON.stringify({
      type: 'queue_join',
      salonId,
      data: queueData,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
        client.send(message);
      }
    });
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, title: string, description: string) {
    const client = this.clients.get(userId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'notification',
        data: { title, description },
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Send notification to all users in a salon's queue
  sendNotificationToSalon(salonId: string, title: string, description: string) {
    const message = JSON.stringify({
      type: 'notification',
      salonId,
      data: { title, description },
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
        client.send(message);
      }
    });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    const client = this.clients.get(userId);
    return client ? client.readyState === WebSocket.OPEN : false;
  }

  // Send queue_notification event to specific user
  sendQueueNotification(
    userId: string,
    data: {
      queueId: string;
      salonId: string;
      salonName: string;
      salonAddress: string;
      estimatedMinutes: number;
      services: Array<{ id: string; name: string; price: number; duration: number }>;
      salonLocation: { latitude: number; longitude: number };
    }
  ): boolean {
    const client = this.clients.get(userId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'queue_notification',
        userId,
        ...data,
        timestamp: new Date().toISOString()
      }));
      
      return true;
    }
    
    return false;
  }

  // Send customer_arrived event to all admin connections for a salon
  sendCustomerArrivedToSalon(
    salonId: string,
    data: {
      queueId: string;
      userId: string;
      userName: string;
      userPhone: string;
      verified: boolean;
      distance?: number;
      requiresConfirmation: boolean;
    }
  ): void {
    const message = JSON.stringify({
      type: 'customer_arrived',
      salonId,
      ...data,
      timestamp: new Date().toISOString()
    });

    // Broadcast to all connected clients (admins will filter by salon)
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
        client.send(message);
      }
    });
  }

  // Send queue_position_update event to all users in a salon's queue
  sendQueuePositionUpdate(
    salonId: string,
    queues: Array<{
      id: string;
      userId: string;
      position: number;
      status: string;
      estimatedWaitTime: number;
    }>
  ): void {
    const message = JSON.stringify({
      type: 'queue_position_update',
      salonId,
      queues,
      timestamp: new Date().toISOString()
    });

    // Broadcast to all connected clients
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
        client.send(message);
      }
    });
  }

  // Send service_starting event to specific user
  sendServiceStarting(
    userId: string,
    data: {
      queueId: string;
      salonName: string;
      services: Array<{ id: string; name: string; duration: number }>;
      estimatedTime: number;
    }
  ): boolean {
    const client = this.clients.get(userId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'service_starting',
        userId,
        ...data,
        timestamp: new Date().toISOString()
      }));
      
      return true;
    }
    
    return false;
  }

  // Send service_completed event to specific user
  sendServiceCompleted(
    userId: string,
    data: {
      queueId: string;
      salonName: string;
      services: Array<{ id: string; name: string; price: number }>;
      totalPrice: number;
    }
  ): boolean {
    const client = this.clients.get(userId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'service_completed',
        userId,
        ...data,
        timestamp: new Date().toISOString()
      }));
      
      return true;
    }
    
    return false;
  }

  // Send no_show event to specific user
  sendNoShow(
    userId: string,
    data: {
      queueId: string;
      salonName: string;
      reason: string;
    }
  ): boolean {
    const client = this.clients.get(userId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'no_show',
        userId,
        ...data,
        timestamp: new Date().toISOString()
      }));
      
      return true;
    }
    
    return false;
  }

  // Get the number of active WebSocket connections
  getConnectionCount(): number {
    return this.clients.size;
  }

  /**
   * Handle user starting to view a salon page
   */
  private handleSalonViewStart(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (!ws.userId || !message.salonId) {
      console.log('⚠️ Invalid salon_view_start:', { userId: ws.userId, salonId: message.salonId });
      return;
    }

    const viewerCount = liveViewersService.joinSalonView(message.salonId, ws.userId);
    
    console.log('👁️ User started viewing salon:', {
      userId: ws.userId,
      salonId: message.salonId,
      newViewerCount: viewerCount,
      timestamp: new Date().toISOString()
    });
    
    // Broadcast updated viewer count to all clients
    this.broadcastViewerCount(message.salonId, viewerCount);
  }

  /**
   * Handle user stopping viewing a salon page
   */
  private handleSalonViewEnd(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (!ws.userId || !message.salonId) {
      console.log('⚠️ Invalid salon_view_end:', { userId: ws.userId, salonId: message.salonId });
      return;
    }

    const viewerCount = liveViewersService.leaveSalonView(message.salonId, ws.userId);
    
    console.log('👁️ User stopped viewing salon:', {
      userId: ws.userId,
      salonId: message.salonId,
      newViewerCount: viewerCount,
      timestamp: new Date().toISOString()
    });
    
    // Broadcast updated viewer count to all clients
    this.broadcastViewerCount(message.salonId, viewerCount);
  }

  /**
   * Broadcast live viewer count update
   */
  broadcastViewerCount(salonId: string, count: number) {
    const message = JSON.stringify({
      type: 'live_viewers_update',
      salonId,
      count,
      timestamp: new Date().toISOString()
    });

    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
        client.send(message);
        sentCount++;
      }
    });
    
    console.log('📡 Broadcasted viewer count update:', {
      salonId,
      count,
      sentToClients: sentCount,
      totalClients: this.clients.size
    });
  }

  /**
   * Get current viewer count for a salon
   */
  getViewerCount(salonId: string): number {
    return liveViewersService.getViewerCount(salonId);
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();
export default wsManager;
