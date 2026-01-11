import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const userLogout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data; // { message: "Logout successful" }
};

export default userLogout