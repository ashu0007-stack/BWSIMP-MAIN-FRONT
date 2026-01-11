import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";


const getSubDivisionByDivisionId = async (divisionId:any) => {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/subdivisions/${divisionId}`
    );
    return response.data;
};


export function useSubDivisionByDivisionId(divisionId:any) {
    return useQuery({
        queryKey: ["cricle", divisionId],
        queryFn: () => getSubDivisionByDivisionId(divisionId),
        enabled:!!divisionId,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

