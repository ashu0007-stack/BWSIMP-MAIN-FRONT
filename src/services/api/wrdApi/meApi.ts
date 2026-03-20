import axiosInstance from "@/apiInterceptor/axiosInterceptor";

// Get all indicators with calculated data
export const getMEIndicators = async () => {
  try {
    const response = await axiosInstance.get("/me/indicators");
    return response.data.indicators || [];
  } catch (error) {
    console.error("Error fetching indicators:", error);
    throw error;
  }
};

// Get dashboard summary
export const getMESummary = async () => {
  try {
    const response = await axiosInstance.get("/me/summary");
    return response.data.summary;
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw error;
  }
};