import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Get all WUAs
export const getAllWUAs = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/wua`);
  return data;
};

// ✅ Get all meetings
export const getAllMeetings = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/meetings`);
  return data;
};

// ✅ Get meeting by ID
export const getMeetingById = async (id: string) => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/meetings/${id}`);
  return data;
};

// ✅ Create new meeting
export const createMeeting = async (meetingData: FormData) => {
  const { data } = await axiosInstance.post(`${API_URL}/pim/meetings`, meetingData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ✅ Update meeting
export const updateMeeting = async (id: string, meetingData: FormData) => {
  const { data } = await axiosInstance.put(`${API_URL}/pim/meetings/${id}`, meetingData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ✅ Delete meeting
export const deleteMeeting = async (id: string) => {
  await axiosInstance.delete(`${API_URL}/pim/meetings/${id}`);
};

// ✅ Update meeting status
export const updateMeetingStatus = async (id: string, status: string) => {
  const { data } = await axiosInstance.patch(`${API_URL}/pim/meetings/${id}/status`, { status });
  return data;
};

// ✅ Delete document
export const deleteDocument = async (documentId: string) => {
  await axiosInstance.delete(`${API_URL}/pim/meetings/documents/${documentId}`);
};

// ✅ Download document
export const downloadDocument = async (documentId: string) => {
  const { data } = await axiosInstance.get(`${API_URL}/pim/meetings/documents/download/${documentId}`, {
    responseType: 'blob'
  });
  return data;
};