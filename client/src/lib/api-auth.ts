// This utility function adds authentication headers for admin requests
export async function apiAuthRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', path: string, data?: any) {
  const userId = localStorage.getItem('userId');
  
  // Use the fetch API directly with auth headers
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId || '',
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}