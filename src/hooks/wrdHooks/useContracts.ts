// useContracts.ts - Updated hooks
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllContracts, 
  createContract, 
  getWorkstender,
  getContractById,
  updateContract,
  deleteContract
} from "@/services/api/wrdApi/contractApi";

// ✅ Fetch all contracts
export const useContracts = () =>
  useQuery({
    queryKey: ["contracts"],
    queryFn: getAllContracts,
  });

// ✅ Fetch works for tender
export const useWorkTender = () =>
  useQuery({
    queryKey: ["tendercontracts"],
    queryFn: getWorkstender,
  });

// ✅ Create a new contract
export const useCreateContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contractData: any) => createContract(contractData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["tendercontracts"] });
    },
  });
};

// ✅ Update contract (Enhanced with proper error handling)
export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => 
      updateContract(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["contract", id] });
      await queryClient.cancelQueries({ queryKey: ["contracts"] });
      
      const previousContract = queryClient.getQueryData(["contract", id]);
      const previousContracts = queryClient.getQueryData(["contracts"]);
      
      if (previousContract) {
        queryClient.setQueryData(["contract", id], (old: any) => ({
          ...old,
          ...data,
          updatedAt: new Date().toISOString()
        }));
      }
      
      if (previousContracts && Array.isArray(previousContracts)) {
        queryClient.setQueryData(["contracts"], (old: any[]) => 
          old?.map(contract => 
            contract.id === id 
              ? { ...contract, ...data, updatedAt: new Date().toISOString() }
              : contract
          )
        );
      }
      
      return { previousContract, previousContracts };
    },
    
    onError: (err: any, variables, context) => {
      console.error("❌ Update contract mutation error:", {
        error: err,
        variables,
        context
      });
      
      // Rollback optimistic updates
      if (context?.previousContract) {
        queryClient.setQueryData(["contract", variables.id], context.previousContract);
      }
      if (context?.previousContracts) {
        queryClient.setQueryData(["contracts"], context.previousContracts);
      }
      
      // Throw error with proper message
      throw new Error(err.response?.data?.message || err.message || "Failed to update contract");
    },
    
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contract", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["tendercontracts"] });
    },
    
    onSuccess: (data, variables) => {
      console.log("✅ Contract updated successfully:", data);
    }
  });
};

// ✅ Get contract by ID
export const useContractById = (id: string | number | null) => {
  return useQuery({
    queryKey: ["contract", id],
    queryFn: () => getContractById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ✅ Delete contract
export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};