// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
// import cartReducer from "./slices/cartSlice";
// import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  // Redux Toolkit já inclui thunk middleware por padrão
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
