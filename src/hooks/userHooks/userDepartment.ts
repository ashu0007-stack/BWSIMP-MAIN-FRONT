import { getDepartments, getDepartmentsById } from "@/services/api/users/departmentApi";
import { useQuery } from "@tanstack/react-query";

// Departments
export const useDepartments = () => {
  const { isLoading, isError, data, error  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,  
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error  };
};

// Departments by id
export const useDepartmentByID = () => {
  const { isLoading, isError, data, error, refetch  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartmentsById,
    enabled: false,                                                             
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error, refetch  };
};


