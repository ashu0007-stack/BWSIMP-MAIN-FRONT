import { useState, useEffect, useCallback } from 'react';
import { workPackagesApi } from '@/services/api/wrdApi/workPackages';

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

interface UseWorkPackagesReturn {
  works: WorkPackage[];
  loading: boolean;
  error: string | null;
  refreshWorks: () => Promise<void>;
  getWorkById: (id: string | number) => Promise<WorkPackage | null>;
  createWork: (work: Partial<WorkPackage>) => Promise<WorkPackage | null>;
  updateWork: (id: string | number, work: Partial<WorkPackage>) => Promise<WorkPackage | null>;
  deleteWork: (id: string | number) => Promise<boolean>;
}

export const useWorkPackages = (): UseWorkPackagesReturn => {
  const [works, setWorks] = useState<WorkPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all works
  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workPackagesApi.getAll();
      setWorks(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch works';
      setError(errorMessage);
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh works
  const refreshWorks = useCallback(async () => {
    await fetchWorks();
  }, [fetchWorks]);

  // Get work by ID
  const getWorkById = useCallback(async (id: string | number): Promise<WorkPackage | null> => {
    try {
      setError(null);
      const work = await workPackagesApi.getById(id);
      return work;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work';
      setError(errorMessage);
      console.error('Error fetching work:', err);
      return null;
    }
  }, []);

  // Create new work
  const createWork = useCallback(async (work: Partial<WorkPackage>): Promise<WorkPackage | null> => {
    try {
      setError(null);
      const newWork = await workPackagesApi.create(work);
      setWorks(prev => [...prev, newWork]);
      return newWork;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create work';
      setError(errorMessage);
      console.error('Error creating work:', err);
      return null;
    }
  }, []);

  // Update work
  const updateWork = useCallback(async (
    id: string | number, 
    work: Partial<WorkPackage>
  ): Promise<WorkPackage | null> => {
    try {
      setError(null);
      const updatedWork = await workPackagesApi.update(id, work);
      setWorks(prev => prev.map(w => w.id === id ? updatedWork : w));
      return updatedWork;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update work';
      setError(errorMessage);
      console.error('Error updating work:', err);
      return null;
    }
  }, []);

  // Delete work
  const deleteWork = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      setError(null);
      await workPackagesApi.delete(id);
      setWorks(prev => prev.filter(w => w.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete work';
      setError(errorMessage);
      console.error('Error deleting work:', err);
      return false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  return {
    works,
    loading,
    error,
    refreshWorks,
    getWorkById,
    createWork,
    updateWork,
    deleteWork,
  };
};

