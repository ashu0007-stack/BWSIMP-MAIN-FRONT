import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const getCircles = async () => {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/circles`
    );
    return response.data;
};

type UseDistrictsOptions = {
    enabled?: boolean;
};


export function useCircles (options?: UseDistrictsOptions) {
    return useQuery({
        queryKey: ["circle"],
        queryFn: getCircles,
        enabled: options?.enabled ?? true,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}



const getCirclesByZoneId = async (zoneId:any) => {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/circles/${zoneId}`
    );
    return response.data;
};


export function useCirclesByZoneId(zoneId:any) {
    return useQuery({
        queryKey: ["cricle", zoneId],
        queryFn: () => getCirclesByZoneId(zoneId),
        enabled:!!zoneId,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

