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


// Edit user API
export const editUser = async ( payload: any) => {
  console.log("payload", payload?.userId)
  try {
    const response = await axiosInstance({
      method: "PATCH", // better to use PATCH for updates
      url: `${process.env.NEXT_PUBLIC_API_URL}/user/users/${payload?.userId}`,
      data: payload, // { full_name, mobno }
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

//Toggle User Status (Enable/Disable)
export const toggleUserStatus = async (payload: { userId: number; isActive: boolean }) => {
  try {
    const response = await axiosInstance({
      method: "PATCH", // or "PUT" based on your backend
      url: `${process.env.NEXT_PUBLIC_API_URL}/user/users/${payload.userId}/toggle-status`,
      data: {
        is_active: payload.isActive ? "1" : "0"
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to toggle user status" };
  }
};