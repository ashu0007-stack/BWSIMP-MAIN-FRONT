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
  fetchAssignedWorks,
  getSpursByWorkId,
  addSpurs,
  // Add these imports
  addEmbankments,
  getEmbankmentsByWorkId,
  updateEmbankments,
  deleteEmbankment
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

// =============================
// ✅ NEW HOOK: Add embankments
// =============================
export const useAddEmbankments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      addEmbankments(workId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["work", variables.workId] });
      queryClient.invalidateQueries({ queryKey: ["embankments", variables.workId] });
      queryClient.invalidateQueries({ queryKey: ["works"] });
    },
    onError: (error) => {
      console.error('❌ Error adding embankments:', error);
      throw error;
    }
  });
};

// =============================
// ✅ NEW HOOK: Get embankments by work ID
// =============================
export const useEmbankmentsByWorkId = (workId: number | null | undefined) => {
  return useQuery({
    queryKey: ["embankments", workId],
    queryFn: () => getEmbankmentsByWorkId(workId!),
    enabled: !!workId,
  });
};

// =============================
// ✅ NEW HOOK: Update embankments
// =============================
export const useUpdateEmbankments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      updateEmbankments(workId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["embankments", variables.workId] });
      queryClient.invalidateQueries({ queryKey: ["work", variables.workId] });
    },
  });
};

// =============================
// ✅ NEW HOOK: Delete embankments
// =============================
// export const useDeleteEmbankments = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ workId, embankmentId }: { workId: number; embankmentId: number }) =>
//       deleteEmbankments(workId, embankmentId),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ["embankments", variables.workId] });
//       queryClient.invalidateQueries({ queryKey: ["work", variables.workId] });
//     },
//   });
// };

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

export const useAddSpurs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workId, data }: { workId: number; data: any }) =>
      addSpurs(workId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["work", variables.workId] });
      queryClient.invalidateQueries({ queryKey: ["spurs", variables.workId] });
      queryClient.invalidateQueries({ queryKey: ["works"] });
    },
    onError: (error) => {
      console.error('❌ Error adding spurs:', error);
      throw error;
    }
  });
};

// =============================
// ✅ Hook: Get spurs by work ID
// =============================
export const useSpursByWorkId = (workId: number | null | undefined) => {
  return useQuery({
    queryKey: ["spurs", workId],
    queryFn: () => getSpursByWorkId(workId!),
    enabled: !!workId,
  });
};