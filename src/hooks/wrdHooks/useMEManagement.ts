import { useQuery } from "@tanstack/react-query";
import { getMEIndicators, getMESummary } from "@/services/api/wrdApi/meApi";

export const meQueryKeys = {
  indicators: ["me", "indicators"],
  summary: ["me", "summary"],
};

export const useMEManagement = () => {
  // Get all indicators
  const useGetMEIndicators = (options = {}) => {
    return useQuery({
      queryKey: meQueryKeys.indicators,
      queryFn: getMEIndicators,
      staleTime: 10 * 60 * 1000, // 10 minutes
      ...options
    });
  };

  // Get dashboard summary
  const useGetMESummary = (options = {}) => {
    return useQuery({
      queryKey: meQueryKeys.summary,
      queryFn: getMESummary,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options
    });
  };

  return {
    useGetMEIndicators,
    useGetMESummary
  };
};