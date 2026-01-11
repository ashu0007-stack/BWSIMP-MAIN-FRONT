// services/pim/farmersService.ts
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getAllFarmers = async () => {
  try {
    console.log(`🚀 Fetching all farmers...`);
    const response = await axiosInstance.get(`${API_URL}/farmers`);
    console.log(`✅ Farmers data received:`, response.data);
    
    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching all farmers:', error);
    return [];
  }
};

export const getFarmersStatistics = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/farmers/statistics`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching farmers statistics:', error);
    return null;
  }
};

export const getFarmerById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/farmers/${id}`);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching farmer details:', error);
    return null;
  }
};