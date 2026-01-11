import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getAllSLCs, createSLC } from "@/services/api/wrdApi/pim/slcApi";

/* -----------------------------------
   🟢 SLC HOOKS
----------------------------------- */
export interface SLCSubmitData {
  wua_id: string;
  slc_name: string;
  section: string;
  subdivision: string;
  circle: string;
  zone: string;
  formation_date: string;
  last_election_date: string;
  next_election_date: string;
  vlc_chairmen: Array<{
    id?: number;
    name: string;
    vlc_represented: string;
    is_executive?: boolean;
  }>;
  executive_members: Array<{
    name: string;
    vlc_represented: string;
    designation: 'Member' | 'Chairman' | 'Vice President' | 'Secretary' | 'Treasurer';
    election_date: string;
  }>;
  water_tax_details: {
    year: number;
    kharif_tax: string;
    rabi_tax: string;
    total_tax: string;
    deposited_govt: string;
    retained_wua: string;
    expenditure: string;
    balance: string;
  };
}
// ✅ Fetch all SLCs
export function useSLCs() {
  return useQuery({
    queryKey: ["slc"],
    queryFn: getAllSLCs,
  });
}

// ✅ Create new SLC
export function useCreateSLC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slcData: any) => {
      const response = await createSLC(slcData);
      return response;
    },
    onSuccess: () => {
      toast.success("✅ SLC created successfully!");
      queryClient.invalidateQueries({ queryKey: ["slc"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to create SLC");
    },
  });
}

