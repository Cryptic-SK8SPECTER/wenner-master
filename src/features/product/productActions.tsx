import { createAsyncThunk } from "@reduxjs/toolkit";
import { Product, ApiResponse } from "./productTypes";
import { customFetch } from "../../lib/utils";
import { logoutUser } from "../user/userActions";

// Buscar produtos da API
export const fetchProducts = createAsyncThunk<Product[]>(
  "products/fetchProducts",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await customFetch.get(`/api/v1/products`);
      const { products } = response.data?.data;

      if (!Array.isArray(products)) {
        return rejectWithValue("Resposta inesperada da API ao buscar produtos");
      }

      // Normaliza os produtos
      const normalizedProducts = products.map((product) => ({
        ...product,
        id: product._id,
      }));

      return normalizedProducts;
    } catch (err: unknown) {
      console.error("❌ Erro no fetchProducts:", err);
      const error = err as {
        response?: { status?: number; data?: Record<string, unknown> };
        message?: string;
      };

      if (error?.response?.status === 401) {
        dispatch(logoutUser());
        return rejectWithValue("Sessão expirada. Faça login novamente.");
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao buscar produtos";
      return rejectWithValue(message);
    }
  }
);

// Criar produto
export const createProduct = createAsyncThunk<ApiResponse, FormData>(
  "products/createProduct",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(logoutUser());
        return rejectWithValue({ message: "Faça login para continuar" });
      }

      const response = await customFetch.post("/api/v1/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: Record<string, unknown> };
      };

      if (error?.response?.status === 401) {
        dispatch(logoutUser());
        return rejectWithValue({
          message: "Sessão expirada. Faça login novamente.",
        });
      }

      const apiErrorBody = error?.response?.data ?? null;
      const message = apiErrorBody?.message ?? "Erro ao criar produto";
      return rejectWithValue(apiErrorBody ?? { message });
    }
  }
);

// features/products/productActions.ts
export const fetchProductBySlug = createAsyncThunk<Product, string>(
  "products/fetchProductBySlug",
  async (slug, { rejectWithValue, dispatch }) => {
    try {
      const response = await customFetch.get(
        `/api/v1/products/product/${slug}`
      );

      
      const { product } = response.data?.data;
      

      if (!product) {
        return rejectWithValue("Produto não encontrado");
      }

      // Normaliza o produto
      const normalizedProduct = {
        ...product,
        id: product._id || product.id,
      };

      return normalizedProduct;
    } catch (err: unknown) {
      console.error("❌ Erro no fetchProductBySlug:", err);
      const error = err as {
        response?: { status?: number; data?: Record<string, unknown> };
        message?: string;
      };

      if (error?.response?.status === 401) {
        dispatch(logoutUser());
        return rejectWithValue("Sessão expirada. Faça login novamente.");
      }

      if (error?.response?.status === 404) {
        return rejectWithValue("Produto não encontrado");
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao buscar detalhes do produto";
      return rejectWithValue(message);
    }
  }
);

// Buscar produtos relacionados por categoria
export const fetchRelatedProducts = createAsyncThunk<
  Product[],
  { category: string; excludeId?: string }
>(
  "products/fetchRelatedProducts",
  async ({ category, excludeId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await customFetch.get(
        `/api/v1/products?category=${encodeURIComponent(category)}`
      );
      const { products } = response.data?.data;

      if (!Array.isArray(products)) {
        return rejectWithValue("Resposta inesperada da API ao buscar produtos relacionados");
      }

      // Normaliza os produtos e filtra o produto atual
      const normalizedProducts = products
        .map((product) => ({
          ...product,
          id: product._id,
        }))
        .filter((product) => product._id !== excludeId)
        .slice(0, 4); // Limita a 4 produtos relacionados

      return normalizedProducts;
    } catch (err: unknown) {
      console.error("❌ Erro no fetchRelatedProducts:", err);
      const error = err as {
        response?: { status?: number; data?: Record<string, unknown> };
        message?: string;
      };

      if (error?.response?.status === 401) {
        dispatch(logoutUser());
        return rejectWithValue("Sessão expirada. Faça login novamente.");
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao buscar produtos relacionados";
      return rejectWithValue(message);
    }
  }
);