import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Get all comparative study data
export const getAllComparativeData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/comparative-study`);
  return data;
};

// ✅ Create new comparative study record
export const createComparativeRecord = async (recordData: any) => {
  const { data } = await axiosInstance.post(`${API_URL}/pim/comparative-study`, recordData);
  return data;
};

// ✅ Update comparative study record
export const updateComparativeRecord = async (id: number, recordData: any) => {
  const { data } = await axiosInstance.put(`${API_URL}/pim/comparative-study/${id}`, recordData);
  return data;
};

// ✅ Delete comparative study record
export const deleteComparativeRecord = async (id: number) => {
  await axiosInstance.delete(`${API_URL}/pim/comparative-study/${id}`);
};