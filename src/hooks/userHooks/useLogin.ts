import { useMutation } from "@tanstack/react-query";
import  userLogin  from "@/services/api/auth/loginApi";
import { create } from "zustand";

interface userLogInState {
  isLoggedIn: boolean , 
  setIsLoggedIn : (isLoggedIn:boolean) => void
}

// store the user status
export const useUserStore = create<userLogInState>(set => ({
  isLoggedIn: typeof window !== 'undefined' &&  sessionStorage.getItem('isLoggedIn') === 'true',
  setIsLoggedIn: (isLoggedIn:boolean) => {
    set({ isLoggedIn });
    sessionStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false'); // Update local storage
    return ;
  },
}));

// Call the login api 
export function useLogin() {
  const { mutate, isPending } = useMutation({
    mutationFn: userLogin,
  })

  return {
    mutate,
    isPending,
  }
};