import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

// Helper function to extract data from API response
const extractApiData = <T>(response: any): T[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  if (response.status?.success && response.data) return response.data;
  return [];
};

const getPanchayatsByBlock = async (blockId: number) => {
  console.log("🌐 Fetching panchayats for block ID:", blockId);
  
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_API_URL}/location/panchayats/${blockId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const useGramPanchayatsByBlock = (blockId?: number) => {
  return useQuery({
    queryKey: ["gramPanchayats", blockId],
    queryFn: async () => {
      if (!blockId || blockId === 0) {
        console.log("⚠️ No valid blockId provided for panchayats");
        return [];
      }
      try {
        const response = await getPanchayatsByBlock(blockId);
        // Extract the actual data array
        const panchayatsData = extractApiData(response);
        return panchayatsData;
      } catch (error) {
       
        return [];
      }
    },
    enabled: !!blockId && blockId !== 0,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};