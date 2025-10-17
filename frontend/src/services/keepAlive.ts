// Keep-alive service to prevent Railway cold starts

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
let pingIntervalId: number | null = null;

export const keepAliveService = {
  start() {
    if (pingIntervalId) {
      console.log('Keep-alive already running');
      return;
    }

    const baseURL = import.meta.env.VITE_API_URL;
    if (!baseURL) {
      console.warn('VITE_API_URL not set, keep-alive disabled');
      return;
    }

    console.log('Starting keep-alive service...');

    // Ping immediately
    this.ping();

    // Then ping every 10 minutes
    pingIntervalId = window.setInterval(() => {
      this.ping();
    }, PING_INTERVAL);
  },

  stop() {
    if (pingIntervalId) {
      clearInterval(pingIntervalId);
      pingIntervalId = null;
      console.log('Keep-alive service stopped');
    }
  },

  async ping() {
    const baseURL = import.meta.env.VITE_API_URL;
    if (!baseURL) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${baseURL}/api/ping`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('Keep-alive ping successful:', data);
      }
    } catch (error) {
      // Silent fail - don't bother user with ping failures
      console.log('Keep-alive ping failed (this is normal):', error);
    }
  }
};
