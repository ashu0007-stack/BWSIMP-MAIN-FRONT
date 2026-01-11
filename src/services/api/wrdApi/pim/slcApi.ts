import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* -----------------------------------
   🟢 SLC APIs
----------------------------------- */

// ✅ Fetch all SLCs
export const getAllSLCs = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/slc`);
  return data;
};

// ✅ Create a new SLC
export const createSLC = async (slcData: any) => {
  const { data } = await axiosInstance.post(`${API_URL}/pim/slc`, slcData);
  return data;
};
