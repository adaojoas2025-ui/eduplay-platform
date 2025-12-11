// Configuração da API
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Se a variável já tem /api/v1, usa direto, senão adiciona
export const API_URL = baseUrl.includes('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
export const API_BASE_URL = baseUrl;
