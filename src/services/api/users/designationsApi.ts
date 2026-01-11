// import axiosInstance from "@/apiInterceptor/axiosInterceptor";

// // GET: Fetch all designations
// export const getDesignations = async () => {
//   const response = await axiosInstance({
//     method: "GET",
//     url: `${process.env.NEXT_PUBLIC_API_URL}/user/designations`,
//   });
//   // Adjust based on your actual API response structure
//   return response.data || [];
// };

// // GET: Fetch designations by department ID
// export const getDesignationsByDeprtId = async (departmentId: number) => {
//   console.log("API called with department id:", departmentId);

//   const response = await axiosInstance({
//     method: "GET",
//     url: `${process.env.NEXT_PUBLIC_API_URL}/user/designations/${departmentId}`,
//   });

//   console.log("API Response:", response.data);
  
//   // Adjust based on your actual API response structure
//   // If your API returns { success: true, data: [...] }
//   if (response.data?.success) {
//     return response.data.data || [];
//   }
  
//   // If your API directly returns an array
//   return response.data || [];
// };


import axiosInstance from "@/apiInterceptor/axiosInterceptor";

// GET: Fetch all designations
export const getDesignations = async () => {
  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/designations`,
  });

  return response.data?.data || [];
};

// GET: Fetch designations by department ID
export const getDesignationsByDeprtId = async (departmentId: number) => {
  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/designations/by-department/${departmentId}`,
  });

  return response.data?.data || [];
};

// GET: Fetch designation by ID (optional)
export const getDesignationById = async (designationId: number) => {
  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/designations/${designationId}`,
  });

  return response.data?.data || null;
};


export const getDesignationsByDeptAndLevel = async ({
  departmentId,
  levelId,
}: {
  departmentId: number;
  levelId: number;
}) => {
  const response = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_URL}/user/designationsByDeptLevel`,
    {
      params: { departmentId, levelId },
    }
  );

  return response.data?.data || [];
};

