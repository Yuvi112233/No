import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { voiceNotificationService } from "../services/voiceNotificationService";
import type { WebSocketMessage } from "../types";

interface WebSocketContextType {
  connected: boolean;
  send: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      // Clean up socket when user logs out
      if (socket) {
        socket.close(1000, 'User logged out');
        setSocket(null);
        setConnected(false);
      }
      // Clean up global reference
      (window as any).wsConnection = null;
      return;
    }

    // Close existing socket if any (prevent duplicate connections)
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close(1000, 'Reconnecting');
    }

    // Create WebSocket connection
    const baseURL = import.meta.env.VITE_API_URL || 'https://no-production-d4fc.up.railway.app';

    // Use VITE_WS_URL if available, otherwise construct from baseURL
    let wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      wsUrl = baseURL.replace('http://', 'ws://').replace('https://', 'wss://');
    }
    wsUrl = wsUrl + '/ws';

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);

      // Authenticate with user ID
      const authMessage = {
        type: 'authenticate',
        userId: user.id,
      };
      ws.send(JSON.stringify(authMessage));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'queue_join':
            // Voice notification for admin when new customer joins
            if (user?.role === 'salon_owner' && message.data) {
              const { customerName, serviceName } = message.data;
              voiceNotificationService.speakQueueJoin(customerName, serviceName);
            }

            // Invalidate queries to refresh queue data
            queryClient.invalidateQueries({ queryKey: ['/api/queues/my'] });
            queryClient.invalidateQueries({ queryKey: ['/api/salons'] });
            if (message.salonId) {
              queryClient.invalidateQueries({
                queryKey: ['/api/salons', message.salonId, 'queues']
              });
            }
            break;

          case 'queue_update':
          case 'queue_position_update':
            // Invalidate queue-related queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['/api/queues/my'] });
            queryClient.invalidateQueries({ queryKey: ['/api/salons'] });

            if (message.salonId) {
              queryClient.invalidateQueries({
                queryKey: ['/api/salons', message.salonId, 'queues']
              });
            }
            break;

          case 'queue_notification':
            // Store notification for NotificationOverlay to display
            window.dispatchEvent(new CustomEvent('queue_notification', { detail: message }));
            break;

          case 'customer_arrived':
            // Voice notification for admin when customer arrives
            if (user?.role === 'salon_owner' && message.data) {
              const customerName = message.data.userName || 'A customer';
              const verified = message.data.verified ? 'verified' : 'pending verification';
              voiceNotificationService.speakCustomerArrival(customerName, verified);
            }

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['/api/queues/my'] });
            if (message.salonId) {
              queryClient.invalidateQueries({
                queryKey: ['/api/salons', message.salonId, 'queues']
              });
            }
            break;

          case 'service_starting':
            // Invalidate queries and show toast
            queryClient.invalidateQueries({ queryKey: ['/api/queues/my'] });
            toast({
              title: "Service Starting",
              description: `Your service at ${message.salonName} is about to begin!`,
            });
            break;

          case 'service_completed':
            // Invalidate queries and show toast
            queryClient.invalidateQueries({ queryKey: ['/api/queues/my'] });
            toast({
              title: "Service Completed",
              description: `Your service at ${message.salonName} is complete. Thank you!`,
            });
            break;

          case 'no_show':
            // Invalidate queries and show toast
            queryClient.invalidateQueries({ queryKey: ['/api/queues/my'] });
            toast({
              title: "Marked as No-Show",
              description: message.data?.reason || "You were marked as no-show.",
              variant: "destructive",
            });
            break;

          case 'notification':
            // Show toast notification
            if (message.data?.title && message.data?.description) {
              toast({
                title: message.data.title,
                description: message.data.description,
              });
            }
            break;

          case 'live_viewers_update':
            // Dispatch custom event for live viewer count updates
            window.dispatchEvent(new CustomEvent('live_viewers_update', { 
              detail: { 
                salonId: message.salonId, 
                count: message.count 
              } 
            }));
            break;

          default:
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      setConnected(false);
      
      // Clean up global reference
      if ((window as any).wsConnection === ws) {
        (window as any).wsConnection = null;
      }

      // Attempt to reconnect after a delay if it wasn't a clean close
      // and user is still logged in
      if (!event.wasClean && user && event.code !== 1000) {
        setTimeout(() => {
          // The useEffect will handle recreation when user.id changes
          // Force a re-render by updating a dummy state if needed
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);

      // Show user-friendly error
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please check if backend is running.",
        variant: "destructive",
      });
    };

    setSocket(ws);

    // Store WebSocket connection globally for salon view tracking
    (window as any).wsConnection = ws;

    // Cleanup on unmount or user change
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
      (window as any).wsConnection = null;
    };
  }, [user?.id]); // Only reconnect when user ID changes

  // Listen for service worker messages (push notifications)
  useEffect(() => {
    if (!user || user.role !== 'salon_owner') return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PUSH_NOTIFICATION_RECEIVED') {
        // Trigger voice notification if it's a queue_join event
        if (event.data.data?.type === 'queue_join') {
          const { customerName, serviceName } = event.data.data;
          voiceNotificationService.speakQueueJoin(customerName, serviceName);
        }
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [user]);

  const send = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected, cannot send message:', message);
    }
  };

  const value: WebSocketContextType = {
    connected,
    send,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
