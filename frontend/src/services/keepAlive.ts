// Keep-alive service to prevent Railway cold starts

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
let pingIntervalId: number | null = null;

export const keepAliveService = {
  start() {
    if (pingIntervalId) {
      return;
    }

    const baseURL = import.meta.env.VITE_API_URL;
    if (!baseURL) {
      console.warn('VITE_API_URL not set, keep-alive disabled');
      return;
    }

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
      }
    } catch (error) {
      // Silent fail - don't bother user with ping failures
    }
  }
};
