import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createSLC, getSLCsByWUA, getAllSLCs, updateSLC, updateSLCStatus } from '@/services/api/wrdApi/slcApi';
import axiosInstance from '@/apiInterceptor/axiosInterceptor';

// ✅ SLC DATA INTERFACE
export interface SLCData {
  id: number;
  slc_name: string;
  wua_name: string;
  formation_date: string;
  executive_members_count: number;
  circle: string;
  subdivision: string;
  status: 'Active' | 'Inactive';
  wua_id: string;
  section?: string;
  zone?: string;
  last_election_date?: string;
  next_election_date?: string;
}

export const useCreateSLC = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slcData: any) => {
      const data = await createSLC(slcData);
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to create SLC');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['slc'] });
      queryClient.invalidateQueries({ queryKey: ['slcs'] }); // ✅ Add this
      queryClient.invalidateQueries({ queryKey: ['wua-master-with-status'] });
      queryClient.invalidateQueries({ queryKey: ['wua-master', variables.wua_id] });
    },
    onError: (error) => {
      console.error('SLC creation failed:', error);
    }
  });
};

// ✅ GET ALL SLCs HOOK - FIXED VERSION
export const useGetAllSLCs = () => {
  return useQuery({
    queryKey: ['slcs'],
    queryFn: async (): Promise<SLCData[]> => {
      const data = await getAllSLCs();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch SLCs');
      }
    },
  });
};

// ✅ GET SLCs BY WUA HOOK
export const useSLCsByWUA = (wuaId: string) => {
  return useQuery({
    queryKey: ['slc', wuaId],
    queryFn: async () => {
      if (!wuaId) return [];
      const data = await getSLCsByWUA(wuaId);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch SLCs');
      }
    },
    enabled: !!wuaId,
  });
};

// ✅ UPDATE SLC HOOK
export const useUpdateSLC = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, slcData }: { id: number; slcData: any }) => {
      const data = await updateSLC(id, slcData);
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to update SLC');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['slcs'] });
      queryClient.invalidateQueries({ queryKey: ['slc', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['wua-master-with-status'] });
    },
    onError: (error) => {
      console.error('SLC update failed:', error);
    }
  });
};

// ✅ DELETE SLC HOOK
export const useDeleteSLC = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axiosInstance.delete(`/slc/${id}`);
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to delete SLC');
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['slcs'] });
    },
    onError: (error) => {
      console.error('SLC deletion failed:', error);
    }
  });
};

// ✅ UPDATE SLC STATUS HOOK
export const useUpdateSLCStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const data = await updateSLCStatus(id, status);
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to update SLC status');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['slcs'] });
      queryClient.invalidateQueries({ queryKey: ['slc', variables.id] });
    },
    onError: (error) => {
      console.error('SLC status update failed:', error);
    }
  });
};