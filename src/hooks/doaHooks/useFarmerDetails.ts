import axiosInstance from "@/apiInterceptor/axiosInterceptor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// GET: Fetch all FFS details
const getFarmerDetails = async (params: {
  clusterCode?: string;
  ffsId?: string;
} = {}) => {
//  const token = JSON.parse(`${sessionStorage.getItem("authToken")}`);

 const query = new URLSearchParams();

  if (params.clusterCode) query.append("clusterCode", params.clusterCode);
  if (params.ffsId) query.append("ffsId", params.ffsId);

  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/doa/farmerDetails?${query.toString()}`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token}`,
    // },
  });

  return response.data?.data || [];
};




export const useFarmerDetails = (params = {}) => {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["farmerDetails", params],
    queryFn: () => getFarmerDetails(params),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
console.log("cluster code",params)
  return { isLoading, isError, data, error };
};





// POST: Add a new FFS record
const addFarmerDetails = async (payload: any) => {
  // const token = JSON.parse(`${sessionStorage.getItem("OAuthCredentials")}`);

  const response = await axiosInstance({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/doa/addFarmerDetails`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token.authToken}`,
    // },
    data: payload,
  });

  return response.data?.data || [];
};

// Custom hook for adding new FFS record
export const useAddFarmerDetails = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationKey: ["addFarmerDetails"],
    mutationFn: addFarmerDetails,
    onSuccess: () => {
      // Refresh the FFS list automatically
      queryClient.invalidateQueries({ queryKey: ["farmerDetails"] });
    },
  });

  return { mutate, isPending, isError, isSuccess };
};
