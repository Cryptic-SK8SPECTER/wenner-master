// features/products/productSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductsState, Filters } from "./productTypes";
import {
  fetchProducts,
  createProduct,
  fetchProductBySlug,
  fetchRelatedProducts,
  updateProduct,
  deleteProduct,
} from "./productActions";

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  currentProduct: null,
  relatedProducts: [],
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
  name: "product",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Filters>) => {
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
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.relatedProducts = [];
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
        state.products = action.payload;
        state.filteredProducts = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.products = [];
      })
      // Fetch Product By Slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentProduct = null;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        // CORREÇÃO: action.payload é ApiResponse, não Product
        if (action.payload.data) {
          state.products.push(action.payload.data);
          state.filteredProducts.push(action.payload.data);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updated = action.payload;

        state.products = state.products.map((product) =>
          product._id === updated._id ? updated : product
        );

        state.filteredProducts = state.filteredProducts.map((product) =>
          product._id === updated._id ? updated : product
        );

        if (state.currentProduct && state.currentProduct._id === updated._id) {
          state.currentProduct = updated;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const deletedId = action.payload;

        state.products = state.products.filter(
          (product) => product._id !== deletedId && product.id !== deletedId
        );

        state.filteredProducts = state.filteredProducts.filter(
          (product) => product._id !== deletedId && product.id !== deletedId
        );

        if (
          state.currentProduct &&
          (state.currentProduct._id === deletedId ||
            state.currentProduct.id === deletedId)
        ) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Related Products
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.relatedProducts = [];
      });
  },
});

export const {
  setFilters,
  setSearchQuery,
  resetFilters,
  clearError,
  clearCurrentProduct,
} = productSlice.actions;
export default productSlice.reducer;
