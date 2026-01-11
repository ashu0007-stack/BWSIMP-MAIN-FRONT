// pages/api/workLogRddApi.ts
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ===========================================================
// 🌟 TypeScript Interfaces for WorkLog RDD
// ===========================================================

export interface WorkLogRddData {
  id?: number;
  data_entry_id: number;
  agency_name: string;
  command_area: number;
  proposed_length: number;
  proposed_width: number;
  proposed_height: number;
  wages_amount: number;
  material_amount: number;
  total_sanction_amount: number;
  initial_upload?: string | null;
  final_upload?: string | null;
  created_by?: number;
  created_by_name?: string;
  work_name?: string;
  work_code?: string;
  created_at?: string;
  updated_at?: string;
  logNumber?: number;
  totalLogs?: number;
}

export interface WorkLogRddResponse {
  success: boolean;
  data: WorkLogRddData;
  message?: string;
  logNumber?: number;
  totalLogs?: number;
  action?: string;
}

export interface WorkLogRddListResponse {
  success: boolean;
  data: WorkLogRddData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  count?: number;
}

export interface WorkLogStatsResponse {
  success: boolean;
  data: {
    stats: {
      total_logs: number;
      unique_data_entries: number;
      avg_sanction_amount: number;
      latest_log_date: string;
    };
    topEntries: Array<{
      data_entry_id: number;
      log_count: number;
      work_name: string;
      work_code: string;
    }>;
  };
}

// ===========================================================
// 🌟 Helper Functions
// ===========================================================

/**
 * ✅ Check if data is FormData
 */
const isFormData = (data: any): data is FormData => {
  return data instanceof FormData;
};

/**
 * ✅ Get appropriate config for request
 */
const getRequestConfig = (data: any) => {
  if (isFormData(data)) {
    return {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  }
  return {};
};

// ===========================================================
// 🌟 WorkLog RDD API Functions
// ===========================================================

/**
 * ✅ Get ALL work logs by data entry ID
 */
export const fetchWorkLogsByDataEntryId = async (dataEntryId: number): Promise<WorkLogRddData[]> => {
  try {
    const response = await axiosInstance.get<WorkLogRddListResponse>(
      `${API_URL}/rdd/work-log-rdd/data-entry/${dataEntryId}/all`
    );
    return response.data.data || [];
  } catch (error: any) {
    // If 404, return empty array (no work logs exist yet)
    if (error.response?.status === 404) {
      return [];
    }
    console.error('Error fetching work logs:', error);
    throw error;
  }
};

/**
 * ✅ Get LATEST work log by data entry ID
 */
export const fetchLatestWorkLogByDataEntryId = async (dataEntryId: number): Promise<WorkLogRddData | null> => {
  try {
    const response = await axiosInstance.get<WorkLogRddResponse>(
      `${API_URL}/rdd/work-log-rdd/data-entry/${dataEntryId}/latest`
    );
    return response.data.data;
  } catch (error: any) {
    // If 404, return null (work log doesn't exist yet)
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching latest work log:', error);
    throw error;
  }
};

/**
 * ✅ Create NEW work log (always creates new entry) - Supports FormData
 */
export const createWorkLog = async (data: Omit<WorkLogRddData, 'id' | 'created_at' | 'updated_at'> | FormData): Promise<WorkLogRddResponse> => {
  try {
    const config = getRequestConfig(data);
    const response = await axiosInstance.post<WorkLogRddResponse>(
      `${API_URL}/rdd/work-log-rdd/create`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating work log:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * ✅ Create or update work log (always creates new entry now) - Supports FormData
 */
// export const createOrUpdateWorkLog = async (data: Omit<WorkLogRddData, 'id' | 'created_at' | 'updated_at'> | FormData): Promise<WorkLogRddResponse> => {
//   try {
//     const config = getRequestConfig(data);
//     const response = await axiosInstance.post<WorkLogRddResponse>(
//       `${API_URL}/rdd/work-log-rdd`,
//       data,
//       config
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error('Error creating/updating work log:', error);
//     if (error.response?.data) {
//       throw error.response.data;
//     }
//     throw error;
//   }
// };



// Update createOrUpdateWorkLog function to log more details
export const createOrUpdateWorkLog = async (data: Omit<WorkLogRddData, 'id' | 'created_at' | 'updated_at'> | FormData): Promise<WorkLogRddResponse> => {
  try {
    const config = getRequestConfig(data);
    
    // Log the data being sent for debugging
    if (isFormData(data)) {
      const formDataObj: Record<string, any> = {};
      for (const [key, value] of (data as FormData).entries()) {
        if (value instanceof File) {
          formDataObj[key] = `File: ${value.name} (${value.size} bytes)`;
        } else {
          formDataObj[key] = value;
        }
      }
      console.log('FormData being sent:', formDataObj);
    } else {
      console.log('JSON data being sent:', data);
    }
    
    console.log('API URL:', `${API_URL}/rdd/work-log-rdd`);
    
    const response = await axiosInstance.post<WorkLogRddResponse>(
      `${API_URL}/rdd/work-log-rdd`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating/updating work log:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
      
      if (error.response.data) {
        // Log the full error response
        console.error('Backend error details:', JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    throw error;
  }
};


/**
 * ✅ Update work log - Supports FormData
 */
export const updateWorkLog = async (dataEntryId: number, data: Partial<WorkLogRddData> | FormData): Promise<WorkLogRddData> => {
  try {
    const config = getRequestConfig(data);
    const response = await axiosInstance.put<WorkLogRddResponse>(
      `${API_URL}/rdd/work-log-rdd/${dataEntryId}`,
      data,
      config
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating work log:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * ✅ Delete specific work log by ID
 */
export const deleteWorkLogById = async (workLogId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/rdd/work-log-rdd/${workLogId}`);
  } catch (error: any) {
    console.error('Error deleting work log:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * ✅ Delete all work logs for a data entry
 */
export const deleteAllWorkLogsForEntry = async (dataEntryId: number): Promise<{ deletedCount: number }> => {
  try {
    const response = await axiosInstance.delete<{ success: boolean; deletedCount: number }>(
      `${API_URL}/rdd/work-log-rdd/data-entry/${dataEntryId}/all`
    );
    return { deletedCount: response.data.deletedCount };
  } catch (error: any) {
    console.error('Error deleting work logs:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * ✅ Get all work logs with pagination and filters
 */
export const fetchAllWorkLogs = async (params?: {
  page?: number;
  limit?: number;
  agency_name?: string;
  start_date?: string;
  end_date?: string;
  data_entry_id?: number;
}): Promise<WorkLogRddListResponse> => {
  try {
    const response = await axiosInstance.get<WorkLogRddListResponse>(
      `${API_URL}/rdd/work-log-rdd`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching work logs:', error);
    throw error;
  }
};

/**
 * ✅ Get work log statistics
 */
export const fetchWorkLogStats = async (): Promise<WorkLogStatsResponse> => {
  try {
    const response = await axiosInstance.get<WorkLogStatsResponse>(
      `${API_URL}/rdd/work-log-rdd/stats`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching work log stats:', error);
    throw error;
  }
};

/**
 * ✅ Debug endpoint to check work logs
 */
export const debugWorkLogs = async (dataEntryId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/rdd/work-log-rdd/debug/${dataEntryId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    throw error;
  }
};

/**
 * ✅ Get uploaded work log image
 */
export const fetchWorkLogImage = async (filename: string): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/rdd/work-log-rdd/images/${filename}`,
      {
        responseType: 'blob'
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching work log image:', error);
    throw error;
  }
};

/**
 * ✅ Upload work log image only
 */
export const uploadWorkLogImage = async (
  dataEntryId: number, 
  type: 'initial' | 'final', 
  file: File
): Promise<WorkLogRddResponse> => {
  try {
    const formData = new FormData();
    formData.append('data_entry_id', dataEntryId.toString());
    formData.append(`${type}_upload`, file);

    const response = await axiosInstance.post<WorkLogRddResponse>(
      `${API_URL}/rdd/work-log-rdd`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error uploading work log image:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * ✅ Validate work log data before submission
 */
export const validateWorkLogData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.data_entry_id) {
    errors.push('Data entry ID is required');
  }

  if (!data.agency_name?.trim()) {
    errors.push('Agency name is required');
  }

  // Validate numeric fields
  const numericFields = [
    'command_area', 'proposed_length', 'proposed_width', 'proposed_height',
    'wages_amount', 'material_amount', 'total_sanction_amount'
  ];

  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      const value = parseFloat(data[field]);
      if (isNaN(value) || value < 0) {
        errors.push(`${field.replace(/_/g, ' ')} must be a positive number`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * ✅ Convert FormData to object (for debugging)
 */
export const formDataToObject = async (formData: FormData): Promise<Record<string, any>> => {
  const obj: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      obj[key] = {
        name: value.name,
        size: value.size,
        type: value.type
      };
    } else {
      obj[key] = value;
    }
  }
  
  return obj;
};

/**
 * ✅ Create FormData from work log object
 */
export const createWorkLogFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (key === 'initial_upload' || key === 'final_upload') {
        // Handle file removal - send empty string to remove existing file
        if (value === '') {
          formData.append(key, '');
        }
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};