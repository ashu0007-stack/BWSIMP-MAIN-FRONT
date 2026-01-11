import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getWUAMaster, 
  getWUAMasterById, 
  getWUAMasterWithStatus, 
  searchWUAMaster, 
  createVLC, 
  getVLCsByWUA,
  getWUAsWithVLCs,
  getWUAsWithBothVLCandSLC,
  createPIMWUA, 
  getAllWUAs,
  getWUAMasterforSLcById
} from '@/services/api/wrdApi/wuaMasterApi';


interface VLCCreateData {
  vlcData: {
    wua_id: string;
    vlc_name: string;
    village_name: string;
    gp_name: string;
    block_name: string;
    district_name: string;
    formation_date: string | null;
    vlc_formed: boolean;
  };
  villages: Array<{
    village_name: string;
    gp_name: string | null;
    block_name: string | null;
    district_name: string | null;
  }>;
  gbMembers: Array<any>;
  executiveMembers: Array<any>;
}

export const useWUAMaster = () => {
  return useQuery({
    queryKey: ['wua-master'],
    queryFn: async () => {
      const data = await getWUAMaster();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch WUA data');
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// WUA Master with completion status fetch karne ke liye hook
export const useWUAMasterWithStatus = () => {
  return useQuery({
    queryKey: ['wua-master-with-status'],
    queryFn: async () => {
      const data = await getWUAMasterWithStatus();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch WUA data with status');
      }
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Single WUA Master fetch karne ke liye
export const useWUAMasterById = (id:any) => {
  return useQuery({
    queryKey: ['wua-master', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await getWUAMasterById(id);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch WUA data');
      }
    },
    enabled: !!id,
  });
};

// use for slc page
export const useWUAMasterforSLcById = (id:any) => {
  return useQuery({
    queryKey: ['wua-master', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await getWUAMasterforSLcById(id);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch WUA data');
      }
    },
    enabled: !!id,
  });
};


// WUA Master search hook
export const useSearchWUAMaster = (searchTerm: string) => {
  return useQuery({
    queryKey: ['wua-master-search', searchTerm],
    queryFn: async () => {
      const data = await searchWUAMaster(searchTerm);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to search WUA data');
      }
    },
    enabled: !!searchTerm && searchTerm.length > 2,
  });
};

export const useCreateVLC = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vlcData: VLCCreateData) => {  // ✅ Type add करें
      const data = await createVLC(vlcData);
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to create VLC');
      }
    },
    onSuccess: (data, variables) => {  // ✅ parameters update करें
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vlc'] });
      queryClient.invalidateQueries({ queryKey: ['wua-master-with-status'] });
      queryClient.invalidateQueries({ queryKey: ['wua-master', variables.vlcData?.wua_id] });
    },
    onError: (error) => {
      console.error('VLC creation failed:', error);
    }
  });
};

// Get VLCs by WUA hook
export const useVLCsByWUA = (wuaId:any) => {
  return useQuery({
    queryKey: ['vlc', wuaId],
    queryFn: async () => {
      if (!wuaId) return [];
      const data = await getVLCsByWUA(wuaId);
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch VLCs');
      }
    },
    enabled: !!wuaId,
  });
};

export const useWUAsWithVLCs = () => {
  return useQuery({
    queryKey: ['wua-with-vlcs'],
    queryFn: async () => {
      const data = await getWUAsWithVLCs();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch WUAs with VLCs');
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useWUAsWithBothVLCandSLC = (selectedWuaId: string) => {
  return useQuery({
    queryKey: ['wua-with-both-vlc-slc'],
    queryFn: async () => {
      const data = await getWUAsWithBothVLCandSLC();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch WUAs with both VLC and SLC');
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ✅ CORRECTED: Create WUA hook
export const useCreateWUA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (wuaData) => {
      console.log("📤 Sending data to createPIMWUA:", wuaData);
      const data = await createPIMWUA(wuaData);
      console.log("📥 Received response:", data);
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to create WUA');
      }
    },
    onSuccess: (data, variables) => {
      console.log("✅ WUA created successfully");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pim-wua'] });
      queryClient.invalidateQueries({ queryKey: ['wua-master'] });
      queryClient.invalidateQueries({ queryKey: ['wua-master-with-status'] });
    },
    onError: (error) => {
      console.error('❌ WUA creation failed:', error);
    }
  });
};
export const useWUAs = () => {
  return useQuery({
    queryKey: ["wua"],
    queryFn: async () => {
      const data = await getAllWUAs();
      return data;  
    },
    staleTime: 5 * 60 * 1000,
  });
};

