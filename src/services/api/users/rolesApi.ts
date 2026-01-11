import axiosInstance from "@/apiInterceptor/axiosInterceptor";



// GET: Fetch all designations
export const getRoles = async () => {
  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/roles`,
  });

  return response.data?.data || [];
};

// // GET: Fetch designations by department ID
// export const getRolesByDesignation = async (desgnId: number) => {
//   const response = await axiosInstance({
//     method: "GET",
//     url: `${process.env.NEXT_PUBLIC_API_URL}/user/designations/by-department/${desgnId}`,
//   });

//   return response.data?.data || [];
// };

// GET: Fetch designation by ID (optional)
export const getRolesByDesignation = async (desgnId: number) => {
  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/roles/by-designation/${desgnId}`,
  });

  return response.data?.data || null;
};