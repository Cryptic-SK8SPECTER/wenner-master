// features/products/productSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductsState, ProductFilters } from "./productTypes";
import { fetchProducts, filterProducts, createProduct } from "./productActions";

const initialState: ProductsState = {
  items: [],
  filteredItems: [],
  loading: false,
  error: null,
  filters: {
    gender: [],
    categories: [],
    colors: [],
    priceRange: [0, 200],
    rating: [],
  },
  searchQuery: "",
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        gender: [],
        categories: [],
        colors: [],
        priceRange: [0, 200],
        rating: [],
      };
      state.searchQuery = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.filteredItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Filter Products
      .addCase(filterProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterProducts.fulfilled, (state, action) => {
        state.filteredItems = action.payload;
        state.loading = false;
      })
      .addCase(filterProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.filteredItems.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setSearchQuery, resetFilters } =
  productSlice.actions;
export default productSlice.reducer;
