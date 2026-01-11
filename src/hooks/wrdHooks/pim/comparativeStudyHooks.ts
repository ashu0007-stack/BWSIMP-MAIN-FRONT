import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getAllComparativeData,
  createComparativeRecord,
  updateComparativeRecord,
  deleteComparativeRecord,
} from "@/services/api/wrdApi/pim/comparativeStudyApi";

/* -----------------------------------
   📊 COMPARATIVE STUDY HOOKS
----------------------------------- */

// ✅ Fetch all comparative study data
export function useComparativeData() {
  return useQuery({
    queryKey: ["comparative-study"],
    queryFn: getAllComparativeData,
  });
}

// ✅ Create new comparative study record
export function useCreateComparativeRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComparativeRecord,
    onSuccess: () => {
      toast.success("✅ Comparative study record added successfully!");
      queryClient.invalidateQueries({ queryKey: ["comparative-study"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to add record");
    },
  });
}

// ✅ Update comparative study record
export function useUpdateComparativeRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateComparativeRecord(id, data),
    onSuccess: () => {
      toast.success("✅ Record updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["comparative-study"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to update record");
    },
  });
}

// ✅ Delete comparative study record
export function useDeleteComparativeRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComparativeRecord,
    onSuccess: () => {
      toast.success("✅ Record deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["comparative-study"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to delete record");
    },
  });
}