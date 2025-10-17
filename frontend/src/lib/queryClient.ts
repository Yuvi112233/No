import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorDetail = res.statusText; // Default error detail
    try {
      // Try to parse as JSON first
      const errorJson = await res.json();
      if (errorJson && typeof errorJson === 'object' && errorJson.message) {
        errorDetail = errorJson.message;
      } else if (errorJson) {
        // If it's a JSON object but no 'message' field, stringify it
        errorDetail = JSON.stringify(errorJson);
      }
    } catch (e) {
      // If not JSON, fall back to text
      const text = await res.text();
      if (text) {
        errorDetail = text;
      }
    }
    throw new Error(`API Error ${res.status}: ${errorDetail}`);
  }
}

// Enhanced fetch with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response; // Success!

    } catch (error: any) {
      console.log(`Attempt ${attempt} failed:`, error.message);

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        // Enhance error message based on type
        if (error.name === 'AbortError') {
          throw new Error('REQUEST_TIMEOUT');
        }
        if (!navigator.onLine) {
          throw new Error('NO_INTERNET');
        }
        if (error.message === 'Failed to fetch') {
          throw new Error('NETWORK_ERROR');
        }
        throw error;
      }

      // Don't retry if user is offline
      if (!navigator.onLine) {
        throw new Error('NO_INTERNET');
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('UNKNOWN_ERROR');
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  // Add Content-Type for requests with data
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add Authorization header if token exists
  const token = localStorage.getItem('smartq_token');
  console.log('apiRequest - Token from localStorage:', token);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('apiRequest - Authorization header set:', headers["Authorization"]);
  }

  // Use full backend URL
  const baseURL = import.meta.env.VITE_API_URL;
  if (!baseURL) {
    throw new Error('VITE_API_URL environment variable is not set. Please configure your backend URL.');
  }
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
  console.log('Making API request to:', fullUrl);

  const res = await fetchWithRetry(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Clone the response to allow multiple reads of the body
  const clonedRes = res.clone();

  // Handle token update response
  if (clonedRes.status === 401) {
    try {
      const errorData = await clonedRes.json(); // Read from cloned response
      if (errorData.newToken) {
        // Update token in localStorage
        localStorage.setItem('smartq_token', errorData.newToken);
        console.log('Token updated from server response');
        
        // Retry the request with new token
        return apiRequest(method, url, data);
      }
    } catch (e) {
      // If parsing fails, continue with normal error handling
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token exists
    const token = localStorage.getItem('smartq_token');
    console.log('getQueryFn - Token from localStorage:', token);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log('getQueryFn - Authorization header set:', headers["Authorization"]);
    }

    // Use full backend URL for query functions
    const baseURL = import.meta.env.VITE_API_URL;
    if (!baseURL) {
      throw new Error('VITE_API_URL environment variable is not set. Please configure your backend URL.');
    }
    const url = queryKey.join("/") as string;
    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
    
    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
