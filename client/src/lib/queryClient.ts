import { QueryClient, QueryFunction, DefaultOptions } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Enhanced API request to include user-id from localStorage
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const userId = localStorage.getItem('userId');
  const headers: Record<string, string> = { 
    ...(data ? { "Content-Type": "application/json" } : {})
  };
  
  // Add authorization header if user is logged in
  if (userId) {
    headers['user-id'] = userId;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const userId = localStorage.getItem('userId');
    const headers: Record<string, string> = {};
    
    // Add authorization header if user is logged in
    if (userId) {
      headers['user-id'] = userId;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Configure caching options
const queryOptions: DefaultOptions = {
  queries: {
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    // Enable caching with a stale time of 5 minutes (300000ms)
    staleTime: 5 * 60 * 1000,
    // Keep data cached for 1 hour even after it becomes inactive
    gcTime: 60 * 60 * 1000,
    retry: 1, // Retry failed queries once
  },
  mutations: {
    retry: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryOptions,
});
