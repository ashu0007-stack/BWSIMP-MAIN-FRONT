import { createUser, getUsersList } from "@/services/api/users/usersApi";
import { useMutation, useQuery } from "@tanstack/react-query";

//Create user 
export function useCreateUser() {
  const { mutate, isPending } = useMutation({
    mutationFn: createUser,
  })

  return {
    mutate,
    isPending,
  }
};

// Get user List
export const useUsersList = () => {
  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: ["userList"], 
    queryFn: getUsersList,
    enabled: true,                                                             
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error, refetch };
};
