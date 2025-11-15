import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosInstance } from "axios";

export const productionUrl = "http://127.0.0.1:8000/";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const customFetch: AxiosInstance = axios.create({
  baseURL: productionUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
