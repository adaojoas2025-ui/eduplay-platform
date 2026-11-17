// Configuração da API
const configuredUrl = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://eduplay-platform.onrender.com')
).replace(/\/+$/, '');

const baseUrl = configuredUrl.replace(/\/api\/v1$/, '');

export const API_URL = `${baseUrl}/api/v1`;
export const API_BASE_URL = baseUrl;
