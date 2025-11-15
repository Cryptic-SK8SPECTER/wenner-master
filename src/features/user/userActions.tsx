// store/actions/userActions.ts
import { customFetch } from "../../lib/utils";
import { AppDispatch } from "../../app/index";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  logout,
} from "./userSlice";
import { User, LoginPayload, LoginResponse } from "./userTypes";

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
    
    

      const user = response.data.data.user;
      const token = response.data.token;
      
      // Persistência opcional
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return user;
    } catch (error: any) {
      // Retorna o erro para o thunk
      return rejectWithValue(
        error.response?.data?.message || "Erro desconhecido"
      );
    }
  }
);



export const logoutUser = () => (dispatch: AppDispatch) => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  dispatch(logout());
};