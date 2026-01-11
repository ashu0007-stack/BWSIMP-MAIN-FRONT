// api/dashboardApi.js
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Dashboard APIs
export const getDashboardData = async () => 
  (await axiosInstance.get(`${API_URL}/dashboard`)).data;

export const getDashboardKPIs = async () => 
  (await axiosInstance.get(`${API_URL}/dashboard/kpis`)).data;

export const getCompletionDistribution = async () => 
  (await axiosInstance.get(`${API_URL}/dashboard/distribution`)).data;

export const getRecentActivities = async () => 
  (await axiosInstance.get(`${API_URL}/dashboard/activities`)).data;

export const getPerformanceMetrics = async () => 
  (await axiosInstance.get(`${API_URL}/dashboard/performance`)).data;