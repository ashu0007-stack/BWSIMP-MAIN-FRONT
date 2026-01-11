import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ===========================================================
// 🌟 TypeScript Interfaces
// ===========================================================

// Interface for Work Category
export interface WorkCategory {
  id: number;
  category_code: string;
  category_name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for Sub Category
export interface SubCategory {
  id: number;
  sub_category_code: string;
  sub_category_name: string;
  requires_mgnrega: boolean;
  condition_note: string | null;
  created_at?: string;
  updated_at?: string;
}

// =============================
// ✅ Fetch paginated + filtered data entries
// =============================
export const fetchDataEntries = async (params?: any) => {
  const response = await axiosInstance.get(`${API_URL}/rdd`, { params });
  return response.data;
};

// Add this function to your rddApi.ts file
export const updateDataEntryStatus = async (id: number, data: { status: string }) => {
  try {
    const response = await axiosInstance.patch(`${API_URL}/rdd/${id}/status`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating data entry status:', error);
    throw error;
  }
};

// =============================
// ✅ Get single data entry by ID
// =============================
export const fetchDataEntryById = async (id: number) => {
  const response = await axiosInstance.get(`${API_URL}/rdd/${id}`);
  return response.data;
};

// =============================
// ✅ Create a new data entry (with file upload) - FIXED: Better error handling
// =============================
export const createDataEntry = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/rdd`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    console.error('API Error in createDataEntry:', error);
    // Return the error in a consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// =============================
// ✅ Update existing data entry - FIXED: Better error handling
// =============================
export const updateDataEntry = async (id: number, formData: FormData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/rdd/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    console.error('API Error in updateDataEntry:', error);
    // Return the error in a consistent format
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// =============================
// ✅ Delete data entry
// =============================
export const deleteDataEntry = async (id: number) => {
  const response = await axiosInstance.delete(`${API_URL}/rdd/${id}`);
  return response.data;
};

// =============================
// ✅ Get unique filter values
// =============================
export const getFilterValues = async () => {
  const response = await axiosInstance.get(`${API_URL}/rdd/filters/unique-values`);
  return response.data;
};

// =============================
// ✅ Get stats/summary
// =============================
export const getStatsSummary = async () => {
  const response = await axiosInstance.get(`${API_URL}/rdd/stats/summary`);
  return response.data;
};

// ===========================================================
// 🌟 Work Categories API Functions
// ===========================================================

/**
 * Fetch all work categories
 * @returns Promise with array of work categories
 */
export const fetchWorkCategories = async (): Promise<WorkCategory[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/rdd/work-categories`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching work categories:", error);
    throw error;
  }
};

/**
 * Fetch sub-categories by category ID
 * @param categoryId - The ID of the work category
 * @returns Promise with array of sub-categories
 */
export const fetchSubCategoriesByCategory = async (
  categoryId: number
): Promise<SubCategory[]> => {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/rdd/work-categories/${categoryId}/sub-categories`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
    throw error;
  }
};

// ==========================================================
// 🌟 RDD DASHBOARD RELATED APIS
// ==========================================================

// ✅ 1. Get Project Expenses List
export const getProjectExpenses = async () => {
  const response = await axiosInstance.get(`${API_URL}/rdd/project-expenses`);
  return response.data;
};

// ✅ 2. Get Users Count (optional ?dept_id=)
export const getUsersCount = async (dept_id?: number) => {
  const response = await axiosInstance.get(`${API_URL}/rdd/userscount`, {
    params: dept_id ? { dept_id } : {},
  });
  return response.data;
};

// ✅ 3. Get MG Report Count
export const getMGReportCount = async () => {
  const response = await axiosInstance.get(`${API_URL}/rdd/mgreportcount`);
  return response.data;
};

// ✅ Update only status