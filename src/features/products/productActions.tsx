// features/products/productActions.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { Product, ProductFilters, CreateProductPayload } from "./productTypes";
import { mockProducts } from "../../data/products";
import { customFetch } from "../../lib/utils";

// Simular busca de produtos da API
export const fetchProducts = createAsyncThunk<Product[]>(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockProducts;
    } catch (error) {
      return rejectWithValue("Erro ao buscar produtos");
    }
  }
);

// Filtrar produtos baseado em filtros
export const filterProducts = createAsyncThunk<
  Product[],
  { products: Product[]; filters: ProductFilters; searchQuery: string }
>(
  "products/filterProducts",
  async ({ products, filters, searchQuery }, { rejectWithValue }) => {
    try {
      return products.filter((product) => {
        // Filtro de busca
        if (
          searchQuery &&
          !product.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Filtro de gênero
        if (
          filters.gender.length > 0 &&
          !filters.gender.includes(product.gender)
        ) {
          return false;
        }

        // Filtro de categoria
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(product.category)
        ) {
          return false;
        }

        // Filtro de cores
        if (
          filters.colors.length > 0 &&
          !product.colors.some((color) => filters.colors.includes(color))
        ) {
          return false;
        }

        // Filtro de preço
        if (
          product.price < filters.priceRange[0] ||
          product.price > filters.priceRange[1]
        ) {
          return false;
        }

        // Filtro de rating
        if (
          filters.rating.length > 0 &&
          !filters.rating.some((minRating) => product.rating >= minRating)
        ) {
          return false;
        }

        return true;
      });
    } catch (error) {
      return rejectWithValue("Erro ao filtrar produtos");
    }
  }
);

// Criar novo produto
export const createProduct = createAsyncThunk<Product, FormData>(
  "products/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      // When sending FormData, let axios set the Content-Type (including boundary).
      const response = await customFetch.post<{ data: { product: Product } }>(
        "/api/v1/products",
        formData,
        {
          headers: {
            // override default json header so browser/axios can set multipart boundary
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const product = response.data.data?.product;

      if (!product) {
        return rejectWithValue({
          message: "Produto não foi criado corretamente",
        });
      }

      return product;
    } catch (error) {

      console.log("resposta   :", error);
      const apiError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Erro ao criar produto";
      return rejectWithValue({ message });
    }
  }
);
