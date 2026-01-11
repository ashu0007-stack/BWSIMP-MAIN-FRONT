"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDataEntries,
  fetchDataEntryById,
  createDataEntry,
  updateDataEntry,
  deleteDataEntry,
  getFilterValues,
  getStatsSummary,
  getProjectExpenses,
  getUsersCount,
  getMGReportCount,
  fetchWorkCategories,
  fetchSubCategoriesByCategory,
  updateDataEntryStatus, // Add this import
} from "@/services/api/rddApi";
import toast from "react-hot-toast";

// ===========================================================
// 🌟 Data Entry CRUD Hooks
// ===========================================================

// ✅ Get all data entries (with filters/pagination)
export const useDataEntries = (params?: any) => {
  return useQuery({
    queryKey: ["rddDataEntries", params],
    queryFn: () => fetchDataEntries(params),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

// ✅ Get single entry by ID
export const useDataEntryById = (id: number | null | undefined) => {
  return useQuery({
    queryKey: ["rddDataEntry", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required");
      return fetchDataEntryById(id);
    },
    enabled: !!id, // Only fetch if ID exists
    staleTime: 2 * 60 * 1000,
  });
};

// ✅ Create entry - Enhanced error handling
export const useCreateDataEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await createDataEntry(formData);
        
        if (!response.success) {
          const error = new Error(response.error || 'Failed to create entry');
          (error as any).errors = response.errors || response.details;
          throw error;
        }
        
        return response;
      } catch (error) {
        console.error('Create data entry error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Data entry created successfully");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["rddDataEntries"] });
    },
    onError: (err: any) => {
      console.error('Create mutation error:', err);
      const errorMessage = err?.errors?.[0]?.message || err?.message || "Failed to create entry";
      toast.error(errorMessage);
    },
  });
};

// ✅ Update entry - Enhanced error handling
export const useUpdateDataEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      try {
        const response = await updateDataEntry(id, formData);
        
        if (!response.success) {
          const error = new Error(response.error || 'Failed to update entry');
          (error as any).errors = response.errors || response.details;
          throw error;
        }
        
        return response;
      } catch (error) {
        console.error('Update data entry error:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      toast.success("Data entry updated successfully");
      // Invalidate specific entry and list
      queryClient.invalidateQueries({ queryKey: ["rddDataEntries"] });
      queryClient.invalidateQueries({ queryKey: ["rddDataEntry", variables.id] });
    },
    onError: (err: any) => {
      console.error('Update mutation error:', err);
      const errorMessage = err?.errors?.[0]?.message || err?.message || "Failed to update entry";
      toast.error(errorMessage);
    },
  });
};

// ✅ Update only status - Fixed with proper error handling
export const useUpdateDataEntryStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      try {
        const response = await updateDataEntryStatus(id, { status });
        
        if (!response.success) {
          const error = new Error(response.error || 'Failed to update status');
          throw error;
        }
        
        return response;
      } catch (error) {
        console.error('Status update API error:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["rddDataEntries"] });
      queryClient.invalidateQueries({ queryKey: ["rddDataEntry", variables.id] });
    },
    onError: (err: any) => {
      console.error('Status update mutation error:', err);
      const errorMessage = err?.message || "Failed to update status";
      toast.error(errorMessage);
    },
  });
};

// ✅ Delete entry - Enhanced error handling
export const useDeleteDataEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await deleteDataEntry(id);
        
        if (!response.success) {
          const error = new Error(response.error || 'Failed to delete entry');
          throw error;
        }
        
        return response;
      } catch (error) {
        console.error('Delete data entry error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Data entry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["rddDataEntries"] });
    },
    onError: (err: any) => {
      console.error('Delete mutation error:', err);
      const errorMessage = err?.response?.data?.error || err?.message || "Failed to delete entry";
      toast.error(errorMessage);
    },
  });
};

// ✅ Get filter values (district, block, etc.)
export const useFilterValues = () => {
  return useQuery({
    queryKey: ["rddFilterValues"],
    queryFn: getFilterValues,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

// ✅ Get stats/summary
export const useStatsSummary = () => {
  return useQuery({
    queryKey: ["rddStatsSummary"],
    queryFn: getStatsSummary,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

// ===========================================================
// 🌟 Work Categories Hooks
// ===========================================================

// ✅ Get all work categories
export const useWorkCategories = () => {
  return useQuery({
    queryKey: ["rddWorkCategories"],
    queryFn: fetchWorkCategories,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

// ✅ Get sub-categories by category ID
export const useSubCategoriesByCategory = (categoryId?: number | null) => {
  return useQuery({
    queryKey: ["rddSubCategories", categoryId],
    queryFn: () => {
      if (!categoryId) throw new Error("Category ID is required");
      return fetchSubCategoriesByCategory(categoryId);
    },
    enabled: !!categoryId, // Only run query if categoryId is provided
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// ===========================================================
// 🌟 RDD Dashboard Stats Hooks
// ===========================================================

// ✅ Get Project Expenses List
export const useProjectExpenses = () => {
  return useQuery({
    queryKey: ["rddProjectExpenses"],
    queryFn: getProjectExpenses,
    staleTime: 2 * 60 * 1000,
  });
};

// ✅ Get Users Count (optional dept_id)
export const useUsersCount = (dept_id?: number) => {
  return useQuery({
    queryKey: ["rddUsersCount", dept_id],
    queryFn: () => getUsersCount(dept_id),
    staleTime: 2 * 60 * 1000,
  });
};

// ✅ Get MG Report Count
export const useMGReportCount = () => {
  return useQuery({
    queryKey: ["rddMGReportCount"],
    queryFn: getMGReportCount,
    staleTime: 2 * 60 * 1000,
  });
};

// ===========================================================
// 🌟 Combined Dashboard Summary Hook
// ===========================================================
export const useRDDDashboardStats = (dept_id?: number) => {
  const projectExpenses = useProjectExpenses();
  const usersCount = useUsersCount(dept_id);
  const mgReportCount = useMGReportCount();

  const isLoading = projectExpenses.isLoading || usersCount.isLoading || mgReportCount.isLoading;
  const isError = projectExpenses.isError || usersCount.isError || mgReportCount.isError;
  const error = projectExpenses.error || usersCount.error || mgReportCount.error;

  return {
    projectExpenses: projectExpenses.data,
    usersCount: usersCount.data,
    mgReportCount: mgReportCount.data,
    isLoading,
    isError,
    error,
    refetch: () => {
      projectExpenses.refetch();
      usersCount.refetch();
      mgReportCount.refetch();
    },
  };
};

// ===========================================================
// 🌟 Utility Hooks for Common Operations
// ===========================================================

// ✅ Hook for bulk operations
export const useBulkDataEntryOperations = () => {
  const queryClient = useQueryClient();
  const updateStatusMutation = useUpdateDataEntryStatus();
  const deleteMutation = useDeleteDataEntry();

  const bulkUpdateStatus = async (ids: number[], status: string) => {
    const results = await Promise.allSettled(
      ids.map(id => updateStatusMutation.mutateAsync({ id, status }))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    if (successful > 0) {
      toast.success(`Successfully updated ${successful} entries`);
      queryClient.invalidateQueries({ queryKey: ["rddDataEntries"] });
    }
    
    if (failed > 0) {
      toast.error(`Failed to update ${failed} entries`);
    }
    
    return { successful, failed };
  };

  const bulkDelete = async (ids: number[]) => {
    const results = await Promise.allSettled(
      ids.map(id => deleteMutation.mutateAsync(id))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    if (successful > 0) {
      toast.success(`Successfully deleted ${successful} entries`);
      queryClient.invalidateQueries({ queryKey: ["rddDataEntries"] });
    }
    
    if (failed > 0) {
      toast.error(`Failed to delete ${failed} entries`);
    }
    
    return { successful, failed };
  };

  return {
    bulkUpdateStatus,
    bulkDelete,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};