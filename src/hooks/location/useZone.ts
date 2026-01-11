import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const getZones = async () => {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/zones`
    );
    return response.data;
};

type UseDistrictsOptions = {
    enabled?: boolean;
};

export function useZones(options?: UseDistrictsOptions) {
    return useQuery({
        queryKey: ["zone"],
        queryFn: getZones,
        enabled: options?.enabled ?? true,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}
