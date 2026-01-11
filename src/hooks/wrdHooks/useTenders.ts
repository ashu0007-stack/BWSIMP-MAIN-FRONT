
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  saveTender,
  getTenderByWorkId, 
  getAllTenders, 
  getFileUrl,
  getTenderLogs,
  TenderLog,
  TenderResponse
} from "@/services/api/wrdApi/tenderApi";

// ✅ Fetch all tenders
export const useTenders = () =>
  useQuery<TenderResponse[]>({
    queryKey: ["tenders"],
    queryFn: getAllTenders,
  });

// ✅ Fetch tender by workId
export const useTenderByWorkId = (workId: number | string) =>
  useQuery({
    queryKey: ["tender", workId],
    queryFn: () => getTenderByWorkId(workId),
    enabled: !!workId,
  });

// ✅ Save/Create/Update tender 
export const useSaveTender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tenderData: FormData) => saveTender(tenderData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      
      // If it's a new tender, also invalidate any related queries
      if (response.tenderId) {
        queryClient.invalidateQueries({ queryKey: ["tender", response.tenderId] });
      }
    },
    onError: (error: any) => {
      console.error("Error saving tender:", error);
      throw error;
    },
  });
};

// ✅ Fetch tender logs
export const useTenderLogs = (tenderId: number | null) => 
  useQuery<TenderLog[]>({
    queryKey: ["tender-logs", tenderId],
    queryFn: () => tenderId ? getTenderLogs(tenderId) : Promise.resolve([]),
    enabled: !!tenderId,
  });

// ✅ Get file URL hook
export const useFileUrl = () => {
  return getFileUrl;
};

