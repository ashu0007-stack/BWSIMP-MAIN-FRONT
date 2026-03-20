import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllWorks,
  getPackageProgress,
  addProgressEntry,
  addEmbankmentProgressEntry,
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

// hooks/wrdHooks/useLength.ts में यह ऐड करो

export const useSpurPackageProgress = (packageNumber: string | null) => {
  return useQuery({
    queryKey: ["spur-package-progress", packageNumber],
    queryFn: async () => {
      if (!packageNumber) return { spurs: [], history: [], target_km: 0 };
      
      try {
        // पहले workId लाओ packageNumber से
        const works = await getAllWorks();
        const work = works.find((w: any) => w.package_number === packageNumber);
        
        if (!work) {
          return { spurs: [], history: [], target_km: 0 };
        }
        
        // अब spur progress लाओ workId से
        const response = await axiosInstance.get(`/length/spurs/work/${work.id}`);
        return {
          spurs: response.data.data || [],
          history: response.data.history || [],
          target_km: work.target_km || 0,
          work_start_range: work.work_start_range || 0,
          work_end_range: work.work_end_range || 0,
          summary: response.data.summary || {}
        };
      } catch (error) {
        console.error("Error fetching spur progress:", error);
        return { spurs: [], history: [], target_km: 0 };
      }
    },
    enabled: !!packageNumber,
  });
};

// ✅ Hook to add EMBANKMENT progress entry
export const useAddEmbankmentProgressEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addEmbankmentProgressEntry,
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ["progress", variables.packageNumber] 
      });
      
      // Also invalidate embankment specific query if exists
      queryClient.invalidateQueries({ 
        queryKey: ["embankment-progress", variables.packageNumber] 
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    }
  });
};