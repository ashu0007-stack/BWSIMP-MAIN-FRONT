import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Get summary data
export const getSummaryData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/reports/summary`);
  return data;
};

// ✅ Get WUA detailed data
export const getWUADetailedData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/reports/wua-detailed`);
  return data;
};

// ✅ Get VLC detailed data
export const getVLCDetailedData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/reports/vlc-detailed`);
  return data;
};

// ✅ Get SLC detailed data
export const getSLCDetailedData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/reports/slc-detailed`);
  return data;
};

// ✅ Get water tax data
export const getWaterTaxData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/reports/water-tax`);
  return data;
};

// ✅ Get PIM impact data
export const getPIMImpactData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/reports/pim-impact-detailed`);
  return data;
};

// ✅ Get comparative study data
export const getComparativeStudyData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/comparative-study`);
  return data;
};

// ✅ Get meetings data
export const getMeetingsData = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/meetings`);
  return data;
};

// ✅ Generate statistics
export const generateStatistics = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/reports/generate-stats`);
  return data;
};

// ✅ Update status
export const updateStatus = async (type: string, id: number, status: string) => {
  const endpoint = `${API_URL}/${type}/${id}/pim/status`;
  const { data } = await axiosInstance.patch(endpoint, { status });
  return data;
};