// hooks/useDashboard.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDashboardData,
  getDashboardKPIs,
  getCompletionDistribution,
  getRecentActivities,
  getPerformanceMetrics
} from '@/services/api/wrdApi/dashboardApi';

// Main dashboard data hook
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const data = await getDashboardData();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Dashboard KPIs hook
export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const data = await getDashboardKPIs();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard KPIs');
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
};

// Completion distribution hook
export const useCompletionDistribution = () => {
  return useQuery({
    queryKey: ['dashboard-distribution'],
    queryFn: async () => {
      const data = await getCompletionDistribution();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch completion distribution');
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Recent activities hook
export const useRecentActivities = () => {
  return useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: async () => {
      const data = await getRecentActivities();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch recent activities');
      }
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};

// Performance metrics hook
export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-performance'],
    queryFn: async () => {
      const data = await getPerformanceMetrics();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch performance metrics');
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Dashboard refresh hook
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Invalidate all dashboard queries
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-distribution'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-activities'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-performance'] });
      
      return { success: true, message: 'Dashboard refreshed successfully' };
    },
    onSuccess: () => {
      console.log('✅ Dashboard refreshed');
    },
    onError: (error) => {
      console.error('❌ Dashboard refresh failed:', error);
    }
  });
};