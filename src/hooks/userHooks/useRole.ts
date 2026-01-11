import { getRoles, getRolesByDesignation } from "@/services/api/users/rolesApi";
import { useQuery } from "@tanstack/react-query";

// get all designations
export const useRoles = () => {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: ["designations"], // Fixed: changed from "departments" to "designations"
    queryFn: getRoles,
    enabled: false,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error, refetch };
};

// get designations by department id
export const useRoleByDesigId = (desgnId: number | undefined) => {
  
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: ["designations", desgnId],
    queryFn: () => {
      if (!desgnId) {
        return Promise.resolve([]);
      }
      return getRolesByDesignation(desgnId);
    },
    enabled: !!desgnId, // Only run query when departmentId is truthy
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error, refetch };
};