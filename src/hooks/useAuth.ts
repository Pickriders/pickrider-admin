import { STORAGE } from "@/constant";
import { deleteCookie, setCookie } from "cookies-next/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export const useAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const login = (token: string, rememberMe?: boolean) => {
    setCookie(STORAGE.accessToken, token, {
      maxAge: rememberMe ? 2592000 : undefined,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    toast.success("Login successful! 🎉");
    router.push(redirect ? decodeURIComponent(redirect) : "/dashboard");
  };

  const logout = () => {
    deleteCookie(STORAGE.accessToken);
    router.push("/auth/login");
  };

  return { login, logout };
};
