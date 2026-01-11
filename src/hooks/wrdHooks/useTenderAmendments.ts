import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface TenderAmendment {
  id: number;
  tender_id: number;
  amendment_number: number;
  amendment_type: 'draft' | 'corrigendum' | 'amendment' | 'final';
  amendment_date: string;
  description: string;
  changes_summary: string;
  status: 'draft' | 'published' | 'final';
  created_by: string;
  created_at: string;
}

export interface TenderVersion {
  id: number;
  tender_id: number;
  amendment_id: number;
  version_data: any;
  version_number: number;
  is_current: boolean;
  created_at: string;
}

// Get amendments for a tender
export const useTenderAmendments = (tenderId?: number) => {
  return useQuery({
    queryKey: ["tenderAmendments", tenderId],
    queryFn: async () => {
      if (!tenderId) return [];
      const { data } = await axios.get(`/api/tender-amendments/${tenderId}`);
      return data as TenderAmendment[];
    },
    enabled: !!tenderId,
  });
};

// Save tender as draft
export const useSaveTenderDraft = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (draftData: {
      tender_id?: number;
      formData: any;
      description?: string;
      amendment_type?: 'draft' | 'corrigendum' | 'amendment';
    }) => {
      const formData = new FormData();
      
      // Add basic data
      Object.keys(draftData.formData).forEach(key => {
        if (draftData.formData[key] !== null && draftData.formData[key] !== undefined) {
          if (draftData.formData[key] instanceof File) {
            formData.append(key, draftData.formData[key]);
          } else {
            formData.append(key, draftData.formData[key]);
          }
        }
      });
      
      // Add amendment info
      formData.append('amendment_type', draftData.amendment_type || 'draft');
      formData.append('description', draftData.description || 'Draft saved');
      
      const { data } = await axios.post("/api/tenders/save-draft", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: (data, variables) => {
      if (variables.tender_id) {
        queryClient.invalidateQueries({ 
          queryKey: ["tenderAmendments", variables.tender_id] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
};

// Final submit tender
export const useFinalSubmitTender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (finalData: {
      tender_id: number;
      description?: string;
    }) => {
      const { data } = await axios.post(`/api/tenders/${finalData.tender_id}/final-submit`, {
        description: finalData.description || 'Final submission'
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["tenderAmendments", variables.tender_id] 
      });
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
};

// Get tender versions
export const useTenderVersions = (tenderId?: number) => {
  return useQuery({
    queryKey: ["tenderVersions", tenderId],
    queryFn: async () => {
      if (!tenderId) return [];
      const { data } = await axios.get(`/api/tenders/${tenderId}/versions`);
      return data as TenderVersion[];
    },
    enabled: !!tenderId,
  });
};

// Restore tender version
export const useRestoreTenderVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (versionData: {
      tender_id: number;
      version_id: number;
    }) => {
      const { data } = await axios.post(`/api/tenders/${versionData.tender_id}/restore`, {
        version_id: versionData.version_id
      });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["tenderVersions", variables.tender_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["tenderAmendments", variables.tender_id] 
      });
      return data;
    },
  });
};