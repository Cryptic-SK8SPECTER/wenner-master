// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import productReducer from "../features/product/productSlice";
import variantReducer from "../features/variants/variantSlice";
import favoriteReducer from "../features/favorite/favoriteSlice";
import orderReducer from "../features/order/orderSlice";
import reportReducer from "../features/report/reportSlice";
// import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    product: productReducer,
    variant: variantReducer,
    favorites: favoriteReducer,
    order: orderReducer,
   report: reportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
