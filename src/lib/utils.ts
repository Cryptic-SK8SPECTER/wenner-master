import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosInstance } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configuração de URLs por ambiente
const getBaseURL = (): string => {
  // Prioridade 1: Variável de ambiente (Vercel ou .env)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Prioridade 2: Modo de desenvolvimento
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }
  
  // Prioridade 3: Produção (fallback)
  return "https://wenner-api-master.onrender.com";
};

const baseURL = getBaseURL();

// Exportar URL de produção para uso em imagens e outros recursos
export const productionUrl = getBaseURL();

// Do not set a global Content-Type header here. Some requests (file uploads using
// FormData) must let the browser set the Content-Type with the proper boundary.
export const customFetch: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Importante para cookies/JWT
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para adicionar token se necessário
customFetch.interceptors.request.use(
  (config) => {
    // Adicionar token se existir no localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirecionar para login se necessário
      // window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);