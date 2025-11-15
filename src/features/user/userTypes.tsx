// features/user/userTypes.ts

// Interface que representa um usuário
export interface User {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "client" | "manager"; 
  avatarUrl?: string; // opcional, se tiver foto
}

// Estado do slice de usuário
export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Payload de login
export interface LoginPayload {
  email: string;
  password: string;
}

// Payload de atualização de perfil
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

// Payload de resposta da API (login)
export interface LoginResponse {
  user: User;
  token: string;
}
