import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ---------------------------------------------------
   ✅ Create SLC
---------------------------------------------------- */
export const createSLC = async (slcData: any) => {
  const { data } = await axiosInstance.post(`${API_URL}/slc`, slcData);
  return data;
};

/* ---------------------------------------------------
   ✅ Get ALL SLCs
---------------------------------------------------- */
export const getAllSLCs = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/slc`);
  return data;
};

/* ---------------------------------------------------
   ✅ Get SLCs by WUA ID
---------------------------------------------------- */
export const getSLCsByWUA = async (wuaId: number | string) => {
  const { data } = await axiosInstance.get(`${API_URL}/slc/wua/${wuaId}`);
  return data;
};

/* ---------------------------------------------------
   ✅ Get Single SLC with details
---------------------------------------------------- */
export const getSLCById = async (slcId: number | string) => {
  const { data } = await axiosInstance.get(`${API_URL}/slc/${slcId}`);
  return data;
};

/* ---------------------------------------------------
   ✅ Update SLC
---------------------------------------------------- */
export const updateSLC = async (slcId: number | string, slcData: any) => {
  const { data } = await axiosInstance.put(`${API_URL}/slc/${slcId}`, slcData);
  return data;
};

/* ---------------------------------------------------
   ✅ Update ONLY SLC Status
---------------------------------------------------- */
export const updateSLCStatus = async (slcId: number | string, status: string) => {
  const { data } = await axiosInstance.patch(`${API_URL}/slc/${slcId}/status`, {
    status,
  });
  return data;
};

/* ---------------------------------------------------
   ✅ Get WUA list with VLCs (for SLC form dropdown)
---------------------------------------------------- */
export const getWUAsWithVLCs = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/wua/with-vlcs`);
  return data;
};