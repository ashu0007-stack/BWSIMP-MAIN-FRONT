import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// =============================
// ✅ Get all works
// =============================
export const getREPWorks = async () => {
  const response = await axiosInstance.get(`${API_URL}/reports/repworks`);
  return response.data; 
}

export const getREPMilestonesByWorkId = async (workId:string | number) => {
  const { data } = await axiosInstance.get(
    `${API_URL}/reports/repmilstone/work/${workId}`
  );
  return data;
};

export const getREPTenderByWorkId = async (workId:string | number) => {
  const { data } = await axiosInstance.get(
    `${API_URL}/reports/reptender/${workId}`
  );
  return data;
};

export const getREPContractById = async (workId: string | number) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/reports/repcontract/${workId}`);
    
    // Process file data to ensure consistency
    const processContractFiles = (contract: any) => {
      const processFileArray = (arr: any[]) => {
        return arr?.map(item => {
          // Check if document is already a URL or needs processing
          if (item.document && !item.document.startsWith('data:') && !item.document.startsWith('http')) {
            return {
              ...item,
              document: getFileUrl(item.document) // Use the utility function
            };
          }
          return item;
        }) || [];
      };

      return {
        ...contract,
        social_data: processFileArray(contract.social_data || []),
        environmental_data: processFileArray(contract.environmental_data || []),
        work_methodology_data: processFileArray(contract.work_methodology_data || [])
      };
    };

    return processContractFiles(data);
  } catch (error) {
    console.error('Error fetching contract by ID:', error);
    throw error;
  }
};

export const getREPLengthById = async (workId:string | number) => {
  const { data } = await axiosInstance.get(
    `${API_URL}/reports/replength/${workId}`
  );
  return data;
};

export const getFileUrl = (filePath: string) => {
  if (!filePath) return null;
  
  if (filePath.startsWith('data:')) {
    return filePath; // Already a data URL
  }
  
  // Handle base64 strings
  if (/^[A-Za-z0-9+/=]+$/.test(filePath)) {
    return `data:application/pdf;base64,${filePath}`;
  }
  
  // Handle file paths
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}/uploads/${filePath}`;
};