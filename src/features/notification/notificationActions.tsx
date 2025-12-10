// notificationActions.tsx
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  INotification,
  ICreateNotificationRequest,
  IUpdateNotificationRequest,
} from "./notificationTypes";
import { customFetch } from "../../lib/utils";
import { logoutUser } from "../user/userActions";

const API_URL = "/api/v1/notifications";

// =========================
// GET ALL NOTIFICATIONS
// =========================
export const getAllNotifications = createAsyncThunk<
  INotification[],
  void,
  { rejectValue: string }
>("notifications/getAll", async (_, { rejectWithValue, dispatch }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(logoutUser());
      return rejectWithValue("Faça login para continuar");
    }

    const response = await customFetch.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Ajustar conforme a estrutura da resposta da API
    const notifications = response.data?.data?.notifications || 
                         response.data?.data?.data || 
                         response.data?.data || 
                         [];

    return Array.isArray(notifications) ? notifications : [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      dispatch(logoutUser());
      return rejectWithValue("Sessão expirada. Faça login novamente.");
    }
    return rejectWithValue(
      error.response?.data?.message || "Erro ao buscar notificações"
    );
  }
});

// =========================
// GET NOTIFICATION BY ID
// =========================
export const getNotification = createAsyncThunk<
  INotification,
  string,
  { rejectValue: string }
>("notifications/getById", async (id, { rejectWithValue, dispatch }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(logoutUser());
      return rejectWithValue("Faça login para continuar");
    }

    const response = await customFetch.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const notification = response.data?.data?.notification || 
                        response.data?.data?.data || 
                        response.data?.data;

    if (!notification) {
      return rejectWithValue("Notificação não encontrada");
    }

    return notification;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      dispatch(logoutUser());
      return rejectWithValue("Sessão expirada. Faça login novamente.");
    }
    return rejectWithValue(
      error.response?.data?.message || "Erro ao buscar notificação"
    );
  }
});

// =========================
// CREATE NOTIFICATION
// =========================
export const createNotification = createAsyncThunk<
  INotification,
  ICreateNotificationRequest,
  { rejectValue: string }
>(
  "notifications/create",
  async (notificationData, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(logoutUser());
        return rejectWithValue("Faça login para continuar");
      }

      const response = await customFetch.post(API_URL, notificationData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const notification = response.data?.data?.notification || 
                          response.data?.data?.data || 
                          response.data?.data;

      if (!notification) {
        return rejectWithValue("Resposta inválida do servidor");
      }

      return notification;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        dispatch(logoutUser());
        return rejectWithValue("Sessão expirada. Faça login novamente.");
      }
      return rejectWithValue(
        error.response?.data?.message || "Erro ao criar notificação"
      );
    }
  }
);

// =========================
// UPDATE NOTIFICATION
// =========================
export const updateNotification = createAsyncThunk<
  INotification,
  IUpdateNotificationRequest,
  { rejectValue: string }
>(
  "notifications/update",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(logoutUser());
        return rejectWithValue("Faça login para continuar");
      }

      const response = await customFetch.patch(`${API_URL}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const notification = response.data?.data?.notification || 
                          response.data?.data?.data || 
                          response.data?.data;

      if (!notification) {
        return rejectWithValue("Resposta inválida do servidor");
      }

      return notification;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        dispatch(logoutUser());
        return rejectWithValue("Sessão expirada. Faça login novamente.");
      }
      return rejectWithValue(
        error.response?.data?.message || "Erro ao atualizar notificação"
      );
    }
  }
);

// =========================
// DELETE NOTIFICATION
// =========================
export const deleteNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/delete", async (id, { rejectWithValue, dispatch }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(logoutUser());
      return rejectWithValue("Faça login para continuar");
    }

    await customFetch.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return id;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      dispatch(logoutUser());
      return rejectWithValue("Sessão expirada. Faça login novamente.");
    }
    return rejectWithValue(
      error.response?.data?.message || "Erro ao deletar notificação"
    );
  }
});

