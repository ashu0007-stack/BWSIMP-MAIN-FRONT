import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

// get all division for tender form

const getDivisions = async () => {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/divisions`
    );
    return response.data;
};

type UseDistrictsOptions = {
    enabled?: boolean;
};

export function useDivisions(options?: UseDistrictsOptions) {
    return useQuery({
        queryKey: ["division"],
        queryFn: getDivisions,
        enabled: options?.enabled ?? true,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}



const getDivisionByCircleId = async (circleId:any) => {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/divisions/${circleId}`
    );
    return response.data;
};


export function useDivisionByCircleId(circleId:any) {
    return useQuery({
        queryKey: ["division", circleId],
        queryFn: () => getDivisionByCircleId(circleId),
        enabled:!!circleId,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

const getDivisionByUserId = async (id:any) => {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/divisions/${id}`
    );
    return response.data;
};


export function useDivisionByUserId(divisionId:any) {
    return useQuery({
        queryKey: ["division", divisionId],
        queryFn: () => getDivisionByUserId(divisionId),
        enabled:!!divisionId,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}


