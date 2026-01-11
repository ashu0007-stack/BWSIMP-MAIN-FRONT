import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Components
export const fetchComponents = async () => {
  const res = await axiosInstance.get(`${API_URL}/master/components`);
  return res.data;
};

export const createComponent = async (data: { component_name: string }) => {
  const res = await axiosInstance.post(`${API_URL}/master/components`, data);
  return res.data;
};

// ✅ Subcomponents
export const fetchAllSubcomponents = async () => {
  const res = await axiosInstance.get(`${API_URL}/master/subcomponents`);
  return res.data;
};

export const fetchSubcomponentsByComponentId = async (componentId: number) => {
  const res = await axiosInstance.get(`${API_URL}/master/subcomponents/${componentId}`);
  return res.data;
};

export const fetchgetSubworkcomponentsByworkComponentId = async (workcomponentId: number) => {
  console.log("Fetching subworkcomponents for workcomponentId:", workcomponentId);
  const res = await axiosInstance.get(`${API_URL}/master/subworkcomponents/${workcomponentId}`);
  console.log("API Response data:", res.data);
  return res.data;
};

export const createSubcomponent = async (data: { work_component_name: string; component_id: number }) => {
  const res = await axiosInstance.post(`${API_URL}/master/subcomponents`, data);
  return res.data;
};

