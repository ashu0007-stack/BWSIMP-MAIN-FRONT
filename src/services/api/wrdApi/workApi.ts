
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// =============================
// ✅ Get all works
// =============================
export const fetchWorks = async () => {
  const response = await axiosInstance.get(`${API_URL}/works`);
  return response.data;
};

// =============================
// ✅ Create new work
// =============================
// export const createWork = async (data: any) => {
//   const response = await axiosInstance.post(`${API_URL}/works`, data);
//   return response.data;
// };
export const createWork = async (data: any) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/works`, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.sqlMessage?.includes('Duplicate entry')) {
      throw new Error('This work name already exists. Please choose a different name.');
    }
    throw new Error(error.response?.data?.message || 'Failed to create work');
  }
};

// =============================
// ✅ Add beneficiaries
// =============================
export const addBeneficiaries = async (workId: number, data: any) => {
  const response = await axiosInstance.post(`${API_URL}/works/${workId}/beneficiaries`, data);
  return response.data;
};

// =============================
// ✅ Add villages
// =============================
export const addVillages = async (workId: number, data: any) => {
  const response = await axiosInstance.post(`${API_URL}/works/${workId}/villages`, data);
  return response.data;
};

// =============================
// ✅ Add components + milestones
// =============================
export const addComponentsAndMilestones = async (workId: number, data: any) => {
  const response = await axiosInstance.post(`${API_URL}/works/${workId}/components`, data);
  return response.data;
};

// =============================
// ✅ Get works by division
// =============================
export const getWorksByDivisionId = async (divisionId: number | string) => {
  const { data } = await axiosInstance.get(`${API_URL}/works/by-division/${divisionId}`);
  return data;
};
export const getWorkById = async (workId: number) => {
  const response = await axiosInstance.get(`${API_URL}/works/${workId}`);
  return response.data;
};
export const updateWork = async (workId: number, data: any) => {
  const response = await axiosInstance.put(`${API_URL}/works/${workId}`, data);
  return response.data;
};
export const deleteWork = async (workId: number) => {
  const response = await axiosInstance.delete(`${API_URL}/works/${workId}`);
  return response.data;
};
export const updateBeneficiaries = async (workId: number, data: any) => {
  const response = await axiosInstance.put(`${API_URL}/works/${workId}/beneficiaries`, data);
  return response.data;
};
export const updateVillages = async (workId: number, data: any) => {
  const response = await axiosInstance.put(`${API_URL}/works/${workId}/villages`, data);
  return response.data;
};
export const updateComponents = async (workId: number, data: any) => {
  const response = await axiosInstance.put(`${API_URL}/works/${workId}/components`, data);
  return response.data;
};
export const fetchAssignedWorks = async (userId:any) => {
  const response = await axiosInstance.get(`${API_URL}/works/assigned/${userId}`);
  return response.data;
};