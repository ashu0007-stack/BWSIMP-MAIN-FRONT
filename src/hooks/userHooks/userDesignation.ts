import { getDesignations, getDesignationsByDeprtId, getDesignationsByDeptAndLevel } from "@/services/api/users/designationsApi";
import { useQuery } from "@tanstack/react-query";

// get all designations
export const useDesignations = () => {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: ["designations"], // Fixed: changed from "departments" to "designations"
    queryFn: getDesignations,
    enabled: false,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error, refetch };
};

// get designations by department id
export const useDesignationsByDpartId = (departmentId: number | undefined) => {
  
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: ["designations", departmentId],
    queryFn: () => {
      if (!departmentId) {
        return Promise.resolve([]);
      }
      return getDesignationsByDeprtId(departmentId);
    },
    enabled: !!departmentId, // Only run query when departmentId is truthy
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error, refetch };
};



interface UseDesignationParams {
  departmentId?: number;
  levelId?: number;
}

export const useGetDesignationsByDeptAndLevel = ({
  departmentId,
  levelId,
}: UseDesignationParams) => {
  return useQuery({
    queryKey: ["designations", departmentId, levelId],
    queryFn: () =>
      getDesignationsByDeptAndLevel({
        departmentId: departmentId as number,
        levelId: levelId as number,
      }),
    enabled: Boolean(departmentId && levelId),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
