import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const getClusterByBlock = async (blockId: number) => {
  // const token = JSON.parse(`${sessionStorage.getItem("OAuthCredentials")}`);

  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/location/clusters/`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token.authToken}`,
    // },
     params: {
      block: blockId, // ✅ now uses ?district=207 format
    },
  });

  return response.data;
};

export function useClusters(blockId?: number) {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["clusters", blockId],
    queryFn: () => getClusterByBlock(blockId!),
    enabled: !!blockId,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isPending, isError, data, error };
}
