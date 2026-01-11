// hooks/pim/farmersHooks.ts
import { useQuery } from '@tanstack/react-query';
import { getAllFarmers, getFarmersStatistics, getFarmerById } from '@/services/api/wrdApi/farmersService';

export const useAllFarmers = () => {
  return useQuery({
    queryKey: ['all-farmers'],
    queryFn: getAllFarmers,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFarmersStatistics = () => {
  return useQuery({
    queryKey: ['farmers-statistics'],
    queryFn: getFarmersStatistics,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFarmerById = (id: string) => {
  return useQuery({
    queryKey: ['farmer', id],
    queryFn: () => getFarmerById(id),
    enabled: !!id,
  });
};