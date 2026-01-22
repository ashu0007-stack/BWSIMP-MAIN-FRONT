import { createUser, editUser, getUsersList,toggleUserStatus  } from "@/services/api/users/usersApi";
import { useMutation, useQuery,useQueryClient  } from "@tanstack/react-query";

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



//Edit user 
export function useEditUser() {
  const { mutate, isPending } = useMutation({
    mutationFn: editUser,
  })

  return {
    mutate,
    isPending,
  }
};

//Enable / Disable user
export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  
  const { mutate, isPending } = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) => 
      toggleUserStatus({ userId, isActive }),
    onSuccess: () => {
      // Refresh user list
      queryClient.invalidateQueries({ queryKey: ["userList"] });
    },
  });

  return {
    toggleUserStatus: mutate,
    isToggling: isPending,
  };
}


