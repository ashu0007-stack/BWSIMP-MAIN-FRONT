import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPDOIndicators, 
  getPDOSummary, 
  getPDOIndicatorsByWork, 
  getPDOProgressByWork,
  createPDOProgress,
  updatePDOProgress,
  deletePDOProgress,
  mapWorkToPDO,
  getWorkMappings, 
  getPDOWorks
} from "@/services/api/wrdApi/pdoApi";

// =======================
// Type Definitions
// =======================

export interface PDOWork {
  id: number;
  work_name: string;
  work_code?: string;
  package_number?: string;
  district?: string;
  block?: string;
  status?: string;
  work_type?: string;
  estimated_cost?: number;
  start_date?: string;
  completion_date?: string;
  // Add other fields as per your database schema
}

export interface PDOIndicator {
  id: number;
  name: string;
  category: 'PDO1' | 'PDO2';
  unit: string;
  target: number;
  baseline: number;
  current: number;
  cumulative: number;
  percentage: number;
  female_target: number;
  youth_target: number;
  created_by: string;
  created_email: string;
}

export interface PDOProgress {
  id: number;
  work_id: number;
  indicator_id: number;
  period: string;
  achievement: number;
  cumulative: number;
  female_achievement: number;
  youth_achievement: number;
  remark: string;
  entry_date: string;
  created_at: string;
  created_by: string;
  created_email: string;
  indicator_name?: string;
  category?: string;
  unit?: string;
  work_name?: string;
  package_number?: string;
}

export interface PDOProgressCreateData {
  work_id: number;
  indicator_id: number;
  period: string;
  achievement: number;
  cumulative: number;
  female_achievement?: number;
  youth_achievement?: number;
  remark?: string;
}

export interface PDOProgressUpdateData {
  period: string;
  achievement: number;
  cumulative: number;
  female_achievement?: number;
  youth_achievement?: number;
  remark?: string;
}

export interface PDOMappingData {
  workId: number;
  indicatorId: number;
  contribution_percentage?: number;
}

export interface PDOSummary {
  pdo1: {
    totalTarget: number;
    totalAchieved: number;
    percentage: number;
    indicators: PDOIndicator[];
  };
  pdo2: {
    totalTarget: number;
    totalAchieved: number;
    percentage: number;
    female: {
      target: number;
      achieved: number;
      percentage: number;
    };
    youth: {
      target: number;
      achieved: number;
      percentage: number;
    };
    indicators: PDOIndicator[];
  };
  progressCount: number;
  recentProgress: PDOProgress[];
  indicators: PDOIndicator[];
}

export interface WorkIndicatorsResponse {
  success: boolean;
  workType: string;
  work: any;
  indicators: PDOIndicator[];
}

// =======================
// Query Keys
// =======================

export const pdoQueryKeys = {
  all: ['pdo'] as const,
  works: () => [...pdoQueryKeys.all, 'works'] as const,
  indicators: () => [...pdoQueryKeys.all, 'indicators'] as const,
  summary: () => [...pdoQueryKeys.all, 'summary'] as const,
  workIndicators: (workId: number | string) => 
    [...pdoQueryKeys.all, 'work-indicators', workId] as const,
  workProgress: (workId: number | string) => 
    [...pdoQueryKeys.all, 'progress', workId] as const,
  workMappings: (workId: number | string) => 
    [...pdoQueryKeys.all, 'mappings', workId] as const,
};

// =======================
// Custom Hook
// =======================


const useGetPDOWorks = (options?: {
    enabled?: boolean;
    staleTime?: number;
  }) => {
    return useQuery<PDOWork[]>({
      queryKey: pdoQueryKeys.works(),
      queryFn: getPDOWorks,
      staleTime: options?.staleTime || 10 * 60 * 1000, // Default 10 minutes
      enabled: options?.enabled ?? true,
    });
  };

export const usePDOManagement = () => {
  const queryClient = useQueryClient();

  // =======================
  // Queries
  // =======================

  // Get all PDO indicators
  const useGetPDOIndicators = () => {
    return useQuery({
      queryKey: pdoQueryKeys.indicators(),
      queryFn: getPDOIndicators,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get PDO summary for dashboard
  const useGetPDOSummary = () => {
    return useQuery({
      queryKey: pdoQueryKeys.summary(),
      queryFn: getPDOSummary,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get PDO indicators by work type
  const useGetPDOIndicatorsByWork = (workId: number | string) => {
    return useQuery({
      queryKey: pdoQueryKeys.workIndicators(workId),
      queryFn: () => getPDOIndicatorsByWork(workId),
      enabled: !!workId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get PDO progress by work
  const useGetPDOProgressByWork = (workId: number | string) => {
    return useQuery({
      queryKey: pdoQueryKeys.workProgress(workId),
      queryFn: () => getPDOProgressByWork(workId),
      enabled: !!workId,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Get work PDO mappings
  const useGetWorkMappings = (workId: number | string) => {
    return useQuery({
      queryKey: pdoQueryKeys.workMappings(workId),
      queryFn: () => getWorkMappings(workId),
      enabled: !!workId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // =======================
  // Mutations
  // =======================

  // Create PDO progress entry
  const useCreatePDOProgress = () => {
    return useMutation({
      mutationFn: createPDOProgress,
      onSuccess: (data, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: pdoQueryKeys.summary() 
        });
        
        // Invalidate work-specific progress if work_id is present
        if (variables.work_id) {
          queryClient.invalidateQueries({ 
            queryKey: pdoQueryKeys.workProgress(variables.work_id) 
          });
        }
        
        // Also invalidate indicators to update cumulative values
        queryClient.invalidateQueries({ 
          queryKey: pdoQueryKeys.indicators() 
        });
      },
      onError: (error: any) => {
        console.error("Error creating PDO progress:", error);
      },
    });
  };

  // Update PDO progress entry
  const useUpdatePDOProgress = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: PDOProgressUpdateData }) => 
        updatePDOProgress(id, data),
      onSuccess: (data, variables) => {
        // Get work_id from existing cache to invalidate
        const existingProgress = queryClient.getQueryData<{ progress: PDOProgress[] }>(
          pdoQueryKeys.workProgress('*')
        );
        
        if (existingProgress?.progress?.[0]?.work_id) {
          queryClient.invalidateQueries({ 
            queryKey: pdoQueryKeys.workProgress(existingProgress.progress[0].work_id) 
          });
        }
        
        // Invalidate summary and indicators
        queryClient.invalidateQueries({ queryKey: pdoQueryKeys.summary() });
        queryClient.invalidateQueries({ queryKey: pdoQueryKeys.indicators() });
      },
      onError: (error: any) => {
        console.error("Error updating PDO progress:", error);
      },
    });
  };

  // Delete PDO progress entry
  const useDeletePDOProgress = () => {
    return useMutation({
      mutationFn: deletePDOProgress,
      onSuccess: (data, variables) => {
        // Invalidate all progress-related queries
        queryClient.invalidateQueries({ 
          queryKey: pdoQueryKeys.all 
        });
      },
      onError: (error: any) => {
        console.error("Error deleting PDO progress:", error);
      },
    });
  };

  // Map work to PDO indicator
  const useMapWorkToPDO = () => {
    return useMutation({
      mutationFn: mapWorkToPDO,
      onSuccess: (data, variables) => {
        // Invalidate mappings for the specific work
        if (variables.workId) {
          queryClient.invalidateQueries({ 
            queryKey: pdoQueryKeys.workMappings(variables.workId) 
          });
        }
      },
      onError: (error: any) => {
        console.error("Error mapping work to PDO:", error);
      },
    });
  };

  // =======================
  // Combined Operations
  // =======================

  // Refresh all PDO data
  const refreshAllPDOData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: pdoQueryKeys.indicators() }),
      queryClient.invalidateQueries({ queryKey: pdoQueryKeys.summary() }),
      queryClient.refetchQueries({ queryKey: pdoQueryKeys.all }),
    ]);
  };

  // Get complete work data (indicators, progress, mappings)
  const useGetWorkPDOData = (workId: number | string) => {
    const indicatorsQuery = useGetPDOIndicatorsByWork(workId);
    const progressQuery = useGetPDOProgressByWork(workId);
    const mappingsQuery = useGetWorkMappings(workId);

    return {
      indicators: indicatorsQuery.data,
      progress: progressQuery.data,
      mappings: mappingsQuery.data,
      isLoading: indicatorsQuery.isLoading || progressQuery.isLoading || mappingsQuery.isLoading,
      isError: indicatorsQuery.isError || progressQuery.isError || mappingsQuery.isError,
      error: indicatorsQuery.error || progressQuery.error || mappingsQuery.error,
      refetch: () => {
        indicatorsQuery.refetch();
        progressQuery.refetch();
        mappingsQuery.refetch();
      },
    };
  };

  // Calculate work progress summary
  const calculateWorkProgressSummary = (progress: PDOProgress[]) => {
    if (!progress || progress.length === 0) {
      return {
        totalAchievement: 0,
        totalCumulative: 0,
        femaleTotal: 0,
        youthTotal: 0,
        lastUpdated: null,
      };
    }

    const totalAchievement = progress.reduce((sum, item) => sum + (item.achievement || 0), 0);
    const totalCumulative = progress.reduce((sum, item) => sum + (item.cumulative || 0), 0);
    const femaleTotal = progress.reduce((sum, item) => sum + (item.female_achievement || 0), 0);
    const youthTotal = progress.reduce((sum, item) => sum + (item.youth_achievement || 0), 0);
    const lastUpdated = progress[0]?.entry_date || null;

    return {
      totalAchievement,
      totalCumulative,
      femaleTotal,
      youthTotal,
      lastUpdated,
      entryCount: progress.length,
    };
  };

  return {
    // Queries
     useGetPDOWorks,
    useGetPDOIndicators,
    useGetPDOSummary,
    useGetPDOIndicatorsByWork,
    useGetPDOProgressByWork,
    useGetWorkMappings,
    
    // Mutations
    useCreatePDOProgress,
    useUpdatePDOProgress,
    useDeletePDOProgress,
    useMapWorkToPDO,
    
    // Combined operations
    useGetWorkPDOData,
    refreshAllPDOData,
    calculateWorkProgressSummary,
    
    // Query client for manual operations
    queryClient,
  };
};

