import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Fetch all works
export const getAllWorks = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/length/works`);
  return data;
};

// ✅ Get components of a package
export const getPackageComponents = async (packageNumber: string) => {
  const { data } = await axiosInstance.get(`${API_URL}/length/package/${packageNumber}/components`);
  return data;
};

// ✅ Get progress of a package
export const getPackageProgress = async (packageNumber: string) => {
  const { data } = await axiosInstance.get(`${API_URL}/length/package/${packageNumber}/progress`);
  return data;
};

// ✅ Add new progress entry
export const addProgressEntry = async (progressData: {
  packageNumber: string;
  startKm: number;
  endKm: number;
  earthworkDoneKm: number;
  liningDoneKm: number;
  progressDate?: string | null;
}) => {
  const { data } = await axiosInstance.post(`${API_URL}/length/add`, progressData);
  return data;
};

// ✅ Add EMBANKMENT progress entry
export const addEmbankmentProgressEntry = async (progressData: {
  packageNumber: string;
  startKm: number;
  endKm: number;
  embankmentDoneKm: number;
  progressDate?: string | null;
  created_by?: string;
}) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/length/add-embankment`, 
      progressData
    );
    return response.data;
  } catch (error) {
    console.error("Error adding embankment progress:", error);
    throw error;
  }
};
