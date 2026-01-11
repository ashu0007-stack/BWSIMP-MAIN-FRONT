import axiosInstance from "@/apiInterceptor/axiosInterceptor";

// create user
export const createUser = async (payload: any) => {
  const response = await axiosInstance({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/createUser`,
    data: payload, // ✅ SEND DATA HERE
  });

  return response.data?.data || [];
};


// get users list
export const getUsersList = async () => {
  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/usersList`,
  });

  return response.data?.data || [];
};
