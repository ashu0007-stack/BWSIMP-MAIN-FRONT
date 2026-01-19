// hooks/useESReports.ts
import axiosInstance from "@/apiInterceptor/axiosInterceptor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ============================================
// PROJECT RELATED HOOKS
// ============================================
const getESProjects = async () => {
    const response = await axiosInstance.get(
        `${API_URL}/esRoutes/projects`
    );
    return response.data?.data || [];
};

export function useESProjects() {
    return useQuery({
        queryKey: ["es-projects"],
        queryFn: getESProjects,
    });
}

export const useESProject = (projectId: string) => {
  return useQuery({
    queryKey: ["es-project", projectId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${API_URL}/esRoutes/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
};

// ============================================
// ENVIRONMENTAL DATA HOOKS
// ============================================

export const useEnvironmentalIndicators = () => {
  return useQuery({
    queryKey: ["environmental-indicators"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${API_URL}/esRoutes/environmental/indicators`);
      return data;
    },
  });
};

export const useEnvironmentalData = (id: number, filters?: any) => {
  return useQuery({
    queryKey: ["environmental-data", id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/environmental/data/${id}?${params.toString()}`
      );
      return data;
    },
    enabled: !!id,
  });
};

export const useSubmitEnvironmentalData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await axiosInstance.post(
        `${API_URL}/esRoutes/environmental/data`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["environmental-data", variables.id] 
      });
    },
  });
};

// ============================================
// SOCIAL DATA HOOKS
// ============================================

export const useSocialIndicators = () => {
  return useQuery({
    queryKey: ["social-indicators"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${API_URL}/esRoutes/social/indicators`);
      return data;
    },
  });
};

export const useSocialData = (id: number, filters?: any) => {
  return useQuery({
    queryKey: ["social-data", id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/social/data/${id}?${params.toString()}`
      );
      return data;
    },
    enabled: !!id,
  });
};

export const useSubmitSocialData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await axiosInstance.post(
        `${API_URL}/esRoutes/social/data`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["social-data", variables.id] 
      });
    },
  });
};

// ============================================
// GRIEVANCE MANAGEMENT HOOKS
// ============================================

export const useGrievances = (id: number, filters?: any) => {
  return useQuery({
    queryKey: ["grievances", id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(`${API_URL}/esRoutes/grievances/${id}?${params.toString()}`
      );
      return data?.data|| [];
    },
    enabled: !!id,
  });
};

export const useAddGrievance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (grievanceData: any) => {
      const response = await axiosInstance.post(`${API_URL}/esRoutes/grievances`, grievanceData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
    },
    onError: (error: any) => {
      console.error('Add grievance error:', error);
    }
  });
};


export const useSubmitGrievance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (grievanceData: any) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/grievances`,
        grievanceData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["grievances", variables.project_id] 
      });
    },
  });
};

export const useUpdateGrievance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data } = await axiosInstance.put(`${API_URL}/esRoutes/grievances/${id}`,updateData );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["grievances", variables.id] 
      });
    },
  });
};

// ============================================
// LABOUR CAMP FACILITIES HOOKS
// ============================================

export const useLabourCamp = (id: number) => {
  return useQuery({
    queryKey: ["labour-camp", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${API_URL}/esRoutes/labour-camp/${id}`);
      return data?.data;
    },
    enabled: !!id,
  });
};

export const useUpdateLabourCamp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campData: any) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/labour-camp`,
        campData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["labour-camp", variables.project_id] 
      });
    },
  });
};

// ============================================
// ATTENDANCE MANAGEMENT HOOKS
// ============================================

export const useAttendance = (projectId: string, filters?: any) => {
  return useQuery({
    queryKey: ["attendance", projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/attendance/${projectId}?${params.toString()}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

export const useSubmitAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendanceData: any) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/attendance`,
        attendanceData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["attendance", variables.project_id] 
      });
    },
  });
};

// ============================================
// E&S REPORTS HOOKS
// ============================================

export const useESReports = (id?: number) => {
  return useQuery({
    queryKey: ["es-reports", id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data } = await axiosInstance.get(
          `${API_URL}/esRoutes/dashboard/stats/${id}`
        );
        return data?.data || data || {};
      } catch (error) {
        console.error("Error fetching E&S stats:", error);
        return {
          environmental: { rate: 0 },
          social: { rate: 0 },
          grievances: { pending: 0 },
          labour: { avg_daily: 0 }
        };
      }
    },
    enabled: !!id,
  });
};

export const useSubmitESReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: any) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/es-reports/submit`,
        reportData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["es-reports", variables.project_id] 
      });
    },
  });
};

export const useUpdateESReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data } = await axiosInstance.put(
        `${API_URL}/esRoutes/es-reports/${id}`,
        updateData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["es-reports"] 
      });
    },
  });
};

// ============================================
// DASHBOARD STATISTICS HOOKS
// ============================================

export const useESStatistics = (id: number) => {
  return useQuery({
    queryKey: ["es-statistics", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/dashboard/stats/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
};

// ============================================
// DOCUMENT MANAGEMENT HOOKS
// ============================================

export const useDocuments = (projectId: string, filters?: any) => {
  return useQuery({
    queryKey: ["documents", projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/documents/${projectId}?${params.toString()}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentData: FormData) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/documents/upload`,
        documentData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      const projectId = variables.get('project_id');
      queryClient.invalidateQueries({ 
        queryKey: ["documents", projectId] 
      });
    },
  });
};

// ============================================
// TRAINING MANAGEMENT HOOKS
// ============================================

export const useTrainings = (projectId: string, filters?: any) => {
  return useQuery({
    queryKey: ["trainings", projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/trainings/${projectId}?${params.toString()}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

export const useSubmitTraining = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trainingData: any) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/trainings`,
        trainingData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["trainings", variables.project_id] 
      });
    },
  });
};

// ============================================
// COMPLIANCE MONITORING HOOKS
// ============================================

export const useCompliance = (projectId: string, filters?: any) => {
  return useQuery({
    queryKey: ["compliance", projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/compliance/${projectId}?${params.toString()}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

export const useUpdateCompliance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (complianceData: any) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/compliance`,
        complianceData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["compliance", variables.project_id] 
      });
    },
  });
};

// ============================================
// INCIDENT REPORTING HOOKS
// ============================================

export const useIncidents = (projectId: string, filters?: any) => {
  return useQuery({
    queryKey: ["incidents", projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/incidents/${projectId}?${params.toString()}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

export const useSubmitIncident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (incidentData: any) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/incidents`,
        incidentData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["incidents", variables.project_id] 
      });
    },
  });
};

// ============================================
// EXPORT DATA HOOKS
// ============================================

export const useExportData = () => {
  return useMutation({
    mutationFn: async ({ projectId, type, filters, format = 'csv' }: any) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      params.append('format', format);
      
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/export/${projectId}/${type}?${params.toString()}`,
        {
          responseType: 'blob',
        }
      );
      return data;
    },
  });
};

// ============================================
// BULK OPERATIONS HOOKS
// ============================================

export const useBulkUpload = () => {
  return useMutation({
    mutationFn: async (uploadData: FormData) => {
      const { data } = await axiosInstance.post(
        `${API_URL}/esRoutes/bulk-upload`,
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    },
  });
};

export const useBulkUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bulkData: any) => {
      const { data } = await axiosInstance.put(
        `${API_URL}/esRoutes/bulk-update`,
        bulkData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

// ============================================
// CACHE MANAGEMENT HOOKS
// ============================================

export const useInvalidateCache = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateProject: (projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ["es-project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["environmental-data", projectId] });
      queryClient.invalidateQueries({ queryKey: ["social-data", projectId] });
      queryClient.invalidateQueries({ queryKey: ["grievances", projectId] });
      queryClient.invalidateQueries({ queryKey: ["labour-camp", projectId] });
      queryClient.invalidateQueries({ queryKey: ["attendance", projectId] });
      queryClient.invalidateQueries({ queryKey: ["es-reports", projectId] });
      queryClient.invalidateQueries({ queryKey: ["es-statistics", projectId] });
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      queryClient.invalidateQueries({ queryKey: ["trainings", projectId] });
      queryClient.invalidateQueries({ queryKey: ["compliance", projectId] });
      queryClient.invalidateQueries({ queryKey: ["incidents", projectId] });
    },
    invalidateEnvironmental: (projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ["environmental-data", projectId] });
    },
    invalidateSocial: (projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ["social-data", projectId] });
    },
  };
};

// ============================================
// CUSTOM QUERY HOOKS FOR SPECIFIC NEEDS
// ============================================

export const useMonthlyReportSummary = (projectId: string, year: number, month: number) => {
  return useQuery({
    queryKey: ["monthly-report-summary", projectId, year, month],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/reports/summary/${projectId}/${year}/${month}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

export const useComplianceTrends = (projectId: string, duration: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  return useQuery({
    queryKey: ["compliance-trends", projectId, duration],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/compliance/trends/${projectId}?duration=${duration}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

export const usePerformanceMetrics = (projectId: string) => {
  return useQuery({
    queryKey: ["performance-metrics", projectId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `${API_URL}/esRoutes/performance/${projectId}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

// ============================================
// TYPES FOR BETTER TYPE SAFETY
// ============================================

export interface Grievance {
  id: number;
  grievance_id: string;
  project_id: number;
  received_date: string;
  complainant_name: string;
  contact_number?: string;
  category: 'labour' | 'environment' | 'safety' | 'payment' | 'facility' | 'other';
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  assigned_to?: string;
  resolution_date?: string;
  resolution_details?: string;
  created_at: string;
  updated_at: string;
}

export interface EnvironmentalData {
  id: number;
  project_id: number;
  indicator_id: number;
  reporting_date: string;
  sample_location: string;
  measured_value: number;
  unit: string;
  status: 'within_limit' | 'exceeded' | 'not_monitored';
  remarks?: string;
  photo_url?: string;
  monitored_by: string;
  created_at: string;
}

export interface SocialData {
  id: number;
  project_id: number;
  indicator_id: number;
  reporting_date: string;
  male_count: number;
  female_count: number;
  value_text?: string;
  value_numeric?: number;
  status: 'complied' | 'not_complied' | 'partial';
  remarks?: string;
  photo_url?: string;
  created_at: string;
}

export interface ESReport {
  id: number;
  report_number: string;
  project_id: number;
  report_type: 'daily' | 'weekly' | 'monthly' | 'six_monthly' | 'annual';
  reporting_period_start: string;
  reporting_period_end: string;
  submission_date: string;
  submitted_by: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  environmental_summary?: string;
  social_summary?: string;
  key_issues?: string;
  recommendations?: string;
  attachments?: any[];
  reviewed_by?: string;
  review_date?: string;
  approved_by?: string;
  approval_date?: string;
  created_at: string;
}

export interface LabourCampFacility {
  id: number;
  project_id: number;
  facility_type: 'accommodation' | 'washroom' | 'water' | 'kitchen' | 'medical' | 'safety' | 'other';
  facility_name: string;
  specification?: string;
  quantity: number;
  condition: 'good' | 'average' | 'poor' | 'not_available';
  last_inspection_date?: string;
  next_inspection_date?: string;
  remarks?: string;
  photo_url?: string;
  created_at: string;
}

export interface Attendance {
  id: number;
  project_id: number;
  attendance_date: string;
  male_present: number;
  female_present: number;
  male_absent: number;
  female_absent: number;
  remarks?: string;
  recorded_by: string;
  created_at: string;
}