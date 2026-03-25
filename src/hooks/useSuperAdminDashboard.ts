// hooks/useSuperAdminDashboard.ts
import axiosInstance from "@/apiInterceptor/axiosInterceptor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
  totalSchemes: number;
  activeProjects: number;
  averagePDO: number;
  atRisk: number;
  lastMonthIncrease: number;
}

export interface DepartmentProgress {
  [key: string]: {
    totalWorks: number;
    completedMilestones: number;
    totalMilestones: number;
    totalBudget: number;
    totalSpent: number;
    pdo: number;
    progress: number;
    budget: string;
    spent: string;
    timeline: string;
  };
}

export interface MilestoneItem {
  id: number;
  milestone_name: string;
  target: number;
  achieved: number;
  percentage: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  start_date: string;
  end_date: string;
  completion_date: string | null;
  package_number: string;
  work_name: string;
  work_cost: number;
  dept_id: number;
  dept_code: string;
  delay_days: number;
}

export interface PDOIndicator {
  id: number;
  name: string;
  category: 'PDO1' | 'PDO2';
  unit: 'Hectare' | 'People';
  target: number;
  baseline: number;
  current: number;
  cumulative: number;
  percentage: number;
  female_target: number;
  youth_target: number;
  latest_progress: {
    achievement: number;
    quarter: string;
    entry_date: string;
  } | null;
}

export interface FinancialItem {
  expenditure_id: number;
  financial_year: string;
  department_id: number;
  dept_name: string;
  dept_code: string;
  budget_fy: number;
  expenditure_this_month: number;
  cumulative_fy: number;
  total_to_date: number;
  utilization_percent: number;
  variance: number;
  cfms_head: string;
  created_date: string;
  remaining_budget: number;
  budget_status: 'Critical' | 'High' | 'Medium' | 'Normal';
}

export interface RiskAlert {
  id: string;
  type: 'delay' | 'pdo' | 'budget' | 'progress';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  department?: number;
  package_number?: string;
  due_date?: string;
  indicator?: string;
  percentage?: number;
  variance?: number;
  budget?: number;
  spent?: number;
}

export interface SchemePerformance {
  id: number;
  name: string;
  package_number: string;
  cost: number;
  target: number;
  department: number;
  dept_code: string;
  total_milestones: number;
  completed_milestones: number;
  progress: number;
  avg_pdo: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  total_expenditure: number;
  last_update: string;
}

export interface DepartmentDetail {
  id: number;
  dept_name: string;
  dept_code: string;
  total_schemes: number;
  total_budget: number;
  total_milestones: number;
  completed_milestones: number;
  delayed_milestones: number;
  avg_pdo: number;
  total_spent: number;
  topSchemes: Array<{
    id: number;
    work_name: string;
    package_number: string;
    work_cost: number;
    progress: number;
    pdo_achievement: number;
  }>;
}

// ============================================
// DASHBOARD STATS HOOKS
// ============================================

const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get(`${API_URL}/superadmin/dashboard/stats`);
  return response.data;
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["superadmin-dashboard-stats"],
    queryFn: getDashboardStats,
  });
}

// ============================================
// DEPARTMENT PROGRESS HOOKS
// ============================================

const getDepartmentProgress = async (): Promise<DepartmentProgress> => {
  const response = await axiosInstance.get(`${API_URL}/superadmin/dashboard/department-progress`);
  return response.data;
};

export function useDepartmentProgress() {
  return useQuery({
    queryKey: ["superadmin-department-progress"],
    queryFn: getDepartmentProgress,
  });
}

// ============================================
// MILESTONE TRACKER HOOKS
// ============================================

const getMilestoneTracker = async (filters?: { department?: number; status?: string }): Promise<MilestoneItem[]> => {
  const params = new URLSearchParams();
  if (filters?.department) params.append('department', String(filters.department));
  if (filters?.status) params.append('status', filters.status);
  
  const response = await axiosInstance.get(
    `${API_URL}/superadmin/dashboard/milestones?${params.toString()}`
  );
  return response.data;
};

export function useMilestoneTracker(filters?: { department?: number; status?: string }) {
  return useQuery({
    queryKey: ["superadmin-milestones", filters],
    queryFn: () => getMilestoneTracker(filters),
  });
}

// ============================================
// PDO DATA HOOKS
// ============================================

const getPDOData = async (): Promise<PDOIndicator[]> => {
  const response = await axiosInstance.get(`${API_URL}/superadmin/dashboard/pdo`);
  return response.data;
};

export function usePDOData() {
  return useQuery({
    queryKey: ["superadmin-pdo-data"],
    queryFn: getPDOData,
  });
}

// ============================================
// FINANCIAL DATA HOOKS
// ============================================

const getFinancialData = async (filters?: { department?: number; year?: string }): Promise<FinancialItem[]> => {
  const params = new URLSearchParams();
  if (filters?.department) params.append('department', String(filters.department));
  if (filters?.year) params.append('year', filters.year);
  
  const response = await axiosInstance.get(
    `${API_URL}/superadmin/dashboard/financial?${params.toString()}`
  );
  return response.data;
};

export function useFinancialData(filters?: { department?: number; year?: string }) {
  return useQuery({
    queryKey: ["superadmin-financial", filters],
    queryFn: () => getFinancialData(filters),
  });
}

// ============================================
// RISK ALERTS HOOKS
// ============================================

const getRiskAlerts = async (severity?: 'high' | 'medium' | 'low'): Promise<RiskAlert[]> => {
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  
  const response = await axiosInstance.get(
    `${API_URL}/superadmin/dashboard/risk-alerts?${params.toString()}`
  );
  return response.data;
};

export function useRiskAlerts(severity?: 'high' | 'medium' | 'low') {
  return useQuery({
    queryKey: ["superadmin-risk-alerts", severity],
    queryFn: () => getRiskAlerts(severity),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// ============================================
// SCHEME PERFORMANCE HOOKS
// ============================================

const getSchemePerformance = async (filters?: { department?: number; status?: string }): Promise<SchemePerformance[]> => {
  const params = new URLSearchParams();
  if (filters?.department) params.append('department', String(filters.department));
  if (filters?.status) params.append('status', filters.status);
  
  const response = await axiosInstance.get(
    `${API_URL}/superadmin/dashboard/scheme-performance?${params.toString()}`
  );
  return response.data;
};

export function useSchemePerformance(filters?: { department?: number; status?: string }) {
  return useQuery({
    queryKey: ["superadmin-scheme-performance", filters],
    queryFn: () => getSchemePerformance(filters),
  });
}

// ============================================
// DEPARTMENT DETAILS HOOKS
// ============================================

const getDepartmentDetails = async (deptId: number): Promise<DepartmentDetail> => {
  const response = await axiosInstance.get(`${API_URL}/superadmin/dashboard/department/${deptId}`);
  return response.data;
};

export function useDepartmentDetails(deptId: number) {
  return useQuery({
    queryKey: ["superadmin-department-details", deptId],
    queryFn: () => getDepartmentDetails(deptId),
    enabled: !!deptId,
  });
}

// ============================================
// DASHBOARD OVERVIEW HOOK (Combines multiple queries)
// ============================================

export function useDashboardOverview() {
  const stats = useDashboardStats();
  const departmentProgress = useDepartmentProgress();
  const riskAlerts = useRiskAlerts();
  const schemePerformance = useSchemePerformance();

  return {
    stats: stats.data,
    departmentProgress: departmentProgress.data,
    riskAlerts: riskAlerts.data,
    schemePerformance: schemePerformance.data,
    isLoading: stats.isLoading || departmentProgress.isLoading || riskAlerts.isLoading || schemePerformance.isLoading,
    isError: stats.isError || departmentProgress.isError || riskAlerts.isError || schemePerformance.isError,
    errors: [stats.error, departmentProgress.error, riskAlerts.error, schemePerformance.error].filter(Boolean),
    refetch: () => {
      stats.refetch();
      departmentProgress.refetch();
      riskAlerts.refetch();
      schemePerformance.refetch();
    }
  };
}

// ============================================
// EXPORT DATA HOOK
// ============================================

export const useExportDashboardData = () => {
  return useMutation({
    mutationFn: async ({ type, format = 'csv', filters }: { type: string; format?: 'csv' | 'excel' | 'pdf'; filters?: any }) => {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(
        `${API_URL}/superadmin/export/${type}?${params.toString()}`,
        {
          responseType: 'blob',
        }
      );
      return data;
    },
  });
};

// ============================================
// REFRESH DASHBOARD HOOK
// ============================================

export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-department-progress"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-pdo-data"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-financial"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-risk-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-scheme-performance"] });
    },
    refreshStats: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-dashboard-stats"] });
    },
    refreshDepartmentProgress: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-department-progress"] });
    },
    refreshMilestones: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-milestones"] });
    },
    refreshPDO: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-pdo-data"] });
    },
    refreshFinancial: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-financial"] });
    },
    refreshRiskAlerts: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-risk-alerts"] });
    },
    refreshSchemePerformance: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-scheme-performance"] });
    },
  };
};

// ============================================
// FILTERED DATA HOOKS
// ============================================

export function useFilteredMilestones(departmentId?: number, status?: string) {
  return useQuery({
    queryKey: ["superadmin-filtered-milestones", departmentId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (departmentId) params.append('department', String(departmentId));
      if (status) params.append('status', status);
      
      const { data } = await axiosInstance.get(
        `${API_URL}/superadmin/milestones/filtered?${params.toString()}`
      );
      return data;
    },
  });
}

export function useDepartmentPerformance(deptId: number, period?: 'week' | 'month' | 'quarter' | 'year') {
  return useQuery({
    queryKey: ["superadmin-department-performance", deptId, period],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      const { data } = await axiosInstance.get(
        `${API_URL}/superadmin/department/${deptId}/performance?${params.toString()}`
      );
      return data;
    },
    enabled: !!deptId,
  });
}

// ============================================
// TREND ANALYSIS HOOKS
// ============================================

export function usePDOTrends(period?: 'month' | 'quarter' | 'year') {
  return useQuery({
    queryKey: ["superadmin-pdo-trends", period],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      const { data } = await axiosInstance.get(
        `${API_URL}/superadmin/trends/pdo?${params.toString()}`
      );
      return data;
    },
  });
}

export function useBudgetTrends(period?: 'month' | 'quarter' | 'year') {
  return useQuery({
    queryKey: ["superadmin-budget-trends", period],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      const { data } = await axiosInstance.get(
        `${API_URL}/superadmin/trends/budget?${params.toString()}`
      );
      return data;
    },
  });
}

// ============================================
// REPORT GENERATION HOOKS
// ============================================

// hooks/useSuperAdminDashboard.ts (Updated section)

// ============================================
// REPORT GENERATION HOOK - UPDATED WITH CORRECT ENDPOINTS
// ============================================

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: async ({ type, format = 'pdf', filters }: { 
      type: 'department' | 'scheme' | 'financial' | 'pdo' | 'comprehensive';
      format?: 'pdf' | 'excel' | 'csv';
      filters?: any;
    }) => {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      // Map report types to actual backend endpoints
      let endpoint = '';
      switch(type) {
        case 'department':
          endpoint = '/superadmin/dashboard/department-progress'; // This returns JSON, not blob
          break;
        case 'scheme':
          endpoint = '/superadmin/dashboard/scheme-performance';
          break;
        case 'financial':
          endpoint = '/superadmin/dashboard/financial';
          break;
        case 'pdo':
          endpoint = '/superadmin/dashboard/pdo';
          break;
        case 'comprehensive':
          endpoint = '/superadmin/dashboard/stats';
          break;
        default:
          endpoint = '/superadmin/dashboard/stats';
      }
      
      // For now, just fetch JSON data instead of blob
      const { data } = await axiosInstance.get(
        `${API_URL}${endpoint}${params.toString() ? '?' + params.toString() : ''}`
      );
      
      // Convert JSON to blob for download
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      return blob;
    },
  });
};
// ============================================
// ALERT MANAGEMENT HOOKS
// ============================================

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/superadmin/alerts/${alertId}/acknowledge`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-risk-alerts"] });
    },
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ alertId, resolution }: { alertId: string; resolution: string }) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/superadmin/alerts/${alertId}/resolve`,
        { resolution }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-risk-alerts"] });
    },
  });
};

// ============================================
// CACHE INVALIDATION HOOK
// ============================================

export const useInvalidateDashboardCache = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin"] });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-dashboard-stats"] });
    },
    invalidateDepartmentProgress: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-department-progress"] });
    },
    invalidateMilestones: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-milestones"] });
    },
    invalidatePDO: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-pdo-data"] });
    },
    invalidateFinancial: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-financial"] });
    },
    invalidateRiskAlerts: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-risk-alerts"] });
    },
    invalidateSchemePerformance: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-scheme-performance"] });
    },
    invalidateDepartment: (deptId: number) => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-department-details", deptId] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-department-performance", deptId] });
    },
  };
};
