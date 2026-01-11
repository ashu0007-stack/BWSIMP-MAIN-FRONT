import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  updateMeetingStatus,
  deleteDocument,
} from "@/services/api/wrdApi/pim/meetingApi";

/* -----------------------------------
   🟢 WUA HOOKS
----------------------------------- */

// ✅ Fetch all WUAs
// export function useWUAs() {
//   return useQuery({
//     queryKey: ["wua"],
//     queryFn: getAllWUAs,
//   });
// }

/* -----------------------------------
   📊 MEETING HOOKS
----------------------------------- */

// ✅ Fetch all meetings
export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: getAllMeetings,
  });
}

// ✅ Fetch meeting by ID
export function useMeeting(id: string) {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => getMeetingById(id),
    enabled: !!id,
  });
}

// ✅ Create new meeting
export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      toast.success("✅ Meeting created successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to create meeting");
    },
  });
}

// ✅ Update meeting
export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateMeeting(id, data),
    onSuccess: () => {
      toast.success("✅ Meeting updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to update meeting");
    },
  });
}

// ✅ Delete meeting
export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      toast.success("✅ Meeting deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to delete meeting");
    },
  });
}

// ✅ Update meeting status
export function useUpdateMeetingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateMeetingStatus(id, status),
    onSuccess: () => {
      toast.success("✅ Meeting status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to update meeting status");
    },
  });
}

// ✅ Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success("✅ Document deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "❌ Failed to delete document");
    },
  });
}