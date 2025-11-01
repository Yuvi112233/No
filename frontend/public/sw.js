// Service Worker for SmartQ PWA
const CACHE_NAME = 'smartq-v1';
const API_CACHE_NAME = 'smartq-api-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => {
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();
          
          // Cache successful responses
          if (response.ok) {
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response
            return new Response(
              JSON.stringify({ error: 'Offline', message: 'No network connection' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseClone = response.clone();

            // Cache static assets (JS, CSS, images)
            if (
              request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/)
            ) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'SmartQ Notification',
    body: 'You have a new notification',
    icon: '/loadlogo.png',
    badge: '/loadlogo.png',
    data: {},
    silent: false
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        vibrate: data.vibrate || [200, 100, 200],
        data: data.data || {},
        tag: data.tag || 'smartq-notification',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [],
        silent: false // Ensure sound plays
      };
    } catch (error) {
      // Error parsing push data
    }
  }

  event.waitUntil(
    Promise.all([
      // Show notification
      self.registration.showNotification(notificationData.title, notificationData),
      
      // Send message to all clients to trigger voice if app is open
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'PUSH_NOTIFICATION_RECEIVED',
            data: notificationData.data
          });
        });
      })
    ])
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification action clicks
self.addEventListener('notificationclick', (event) => {
  if (event.action) {
    // Handle specific actions
    switch (event.action) {
      case 'view':
        event.waitUntil(
          clients.openWindow(event.notification.data?.url || '/')
        );
        break;
      case 'dismiss':
        // Just close the notification
        break;
    }
  }
  
  event.notification.close();
});

// Background sync event (for future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queues') {
    event.waitUntil(
      // Sync queue data when back online
      fetch('/api/queues')
        .then((response) => response.json())
        .catch(() => {
          // Sync failed
        })
    );
  }
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
