"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import userLogin  from "@/services/api/auth/loginApi";
import  userLogout  from "@/services/api/auth/logoutApi";
import { changePassword } from "@/services/api/users/changepassApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { create } from "zustand";

/**
 * ----------------------------------
 * LOGIN HOOK
 * ----------------------------------
 */
interface userLogInState {
  isLoggedIn: boolean , 
  setIsLoggedIn : (isLoggedIn:boolean) => void
}

export const useUserStore = create<userLogInState>(set => ({
  isLoggedIn: typeof window !== 'undefined' &&  sessionStorage.getItem('isLoggedIn') === 'true',
  setIsLoggedIn: (isLoggedIn:boolean) => {
    set({ isLoggedIn });
    sessionStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false'); // Update local storage
    return ;
  },
}));

export function useLogin() {
  const { mutate, isPending } = useMutation({
    mutationFn: userLogin,
  })

  return {
    mutate,
    isPending,
  }

};


/**
 * ----------------------------------
 * LOGOUT HOOK
 * ----------------------------------
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: userLogout,
    onSuccess: () => {
      console.log("🧹 Logging out...");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userdetail");
      sessionStorage.removeItem("OAuthCredentials");
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("OAuthCredentials");

      console.log("✅ Token after logout:", sessionStorage.getItem("authToken"));

      queryClient.clear();
      toast.success("Logged out successfully");

      setTimeout(() => {
        router.push("/login");
      }, 300);
    },
    onError: (error) => {
      console.error("❌ Logout failed:", error);
      sessionStorage.removeItem("authToken");
      queryClient.clear();

      toast.error("Logout failed, but session cleared locally");

      setTimeout(() => {
        router.push("/login");
      }, 300);
    },
  });
};

/**
 * ----------------------------------
 * AUTH GUARD HOOK
 * ----------------------------------
 * Redirects to /login if user is not authenticated
 */
export const useRequireAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to continue");
      router.push("/login");
    }
  }, [router]);
};
  // 🔐 Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (res) => {
      toast.success(res.message || "Password changed successfully");
    },
    onError: (err: any) => {
     
    },
  });
}