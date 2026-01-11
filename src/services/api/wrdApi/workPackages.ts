import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface WorkPackage {
  id: string | number;
  work_name: string;
  package_number: string;
  work_cost: number | string;
  division_name: string;
  work_status?: string;
  district_name?: string;
  block_name?: string;
  scheme_name?: string;
  sanction_date?: string;
  completion_date?: string;
  contractor_name?: string;
  created_at?: string;
  updated_at?: string;
}

export const workPackagesApi = {
  // Get all work packages
  getAll: async (): Promise<WorkPackage[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/works`);
      return response.data;
    } catch (error) {
      console.error('Error fetching work packages:', error);
      throw new Error('Failed to fetch work packages');
    }
  },

  // Get work package by ID
  getById: async (id: string | number): Promise<WorkPackage> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/works/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching work package ${id}:`, error);
      throw new Error('Failed to fetch work package');
    }
  },

  // Create new work package
  create: async (work: Partial<WorkPackage>): Promise<WorkPackage> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/works`, work);
      return response.data;
    } catch (error) {
      console.error('Error creating work package:', error);
      throw new Error('Failed to create work package');
    }
  },

  // Update work package
  update: async (id: string | number, work: Partial<WorkPackage>): Promise<WorkPackage> => {
    try {
      const response = await axiosInstance.put(`${API_URL}/works/${id}`, work);
      return response.data;
    } catch (error) {
      console.error(`Error updating work package ${id}:`, error);
      throw new Error('Failed to update work package');
    }
  },

  // Delete work package
  delete: async (id: string | number): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_URL}/works/${id}`);
    } catch (error) {
      console.error(`Error deleting work package ${id}:`, error);
      throw new Error('Failed to delete work package');
    }
  },

  // Get works by filter
  getByFilter: async (filters: {
    division?: string;
    district?: string;
    status?: string;
  }): Promise<WorkPackage[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.division) params.append('division', filters.division);
      if (filters.district) params.append('district', filters.district);
      if (filters.status) params.append('status', filters.status);
      
      const response = await axiosInstance.get(`${API_URL}/works?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered works:', error);
      throw new Error('Failed to fetch filtered works');
    }
  },

  // Get works by division
  getByDivision: async (divisionName: string): Promise<WorkPackage[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/works/division/${divisionName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching works for division ${divisionName}:`, error);
      throw new Error('Failed to fetch works by division');
    }
  },

  // Search works
  search: async (query: string): Promise<WorkPackage[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/works/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching works:', error);
      throw new Error('Failed to search works');
    }
  },
};

