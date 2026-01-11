import axiosInstance from "@/apiInterceptor/axiosInterceptor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// GET: Fetch all FFS details
const getFfsDetails = async () => {
  // const token = JSON.parse(`${sessionStorage.getItem("userdetail")}`);

  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/doa/ffsDetails`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token.authToken}`,
    // },
  });

  return response.data?.data || [];
};

export const useFfsDetails = () => {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["ffsDetails"],
    queryFn: getFfsDetails,                                                              
    retry: false,
    // refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error };
};



// POST: Add a new FFS record
const addFfsDetails = async (payload: any) => {
  // const token = JSON.parse(`${sessionStorage.getItem("OAuthCredentials")}`);

  const response = await axiosInstance({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/doa/addFfsDetails`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token.authToken}`,
    // },
    data: payload,
  });

  return response.data?.data || [];
};

// Custom hook for adding new FFS record
export const useAddFfsDetails = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationKey: ["addFfsDetails"],
    mutationFn: addFfsDetails,
    onSuccess: () => {
      // Refresh the FFS list automatically
      queryClient.invalidateQueries({ queryKey: ["ffsDetails"] });
    },
  });

  return { mutate, isPending, isError, isSuccess };
};
