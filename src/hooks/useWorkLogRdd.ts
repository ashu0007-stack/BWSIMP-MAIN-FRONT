// hooks/useWorkLogRdd.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkLogsByDataEntryId,
  fetchLatestWorkLogByDataEntryId,
  createWorkLog,
  createOrUpdateWorkLog,
  updateWorkLog,
  deleteWorkLogById,
  deleteAllWorkLogsForEntry,
  fetchAllWorkLogs,
  fetchWorkLogStats,
  debugWorkLogs,
  WorkLogRddData,
  WorkLogRddResponse,
  WorkLogRddListResponse,
  WorkLogStatsResponse,
} from "@/services/api/workLogRddApi";
import toast from "react-hot-toast";

// ===========================================================
// 🌟 Types for File Upload Support
// ===========================================================

// Base type without file fields
export type WorkLogWithoutFiles = Omit<WorkLogRddData, 'initial_upload' | 'final_upload'>;

// Type for creating/updating with file objects
export interface WorkLogWithFiles extends Omit<WorkLogWithoutFiles, 'id' | 'created_at' | 'updated_at'> {
  initial_upload?: File | null;
  final_upload?: File | null;
}

// Type for updating with optional fields
export interface WorkLogUpdateWithFiles extends Partial<Omit<WorkLogWithoutFiles, 'id' | 'created_at' | 'updated_at'>> {
  initial_upload?: File | null;
  final_upload?: File | null;
}

// ===========================================================
// 🌟 Helper Functions
// ===========================================================

/**
 * ✅ Convert WorkLogWithFiles to FormData
 */
const createWorkLogFormData = (data: WorkLogWithFiles | WorkLogUpdateWithFiles): FormData => {
  const formData = new FormData();
  
  // Append all non-file fields
  Object.keys(data).forEach(key => {
    if (key === 'initial_upload' || key === 'final_upload') {
      // Handle file uploads
      const file = data[key as keyof typeof data];
      if (file instanceof File) {
        formData.append(key, file);
      } else if (file === null) {
        // Explicitly send empty string to remove existing file
        formData.append(key, '');
      }
      // If undefined, don't append anything (keep existing)
    } else {
      const value = data[key as keyof typeof data];
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};

/**
 * ✅ Convert WorkLogWithFiles to API data (without file fields)
 */
const convertToApiData = (data: WorkLogWithFiles): Omit<WorkLogRddData, 'id' | 'created_at' | 'updated_at'> => {
  // Create a copy without file fields
  const { initial_upload, final_upload, ...rest } = data;
  
  // Convert undefined file fields to null for the API
  const apiData: Omit<WorkLogRddData, 'id' | 'created_at' | 'updated_at'> = {
    ...rest,
    initial_upload: initial_upload !== undefined ? null : undefined,
    final_upload: final_upload !== undefined ? null : undefined,
  };
  
  return apiData;
};

/**
 * ✅ Convert WorkLogUpdateWithFiles to API update data
 */
const convertToUpdateApiData = (data: WorkLogUpdateWithFiles): Partial<WorkLogRddData> => {
  // Create a copy without file fields
  const { initial_upload, final_upload, ...rest } = data;
  
  // Prepare the API data
  const apiData: Partial<WorkLogRddData> = { ...rest };
  
  // Handle file fields - only include if they're explicitly set
  if (initial_upload !== undefined) {
    apiData.initial_upload = initial_upload !== null ? null : null;
  }
  
  if (final_upload !== undefined) {
    apiData.final_upload = final_upload !== null ? null : null;
  }
  
  return apiData;
};

// ===========================================================
// 🌟 WorkLog RDD CRUD Hooks
// ===========================================================

/**
 * ✅ Get ALL work logs by data entry ID
 */
export const useWorkLogsByDataEntryId = (dataEntryId?: number | null) => {
  return useQuery({
    queryKey: ["workLogRdd", "all", dataEntryId],
    queryFn: async (): Promise<WorkLogRddData[]> => {
      if (!dataEntryId) return [];
      return await fetchWorkLogsByDataEntryId(dataEntryId);
    },
    enabled: !!dataEntryId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * ✅ Get LATEST work log by data entry ID (for form pre-fill)
 */
export const useWorkLogRdd = (dataEntryId?: number | null) => {
  return useQuery({
    queryKey: ["workLogRdd", "latest", dataEntryId],
    queryFn: async (): Promise<WorkLogRddData | null> => {
      if (!dataEntryId) return null;
      return await fetchLatestWorkLogByDataEntryId(dataEntryId);
    },
    enabled: !!dataEntryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry for 404 errors (work log not found is normal)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * ✅ Create NEW work log - Enhanced with FormData support
 */
export const useCreateWorkLogRdd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: WorkLogWithFiles): Promise<WorkLogRddResponse> => {
      const hasFiles = data.initial_upload instanceof File || data.final_upload instanceof File;
      
      if (hasFiles) {
        // Use FormData for file uploads
        const formData = createWorkLogFormData(data);
        return await createWorkLog(formData);
      } else {
        // Regular JSON request for non-file data
        const apiData = convertToApiData(data);
        return await createWorkLog(apiData);
      }
    },
    onSuccess: (response, variables) => {
      toast.success(response.message || "Work log created successfully");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "latest", variables.data_entry_id] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "all", variables.data_entry_id] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "list"] });
    },
    onError: (err: any) => {
      console.error('Create mutation error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create work log";
      toast.error(errorMessage);
    },
  });
};

/**
 * ✅ Create or update work log - Enhanced with FormData support
 */
export const useCreateOrUpdateWorkLogRdd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: WorkLogWithFiles): Promise<WorkLogRddResponse> => {
      const hasFiles = data.initial_upload instanceof File || data.final_upload instanceof File;
      
      if (hasFiles) {
        // Use FormData for file uploads
        const formData = createWorkLogFormData(data);
        return await createOrUpdateWorkLog(formData);
      } else {
        // Regular JSON request for non-file data
        const apiData = convertToApiData(data);
        return await createOrUpdateWorkLog(apiData);
      }
    },
    onSuccess: (response, variables) => {
      const message = response.message || "Work log saved successfully";
      toast.success(message);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "latest", variables.data_entry_id] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "all", variables.data_entry_id] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "list"] });
      
      // Also invalidate data entries if needed
      queryClient.invalidateQueries({ queryKey: ["rddDataEntries"] });
    },
    onError: (err: any) => {
      console.error('Create/update mutation error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to save work log";
      toast.error(errorMessage);
    },
  });
};

/**
 * ✅ Update work log with FormData support
 */
export const useUpdateWorkLogRdd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      dataEntryId, 
      data 
    }: { 
      dataEntryId: number; 
      data: WorkLogUpdateWithFiles;
    }): Promise<WorkLogRddData> => {
      const hasFiles = data.initial_upload instanceof File || data.final_upload instanceof File;
      
      if (hasFiles) {
        // Use FormData for file uploads
        const formData = createWorkLogFormData(data);
        return await updateWorkLog(dataEntryId, formData);
      } else {
        // Regular JSON request for non-file data
        const apiData = convertToUpdateApiData(data);
        return await updateWorkLog(dataEntryId, apiData);
      }
    },
    onSuccess: (data, variables) => {
      toast.success("Work log updated successfully");
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "latest", variables.dataEntryId] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "all", variables.dataEntryId] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "list"] });
    },
    onError: (err: any) => {
      console.error('Update mutation error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update work log";
      toast.error(errorMessage);
    },
  });
};

/**
 * ✅ Delete work log by ID - Enhanced error handling
 */
export const useDeleteWorkLogRdd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workLogId: number): Promise<void> => {
      await deleteWorkLogById(workLogId);
    },
    onSuccess: (_, workLogId) => {
      toast.success("Work log deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "latest"] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "all"] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "list"] });
    },
    onError: (err: any) => {
      console.error('Delete mutation error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete work log";
      toast.error(errorMessage);
    },
  });
};

/**
 * ✅ Delete all work logs for a data entry
 */
export const useDeleteAllWorkLogsForEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dataEntryId: number): Promise<{ deletedCount: number }> => {
      return await deleteAllWorkLogsForEntry(dataEntryId);
    },
    onSuccess: (result, dataEntryId) => {
      toast.success(`Deleted ${result.deletedCount} work logs`);
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "latest", dataEntryId] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "all", dataEntryId] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "list"] });
    },
    onError: (err: any) => {
      console.error('Delete all mutation error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete work logs";
      toast.error(errorMessage);
    },
  });
};

/**
 * ✅ Get all work logs with pagination and filters
 */
export const useAllWorkLogs = (params?: {
  page?: number;
  limit?: number;
  agency_name?: string;
  start_date?: string;
  end_date?: string;
  data_entry_id?: number;
}) => {
  return useQuery({
    queryKey: ["workLogRdd", "list", params],
    queryFn: async (): Promise<WorkLogRddListResponse> => {
      return await fetchAllWorkLogs(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * ✅ Get work log statistics
 */
export const useWorkLogStats = () => {
  return useQuery({
    queryKey: ["workLogRdd", "stats"],
    queryFn: async (): Promise<WorkLogStatsResponse> => {
      return await fetchWorkLogStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ===========================================================
// 🌟 Image Upload Hook
// ===========================================================

/**
 * ✅ Hook for uploading work log images
 */
export const useWorkLogImageUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      dataEntryId,
      type, // 'initial' or 'final'
      file
    }: {
      dataEntryId: number;
      type: 'initial' | 'final';
      file: File;
    }): Promise<WorkLogRddResponse> => {
      const formData = new FormData();
      formData.append('data_entry_id', dataEntryId.toString());
      formData.append(`${type}_upload`, file);
      
      return await createOrUpdateWorkLog(formData);
    },
    onSuccess: (response, variables) => {
      toast.success(`${variables.type === 'initial' ? 'Initial' : 'Final'} image uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "latest", variables.dataEntryId] });
      queryClient.invalidateQueries({ queryKey: ["workLogRdd", "all", variables.dataEntryId] });
    },
    onError: (err: any) => {
      console.error('Image upload error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to upload image";
      toast.error(errorMessage);
    },
  });
};

// ===========================================================
// 🌟 Combined Work Log Dashboard Hook
// ===========================================================
export const useWorkLogDashboard = (params?: {
  page?: number;
  limit?: number;
  agency_name?: string;
}) => {
  const workLogs = useAllWorkLogs(params);
  const stats = useWorkLogStats();

  return {
    workLogs: workLogs.data,
    stats: stats.data,
    isLoading: workLogs.isLoading || stats.isLoading,
    isError: workLogs.isError || stats.isError,
    error: workLogs.error || stats.error,
    refetch: () => {
      workLogs.refetch();
      stats.refetch();
    },
  };
};

// ===========================================================
// 🌟 Utility Hooks for Common Operations
// ===========================================================

/**
 * ✅ Hook for bulk work log operations
 */
export const useBulkWorkLogOperations = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteWorkLogRdd();

  const bulkDelete = async (workLogIds: number[]): Promise<{ successful: number; failed: number }> => {
    const results = await Promise.allSettled(
      workLogIds.map(id => deleteMutation.mutateAsync(id))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    if (successful > 0) {
      toast.success(`Successfully deleted ${successful} work logs`);
      queryClient.invalidateQueries({ queryKey: ["workLogRdd"] });
    }
    
    if (failed > 0) {
      toast.error(`Failed to delete ${failed} work logs`);
    }
    
    return { successful, failed };
  };

  return {
    bulkDelete,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * ✅ Hook for work log history
 */
export const useWorkLogHistory = (dataEntryId?: number | null) => {
  const { data: workLogs, isLoading, isError, error } = useWorkLogsByDataEntryId(dataEntryId);

  const history = {
    logs: workLogs || [],
    totalLogs: workLogs?.length || 0,
    latestLog: workLogs?.[0] || null,
    firstLog: workLogs?.[workLogs.length - 1] || null,
  };

  return {
    history,
    isLoading,
    isError,
    error,
  };
};

/**
 * ✅ Debug hook
 */
export const useDebugWorkLogs = (dataEntryId?: number | null) => {
  return useQuery({
    queryKey: ["workLogRdd", "debug", dataEntryId],
    queryFn: async (): Promise<any> => {
      if (!dataEntryId) return null;
      return await debugWorkLogs(dataEntryId);
    },
    enabled: !!dataEntryId,
  });
};

// ===========================================================
// 🌟 Custom Hook for Form Handling
// ===========================================================

/**
 * ✅ Hook for managing work log form state with file handling
 */
export const useWorkLogForm = (dataEntryId?: number) => {
  const [formData, setFormData] = useState<WorkLogWithFiles>({
    data_entry_id: dataEntryId || 0,
    agency_name: '',
    command_area: 0,
    proposed_length: 0,
    proposed_width: 0,
    proposed_height: 0,
    wages_amount: 0,
    material_amount: 0,
    total_sanction_amount: 0,
    initial_upload: undefined,
    final_upload: undefined,
  });

  const updateFormField = (field: keyof WorkLogWithFiles, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: 'initial_upload' | 'final_upload', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const resetForm = () => {
    setFormData({
      data_entry_id: dataEntryId || 0,
      agency_name: '',
      command_area: 0,
      proposed_length: 0,
      proposed_width: 0,
      proposed_height: 0,
      wages_amount: 0,
      material_amount: 0,
      total_sanction_amount: 0,
      initial_upload: undefined,
      final_upload: undefined,
    });
  };

  return {
    formData,
    updateFormField,
    handleFileUpload,
    resetForm,
    setFormData,
  };
};

// ===========================================================
// 🌟 Hook for File Validation
// ===========================================================

/**
 * ✅ Hook for validating image files before upload
 */
export const useFileValidation = () => {
  const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    return { isValid: true };
  };

  return {
    validateImageFile,
  };
};