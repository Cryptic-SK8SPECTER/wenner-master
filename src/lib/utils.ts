import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { AxiosInstance } from "axios";

export const productionUrl = "http://127.0.0.1:8000/";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


const baseURL = import.meta.env.DEV ? "" : productionUrl;

// Do not set a global Content-Type header here. Some requests (file uploads using
// FormData) must let the browser set the Content-Type with the proper boundary.
export const customFetch: AxiosInstance = axios.create({
  baseURL,
});
