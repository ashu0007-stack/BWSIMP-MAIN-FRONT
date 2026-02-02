// services/api/pdoApi.ts
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

// =======================
// GET APIs
// =======================

export const getPDOWorks = async () => {
  const res = await axiosInstance.get("/pdo/allworks");
  return res.data;
};

export const getPDOIndicators = async () => {
  const res = await axiosInstance.get("/pdo/indicators");
  return res.data;
};

export const getPDOSummary = async () => {
  const res = await axiosInstance.get("/pdo/summary");
  return res.data;
};

export const getPDOIndicatorsByWork = async (workId: number | string) => {
  const res = await axiosInstance.get(`/pdo/work-indicators/${workId}`);
  return res.data;
};

export const getPDOProgressByWork = async (workId: number | string) => {
  const res = await axiosInstance.get(`/pdo/progress/work/${workId}`);
  return res.data;
};

// =======================
// MUTATION APIs
// =======================

export const createPDOProgress = async (data: any) => {
  const res = await axiosInstance.post("/pdo/progress", data);
  return res.data;
};

export const updatePDOProgress = async (id: number, data: any) => {
  const res = await axiosInstance.put(`/pdo/progress/${id}`, data);
  return res.data;
};

export const deletePDOProgress = async (id: number) => {
  const res = await axiosInstance.delete(`/pdo/progress/${id}`);
  return res.data;
};

export const mapWorkToPDO = async (data: any) => {
  const res = await axiosInstance.post("/pdo/map-work", data);
  return res.data;
};

export const getWorkMappings = async (workId: number | string) => {
  const res = await axiosInstance.get(`/pdo/work-mappings/${workId}`);
  return res.data;
};
