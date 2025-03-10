export * from "./select";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const GOOGLE_MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

export const MAP_ID = process.env.NEXT_PUBLIC_MAP_ID;

export const API_URL = `${BASE_URL}/api/v1`;

export const STORAGE = {
  accessToken: "@pickriders/accessToken",
};
