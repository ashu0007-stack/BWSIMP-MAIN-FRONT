import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getSummaryData,
  getWUADetailedData,
  getVLCDetailedData,
  getSLCDetailedData,
  getWaterTaxData,
  getPIMImpactData,
  getComparativeStudyData,
  getMeetingsData,
  generateStatistics,
  updateStatus,
} from "@/services/api/wrdApi/pim/reportsApi";

/* -----------------------------------
   📊 REPORTS HOOKS
----------------------------------- */

// ✅ Fetch summary data
export function useSummaryData() {
  return useQuery({
    queryKey: ["reports-summary"],
    queryFn: getSummaryData,
  });
}

// ✅ Fetch WUA detailed data
export function useWUADetailedData() {
  return useQuery({
    queryKey: ["reports-wua"],
    queryFn: getWUADetailedData,
  });
}

// ✅ Fetch VLC detailed data
export function useVLCDetailedData() {
  return useQuery({
    queryKey: ["reports-vlc"],
    queryFn: getVLCDetailedData,
  });
}

// ✅ Fetch SLC detailed data
export function useSLCDetailedData() {
  return useQuery({
    queryKey: ["reports-slc"],
    queryFn: getSLCDetailedData,
  });
}

// ✅ Fetch water tax data
export function useWaterTaxData() {
  return useQuery({
    queryKey: ["reports-water-tax"],
    queryFn: getWaterTaxData,
  });
}

// ✅ Fetch PIM impact data
export function usePIMImpactData() {
  return useQuery({
    queryKey: ["reports-pim-impact"],
    queryFn: getPIMImpactData,
  });
}

// ✅ Fetch comparative study data
export function useComparativeStudyData() {
  return useQuery({
    queryKey: ["reports-comparative"],
    queryFn: getComparativeStudyData,
  });
}

// ✅ Fetch meetings data
export function useMeetingsData() {
  return useQuery({
    queryKey: ["reports-meetings"],
    queryFn: getMeetingsData,
  });
}

// ✅ Generate statistics
export function useGenerateStatistics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateStatistics,
    onSuccess: () => {
      toast.success("✅ Statistics generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["reports-pim-impact"] });
      queryClient.invalidateQueries({ queryKey: ["reports-summary"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to generate statistics");
    },
  });
}

// ✅ Update status
export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id, status }: { type: string; id: number; status: string }) =>
      updateStatus(type, id, status),
    onSuccess: (_, variables) => {
      toast.success(`✅ ${variables.type.toUpperCase()} status updated successfully!`);
      
      // Invalidate relevant queries
      const queries = {
        wua: ["reports-wua"],
        vlc: ["reports-vlc"],
        slc: ["reports-slc"],
        meetings: ["reports-meetings"],
      };
      
      if (queries[variables.type as keyof typeof queries]) {
        queryClient.invalidateQueries({ 
          queryKey: queries[variables.type as keyof typeof queries] 
        });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to update status");
    },
  });
}