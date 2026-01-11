import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getAllWUAs,
  createWUA,
  createWUAVillages,
  createVLC,
  getAllVLCs,
} from "@/services/api/wrdApi/pim/wuaApi"; // 👈 same API file se import

/* -----------------------------------
   🟢 WUA HOOKS
----------------------------------- */

// ✅ Fetch all WUAs
export function useWUAs() {
  return useQuery({
    queryKey: ["wua"],
    queryFn: getAllWUAs,
  });
}

// ✅ Create new WUA
export function useCreateWUA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData , villages }: any) => {
      
      const wua = await createWUA(formData);
      const wuaId = wua.id;

      if (villages?.length > 0) {
        const validVillages = villages
          .filter((v: any) => v.village_name)
          .map((v: any) => ({ ...v, wua_id: wuaId }));

        await createWUAVillages(validVillages);
      }

      return wua;
    },
    onSuccess: () => {
      toast.success("✅ WUA created successfully!");
      queryClient.invalidateQueries({ queryKey: ["wua"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to create WUA");
    },
  });
}

/* -----------------------------------
   🔵 VLC HOOKS
----------------------------------- */

// ✅ Fetch all VLCs
export function useVLCs() {
  return useQuery({
    queryKey: ["vlc"],
    queryFn: getAllVLCs,
  });
}

// ✅ Create new VLC
export function useCreateVLC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, gbMembers, executiveMembers }: any) => {
      // 🔹 Call createVLC API
      const vlc = await createVLC({
        ...formData,
        gb_members: gbMembers,
        executive_members: executiveMembers,
      });

      return vlc;
    },
    onSuccess: () => {
      toast.success("✅ VLC created successfully!");
      queryClient.invalidateQueries({ queryKey: ["vlc"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to create VLC");
    },
  });
}
