import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getREPWorks, getREPMilestonesByWorkId,getREPTenderByWorkId,getREPContractById, getREPLengthById } from "@/services/api/wrdApi/reports/reportApi";

export const useRepWorks = () => {
  return useQuery({
    queryKey: ["works"],
    queryFn: getREPWorks,
  });
};

export const useREPMilestones = (workId:number | string) =>
  useQuery({
    queryKey: ["workMilestones", workId],
    queryFn: () => getREPMilestonesByWorkId(workId),
    enabled: !!workId,
    select: (data) => data || [],
  });

export const useREPTender = (workId: string | number) =>
  useQuery({
    queryKey: ["repTender", workId],
    queryFn: () => getREPTenderByWorkId(workId),
    enabled: !!workId, // 🔥 very important
  });

  export const useREPContract = (workId: string | number ) => {
    return useQuery({
      queryKey: ["repContract", workId],
      queryFn: () => getREPContractById(workId!),
      enabled: !!workId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  

  export const useREPLength = (workId: string | number ) =>
  useQuery({
    queryKey: ["repLength", workId],
    queryFn: () => getREPLengthById(workId),
    enabled: !!workId, // 🔥 very important
  });


  