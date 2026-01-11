import { getLevels, getLevelsByDepartmentId } from "@/services/api/users/levelsApi";
import { getRoles, getRolesByDesignation } from "@/services/api/users/rolesApi";
import { useQuery } from "@tanstack/react-query";

// get all designations
export const useLevels = () => {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: ["levels"], // Fixed: changed from "departments" to "designations"
    queryFn: getLevels,
    enabled: false,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error, refetch };
};

// get designations by department id
export const useLevelsByDeptId = (departmentId: number | undefined) => {
  
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: ["levels", departmentId],
    queryFn: () => {
      if (!departmentId) {
        return Promise.resolve([]);
      }
      return getLevelsByDepartmentId(departmentId);
    },
    enabled: !!departmentId, // Only run query when departmentId is truthy
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error, refetch };
};


