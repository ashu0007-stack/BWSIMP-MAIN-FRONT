import axiosInstance from "@/apiInterceptor/axiosInterceptor";

// GET: Fetch all FFS details
export const getDepartments = async () => {

  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/departments`,
    
  });

  return response.data?.data || [];
};

// GET: Fetch all FFS details
export const getDepartmentsById = async ({departmentId}:any) => {

  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/departments/${departmentId}`,
    
  });

  return response.data?.data || [];
};