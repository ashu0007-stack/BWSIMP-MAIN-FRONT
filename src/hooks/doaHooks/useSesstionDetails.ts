import axiosInstance from "@/apiInterceptor/axiosInterceptor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// GET: Fetch all FFS details
const getSessionDetails = async () => {
  //  const token = JSON.parse(`${sessionStorage.getItem("authToken")}`);

  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/doa/sessionDetails`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token}`,
    // },
  });

  return response.data?.data || [];
};

export const useSessionDetails = () => {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["sesstionDetails"],
    queryFn: getSessionDetails,
    retry: false,
    // refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isLoading, isError, data, error };
};



// POST: Add a new FFS record
const addSessionDetails = async (payload: any) => {
  // const token = JSON.parse(`${sessionStorage.getItem("OAuthCredentials")}`);

  const response = await axiosInstance({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/doa/addSessionDetails`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token.authToken}`,
    // },
    data: payload,
  });

  return response.data?.data || [];
};

// Custom hook for adding new FFS record
export const useAddSessionDetails = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationKey: ["addSessionDetails"],
    mutationFn: addSessionDetails,
    onSuccess: () => {
      // Refresh the FFS list automatically
      queryClient.invalidateQueries({ queryKey: ["sessionDetails"] });
    },
  });

  return { mutate, isPending, isError, isSuccess };
};
