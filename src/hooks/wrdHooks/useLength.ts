import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllWorks,
  getPackageProgress,
  addProgressEntry,
} from "@/services/api/wrdApi/lengthApi";
//import axios from "axios";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Hook to fetch all works
export const useWorks = () =>
  useQuery({
    queryKey: ["works"],
    queryFn: getAllWorks,
  });

// ✅ Hook to fetch progress of a package
export const usePackageProgress = (packageNumber: string | null) =>
  useQuery({
    queryKey: ["progress", packageNumber],
    queryFn: () =>
      packageNumber
        ? getPackageProgress(packageNumber)
        : Promise.resolve({ target_km: 0, progress: [] }),
    enabled: !!packageNumber,
  });

// ✅ Hook to add a progress entry (fixed for React Query v5+)
export const useAddProgressEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProgressEntry,
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["progress", variables.packageNumber] });
    },
  });
};



export const useAddSpurProgressEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response =  await axiosInstance.post('/length/spurs/add', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spur-progress'] });
      queryClient.invalidateQueries({ queryKey: ['package-progress'] });
    },
  });
};


export const useGetSpurProgress = (workId: number | string | null) => {
  return useQuery({
    queryKey: ["spurs-progress", workId],
    queryFn: async () => {
      if (!workId) return null;
      
      try {
        const response = await axiosInstance.get(`/length/spurs/work/${workId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching spur progress:", error);
        throw error;
      }
    },
    enabled: !!workId, // Only fetch if workId exists
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};