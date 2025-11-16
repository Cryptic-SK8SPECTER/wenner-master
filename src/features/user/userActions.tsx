// store/actions/userActions.ts
import { customFetch } from "../../lib/utils";
import { AppDispatch } from "../../app/index";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "./userSlice";
import {
  User,
  LoginPayload,
  LoginResponse,
  SignupPayload,
  UpdateProfilePayload,
  UpdatePasswordPayload,
} from "./userTypes";

export const updateProfile = createAsyncThunk<User, UpdateProfilePayload>(
  "user/updateMe",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await customFetch.patch<{ data: { user: User } }>(
        "/api/v1/users/updateMe",
        payload
      );
      const user = response.data.data.user;

      console.log("Verifique :", user);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        return user;
      }
      return rejectWithValue({ message: "Resposta inesperada do servidor" });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        error?.response?.data?.message || error?.message || "Erro desconhecido";
      return rejectWithValue({ message });
    }
  }
);

export const updatePassword = createAsyncThunk<void, UpdatePasswordPayload>(
  "user/updateMyPassword",
  async (payload, { rejectWithValue }) => {
    try {
      await customFetch.patch("/api/v1/users/updateMyPassword", payload);
      return;
    } catch (err: unknown) {
      const error: any = err;
      const message =
        error?.response?.data?.message || error?.message || "Erro desconhecido";
      return rejectWithValue({ message });
    }
  }
);

type RespShape = {
  user?: User;
  token?: string;
  message?: string;
  data?: { user?: User; token?: string; message?: string };
};

function getErrorMessage(err: unknown): string {
  if (!err) return "Erro desconhecido";
  if (typeof err === "string") return err;

  const axiosError = err as any;

  // Tenta extrair a mensagem da resposta da API (erro 401, 400, etc)
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }

  // Fallback para message do Error
  if (err instanceof Error && err.message) return err.message;

  return "Erro desconhecido";
}

export const loginUser = createAsyncThunk<User, LoginPayload>(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await customFetch.post<LoginResponse>(
        "/api/v1/users/login",
        {
          email,
          password,
        }
      );

      const respData = (response.data ?? {}) as RespShape;
      const user = respData.data?.user || respData.user;
      const token = respData.token || respData.data?.token;

      // If backend returned a message but no user (API signals an error using 200),
      // treat it as a failure so frontend receives the message.
      const backendMessage =
        (response.data as RespShape & { message?: string })?.message ||
        respData.data?.message;
      if (!user) {
        if (backendMessage) {
          return rejectWithValue({ message: backendMessage });
        }
        return rejectWithValue({ message: "Resposta inesperada do servidor" });
      }

      // Persistência opcional
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (token) {
        localStorage.setItem("token", token);
      }

      return user;
    } catch (err: unknown) {
      // Retorna o erro para o thunk
      const message = getErrorMessage(err);

      console.log("Resposta   ", err);

      // Return a structured error so frontend can read `error.message` when using unwrap()
      return rejectWithValue({ message });
    }
  }
);

export const signupUser = createAsyncThunk<User, SignupPayload>(
  "user/signup",
  async ({ name, email, password, passwordConfirm }, { rejectWithValue }) => {
    try {
      const response = await customFetch.post<LoginResponse>(
        "/api/v1/users/signup",
        {
          name,
          email,
          password,
          passwordConfirm,
        }
      );

      const respData = (response.data ?? {}) as RespShape;
      const user = respData.data?.user || respData.user;
      const token = respData.token || respData.data?.token;

      if (!user) {
        const backendMessage =
          (response.data as RespShape & { message?: string })?.message ||
          respData.data?.message;
        if (backendMessage) {
          return rejectWithValue({ message: backendMessage });
        }
        return rejectWithValue({ message: "Resposta inesperada do servidor" });
      }

      // Persistência
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (token) {
        localStorage.setItem("token", token);
      }

      return user;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const logoutUser = () => (dispatch: AppDispatch) => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  dispatch(logout());
};
