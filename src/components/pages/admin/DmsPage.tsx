// DmsPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, FileText, File, Download, Eye, X, CloudUpload, Search, Folder, Calendar, User, Share, Settings } from "lucide-react";
import { useDms, useUser } from '../../../hooks/useDms';
import Select from 'react-select';

// Interfaces
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

interface ShareData {
  userEmail: string;
  permissionType: 'view' | 'download' | 'both';
  expiresInHours: number;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  onShare: (data: ShareData) => void;
  currentUser: any;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  permissions: any[];
  onRevoke: (permissionId: number) => void;
  currentUser: any;
}

interface Discipline {
  id: number;
  discipline_name: string;
  component_id: number;
}

// Custom styles for React Select
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    border: '2px solid #d1d5db',
    borderRadius: '12px',
    padding: '4px 8px',
    minHeight: '52px',
    boxShadow: 'none',
    '&:hover': {
      border: '2px solid #3b82f6',
    },
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    padding: '10px 16px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#3b82f6',
      color: 'white'
    }
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 20,
  }),
  menuList: (base: any) => ({
    ...base,
    padding: '8px',
    borderRadius: '12px',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#9ca3af',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#374151',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base: any, state: any) => ({
    ...base,
    color: state.isFocused ? '#3b82f6' : '#9ca3af',
    '&:hover': {
      color: '#3b82f6',
    },
  }),
  clearIndicator: (base: any) => ({
    ...base,
    color: '#9ca3af',
    '&:hover': {
      color: '#ef4444',
    },
  }),
};

// Share Modal Component
const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, document, onShare, currentUser }) => {
  const [email, setEmail] = useState("");
  const [permissionType, setPermissionType] = useState<'view' | 'download' | 'both'>('view');
  const [expiresInHours, setExpiresInHours] = useState(24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShare({
      userEmail: email,
      permissionType,
      expiresInHours
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Sharing: <strong>{document.document_name}</strong></p>
          {currentUser && (
            <p className="text-xs text-gray-500">Sharing as: {currentUser.name}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address to share with"
              className="w-full border-gray-300 border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Type
            </label>
            <select
              value={permissionType}
              onChange={(e) => setPermissionType(e.target.value as any)}
              className="w-full border-gray-300 border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="view">View Only</option>
              <option value="download">Download</option>
              <option value="both">View & Download</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Expires In
            </label>
            <select
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(Number(e.target.value))}
              className="w-full border-gray-300 border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 Hour</option>
              <option value={24}>24 Hours</option>
              <option value={168}>7 Days</option>
              <option value={720}>30 Days</option>
              <option value={0}>Never</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Generate Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Permissions Management Component
const PermissionsModal: React.FC<PermissionsModalProps> = ({ 
  isOpen, 
  onClose, 
  document, 
  permissions, 
  onRevoke, 
  currentUser 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sharing Permissions - {document.document_name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser && (
          <p className="text-sm text-gray-600 mb-4">Managed by: {currentUser.name}</p>
        )}

        {permissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sharing permissions set for this document
          </div>
        ) : (
          <div className="space-y-3">
            {permissions.map((permission) => (
              <div key={permission.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{permission.user_email}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>Permission: {permission.permission_type}</span>
                      <span>Created: {new Date(permission.created_at).toLocaleDateString()}</span>
                      {permission.expires_at && (
                        <span>Expires: {new Date(permission.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Shared by: {permission.created_by_name}
                    </p>
                  </div>
                  <button
                    onClick={() => onRevoke(permission.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                  >
                    Revoke
                  </button>
                </div>
                {permission.share_token && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-600 break-all">
                      Share URL: {window.location.origin}/shared/{permission.share_token}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DmsPage: React.FC = () => {
  // Use custom hooks
  const {
    documents,
    masterData,
    documentPermissions,
    loading: dmsLoading,
    error: dmsError,
    uploadDocument,
    deleteDocument,
    shareDocument,
    loadDocumentPermissions,
    revokePermission
  } = useDms();

  const {
    currentUser,
    userLoading,
    clearUser
  } = useUser();

  // Component state
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Form fields with React Select compatible format
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<any>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>({ value: "R0", label: "R0" });
  const [isFinal, setIsFinal] = useState(false);

  // Options for dropdowns
  const [componentOptions, setComponentOptions] = useState<any[]>([]);
  const [disciplineOptions, setDisciplineOptions] = useState<any[]>([]);
  const [filteredDisciplineOptions, setFilteredDisciplineOptions] = useState<any[]>([]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState<any[]>([]);
  const [versionOptions, setVersionOptions] = useState<any[]>([]);

  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize dropdown options from masterData
  useEffect(() => {
    // Components
    const compOptions = masterData.components.map(comp => ({
      value: comp.id,
      label: comp.component_name,
    }));
    setComponentOptions(compOptions);

    // Disciplines
    const discOptions = masterData.disciplines.map(disc => ({
      value: disc.id,
      label: disc.discipline_name,
      component_id: disc.component_id,
    }));
    setDisciplineOptions(discOptions);

    // Document Types
    const docTypeOptions = masterData.documentTypes.map(type => ({
      value: type.id,
      label: type.type_name,
    }));
    setDocumentTypeOptions(docTypeOptions);

    // Versions
    const verOptions = masterData.versions.map(version => ({
      value: version,
      label: version,
    }));
    setVersionOptions(verOptions);
  }, [masterData]);

  // Filter disciplines when component changes
  useEffect(() => {
    if (selectedComponent) {
      const filtered = disciplineOptions.filter(
        discipline => discipline.component_id === selectedComponent.value
      );
      setFilteredDisciplineOptions(filtered);
      // Reset discipline when component changes
      setSelectedDiscipline(null);
    } else {
      setFilteredDisciplineOptions([]);
      setSelectedDiscipline(null);
    }
  }, [selectedComponent, disciplineOptions]);

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dropRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!documentName) setDocumentName(droppedFile.name.split('.')[0]);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile && !documentName) {
      setDocumentName(selectedFile.name.split('.')[0]);
    }
  };

  // Upload document
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    if (!selectedDocumentType) {
      alert("Please select a document type");
      return;
    }
    if (!documentName) {
      alert("Please enter a document name");
      return;
    }
    if (!currentUser) {
      alert("Please set a user first to upload documents");
      return;
    }

    const uploadData = {
      file,
      documentName,
      remarks,
      componentId: selectedComponent ? selectedComponent.value : "",
      disciplineId: selectedDiscipline ? selectedDiscipline.value : "",
      documentTypeId: selectedDocumentType.value,
      versionControl: selectedVersion.value,
      isFinal,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email
    };

    const success = await uploadDocument(uploadData, setProgress);

    if (success) {
      // Reset form
      setFile(null);
      setDocumentName("");
      setRemarks("");
      setSelectedComponent(null);
      setSelectedDiscipline(null);
      setSelectedDocumentType(null);
      setSelectedVersion({ value: "R0", label: "R0" });
      setIsFinal(false);

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    }
  };

  // Delete document
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    const success = await deleteDocument(id);
    if (!success) {
      alert("Delete failed. Please try again.");
    }
  };

  // Share document function
  const handleShareDocument = async (shareData: ShareData) => {
    if (!selectedDocument || !currentUser) return;

    try {
      const result = await shareDocument(selectedDocument.id, shareData, currentUser.id);
      
      const shareUrl = result.shareUrl;
      const shareToken = result.shareToken;
      
      console.log("🔗 Generated share URL:", shareUrl);
      console.log("🔑 Share token:", shareToken);

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Show success message with link
      alert(
        `✅ Share link created successfully!\n\n` +
        `🔗 Share URL: ${shareUrl}\n\n` +
        `📧 Shared with: ${shareData.userEmail}\n` +
        `🎯 Permission: ${shareData.permissionType}\n` +
        `⏰ Expires: ${shareData.expiresInHours === 0 ? 'Never' : `${shareData.expiresInHours} hours`}\n\n` +
        `The link has been copied to your clipboard.`
      );
      
      // Close modal
      setShareModalOpen(false);
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  // Revoke permission
  const handleRevokePermission = async (permissionId: number) => {
    const success = await revokePermission(permissionId, selectedDocument?.id);
    if (success) {
      alert("Permission revoked successfully!");
    } else {
      alert("Failed to revoke permission");
    }
  };

  // Open share modal
  const openShareModal = (document: Document) => {
    if (!currentUser) {
      alert("Please set a user first to share documents");
      return;
    }
    setSelectedDocument(document);
    setShareModalOpen(true);
  };

  // Open permissions modal
  const openPermissionsModal = async (document: Document) => {
    if (!currentUser) {
      alert("Please set a user first to manage permissions");
      return;
    }
    setSelectedDocument(document);
    setPermissionsModalOpen(true);
    await loadDocumentPermissions(document.id);
  };

  // Format date
  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-12 h-12 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-12 h-12 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="w-12 h-12 text-green-500" />;
      default:
        return <File className="w-12 h-12 text-gray-500" />;
    }
  };

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.discipline_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.uploaded_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Controls */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900">Document Management System</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-2">
                Securely upload, manage, and access documents in one place
              </p>
            </div>
            <div className="w-64">
              {!currentUser && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-800 text-center">
                    <strong>Note:</strong> Set a user to enable upload and sharing features
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CloudUpload className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upload New Document</h2>
              <p className="text-gray-500">
                {/* {currentUser ? `Uploading as: ${currentUser.name}` : "Please set a user to upload documents"} */}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Component Dropdown with Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component Name
                </label>
                <Select
                  options={componentOptions}
                  value={selectedComponent}
                  onChange={setSelectedComponent}
                  placeholder="Select Component"
                  isSearchable
                  isClearable
                  styles={customSelectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Discipline Dropdown with Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discipline Name
                </label>
                <Select
                  options={filteredDisciplineOptions}
                  value={selectedDiscipline}
                  onChange={setSelectedDiscipline}
                  placeholder={selectedComponent ? "Select Discipline" : "First select Component"}
                  isDisabled={!selectedComponent}
                  isSearchable
                  isClearable
                  styles={customSelectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                {!selectedComponent && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a component first to see available disciplines
                  </p>
                )}
              </div>

              {/* Document Type Dropdown with Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <Select
                  options={documentTypeOptions}
                  value={selectedDocumentType}
                  onChange={setSelectedDocumentType}
                  placeholder="Select Document Type"
                  isSearchable
                  isClearable
                  required
                  styles={customSelectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Version Control Dropdown with Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Control
                </label>
                <Select
                  options={versionOptions}
                  value={selectedVersion}
                  onChange={setSelectedVersion}
                  isSearchable
                  styles={customSelectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFinal}
                    onChange={(e) => setIsFinal(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Final Document
                  </span>
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter document name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  required
                  className="w-full border-gray-300 border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <input
                  type="text"
                  placeholder="Enter remarks (optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border-gray-300 border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Drag and Drop Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File *
              </label>
              <div
                ref={dropRef}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                } ${file ? "border-green-500 bg-green-50" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-16 h-16 text-green-500 mb-4" />
                    <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-3 text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Drag & drop your file here
                    </p>
                    <p className="text-gray-500 mb-4">or click to browse</p>
                    <p className="text-sm text-gray-400">
                      Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Error Message */}
            {dmsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                <p className="text-red-800 font-medium">{dmsError}</p>
              </div>
            )}

            {/* Progress Bar */}
            {dmsLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-green-800 font-medium">Document uploaded successfully!</p>
              </div>
            )}

            <button
              type="submit"
              disabled={dmsLoading || !file || !selectedDocumentType || !documentName || !currentUser}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                dmsLoading || !file || !selectedDocumentType || !documentName || !currentUser
                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              }`}
            >
              {dmsLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {currentUser ? "Upload Document" : "Set User to Upload"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Document List - Grid Layout */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Uploaded Documents</h2>
                <p className="text-gray-500">{documents.length} documents stored</p>
              </div>
            </div>
            <div className="flex-1 max-w-md relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by document name, uploaded by, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-gray-300 border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                {searchTerm ? "No documents found" : "No documents uploaded yet"}
              </h3>
              <p className="text-gray-400">
                {searchTerm ? "Try adjusting your search terms" : "Upload your first document to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group h-fit"
                >
                  {/* Header with Document Name and Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.file_path)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-lg truncate">
                            {doc.document_name}
                          </h3>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              doc.version_control === 'Final' 
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {doc.version_control}
                            </span>
                            {doc.is_final && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full text-xs font-medium">
                                Final
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm truncate mb-2">
                          {doc.file_name}
                        </p>
                        
                        {/* Uploaded By with highlight if current user */}
                        <div className="flex items-center gap-1 mb-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs font-medium ${
                            currentUser && doc.uploaded_by === currentUser.name 
                              ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded'
                              : 'text-gray-600'
                          }`}>
                            By: {doc.uploaded_by}
                            {currentUser && doc.uploaded_by === currentUser.name && " (You)"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delete Button - Show only if user is owner or admin */}
                    {(currentUser && (doc.uploaded_by === currentUser.name || currentUser.role === 'admin')) && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Document Details */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Component:</span>
                        <span className="text-gray-600 truncate">{doc.component_name || "General"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Discipline:</span>
                        <span className="text-gray-600 truncate">{doc.discipline_name || "General"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="text-gray-600">{doc.document_type}</span>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(doc.upload_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <File className="w-3 h-3" />
                        <span>{formatFileSize(doc.file_size)}</span>
                      </div>
                    </div>

                    {/* Folder Structure */}
                    {doc.folder_structure && (
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-xs">
                          <Folder className="w-3 h-3 text-gray-500" />
                          <span className="font-medium text-gray-700">Folder:</span>
                          <span className="text-gray-600 font-mono truncate">
                            {doc.folder_structure}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {doc.remarks && (
                      <div className="text-xs">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-700">Remarks: </span>
                          {doc.remarks}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 pt-2 border-t border-gray-200">
                    <a
                      href={`http://localhost:5000/${doc.file_path.replace(/\\/g, "/")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    <a
                      href={`http://localhost:5000/${doc.file_path.replace(/\\/g, "/")}`}
                      download
                      className="flex-1 flex items-center justify-center gap-2 text-green-600 hover:text-green-800 text-sm font-medium transition bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg border border-green-200"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    
                    {/* Share Buttons - Only show for document owner */}
                    {currentUser && doc.uploaded_by === currentUser.name && (
                      <>
                        <button
                          onClick={() => openShareModal(doc)}
                          className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium transition bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg border border-purple-200"
                          title="Share Document"
                        >
                          <Share className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openPermissionsModal(doc)}
                          className="flex items-center justify-center gap-2 text-orange-600 hover:text-orange-800 text-sm font-medium transition bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-lg border border-orange-200"
                          title="Manage Permissions"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Modal */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          document={selectedDocument!}
          onShare={handleShareDocument}
          currentUser={currentUser}
        />
        
        {/* Permissions Modal */}
        <PermissionsModal
          isOpen={permissionsModalOpen}
          onClose={() => setPermissionsModalOpen(false)}
          document={selectedDocument!}
          permissions={documentPermissions}
          onRevoke={handleRevokePermission}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default DmsPage;