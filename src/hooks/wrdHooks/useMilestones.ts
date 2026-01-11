"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllMilestones,
  getMilestoneProgress,
  addMilestoneProgress,
  getPackageProgress,
  getPackageComponents,
  savePackageProgress,
  getworkbyMilestone,
  getPackageMilestones,
  getPackageComponentsDetailed,
  saveMilestoneProgress,
} from "@/services/api/wrdApi/milestoneApi";

interface MilestoneProgressData {
  packageNumber: string;
  progressDate: string;
  fortnight: string;
  milestoneNumber: string;
  components: Array<{
    component_id: string;
    completed_quantity: number;
    remarks?: string;
  }>;
  remark?: string;
}

// =============================
// ✅ Fetch all milestones (Updated for React Query v5)
// =============================
export const useMilestones = () =>
  useQuery({
    queryKey: ["milestones"],
    queryFn: getAllMilestones,
    staleTime: 1000 * 60, // 1 min cache
    select: (data) => data || [],
  });

export const useWorksmiles = () => {
  return useQuery({
    queryKey: ["miles"],
    queryFn: getworkbyMilestone,
  });
};

// =============================
// ✅ Fetch milestone progress by ID
// =============================
export const useMilestoneProgress = (id?: number | string) =>
  useQuery({
    queryKey: ["milestoneProgress", id],
    queryFn: () => getMilestoneProgress(id!),
    enabled: !!id,
    select: (data) => data || [],
  });

// =============================
// ✅ Add milestone progress
// =============================
export const useAddMilestoneProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, progressData }: { id: number | string; progressData: any }) =>
      addMilestoneProgress(id, progressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
    // ✅ Removed onError from mutation - handle in component
  });
};

// =============================
// ✅ Get package progress
// =============================
export const usePackageProgress = (pkg?: string) =>
  useQuery({
    queryKey: ["packageProgress", pkg],
    queryFn: () => getPackageProgress(pkg!),
    enabled: !!pkg,
    select: (data) => data || [],
  });

// =============================
// ✅ Get package components
// =============================
export const usePackageComponents = (pkg?: string) =>
  useQuery({
    queryKey: ["packageComponents", pkg],
    queryFn: () => getPackageComponents(pkg!),
    enabled: !!pkg,
    select: (data) => data || [],
  });

// =============================
// ✅ Save package progress
// =============================
export const useSavePackageProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (progressData: any) => savePackageProgress(progressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packageProgress"] });
    },
  });
};

// ✅ Get package milestones (Excel format)
export const usePackageMilestones = (pkg?: string) =>
  useQuery({
    queryKey: ["packageMilestones", pkg],
    queryFn: () => getPackageMilestones(pkg!),
    enabled: !!pkg,
    select: (data) => data || [],
  });

// ✅ Get detailed package components
export const usePackageComponentsDetailed = (pkg?: string) =>
  useQuery({
    queryKey: ["packageComponentsDetailed", pkg],
    queryFn: () => getPackageComponentsDetailed(pkg!),
    enabled: !!pkg,
    select: (data) => data || [],
  });

// ✅ Save milestone progress
export const useSaveMilestoneProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (progressData: MilestoneProgressData) => 
      saveMilestoneProgress(progressData),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["packageMilestones", variables.packageNumber] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["packageProgress", variables.packageNumber] 
      });
    },
  });
};