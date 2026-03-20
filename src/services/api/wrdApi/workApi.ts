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
// ✅ Add spurs
// =============================
export const addSpurs = async (workId: number, data: any) => {
  const response = await axiosInstance.post(`${API_URL}/works/${workId}/spurs`, data);
  return response.data;
};

// =============================
// ✅ NEW: Add embankments
// =============================
export const addEmbankments = async (workId: number, data: any) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/works/${workId}/embankments`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error adding embankments:', error);
    throw new Error(error.response?.data?.message || 'Failed to add embankments');
  }
};

// =============================
// ✅ NEW: Get embankments by work ID
// =============================
export const getEmbankmentsByWorkId = async (workId: number) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/works/${workId}/embankments`);
    return response.data.embankments || [];
  } catch (error: any) {
    console.error('❌ Error fetching embankments:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch embankments');
  }
};

// =============================
// ✅ NEW: Update embankments
// =============================
export const updateEmbankments = async (workId: number, data: any) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/works/${workId}/embankments`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating embankments:', error);
    throw new Error(error.response?.data?.message || 'Failed to update embankments');
  }
};

// =============================
// ✅ NEW: Delete a specific embankment
// =============================
export const deleteEmbankment = async (workId: number, embankmentId: number) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/works/${workId}/embankments/${embankmentId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error deleting embankment:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete embankment');
  }
};

// =============================
// ✅ NEW: Delete all embankments for a work
// =============================
export const deleteAllEmbankments = async (workId: number) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/works/${workId}/embankments`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error deleting all embankments:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete embankments');
  }
};

// =============================
// ✅ Get spurs by work ID
// =============================
export const getSpursByWorkId = async (workId: number) => {
  const response = await axiosInstance.get(`${API_URL}/works/${workId}/spurs`);
  return response.data.spurs || [];
};

// =============================
// ✅ Get works by division
// =============================
export const getWorksByDivisionId = async (divisionId: number | string) => {
  const { data } = await axiosInstance.get(`${API_URL}/works/by-division/${divisionId}`);
  return data;
};

// =============================
// ✅ Get work by ID
// =============================
export const getWorkById = async (workId: number) => {
  const response = await axiosInstance.get(`${API_URL}/works/${workId}`);
  return response.data;
};

// =============================
// ✅ Update work
// =============================
export const updateWork = async (workId: number, data: any) => {
  const response = await axiosInstance.put(`${API_URL}/works/${workId}`, data);
  return response.data;
};

// =============================
// ✅ Delete work
// =============================
export const deleteWork = async (workId: number) => {
  const response = await axiosInstance.delete(`${API_URL}/works/${workId}`);
  return response.data;
};

// =============================
// ✅ Update beneficiaries
// =============================
export const updateBeneficiaries = async (workId: number, data: any) => {
  const response = await axiosInstance.put(`${API_URL}/works/${workId}/beneficiaries`, data);
  return response.data;
};

// =============================
// ✅ Update villages
// =============================
export const updateVillages = async (workId: number, data: any) => {
  const response = await axiosInstance.put(`${API_URL}/works/${workId}/villages`, data);
  return response.data;
};

// =============================
// ✅ Update components
// =============================
export const updateComponents = async (workId: number, data: any) => {
  const response = await axiosInstance.put(`${API_URL}/works/${workId}/components`, data);
  return response.data;
};

// =============================
// ✅ Fetch assigned works
// =============================
export const fetchAssignedWorks = async (userId:any) => {
  const response = await axiosInstance.get(`${API_URL}/works/assigned/${userId}`);
  return response.data;
};