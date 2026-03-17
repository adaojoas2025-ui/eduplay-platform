// Configuração da API
const PROD_BACKEND = 'https://eduplay-backend-yw7z.onrender.com';
const baseUrl = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  : PROD_BACKEND;

export const API_URL = baseUrl.includes('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
export const API_BASE_URL = baseUrl;
