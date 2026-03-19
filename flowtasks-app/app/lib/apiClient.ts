export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('flowtasks_token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  if (response.status === 401) {
    // Token expirou ou inválido -> desloga o usuário
    localStorage.removeItem('flowtasks_token');
    window.location.href = '/login';
  }

  return response.json();
}