
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorks,
  createWork,
  addBeneficiaries,
  addVillages,
  addComponentsAndMilestones,
  getWorksByDivisionId,
  getWorkById,
  updateWork,
  deleteWork,
  updateBeneficiaries,
  updateVillages,
  updateComponents,
  fetchAssignedWorks

} from "@/services/api/wrdApi/workApi";

// =============================
// ✅ Hook: Get all works
// =============================
export const useWorks = () => {
  return useQuery({
    queryKey: ["works"],
    queryFn: fetchWorks,
  });
};

// =============================
// ✅ Hook: Create new work
// =============================

export const useCreateWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWork,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      return data;
    },
  });
};
// =============================
// ✅ Hook: Add beneficiaries
// =============================
export const useAddBeneficiaries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      addBeneficiaries(workId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
    },
  });
};

// =============================
// ✅ Hook: Add villages
// =============================
export const useAddVillages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      addVillages(workId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
    },
  });
};

// =============================
// ✅ Hook: Add components + milestones
// =============================
export const useAddComponentsAndMilestones = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      addComponentsAndMilestones(workId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
    },
  });
};

export const useWorksByDivision = (divisionId?: number | string) =>
  useQuery({
    queryKey: ["works", divisionId],
    queryFn: () => getWorksByDivisionId(divisionId!),
    enabled: !!divisionId,
  });

export const useWorksList = () => {
  return useQuery({
    queryKey: ['works-list'],
    queryFn: async (): Promise<any[]> => {
      const response = await fetch('/api/works');
      if (!response.ok) throw new Error('Failed to fetch works');
      return response.json();
    },
  });
};
export const useWorkById = (workId: number | null | undefined) => {
  return useQuery({
    queryKey: ["work", workId],
    queryFn: () => getWorkById(workId!),
    enabled: !!workId,
  });
};


export const useUpdateWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      updateWork(workId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work", variables.workId] });
      queryClient.invalidateQueries({ queryKey: ["works"] });
    },
  });
};
export const useDeleteWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
    },
  });
};
export const useUpdateBeneficiaries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      updateBeneficiaries(workId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work", variables.workId] });
    },
  });
};
export const useUpdateVillages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      updateVillages(workId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work", variables.workId] });
    },
  });
};
export const useUpdateComponents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      updateComponents(workId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work", variables.workId] });
    },
  });
};
export const useWorkDetails = (workId?: number) => {
  return useQuery({
    queryKey: ["work-details", workId],
    queryFn: async () => {
      if (!workId) throw new Error("Work ID is required");

      const work = await getWorkById(workId);
      // You might want to fetch related data here
      return work;
    },
    enabled: !!workId,
  });
};
export const useAssignedWorks = (userId?: string) => {
  return useQuery({
    queryKey: ["assigned-works", userId],
    queryFn: () => fetchAssignedWorks(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};