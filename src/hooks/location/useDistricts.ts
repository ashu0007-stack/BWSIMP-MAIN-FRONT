import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const getDistricts = async () => {
  const response = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_URL}/location/districts`
  );
  return response.data;
};

type UseDistrictsOptions = {
  enabled?: boolean;
};

export function useDistricts(options?: UseDistrictsOptions) {
  return useQuery({
    queryKey: ["districts"],
    queryFn: getDistricts,
    enabled: options?.enabled ?? true,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
