import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Get all WUAs
export const getAllWUAs = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/wua`);
  return data;
};

// ✅ Create new WUA
export const createWUA = async (formData: any) => {
  const { data } = await axiosInstance.post(`${API_URL}/pim/wua`, formData);
  return data;
};

// ✅ Create villages for WUA
export const createWUAVillages = async (villages: any[]) => {
  if (!villages.length) return;
  await Promise.all(
    villages.map((village) =>
      axiosInstance.post(`${API_URL}/pim/wua/villages`, village)
    )
  );
};

// ✅ Fetch all VLCs
export const getAllVLCs = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/vlc`);
  return data;
};

// ✅ Create VLC
export const createVLC = async (vlcData: any) => {
  const { data } = await axiosInstance.post(`${API_URL}/pim/vlc`, vlcData);
  return data;
};
