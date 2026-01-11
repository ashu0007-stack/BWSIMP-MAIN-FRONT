import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
}

export const changePassword = async (payload: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
  const { data } = await axiosInstance.post(`${API_URL}/auth/change-password`, payload);
  return data;
};
