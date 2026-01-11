import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

// Interfaces (same as in your component)
interface Document {
  id: number;
  document_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_extension: string;
  upload_date: string;
  remarks: string;
  uploaded_by: string;
  is_final: boolean;
  component_id: number;
  component_name: string;
  discipline_id: number;
  discipline_name: string;
  document_type_id: number;
  document_type: string;
  version_control: string;
  created_at: string;
  folder_structure?: string;
}

interface Component {
  id: number;
  component_name: string;
}

interface Discipline {
  component_id: any;
  id: number;
  discipline_name: string;
}

interface DocumentType {
  id: number;
  type_name: string;
}

interface MasterData {
  components: Component[];
  disciplines: Discipline[];
  documentTypes: DocumentType[];
  versions: string[];
}

interface SharePermission {
  id: number;
  user_email: string;
  permission_type: string;
  share_token: string;
  expires_at: string;
  created_at: string;
  is_active: boolean;
  created_by_name: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  user_level_name?: string;
  district_name?: string;
  permissions: JSON; 
}

interface ShareData {
  userEmail: string;
  permissionType: 'view' | 'download' | 'both';
  expiresInHours: number;
}

interface UploadData {
  file: File;
  documentName: string;
  remarks: string;
  componentId: number | "";
  disciplineId: number | "";
  documentTypeId: number | "";
  versionControl: string;
  isFinal: boolean;
  userId: number;
  userName: string;
  userEmail: string;
}

// API Base URL - NO CHANGES
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get safe URL - WITHOUT HARDCODED FALLBACK
const getSafeUrl = (path: string = ''): string => {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
  }
  return path ? `${API_URL}/${path.replace(/^\//, '')}` : API_URL;
};

// Custom Hook
export const useDms = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [masterData, setMasterData] = useState<MasterData>({
    components: [],
    disciplines: [],
    documentTypes: [],
    versions: ['P0', 'R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'Final']
  });
  const [documentPermissions, setDocumentPermissions] = useState<SharePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // API Functions - USING getSafeUrl
 const api = useMemo(() => ({
    // Fetch all documents
    fetchDocuments: async (): Promise<Document[]> => {
      try {
        const url = getSafeUrl('dms');
        console.log("Fetching documents from:", url);
        const response = await axios.get(url);
        console.log("Documents fetched:", response.data.length);
        return response.data;
      } catch (err: any) {
        console.error("Fetch documents failed:", err.message);
        throw new Error(err.response?.data?.message || "Failed to fetch documents");
      }
    },

    // Fetch master data - NO HARDCODED FALLBACK
    fetchMasterData: async (): Promise<MasterData> => {
      try {
        const url = getSafeUrl('dms/masters');
        console.log("Fetching master data from:", url);
        const response = await axios.get(url);
        console.log("Master data fetched:", response.data);
        return response.data;
      } catch (err: any) {
        console.error("Fetch master data failed:", err.message);
        // Return empty arrays if API fails - NO HARDCODED DATA
        return {
          components: [],
          disciplines: [],
          documentTypes: [],
          versions: ['P0', 'R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'Final']
        };
      }
    },

    // Upload document
    uploadDocument: async (uploadData: UploadData, onProgress?: (progress: number) => void): Promise<any> => {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("documentName", uploadData.documentName);
      formData.append("remarks", uploadData.remarks);
      formData.append("componentId", uploadData.componentId.toString());
      formData.append("disciplineId", uploadData.disciplineId.toString());
      formData.append("documentTypeId", uploadData.documentTypeId.toString());
      formData.append("versionControl", uploadData.versionControl);
      formData.append("isFinal", uploadData.isFinal.toString());
      formData.append("userId", uploadData.userId.toString());
      formData.append("userName", uploadData.userName);
      formData.append("userEmail", uploadData.userEmail);

      console.log("👤 Uploading as user:", uploadData.userName);

      try {
        const url = getSafeUrl('dms/upload');
        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / (event.total || 1));
            onProgress?.(percent);
          },
        });

        console.log("Upload response:", response.data);
        return response.data;
      } catch (err: any) {
        console.error("Upload failed:", err);
        let errorMessage = "Upload failed. Please try again.";

        if (err.response) {
          console.error("Response error:", err.response.data);
          errorMessage = err.response.data.error || err.response.data.message || errorMessage;
        } else if (err.request) {
          console.error("No response received:", err.request);
          errorMessage = "No response from server. Please check if the server is running.";
        }

        throw new Error(errorMessage);
      }
    },

    // Delete document
    deleteDocument: async (id: number): Promise<void> => {
      try {
        const url = getSafeUrl(`dms/${id}`);
        await axios.delete(url);
      } catch (err: any) {
        console.error("Delete failed:", err);
        throw new Error(err.response?.data?.message || "Failed to delete document");
      }
    },

    // Share document
    shareDocument: async (documentId: number, shareData: ShareData, userId: number): Promise<any> => {
      try {
        console.log("🔗 Sharing document:", documentId);
        console.log("👤 Current user:", userId);
        console.log("📧 Share data:", shareData);

        const url = getSafeUrl(`dms/documents/${documentId}/share`);
        const response = await axios.post(url, {
          ...shareData,
          userId: userId
        });

        console.log("✅ Share response:", response.data);
        return response.data;
      } catch (err: any) {
        console.error("❌ Share failed:", err);
        throw new Error(err.response?.data?.error || err.message || "Failed to share document");
      }
    },

    // Get document permissions
    getDocumentPermissions: async (documentId: number): Promise<SharePermission[]> => {
      try {
        console.log("🔍 Fetching permissions for document:", documentId);
        
        const url = getSafeUrl(`dms/documents/${documentId}/permissions`);
        const response = await axios.get(url);
        
        if (response.data.success) {
          console.log("✅ Permissions fetched successfully:", response.data.permissions.length);
          return response.data.permissions;
        } else {
          throw new Error(response.data.error || "Failed to fetch permissions");
        }
      } catch (err: any) {
        console.error("❌ Failed to fetch permissions:", err);
        
        if (err.response) {
          throw new Error(`Server error: ${err.response.data.error || err.response.statusText}`);
        } else if (err.request) {
          throw new Error("No response from server. Please check if the server is running.");
        } else {
          throw new Error("Error fetching permissions: " + err.message);
        }
      }
    },

    // Revoke permission
    revokePermission: async (permissionId: number): Promise<void> => {
      try {
        const url = getSafeUrl(`dms/permissions/${permissionId}`);
        await axios.delete(url);
      } catch (err: any) {
        console.error("Failed to revoke permission:", err);
        throw new Error(err.response?.data?.message || "Failed to revoke permission");
      }
    }
  }), []); // Empty dependency array to memoize once

  // Hook Functions
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const docs = await api.fetchDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  }, [api]);


const loadMasterData = useCallback(async () => {
    try {
      const data = await api.fetchMasterData();
      setMasterData(data);
    } catch (err: any) {
      console.error("Error loading master data:", err);
      // Set empty arrays if API fails
      setMasterData({
        components: [],
        disciplines: [],
        documentTypes: [],
        versions: ['P0', 'R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'Final']
      });
    }
}, [api]);

  const loadDocumentPermissions = async (documentId: number) => {
    try {
      const permissions = await api.getDocumentPermissions(documentId);
      setDocumentPermissions(permissions);
    } catch (err: any) {
      console.error("Error loading permissions:", err);
      setDocumentPermissions([]);
    }
  };

  const uploadDocument = async (uploadData: UploadData, onProgress?: (progress: number) => void): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      await api.uploadDocument(uploadData, onProgress);
      await loadDocuments(); // Refresh the documents list
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: number): Promise<boolean> => {
    setError("");
    try {
      await api.deleteDocument(id);
      await loadDocuments(); // Refresh the documents list
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const shareDocument = async (documentId: number, shareData: ShareData, userId: number): Promise<any> => {
    setError("");
    try {
      const result = await api.shareDocument(documentId, shareData, userId);
      await loadDocumentPermissions(documentId); // Refresh permissions
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const revokePermission = async (permissionId: number, documentId?: number): Promise<boolean> => {
    setError("");
    try {
      await api.revokePermission(permissionId);
      if (documentId) {
        await loadDocumentPermissions(documentId); // Refresh permissions
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Initialize data
  useEffect(() => {
    loadDocuments();
    loadMasterData();
  }, [loadDocuments, loadMasterData]);

  return {
    // State
    documents,
    masterData,
    documentPermissions,
    loading,
    error,
    
    // Actions
    loadDocuments,
    loadMasterData,
    loadDocumentPermissions,
    uploadDocument,
    deleteDocument,
    shareDocument,
    revokePermission,
    
    // API functions (direct access if needed)
    api
  };
};

// User management hook - WITHOUT DEMO USER
export const useUser = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);

 const getCurrentUser = useCallback(async (): Promise<UserData | null> => {
  try {
    const stored = sessionStorage.getItem("userdetail");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const userData: UserData = {
          id: parsed.id,
          name: parsed.username || parsed.email || "User",
          email: parsed.email,
          role: parsed.role || "user",
          department: parsed.department,
          designation: parsed.designation || "N/A",
          user_level_name: parsed.user_level_name,
          district_name: parsed.district_name,
          permissions: parsed.permissions || [], 
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return userData;
      } catch (error) {
        console.error("❌ Error parsing OAuth data:", error);
      }
    }

    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      return JSON.parse(localUser);
    }

    return null;
  } catch (error) {
    console.error("❌ Error getting current user:", error);
    return null;
  }
}, []); // No dependencies needed here

 const initializeUser = useCallback(async () => {
  setUserLoading(true);
  const user = await getCurrentUser();
  setCurrentUser(user);
  setUserLoading(false);
}, [getCurrentUser]);

  // Automatically initialize user on hook mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const clearUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem("userdetail");
  };

  return {
    currentUser,
    userLoading,
    initializeUser,
    clearUser,
    getCurrentUser
  };
};