// Configuração da API
const baseUrl = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  : 'https://eduplay-platform.onrender.com';

export const API_URL = `${baseUrl}/api/v1`;
export const API_BASE_URL = baseUrl;
