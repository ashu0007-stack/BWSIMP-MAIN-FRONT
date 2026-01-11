

import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Type for log entry
export interface TenderLog {
  id: number;
  tender_id: number;
  action_type: 'DRAFT_SAVE' | 'FINAL_SUBMIT' | 'UPDATE' | 'DELETE' | 'DRAFT_UPDATE';
  user_id: number | null;
  user_name: string;
  log_data: string; // JSON string
  log_timestamp: string;
}

// ✅ Type for Tender response (matching your database fields)
export interface TenderResponse {
  zone_id: number;
  circle_id: number;
  id: number;
  division_name: string;
  work_name: string;
  tenderRefNo: string;
  agreement_no: string;
  tenderAuthority: string;
  emdfee: string;
  bid_security: string;
  tenderValidity: string;
  newspaperdetails?: string;
  nitfile?: string;
  corrigendumUpload?: string;
  financialEvaluation?: string;
  loaUpload?: string;
  contractUpload?: string;
  remark?: string;
  status: 'draft' | 'submitted' | 'finalized';
  createdAt?: string;
  updatedAt?: string;
  division_id?: number;
  work_id?: number;
}

// ✅ Create or Update tender (with FormData for file upload)
export const saveTender = async (tenderData: FormData) => {
  try {
    console.log("📤 Sending tender data to API...");
    
    // Log form data entries (excluding files for cleaner logs)
    const entries: {[key: string]: any} = {};
    for (const [key, value] of tenderData.entries()) {
      // Skip file fields for cleaner logs
      const fileFields = [
        'newspaper_file', 'nit_file', 'sale_file', 'pre_bid_file', 
        'corrigendum_file', 'bids_file', 'tech_open_file', 'tech_eval_file', 
        'financial_eval_file', 'loa_file', 'contract_file'
      ];
      
      if (!fileFields.includes(key)) {
        entries[key] = value;
      } else if (value instanceof File) {
        entries[key] = `File: ${value.name}`;
      }
    }
    console.log("📝 FormData entries:", entries);

    const response = await axiosInstance.post(`${API_URL}/tenders`, tenderData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log("✅ Tender saved successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error saving tender:", error);
    
    // Extract error message from response
    let errorMessage = 'Error saving tender';
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMessage = errorData.error || errorData.details || errorData.message || 'Unknown server error';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// ✅ Get tender info by workId
export const getTenderByWorkId = async (workId: number | string) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/tenders/work/${workId}`);
    return data;
  } catch (error) {
    console.error("Error fetching tender by workId:", error);
    throw error;
  }
};

// ✅ Get all tenders
export const getAllTenders = async (): Promise<TenderResponse[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/tenders`);
    console.log("✅ Tenders API Response:", response);
    
    // Check if data exists
    if (!response.data) {
      console.warn("⚠️ No data returned from API");
      return [];
    }
    
    // API response is an object with data property
    if (response.data && typeof response.data === 'object' && response.data.success && Array.isArray(response.data.data)) {
      const dataArray = response.data.data as TenderResponse[];
      console.log("✅ Tenders API Response count:", dataArray?.length || 0);
      
      // Transform the data if needed to match frontend expectations
      const transformedData = dataArray.map((tender: TenderResponse) => ({
        ...tender,
        tender_ref_no: tender.tenderRefNo,
        agreement_number: tender.agreement_no,
        authority: tender.tenderAuthority,
        work_cost: tender.emdfee,
        validity: tender.tenderValidity,
        circle_id: tender.circle_id || (tender as any).circle_id,
        zone_id: tender.zone_id || (tender as any).zone_id,
      }));
      
      return transformedData;
    }
    
    // If response structure is different
    if (response.data.error) {
      console.error("❌ API returned error:", response.data.error);
      throw new Error(response.data.error);
    }
    
    console.warn("⚠️ Unexpected API response format, returning empty array");
    return [];
  } catch (error: any) {
    console.error("❌ Error fetching tenders:", error);
    
    if (error.response) {
      console.error("❌ Server responded with error:", error.response.status, error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      console.error("❌ No response received:", error.request);
      throw new Error("No response from server. Please check your network connection.");
    } else {
      console.error("❌ Request setup error:", error.message);
      throw error;
    }
  }
};

// ✅ Get logs for a specific tender
export const getTenderLogs = async (tenderId: number): Promise<TenderLog[]> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/tenders/logs/${tenderId}`);
    
    // Check if data exists and is an array
    if (!response.data) {
      console.warn("⚠️ No log data returned from API");
      return [];
    }
    
    if (!Array.isArray(response.data)) {
      console.warn("⚠️ Log API response is not an array:", typeof response.data, response.data);
      
      // If it's an object with data property
      if (response.data && typeof response.data === 'object' && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data as TenderLog[];
      }
      
      return [];
    }
    
    return response.data as TenderLog[];
  } catch (error) {
    console.error("Error fetching tender logs:", error);
    throw error;
  }
};

// ✅ Get file URL with better error handling
export const getFileUrl = (filename: string | null | undefined): string => {
  if (!filename || filename.trim() === "" || filename === "null" || filename === "undefined") {
    return "#";
  }
  
  // Clean up filename (remove any leading/trailing slashes)
  const cleanFilename = filename.replace(/^\/+|\/+$/g, '');
  
  // Handle different filename formats that might come from database
  let finalFilename = cleanFilename;
  
  // If filename is already a full URL, return it
  if (cleanFilename.startsWith('http://') || cleanFilename.startsWith('https://')) {
    return cleanFilename;
  }
  
  // If filename is just a filename without path, construct the full URL
  if (!cleanFilename.includes('/')) {
    finalFilename = `${API_URL.replace('/api', '')}/uploads/documents/${cleanFilename}`;
  }
  
  return finalFilename;
};