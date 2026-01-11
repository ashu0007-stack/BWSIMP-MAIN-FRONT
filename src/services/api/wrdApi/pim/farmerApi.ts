import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Get all WUAs
// export const getAllWUAs = async () => {
//   const { data } = await axiosInstance.get(`${API_URL}/wua`);
//   return data;
// };

// ✅ Save farmers data
export const saveFarmersData = async (farmersData: {
  wua_id: string;
  farmers: any[];
}) => {
  const { data } = await axiosInstance.post(`${API_URL}/pim/farmers`, farmersData);
  return data;
};

// ✅ Get farmers by WUA
export const getFarmersByWUA = async (wuaId: string) => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/farmers/${wuaId}`);
  return data;
};