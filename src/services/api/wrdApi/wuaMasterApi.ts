
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";


// WUA Master APIs
export const getWUAMaster = async () => 
  (await axiosInstance.get(`${API_URL}/wua`)).data;

export const getWUAMasterById = async (id: any) => 
  (await axiosInstance.get(`${API_URL}/wua/${id}`)).data;


export const getWUAMasterforSLcById = async (id: any) => 
  (await axiosInstance.get(`${API_URL}/wua/wuaslc/${id}`)).data;

export const getWUAMasterWithStatus = async () => 
  (await axiosInstance.get(`${API_URL}/wua/with-status`)).data;

export const getWUAMasterStats = async () => 
  (await axiosInstance.get(`${API_URL}/wua/stats`)).data;

export const searchWUAMaster = async (query: any) => 
  (await axiosInstance.get(`${API_URL}/wua/search?q=${query}`)).data;

export const createWUAMaster = async (data: any) => 
  (await axiosInstance.post(`${API_URL}/wua`, data)).data;

export const updateWUAMaster = async (id: any, data: any) => 
  (await axiosInstance.put(`${API_URL}/wua/${id}`, data)).data;

export const deleteWUAMaster = async (id: any) => 
  (await axiosInstance.delete(`${API_URL}/wua/${id}`)).data;

// VLC APIs
export const createVLC = async (data: any) => 
  (await axiosInstance.post(`${API_URL}/wua/vlc`, data)).data;

export const getVLCsByWUA = async (wuaId: any) => 
  (await axiosInstance.get(`${API_URL}/wua/vlc/wua/${wuaId}`)).data;

export const getVLCById = async (id: any) => 
  (await axiosInstance.get(`${API_URL}/wua/vlc/${id}`)).data;

export const updateVLCStatus = async (id: any, status: any) => 
  (await axiosInstance.patch(`${API_URL}/wua/vlc/${id}/status`, { status })).data;

// SLC APIs
export const createSLC = async (data: any) => 
  (await axiosInstance.post(`${API_URL}/slc`, data)).data;

export const getSLCsByWUA = async (wuaId: any) => 
  (await axiosInstance.get(`${API_URL}/slc/wua/${wuaId}`)).data;

export const getSLCById = async (id: any) => 
  (await axiosInstance.get(`${API_URL}/slc/${id}`)).data;

export const updateSLC = async (id: any, data: any) => 
  (await axiosInstance.put(`${API_URL}/slc/${id}`, data)).data;

export const updateSLCStatus = async (id: any, status: any) => 
  (await axiosInstance.patch(`${API_URL}/slc/${id}/status`, { status })).data;

export const getWUAsWithVLCs = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/wua/with-vlcs`);
    return response.data;
  } catch (error) {
    return { success: false };
  }
};

export const getWUAsWithBothVLCandSLC = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/wua/with-both-vlc-slc`);
    return response.data;
  } catch (error) {
    return { success: false};
  }
};

// ✅ CORRECTED: Rename API function (remove "use" prefix)
export const createPIMWUA = async (data: any) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/wua/create`, data);
    return response.data;
  } catch (error) {
    const err = error as any;
    return { 
      success: false, 
      error: err.response?.data?.error || err.message 
    };
  }
};
export const getAllWUAs = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/wua/all`);
  return data;
};

