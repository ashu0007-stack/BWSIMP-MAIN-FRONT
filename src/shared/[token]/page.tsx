// app/shared/[token]/page.tsx - ENHANCED UI VERSION
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Eye, 
  AlertCircle, 
  Loader, 
  User, 
  Calendar, 
  File, 
  Shield,
  Clock,
  Share2,
  ArrowLeft,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

// Rename your interface to avoid conflict with global 'document'
interface SharedDocumentData {
  id: number;
  document_name: string;
  file_name: string;
  file_size: number;
  file_extension: string;
  uploaded_by: string;
  folder_structure: string;
}

interface Permission {
  type: string;
  expiresAt: string;
  createdBy: string;
}

export default function SharedDocumentPage() {
  const params = useParams();
  const token = params?.token as string;
  
  // Rename state variable to avoid conflict
  const [sharedDocument, setSharedDocument] = useState<SharedDocumentData | null>(null);
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);

  const fetchSharedDocument = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      console.log("🔗 Fetching shared document for token:", token);

      const response = await fetch(`http://localhost:5000/api/dms/shared/${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📄 API Response:", data);

      if (data.success) {
        setSharedDocument(data.document);
        setPermission(data.permission);
      } else {
        setError(data.error || 'Failed to load shared document');
      }
    } catch (err: unknown) {
      console.error('❌ Error fetching shared document:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Network error: Could not load document');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSharedDocument();
    }
  }, [token, fetchSharedDocument]);

  const handleDownload = useCallback(async () => {
    if (!sharedDocument) return;

    try {
      setDownloading(true);
      console.log("📥 Downloading document...");
      const response = await fetch(`http://localhost:5000/api/dms/shared/${token}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        // Now we can use 'document' safely - it refers to the global DOM document
        const anchor = document.createElement('a');
        anchor.style.display = 'none';
        anchor.href = url;
        anchor.download = sharedDocument.file_name;
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
        console.log("✅ Download successful");
        
        setTimeout(() => setDownloading(false), 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
    } catch (err: unknown) {
      console.error('❌ Download error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Download failed');
      }
      setDownloading(false);
    }
  }, [sharedDocument, token]);

  const handleView = useCallback(async () => {
    if (!sharedDocument) return;
    
    try {
      setViewing(true);
      console.log("👁️ Opening document for viewing...");
      
      const viewUrl = `http://localhost:5000/api/dms/shared/${token}/view`;
      window.open(viewUrl, '_blank');
      
      setTimeout(() => setViewing(false), 2000);
    } catch (err) {
      setViewing(false);
    }
  }, [sharedDocument, token]);

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
    const baseClass = "w-20 h-20";
    
    switch (extension) {
      case 'pdf':
        return <FileText className={`${baseClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${baseClass} text-blue-500`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className={`${baseClass} text-green-500`} />;
      case 'xls':
      case 'xlsx':
        return <FileText className={`${baseClass} text-green-600`} />;
      case 'ppt':
      case 'pptx':
        return <FileText className={`${baseClass} text-orange-500`} />;
      default:
        return <File className={`${baseClass} text-gray-500`} />;
    }
  };

  // Get permission badge color
  const getPermissionColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'download': return 'bg-green-100 text-green-800 border-green-200';
      case 'both': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Loading Shared Document</h2>
          <p className="text-gray-600 max-w-md">We&apos;re preparing your document for secure access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="relative inline-block mb-4">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
            <div className="absolute -inset-4 bg-red-100 rounded-full blur-lg opacity-50"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchSharedDocument}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3.5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sharedDocument) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h2>
          <p className="text-gray-600 mb-6">The requested document is no longer available.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Share2 className="w-4 h-4" />
            <span>Shared Document</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          {/* Document Header */}
          <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
            {/* File Icon with Gradient Background */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl blur-lg opacity-60"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                {getFileIcon(sharedDocument.file_name)}
              </div>
            </div>
            
            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                    {sharedDocument.document_name}
                  </h1>
                  <p className="text-gray-600 text-lg mb-6 flex items-center gap-2">
                    <File className="w-5 h-5" />
                    {sharedDocument.file_name}
                  </p>
                </div>
                
                {/* Permission Badge */}
                {permission && (
                  <div className={`flex-shrink-0 px-4 py-2 rounded-full border-2 font-semibold text-sm ${getPermissionColor(permission.type)}`}>
                    {permission.type.toUpperCase()} ACCESS
                  </div>
                )}
              </div>
              
              {/* Document Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shared By</p>
                    <p className="font-semibold text-gray-900">{sharedDocument.uploaded_by}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">File Size</p>
                    <p className="font-semibold text-gray-900">{formatFileSize(sharedDocument.file_size)}</p>
                  </div>
                </div>
              </div>

              {/* Expiry Info */}
              {permission?.expiresAt && (
                <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      This link expires on {new Date(permission.expiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {(permission?.type === 'view' || permission?.type === 'both') && (
              <button
                onClick={handleView}
                disabled={viewing}
                className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {viewing ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
                <span className="relative">
                  {viewing ? 'Opening...' : 'View Document'}
                </span>
                <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
            
            {(permission?.type === 'download' || permission?.type === 'both') && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {downloading ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : (
                  <Download className="w-6 h-6" />
                )}
                <span className="relative">
                  {downloading ? 'Downloading...' : 'Download Document'}
                </span>
                {downloading && (
                  <CheckCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Security & Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Secure Access</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>This is a secure shared link</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Access is tracked and monitored</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Do not share this URL with others</span>
              </li>
            </ul>
          </div>

          {/* Document Info Card */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50/50 rounded-2xl p-6 border border-gray-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">File Type</span>
                <span className="font-medium text-gray-900">{sharedDocument.file_extension.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Folder Structure</span>
                <span className="font-medium text-gray-900 text-right">{sharedDocument.folder_structure || 'General'}</span>
              </div>
              {permission?.createdBy && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Shared by</span>
                  <span className="font-medium text-gray-900">{permission.createdBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Need help? Contact the document owner or your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}