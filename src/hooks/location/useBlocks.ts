import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

export function useBlocks(districtId?: number) {
  const query = useQuery({
    queryKey: ["blocks", districtId],
    queryFn: () => getBlockByDistricts(districtId!),
    enabled: !!districtId,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (response) => {
      return response?.data || [];
    },
  });



  return {
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    error: query.error,
  };
}

export const getBlockByDistricts = async (districtId: number) => {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_API_URL}/location/blocks/${districtId}`,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching blocks:", error);
    throw error;
  }
};