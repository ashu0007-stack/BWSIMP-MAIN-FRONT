import axiosInstance from "@/apiInterceptor/axiosInterceptor";
import { create } from "zustand";

interface userLogInState {
  isLoggedIn: boolean , 
  setIsLoggedIn : (isLoggedIn:boolean) => void
}

export const useUserStore = create<userLogInState>(set => ({
  isLoggedIn: typeof window !== 'undefined' &&  sessionStorage.getItem('isLoggedIn') === 'true',
  setIsLoggedIn: (isLoggedIn:boolean) => {
    set({ isLoggedIn });
    sessionStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
    return ;
  },
}));

 const userLogin = async (data: any) => {
  const response = await axiosInstance({
    method: 'post',
    url: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    data: data,
  });

  return response.data;
};

export default userLogin;