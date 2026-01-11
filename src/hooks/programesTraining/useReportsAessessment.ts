import { addReportsDocument, grtReportsDocument, grtReportsDocumentById } from "@/services/api/programAPI/reportDocument";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ✅ Fetch all calendars
export const useReportsDocument = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reportsDocument"],   // consistent key
    queryFn: grtReportsDocument,
    retry: false,
    // refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return { data, isLoading, isError, error };
};


// program orfanizing get by id
// ✅ Fetch all calendars
export const useReportsDocumentById = (selectReportAssessmentId: number) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reportsDocument", selectReportAssessmentId],   // consistent key
    queryFn: () => grtReportsDocumentById(selectReportAssessmentId),
    enabled: !!selectReportAssessmentId,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return { data, isLoading, isError, error };
};


// Insert the program organizing
export const useAddreportsDocument = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["reportsDocument"],
    mutationFn: addReportsDocument,
    onSuccess: () => {
      // Refetch the same key used in useCalendar
      queryClient.invalidateQueries({ queryKey: ["reportsDocument"] });
    },
  });

  return { mutate, isPending, isError, error };
};