import { createSlice } from "@reduxjs/toolkit";
import { VariantState } from "./variantType";
import { createVariant } from "./variantActions";

const initialState: VariantState = {
  variants: [],
  loading: false,
  error: null,
  lastCreatedVariant: null,
};

const variantSlice = createSlice({
  name: "variant",
  initialState,
  reducers: {
    clearVariantStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.lastCreatedVariant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVariant.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastCreatedVariant = action.payload;
        state.variants.push(action.payload);
      })
      .addCase(createVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Erro ao criar variante.";
      });
  },
});

export const { clearVariantStatus } = variantSlice.actions;
export default variantSlice.reducer;
