import { createUser } from "@/services/api/users/usersApi";
import { useMutation } from "@tanstack/react-query";



export function useCreateUser() {
  const { mutate, isPending } = useMutation({
    mutationFn: createUser,
  })

  return {
    mutate,
    isPending,
  }
};

// export function useUserDetails() {
//   const { mutate, isPending } = useMutation({
//     mutationFn: userLogin,
//   })

//   return {
//     mutate,
//     isPending,
//   }
// };