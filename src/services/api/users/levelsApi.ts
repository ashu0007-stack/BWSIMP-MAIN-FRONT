import axiosInstance from "@/apiInterceptor/axiosInterceptor";


// GET: Fetch all designations
export const getLevels = async () => {
  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/level`,
  });

  return response.data?.data || [];
};



// GET: Fetch designation by ID (optional)
export const getLevelsByDepartmentId = async (departmentId: number) => {
  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/level/${departmentId}`,
  });

  return response.data?.data || null;
};