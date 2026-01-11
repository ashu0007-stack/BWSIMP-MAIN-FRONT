import axios from "axios";
import { useRouter } from "next/router";

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {}, // empty body
        { withCredentials: true } // send cookies
      );
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout API error:", error);
      // optionally show toast or notification
    } finally {
      // Clear frontend state
      sessionStorage.removeItem("OAuthCredentials");
      sessionStorage.removeItem("userdetail");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("doaActiveTab");
      localStorage.removeItem("accessToken"); 
      sessionStorage.removeItem("wrdActiveTab");
      router.replace("/login");
    }
  };

  return logout;
};
