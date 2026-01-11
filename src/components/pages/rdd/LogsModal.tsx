'use client';
import React, { useMemo, useState } from "react";
import { 
  X, 
  Calendar, 
  User, 
  FileText, 
  IndianRupee, 
  Ruler, 
  Building2, 
  Hash, 
  Box, 
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronDown,
  ChevronUp,
  Maximize2
} from "lucide-react";

// Updated type to match API
export interface WorkLogRddData {
  id?: number;  // Optional as per API
  data_entry_id: number;
  agency_name?: string;
  command_area?: number;
  proposed_length?: number;
  proposed_width?: number;
  proposed_height?: number;
  wages_amount?: number;  
  material_amount?: number;
  total_sanction_amount?: number;
  initial_upload?: string | null;
  final_upload?: string | null;
  created_by?: number;
  created_by_name?: string;
  work_name?: string;
  work_code?: string;
  created_at?: string;
  updated_at?: string;
  logNumber?: number;
  totalLogs?: number;
}

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WorkLogRddData[];
  workName?: string;
  workCode?: string;
  dataEntryId?: number;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  filename?: string;
}

// Enhanced Image Modal Component
const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, title, filename }) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || 'work-log-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl max-h-[95vh] w-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 shadow-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{title}</h3>
              {filename && (
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 inline-block mt-1 truncate max-w-full">
                  {filename}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 ml-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg text-blue-600 dark:text-blue-400 transition-all hover:scale-105"
              title="Download Image"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-all"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={handleResetZoom}
              className="hidden sm:block px-3 py-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg text-xs sm:text-sm font-semibold min-w-[60px] transition-all"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 hover:bg-white/80 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-all"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-1 sm:ml-2 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-full object-contain transition-transform duration-300 rounded-lg shadow-2xl"
            style={{ transform: `scale(${zoom})` }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Modern LogCard Component
const LogCard: React.FC<{
  log: WorkLogRddData;
  versionNumber: number;
  volume: number;
  hasValidDimensions: boolean;
  onImageClick: (url: string, title: string, filename?: string) => void;
  getImageUrl: (filename: string | null | undefined) => string | null;
  getImageFilename: (filename: string | null | undefined) => string | null;
}> = ({ log, versionNumber, volume, hasValidDimensions, onImageClick, getImageUrl, getImageFilename }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return "0.00";
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "—" : d.toLocaleString('en-IN', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      });
    } catch {
      return "—";
    }
  };

  const initialImageUrl = getImageUrl(log.initial_upload);
  const finalImageUrl = getImageUrl(log.final_upload);
  const hasImages = initialImageUrl || finalImageUrl;
  const initialFilename = getImageFilename(log.initial_upload);
  const finalFilename = getImageFilename(log.final_upload);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-4 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-xl">
              <span className="text-xl sm:text-2xl font-black text-white">V{versionNumber}</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-base sm:text-lg drop-shadow-md">
                Version {versionNumber}
                {log.logNumber && ` (Log ${log.logNumber} of ${log.totalLogs || 0})`}
              </h4>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90 mt-1">
                <Calendar size={14} />
                <span className="drop-shadow">{formatDateTime(log.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 border border-white/20">
              <div className="text-xs text-white/80 mb-1">Total Amount</div>
              <div className="text-lg sm:text-xl font-bold text-white drop-shadow">
                {formatCurrency(log.total_sanction_amount)}
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/30"
            >
              {isExpanded ? <ChevronUp className="text-white" size={20} /> : <ChevronDown className="text-white" size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Card Content - Collapsible */}
      {isExpanded && (
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Agency Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-500 rounded-lg p-1.5">
                  <Building2 size={16} className="text-white" />
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white text-sm">Agency Info</h5>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                    Agency Name
                  </label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {log.agency_name || '—'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                    Command Area
                  </label>
                  <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1 mt-1">
                    <Ruler size={14} />
                    <span className="font-medium">{log.command_area ? `${formatNumber(log.command_area)} ha` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensions & Volume */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-500 rounded-lg p-1.5">
                  <Ruler size={16} className="text-white" />
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white text-sm">Dimensions</h5>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'L', value: log.proposed_length },
                  { label: 'W', value: log.proposed_width },
                  { label: 'H', value: log.proposed_height }
                ].map((dim, idx) => (
                  <div key={idx} className="text-center bg-white dark:bg-gray-800 rounded-lg p-2 border border-purple-100 dark:border-purple-800">
                    <div className="text-xs font-bold text-purple-700 dark:text-purple-400">{dim.label}</div>
                    <div className="font-bold text-base text-gray-900 dark:text-white">{formatNumber(dim.value)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">m</div>
                  </div>
                ))}
              </div>

              {hasValidDimensions ? (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide">Volume</span>
                    <Box size={14} />
                  </div>
                  <div className="text-xl font-black">{formatNumber(volume)} m³</div>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-xs text-yellow-700 dark:text-yellow-400 font-medium text-center">
                    Incomplete dimensions
                  </div>
                </div>
              )}
            </div>

            {/* Financial Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-500 rounded-lg p-1.5">
                  <IndianRupee size={16} className="text-white" />
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white text-sm">Financials</h5>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 rounded-lg p-2 border border-green-100 dark:border-green-800">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Wages</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(log.wages_amount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 rounded-lg p-2 border border-green-100 dark:border-green-800">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Material</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(log.material_amount)}</span>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3 text-white shadow-lg mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
                    <span className="text-xl font-black">{formatCurrency(log.total_sanction_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-orange-500 rounded-lg p-1.5">
                  <ImageIcon size={16} className="text-white" />
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white text-sm">Images</h5>
              </div>
              
              {hasImages ? (
                <div className="space-y-3">
                  {initialImageUrl && (
                    <div>
                      <label className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2 block uppercase tracking-wide">
                        Initial
                      </label>
                      <div 
                        className="cursor-pointer group relative overflow-hidden rounded-xl"
                        onClick={() => onImageClick(
                          initialImageUrl, 
                          `Initial - V${versionNumber}`,
                          initialFilename || undefined
                        )}
                      >
                        <img 
                          src={initialImageUrl} 
                          alt="Initial"
                          className="w-full h-24 object-cover border-2 border-orange-200 dark:border-orange-700 group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white" size={24} />
                        </div>
                      </div>
                    </div>
                  )}
                  {finalImageUrl && (
                    <div>
                      <label className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2 block uppercase tracking-wide">
                        Final
                      </label>
                      <div 
                        className="cursor-pointer group relative overflow-hidden rounded-xl"
                        onClick={() => onImageClick(
                          finalImageUrl, 
                          `Final - V${versionNumber}`,
                          finalFilename || undefined
                        )}
                      >
                        <img 
                          src={finalImageUrl} 
                          alt="Final"
                          className="w-full h-24 object-cover border-2 border-orange-200 dark:border-orange-700 group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white" size={24} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ImageIcon className="w-12 h-12 text-orange-300 dark:text-orange-700 mx-auto mb-2" />
                  <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">No images</div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            {log.id && (
              <div className="flex items-center gap-1">
                <Hash size={12} />
                <span>Log ID: <strong className="text-gray-900 dark:text-white">#{log.id}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Hash size={12} />
              <span>Entry ID: <strong className="text-gray-900 dark:text-white">#{log.data_entry_id}</strong></span>
            </div>
            {log.created_by_name && (
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>By: <strong className="text-gray-900 dark:text-white">{log.created_by_name}</strong></span>
              </div>
            )}
            {log.work_name && (
              <div className="flex items-center gap-1">
                <FileText size={12} />
                <span>Work: <strong className="text-gray-900 dark:text-white">{log.work_name}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Modal Component
export function LogsModal({
  isOpen,
  onClose,
  logs,
  workName,
  workCode,
  dataEntryId,
}: LogsModalProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; filename?: string } | null>(null);

  // Filter logs for the specific data_entry_id and sort by creation date
  const filteredAndSortedLogs = useMemo(() => {
    if (!dataEntryId) return [];
    
    return logs
      .filter(log => log.data_entry_id === dataEntryId)
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime(); // Newest first
      });
  }, [logs, dataEntryId]);

  // Calculate volume for a log entry
  const calculateVolume = (log: WorkLogRddData) => {
    const length = log.proposed_length || 0;
    const width = log.proposed_width || 0;
    const height = log.proposed_height || 0;
    
    if (length > 0 && width > 0 && height > 0) {
      return length * width * height;
    }
    return 0;
  };

  // Calculate total volume for all logs
  const calculateTotalVolume = () => {
    return filteredAndSortedLogs.reduce((total, log) => {
      return total + calculateVolume(log);
    }, 0);
  };

  // Generate image URL
  const getImageUrl = (filename: string | null | undefined) => {
    if (!filename) return null;
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    // URL format: http://localhost:5000/rdd/work-log-rdd/images/filename
    return `${API_URL}/rdd/work-log-rdd/images/${encodeURIComponent(filename)}`;
  }

  // Get image filename for display
  const getImageFilename = (filename: string | null | undefined) => {
    if (!filename) return null;
    return filename.split('/').pop() || filename;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-2.5 shadow-xl">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-lg">
                      Work Logs History
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-white/90">
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
                        <Building2 size={14} />
                        <span className="font-semibold">Entry ID: {dataEntryId}</span>
                      </div>
                      {workName && (
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
                          <FileText size={14} />
                          <span className="font-semibold">{workName}</span>
                        </div>
                      )}
                      {workCode && (
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
                          <Hash size={14} />
                          <span className="font-semibold">{workCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 transition-all p-2 rounded-xl border border-white/20 backdrop-blur-sm flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {filteredAndSortedLogs.length} Log{filteredAndSortedLogs.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {calculateTotalVolume() > 0 && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Box size={14} />
                    <span className="font-semibold">Total Volume: {formatNumber(calculateTotalVolume())} m³</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
            {filteredAndSortedLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Logs Found</h3>
                <p className="text-gray-500">
                  No work logs have been created for this data entry yet.
                </p>
              </div>
            ) : (
              filteredAndSortedLogs.map((log, index) => {
                const volume = calculateVolume(log);
                const hasValidDimensions = log.proposed_length && log.proposed_width && log.proposed_height;
                
                return (
                  <LogCard
                    key={log.id || index}
                    log={log}
                    versionNumber={filteredAndSortedLogs.length - index}
                    volume={volume}
                    hasValidDimensions={!!hasValidDimensions}
                    onImageClick={(url, title, filename) => setSelectedImage({ url, title, filename })}
                    getImageUrl={getImageUrl}
                    getImageFilename={getImageFilename}
                  />
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 bg-white dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium">
                  Showing {filteredAndSortedLogs.length} log{filteredAndSortedLogs.length !== 1 ? 's' : ''} for Data Entry ID: <strong className="text-gray-900 dark:text-white">{dataEntryId}</strong>
                </div>
                {calculateTotalVolume() > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400 font-semibold">
                    <Box size={14} />
                    <span>Total Volume Across All Logs: {formatNumber(calculateTotalVolume())} m³</span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ''}
        title={selectedImage?.title || ''}
        filename={selectedImage?.filename}
      />
    </>
  );
}