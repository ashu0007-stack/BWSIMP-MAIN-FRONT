import axiosInstance from "@/apiInterceptor/axiosInterceptor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// GET: Fetch all FFS details
const getAttendanceDetails = async () => {
  // const token = JSON.parse(`${sessionStorage.getItem("userdetail")}`);

  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/doa/attendanceRecords`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token.authToken}`,
    // },
  });

  return response.data?.data || [];
};

export const useAttendanceDetails = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getAttendanceDetails"],
    queryFn: getAttendanceDetails,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { data, isLoading, isError, error };
};



// POST: Add a new FFS record
const addAttendanceDetails = async (payload: any) => {
  // const token = JSON.parse(`${sessionStorage.getItem("OAuthCredentials")}`);

  const response = await axiosInstance({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/doa/addAttendance`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token.authToken}`,
    // },
    data: payload,
  });

  return response.data?.data || [];
};

// Custom hook for adding new FFS record
export const useAddAttendanceDetails = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationKey: ["addAttendanceDetails"],
    mutationFn: addAttendanceDetails,
    onSuccess: () => {
      // Refresh the FFS list automatically
      queryClient.invalidateQueries({ queryKey: ["farmerDetails"] });
    },
  });

  return { mutate, isPending, isError, isSuccess };
};
