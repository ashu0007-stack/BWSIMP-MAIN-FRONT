"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchComponents,
  createComponent,
  fetchAllSubcomponents,
  fetchSubcomponentsByComponentId,
  fetchgetSubworkcomponentsByworkComponentId,
  createSubcomponent,
} from "@/services/api/master/componentApi"; // 👈 adjust this import path to where your API file is

// =============================
// ✅ Hook: Get all components
// =============================
export const useComponents = () => {
  return useQuery({
    queryKey: ["components"],
    queryFn: fetchComponents,
  });
};

// =============================
// ✅ Hook: Create new component
// =============================
export const useCreateComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
    },
  });
};

// =============================
// ✅ Hook: Get all subcomponents
// =============================
export const useSubcomponents = () => {
  return useQuery({
    queryKey: ["subcomponents"],
    queryFn: fetchAllSubcomponents,
  });
};

// =============================
// ✅ Hook: Get subcomponents by component ID
// =============================
export const useSubcomponentsByComponent = (componentId?: number) => {
  return useQuery({
    queryKey: ["subcomponents", componentId],
    queryFn: () => fetchSubcomponentsByComponentId(componentId!),
    enabled: !!componentId, // only runs when componentId is provided
  });
};

export const useSubworkcomponentsByworkComponentId = (workcomponentId?: number) => {
  return useQuery({
    queryKey: ["subworkcomponents", workcomponentId],
    queryFn: () => fetchgetSubworkcomponentsByworkComponentId(workcomponentId!),
    enabled: !!workcomponentId, // only runs when workcomponentId is provided
    staleTime: 60000, // cache for 1 minute
  });
};

// =============================
// ✅ Hook: Create subcomponent
// =============================
export const useCreateSubcomponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubcomponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcomponents"] });
    },
  });
};
