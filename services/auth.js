// services/auth.js
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const loginService = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    // No fetch, respostas HTTP com status 4xx ou 5xx NÃO caem no catch automaticamente,
    // por isso verificamos a flag response.ok (status entre 200 e 299).
    if (!response.ok) {
      throw new Error(data.message || 'Authentication failed');
    }

    return data;
  } catch (error) {
    // Se for o nosso próprio erro relançado acima ou erro de rede/conexão
    if (error.message && error.message !== 'Failed to fetch') {
      throw error;
    }
    throw new Error('Could not connect to the server');
  }
};