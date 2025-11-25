import { createAsyncThunk } from "@reduxjs/toolkit";
import { customFetch } from "@/lib/utils";
import { logoutUser } from "../user/userActions";
import { ProductVariation } from "../product/productTypes";

interface CreateVariantResponse {
  data?: {
    variant?: ProductVariation;
  };
  message?: string;
}

export const createVariant = createAsyncThunk<
  ProductVariation,
  FormData,
  { rejectValue: string }
>("variants/createVariant", async (formData, { rejectWithValue, dispatch }) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      dispatch(logoutUser());
      return rejectWithValue("Faça login para continuar.");
    }

    const response = await customFetch.post<CreateVariantResponse>(
      "/api/v1/variants",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const variant = response.data?.data?.variant;

    if (!variant) {
      return rejectWithValue("Resposta inesperada ao criar variante.");
    }

    const normalizedVariant: ProductVariation = {
      ...variant,
      _id: variant._id || (variant as { id?: string }).id || "",
    };

    return normalizedVariant;
  } catch (err) {
    const error = err as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };

    if (error?.response?.status === 401) {
      dispatch(logoutUser());
      return rejectWithValue("Sessão expirada. Faça login novamente.");
    }

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao criar variante.";
    return rejectWithValue(message);
  }
});
