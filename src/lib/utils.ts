import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosInstance } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Configuração de URLs por ambiente
function getBaseURL(): string {
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
}

// Exportar URL de produção para uso em imagens e outros recursos
// Exportação direta e explícita para garantir compatibilidade com Rollup
export const productionUrl: string = getBaseURL();

const baseURL = getBaseURL();

// Do not set a global Content-Type header here. Some requests (file uploads using
// FormData) must let the browser set the Content-Type with the proper boundary.
export const customFetch: AxiosInstance = axios.create({
  baseURL,
  // IMPORTANTE: withCredentials: true requer que o backend configure CORS corretamente
  // O backend NÃO pode usar Access-Control-Allow-Origin: *
  // Deve especificar o domínio exato: https://wenner-master.vercel.app
  // Ver: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#credentials
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
    // Não remover token automaticamente aqui
    // Deixar as actions tratarem o logout para evitar problemas
    // O interceptor apenas rejeita a promise para que as actions possam tratar
    return Promise.reject(error);
  }
);