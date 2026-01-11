import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllWorks,
  getPackageProgress,
  addProgressEntry,
} from "@/services/api/wrdApi/lengthApi";

// ✅ Hook to fetch all works
export const useWorks = () =>
  useQuery({
    queryKey: ["works"],
    queryFn: getAllWorks,
  });

// ✅ Hook to fetch progress of a package
export const usePackageProgress = (packageNumber: string | null) =>
  useQuery({
    queryKey: ["progress", packageNumber],
    queryFn: () =>
      packageNumber
        ? getPackageProgress(packageNumber)
        : Promise.resolve({ target_km: 0, progress: [] }),
    enabled: !!packageNumber,
  });

// ✅ Hook to add a progress entry (fixed for React Query v5+)
export const useAddProgressEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProgressEntry,
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["progress", variables.packageNumber] });
    },
  });
};
