
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ✅ Get all contracts
export const getAllContracts = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/contracts`);
  return data;
};

export const getWorkstender = async () => {
  const { data } = await axiosInstance.get(`${API_URL}/contracts/getTender`);
  return data;
};

// ✅ Create new contract with proper file handling
export const createContract = async (contractData: any) => {
  // Process files to ensure they're properly formatted
  const processFiles = (data: any[]) => {
    return data.map(item => ({
      ...item,
      document: item.document && !item.document.startsWith('data:') 
        ? `data:application/pdf;base64,${item.document}`
        : item.document
    }));
  };

  const formattedData = {
    ...contractData,
    social_data: processFiles(contractData.social_data || []),
    environmental_data: processFiles(contractData.environmental_data || []),
    work_methodology_data: processFiles(contractData.work_methodology_data || [])
  };

  const { data } = await axiosInstance.post(
    `${API_URL}/contracts`, 
    formattedData,
    {
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
  
  return data;
};

// ✅ Get contract by ID with all related data
export const getContractById = async (id: string | number) => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/contracts/${id}`);
    
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
// ✅ Update contract with proper file handling (Enhanced)
export const updateContract = async (id: string | number, contractData: any) => {
  try {
    // Process files to ensure they're properly formatted
    const processFiles = (data: any[]) => {
      return data.map(item => ({
        ...item,
        document: item.document && !item.document.startsWith('data:') 
          ? `data:application/pdf;base64,${item.document}`
          : item.document
      }));
    };

    const formattedData = {
      ...contractData,
      social_data: processFiles(contractData.social_data || []),
      environmental_data: processFiles(contractData.environmental_data || []),
      work_methodology_data: processFiles(contractData.work_methodology_data || [])
    };

    const { data } = await axiosInstance.put(
      `${API_URL}/contracts/${id}`, 
      formattedData,
      {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    return data;
  } catch (error) {
    console.error('Error updating contract:', error);
    throw error;
  }
};

// ✅ Get file URL utility
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

// ✅ Delete contract
export const deleteContract = async (id: string | number) => {
  const { data } = await axiosInstance.delete(`${API_URL}/contracts/${id}`);
  return data;
};

// ✅ Download document
export const downloadDocument = async (documentData: string) => {
  try {
    let url = documentData;
    
    // If it's a base64 string without data URL prefix
    if (/^[A-Za-z0-9+/=]+$/.test(documentData) && !documentData.startsWith('data:')) {
      url = `data:application/pdf;base64,${documentData}`;
    }
    
    return url;
  } catch (error) {
    console.error('Error preparing download:', error);
    throw error;
  }
};