import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";


const getSectionBySubDivisionId = async (subDivisionId:any) => {
    const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/location/sections/${subDivisionId}`
    );
    return response.data;
};


export function useSectionBySubDivisionId(subDivisionId:any) {
    return useQuery({
        queryKey: ["cricle", subDivisionId],
        queryFn: () => getSectionBySubDivisionId(subDivisionId),
        enabled:!!subDivisionId,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

