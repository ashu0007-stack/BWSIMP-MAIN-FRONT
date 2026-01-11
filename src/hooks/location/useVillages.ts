import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const getVillagesByCluster = async (clusterCode: number) => {
  // const token = JSON.parse(`${sessionStorage.getItem("OAuthCredentials")}`);

  const response = await axiosInstance({
    method: "GET",
    url: `${process.env.NEXT_PUBLIC_API_URL}/location/villages/`,
    // headers: {
    //   "Content-Type": "application/json",
    //   Authorization: `Bearer ${token.authToken}`,
    // },
    params: {
      cluster: clusterCode, // ✅ backend expects ?cluster=<code>
    },
  });

  return response.data;
};

export function useVillages(clusterCode?: number) {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["villages", clusterCode],
    queryFn: () => getVillagesByCluster(clusterCode!),
    enabled: !!clusterCode, // ✅ only runs when clusterCode is available
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { isPending, isError, data, error };
}
