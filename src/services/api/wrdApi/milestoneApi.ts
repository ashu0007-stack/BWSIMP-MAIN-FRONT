import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Fetch all milestones
export const getAllMilestones = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/milestones`);
  return data;
};

export const getworkbyMilestone = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/milestones/miles`);
  return data;
};


// ✅ Get milestone progress by ID
export const getMilestoneProgress = async (id: number | string) => {
  const { data } = await axiosInstance.get(`${API_URL}/milestones/${id}/progress`);
  return data;
};

// ✅ Add milestone progress
export const addMilestoneProgress = async (id: number | string, progressData: any) => {
  const { data } = await axiosInstance.post(`${API_URL}/${id}/milestones/progress`, progressData);
  return data;
};

// ✅ Get package progress
export const getPackageProgress = async (pkg: string) => {
  const { data } = await axiosInstance.get(`${API_URL}/milestones/package/${pkg}/progress`);
  return data;
};

// ✅ Get package components
export const getPackageComponents = async (pkg: string) => {
  const { data } = await axiosInstance.get(`${API_URL}/milestones/package/${pkg}/components`);
  return data;
};

// ✅ Save package progress
export const savePackageProgress = async (progressData: any) => {
  const { data } = await axiosInstance.post(`${API_URL}/milestones/progress`, progressData);
  return data;
};

// ✅ Get package milestones (Excel format)
export const getPackageMilestones = async (pkg:any) => {
  const { data } = await axiosInstance.get(`${API_URL}/milestones/package/${pkg}/milestones`);
  return data;
};

// ✅ Get detailed package components
export const getPackageComponentsDetailed = async (pkg: any) => {
  const { data } = await axiosInstance.get(`${API_URL}/milestones/package/${pkg}/components-detailed`);
  return data;
};

// ✅ Save milestone progress
export const saveMilestoneProgress = async (progressData: any) => {
  const { data } = await axiosInstance.post(`${API_URL}/milestones/milestone-progress`, progressData);
  return data;
};