// ✅ NEW: Keep only necessary directives
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDivisions } from "@/hooks/location/useDivision";
import { useWorksByDivision } from "@/hooks/wrdHooks/useWorks";
import { useTenders, useSaveTender, useFileUrl, useTenderLogs } from "@/hooks/wrdHooks/useTenders";
import { TenderLog } from "@/services/api/wrdApi/tenderApi";
import {
  ChevronDown, Upload, FileText, Calendar, Building,
  DollarSign, Clock, User, BookOpen, Award, FileCheck,
  MessageSquare, AlertCircle, Eye,
  Plus, X, Filter, Download, Search, ChevronLeft,
  ChevronRight, ExternalLink, History, CheckCircle,
  FolderOpen, FileEdit, Save, Layers, File, Briefcase, Hash, Clock as ClockIcon,
  Lock, RefreshCw, ZoomIn, Maximize2, Minimize2,
  IndianRupee, ChevronRight as ChevronRightIcon
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

interface SelectProps {
  options: Array<{ value: string | number; label: string }>;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

interface Tender {
  id: number;
  division_name: string;
  work_name: string;
  tenderRefNo: string;
  agreement_no: string;
  tenderAuthority: string;
  emdfee: string;
  bid_security: string | any;
  tenderValidity: string;
  newspaperdetails?: string;
  nitfile?: string;
  corrigendumUpload?: string;
  financialEvaluation?: string;
  loaUpload?: string;
  contractUpload?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'draft' | 'submitted' | 'finalized';
  division_id?: number;
  work_id?: number;
  [key: string]: any;
}

interface UserData {
  username: string;
  email: string;
  dept_id: number;
  role: string;
  role_id?: string;
  department?: string;
  designation?: string;
  levelname?: string;
  levelid?: number;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
}

interface ValidationErrors {
  [key: string]: string;
}

type PageMode = 'list' | 'create' | 'view' | 'edit';

const CustomSelect: React.FC<SelectProps> = ({ options, value, onChange, placeholder, disabled = false, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);
  const user = JSON.parse(sessionStorage.getItem('userdetail') || '{}');
  const userDivisionId = user?.division_id;
  const filteredOptions = userDivisionId
    ? options.filter(option => option.value === userDivisionId)
    : options;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 border-2 rounded-xl flex items-center justify-between transition-all duration-200 ${disabled
          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-70'
          : error
            ? 'border-red-500 hover:border-red-600 bg-white'
            : 'border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
          }`}
      >
        <span className={`${!selectedOption?.value ? 'text-gray-400' : 'text-gray-900'} font-medium`}>
          {selectedOption?.label || placeholder || "Select an option"}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-auto">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`w-full px-4 py-3.5 text-left transition-colors duration-150 ${option.value === value
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-500 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ModernInput: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClear?: () => void;
  isCurrency?: boolean; // ✅ New prop for currency formatting
}> = ({ label, name, value, onChange, onBlur, placeholder, error, type = "text", required = false, readOnly = false, disabled = false, icon, onClear, isCurrency = false }) => {
  const isLocked = disabled || readOnly;

  // ✅ Currency formatting function
  const formatCurrencyDisplay = (val: string) => {
    if (!val) return '';
    // Remove commas and format with Indian numbering system
    const numStr = val.replace(/,/g, '');
    if (!/^\d*\.?\d*$/.test(numStr)) return val;

    const num = parseFloat(numStr);
    if (isNaN(num)) return val;

    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(num);
  };

  // ✅ Handle currency input change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');

    // Allow only numbers and decimal point
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      // Create synthetic event with raw value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: rawValue
        }
      };
      onChange(syntheticEvent);
    }
  };

  // ✅ Get display value
  const displayValue = isCurrency ? formatCurrencyDisplay(value) : value;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="font-medium text-gray-700 flex items-center gap-2">
          {icon && <span className={`${isLocked ? 'text-gray-400' : 'text-blue-500'}`}>{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isLocked && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
          >
            Clear to edit
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={displayValue} // ✅ Use formatted display value
          onChange={isCurrency ? handleCurrencyChange : onChange} // ✅ Use custom handler for currency
          onBlur={onBlur}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full px-4 py-3.5 border-2 rounded-xl font-medium transition-all duration-200 ${error
            ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
            : isLocked
              ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
              : 'border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
            }`}
        />
        {isLocked && !onClear && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {isCurrency && !error && (
        <p className="text-xs text-gray-500">
          • Enter amount with commas (e.g., 2,87,00,000)
          <br />
          • Will be saved as plain number (28700000)
        </p>
      )}
    </div>
  );
};

const ModernFileUpload: React.FC<{
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, existingFileField: string) => void;
  error?: string;
  required?: boolean;
  existingFile?: string | null;
  getFileUrl: (filename: string) => string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClear?: () => void;
}> = ({ label, name, onChange, error, required = false, existingFile, getFileUrl, icon, disabled = false, onClear }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, existingFileField: string) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
    onChange(e, existingFileField);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="font-medium text-gray-700 flex items-center gap-2">
          {icon && <span className={`${disabled ? 'text-gray-400' : 'text-green-500'}`}>{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {disabled && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
          >
            Clear to edit
          </button>
        )}
      </div>

      <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${disabled
        ? 'bg-gray-100 border-gray-300'
        : error
          ? 'border-red-500 bg-red-50'
          : 'border-gray-200 hover:border-blue-400 bg-white'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <label className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
          <div className="flex flex-col items-center justify-center gap-3">
            <div className={`p-3 rounded-full ${disabled ? 'bg-gray-200' : error ? 'bg-red-100' : 'bg-blue-100'}`}>
              <Upload className={`w-6 h-6 ${disabled ? 'text-gray-400' : error ? 'text-red-500' : 'text-blue-500'}`} />
            </div>
            <div className="text-center">
              <p className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
                {fileName || (existingFile ? "Change file" : "Click to upload")}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {fileName || existingFile || "PDF, DOC, DOCX, JPEG, PNG (Max 5MB)"}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${disabled ? 'bg-gray-200 text-gray-500'
              : error ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}>
              Choose File
            </span>
          </div>
          <input
            type="file"
            name={name}
            onChange={(e) => handleFileChange(e, `existing_${name}`)}
            className="hidden"
            disabled={disabled}
          />
        </label>

        {existingFile && !fileName && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <a
              href={getFileUrl(existingFile) || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm font-medium ${disabled ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}
            >
              <FileText className="w-4 h-4" />
              <span className="truncate">Current: {existingFile}</span>
              {!disabled && <ExternalLink className="w-3 h-3" />}
            </a>
          </div>
        )}

        {fileName && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <FileCheck className="w-4 h-4" />
              <span className="truncate">Selected: {fileName}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface ImageViewerModalProps {
  images: Array<{ src: string; alt: string }>;
  initialIndex: number;
  onClose: () => void;
  getFileUrl: (filename: string) => string;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ images, initialIndex, onClose, getFileUrl }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
          setIsLoading(true);
          break;
        case 'ArrowRight':
          setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
          setIsLoading(true);
          break;
        case ' ':
          setIsZoomed(z => !z);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, images.length]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getFileUrl(images[currentIndex].src);
    link.download = images[currentIndex].alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        <button
          onClick={() => { setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1)); setIsLoading(true); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => { setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0)); setIsLoading(true); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute top-4 left-4 z-30 flex gap-2">
          <button
            onClick={handleDownload}
            className="p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 flex items-center gap-2"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsZoomed(z => !z)}
            className="p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
            title={isZoomed ? "Zoom Out" : "Zoom In"}
          >
            {isZoomed ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-gray-800/80 text-white rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>

        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={getFileUrl(images[currentIndex].src)}
            alt={images[currentIndex].alt}
            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onClick={() => setIsZoomed(z => !z)}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-30">
          <div className="bg-gradient-to-t from-black/80 to-transparent p-4 rounded-lg">
            <p className="text-white text-sm truncate">{images[currentIndex].alt}</p>
          </div>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex gap-3 overflow-x-auto justify-center py-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => { setCurrentIndex(index); setIsLoading(true); }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${currentIndex === index
                    ? 'border-blue-500 scale-110 shadow-lg'
                    : 'border-gray-600 hover:border-gray-400'
                    }`}
                >
                  <img
                    src={getFileUrl(img.src)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface LogModalProps {
  tenderId: number;
  onClose: () => void;
  isOpen: boolean;
}

const LogModal: React.FC<LogModalProps> = ({ tenderId, onClose, isOpen }) => {
  const { data: logs, isLoading, error } = useTenderLogs(tenderId);
  const getFileUrl = useFileUrl();
  const [selectedImage, setSelectedImage] = useState<{
    images: Array<{ src: string; alt: string }>;
    initialIndex: number;
  } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getLogSnapshot = (data: any): object => {
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch {
        console.error("Error parsing log data:", data);
        return { error: "Invalid JSON format in log data." };
      }
    }

    const displayData: any = {};

    if (parsedData.action_type) displayData['Action Type'] = parsedData.action_type;
    if (parsedData.status) displayData['Status'] = parsedData.status;

    const basicFields = [
      'division_id', 'work_id', 'tender_ref_no', 'authority',
      'emd_fee', 'bid_security', 'validity', 'nameofpiu',
      'newsprno', 'agreement_number', 'remark', 'newsdate',
      'nitDate', 'saleStartDate', 'preBidDate', 'corrigendumDate',
      'bidReceiptDate', 'techBidopeningDate', 'techBidevaluationDate',
      'financial_eval_date', 'loa_date'
    ];

    basicFields.forEach(field => {
      if (parsedData[field]) {
        const formattedKey = field.replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        displayData[formattedKey] = parsedData[field];
      }
    });

    if (parsedData.files && typeof parsedData.files === 'object') {
      Object.entries(parsedData.files).forEach(([key, value]) => {
        if (value) {
          const formattedKey = key.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') + ' File';
          displayData[formattedKey] = value;
        }
      });
    }

    if (parsedData._isUpdate && parsedData.original_data) {
      displayData['Update Type'] = 'Field Update';
    }

    return displayData;
  };

  const getActionStyle = (action: TenderLog['action_type']) => {
    switch (action) {
      case 'FINAL_SUBMIT':
        return { color: 'text-green-700', bg: 'bg-gradient-to-r from-green-50 to-green-100', border: 'border-green-200', icon: <CheckCircle className="w-5 h-5" />, label: 'Final Submit' };
      case 'DRAFT_SAVE':
        return { color: 'text-amber-700', bg: 'bg-gradient-to-r from-amber-50 to-amber-100', border: 'border-amber-200', icon: <Save className="w-5 h-5" />, label: 'Draft Save' };
      case 'UPDATE':
        return { color: 'text-blue-700', bg: 'bg-gradient-to-r from-blue-50 to-blue-100', border: 'border-blue-200', icon: <RefreshCw className="w-5 h-5" />, label: 'Update' };
      default:
        return { color: 'text-gray-700', bg: 'bg-gradient-to-r from-gray-50 to-gray-100', border: 'border-gray-200', icon: <Clock className="w-5 h-5" />, label: action };
    }
  };

  const isImageFile = (filename: string) => {
    const exts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return exts.some(ext => filename?.toLowerCase().endsWith(ext));
  };

  const extractImagesFromData = (data: any): Array<{ src: string; alt: string }> => {
    const images: Array<{ src: string; alt: string }> = [];
    Object.entries(data || {}).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim() !== '' && isImageFile(value)) {
        images.push({ src: value, alt: `${key.replace(/_/g, ' ')}: ${value}` });
      }
    });
    return images;
  };

  const LogDataTable: React.FC<{ data: object }> = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <p className="text-gray-500 italic">No detailed form data recorded.</p>
        </div>
      );
    }

    const formatKey = (key: string): string =>
      key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
        .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const pairs = Object.entries(data)
      .filter(([_, value]) => value !== null && value !== '' && value !== '0')
      .sort(([a], [b]) => a.localeCompare(b));

    if (pairs.length === 0) {
      return (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <p className="text-gray-500 italic">Only empty or default values were recorded.</p>
        </div>
      );
    }

    const images = extractImagesFromData(data);

    return (
      <div className="space-y-4">
        {images.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-gray-800">Attached Images</h3>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {images.length} image{images.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedImage({ images, initialIndex: index })}>
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 group-hover:scale-105">
                    <img
                      src={getFileUrl(img.src)}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        el.parentElement!.innerHTML = `
                          <div class="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2">
                            <span class="text-gray-400 text-sm">Image unavailable</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-white text-xs truncate">{img.alt.split(':')[1]?.trim() || img.alt}</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl overflow-hidden border-2 border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {pairs.map(([key, value], idx) => {
                const isFileField = key.toLowerCase().includes('file');
                const isImage = isFileField && typeof value === 'string' && isImageFile(value);

                return (
                  <tr key={key} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-5 py-3.5 font-semibold text-gray-700 border-r border-gray-100 align-top min-w-[200px]">
                      <div className="flex items-center gap-2">
                        {isFileField && <span className="text-blue-500">{isImage ? '🖼️' : '📎'}</span>}
                        {formatKey(key)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-800 break-words font-mono text-sm align-top">
                      {isImage ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <span>🖼️</span>
                            <span>{String(value)}</span>
                          </div>
                          <div
                            className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-200 hover:scale-105"
                            onClick={() => setSelectedImage({
                              images: [{ src: String(value), alt: String(value) }],
                              initialIndex: 0
                            })}
                          >
                            <img
                              src={getFileUrl(String(value))}
                              alt={String(value)}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        String(value)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="relative mx-auto mb-4">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading history timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error loading logs</h3>
            <p className="text-gray-600">{error.message}</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex-shrink-0">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <History className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Tender History Timeline</h1>
                  <p className="text-blue-100 mt-1">Tender ID: {tenderId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all backdrop-blur-sm font-medium"
              >
                <X className="w-5 h-5" />
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {logs && logs.length > 0 ? (
              <div className="space-y-6">
                {logs.map((log, index) => {
                  const { color, bg, border, label } = getActionStyle(log.action_type);
                  const isLatest = index === 0;
                  return (
                    <div key={log.id} className={`p-5 rounded-xl border-2 ${border} ${bg} shadow-sm`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${bg} ${color} border ${border}`}>
                            {label}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(log.log_timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.log_timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 flex items-center gap-2 mb-4 p-3 bg-white/50 rounded-lg">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">User:</span> {log.user_name || 'N/A'}
                        <span className="text-gray-400">|</span>
                        <span className="font-medium">ID:</span> {log.user_id || 'N/A'}
                      </p>

                      <details className="group">
                        <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors">
                          <History className="w-4 h-4 group-open:rotate-90 transition-transform" />
                          View Detailed Snapshot
                          <ChevronDown className="w-4 h-4 ml-auto group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="mt-4">
                          <LogDataTable data={getLogSnapshot(log.log_data)} />
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 text-gray-400 rounded-full mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No history logs found</h3>
                <p className="text-gray-500">No activity recorded for this tender yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageViewerModal
          images={selectedImage.images}
          initialIndex={selectedImage.initialIndex}
          onClose={() => setSelectedImage(null)}
          getFileUrl={getFileUrl}
        />
      )}
    </>
  );
};

const TenderDetailView: React.FC<{
  tender: Tender;
  onBack: () => void;
  onViewLogs: () => void;
}> = ({ tender, onBack, onViewLogs }) => {
  const getFileUrl = useFileUrl();
  const [selectedImage, setSelectedImage] = useState<{
    images: Array<{ src: string; alt: string }>;
    initialIndex: number;
  } | null>(null);

  const formatCurrency = (amount: string) => {
    if (!amount) return '0';
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(num);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const isImageFile = (filename: string | undefined): boolean => {
    if (!filename) return false;
    const exts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return exts.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const infoCards = [
    { icon: <Building className="w-5 h-5" />, label: "Division Name", value: tender.division_name, color: "from-blue-500 to-blue-600" },
    { icon: <Briefcase className="w-5 h-5" />, label: "Name of Work", value: tender.work_name, color: "from-purple-500 to-purple-600" },
    { icon: <Hash className="w-5 h-5" />, label: "Tender Reference No", value: tender.tenderRefNo, color: "from-green-500 to-green-600" },
    { icon: <FileCheck className="w-5 h-5" />, label: "Agreement No", value: tender.agreement_no || 'N/A', color: "from-orange-500 to-orange-600" },
    { icon: <User className="w-5 h-5" />, label: "Officer Inviting Bid", value: tender.tenderAuthority, color: "from-indigo-500 to-indigo-600" },
    { icon: <IndianRupee className="w-5 h-5" />, label: "Work Cost amount", value: `₹${formatCurrency(tender.emdfee)}`, color: "from-emerald-500 to-emerald-600" },
    { icon: <IndianRupee className="w-5 h-5" />, label: "Bid Security amount", value: `₹${formatCurrency(tender.bid_security)}`, color: "from-rose-500 to-rose-600" },
    { icon: <ClockIcon className="w-5 h-5" />, label: "Validity (in Days)", value: tender.tenderValidity, color: "from-cyan-500 to-cyan-600" }
  ];

  const documentCards = [
    {
      label: "NIT document",
      file: tender.nitfile || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <File className="w-5 h-5" />
    },
    {
      label: "Newspaper document",
      file: tender.newspaperdetails || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: "start Sales of bidding document",
      file: tender.salesfile || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <FileCheck className="w-5 h-5" />
    },
    {
      label: "Pre-bid meeting document",
      file: tender.preBidUpload || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <FileCheck className="w-5 h-5" />
    },
    {
      label: "Corrigendum document",
      file: tender.corrigendumUpload || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <FileCheck className="w-5 h-5" />
    },
    {
      label: "Last date for receipt of bids document",
      file: tender.bidsUpload || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <FileCheck className="w-5 h-5" />
    },
    {
      label: "Technical Bid Evaluation document",
      file: tender.techbidevaluationUpload || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <FileCheck className="w-5 h-5" />
    },
    {
      label: "Technical Bid opening document",
      file: tender.techBidopeningUpload || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <FileCheck className="w-5 h-5" />
    },
    {
      label: "Financial Evaluation document",
      file: tender.financialEvaluation || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <IndianRupee className="w-5 h-5" />
    },
    {
      label: "LOA document",
      file: tender.loaUpload || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <Award className="w-5 h-5" />
    },
    {
      label: "Contract document",
      file: tender.contractUpload || '',
      color: "bg-green-50 border-green-200 text-green-700",
      icon: <FileCheck className="w-5 h-5" />
    }
  ].filter(doc => doc.file && doc.file !== "null" && doc.file.trim() !== "");

  const imageDocuments = documentCards.filter(doc => isImageFile(doc.file));
  const otherDocuments = documentCards.filter(doc => !isImageFile(doc.file));

  const handleImageClick = (file: string, label: string) => {
    if (isImageFile(file)) {
      setSelectedImage({
        images: [{ src: file, alt: `${label}: ${file}` }],
        initialIndex: 0
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Tender Details</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <p className="text-blue-100">Reference: {tender.tenderRefNo}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={onBack}
                     className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    ⬅ Back
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8 space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Building className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Tender Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {infoCards.map((card, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 bg-gradient-to-br ${card.color} rounded-lg`}>
                          <div className="text-white">{card.icon}</div>
                        </div>
                        {card.label.includes("Cost") || card.label.includes("Security") ? (
                          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">Amount</span>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                      <p className="font-bold text-gray-900 text-lg">{card.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Documents</h2>
                </div>

                {imageDocuments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <File className="w-4 h-4" />
                      </span>
                      Image Documents ({imageDocuments.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {imageDocuments.map((doc, index) => {
                        if (!doc.file) return null;

                        return (
                          <div
                            key={index}
                            className={`${doc.color} border-2 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:scale-[1.02] group cursor-pointer`}
                            onClick={() => handleImageClick(doc.file!, doc.label)}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-white/50 rounded-lg">{doc.icon}</div>
                              <span className="font-semibold">{doc.label}</span>
                            </div>

                            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 mb-3">
                              <img
                                src={getFileUrl(doc.file!)}
                                alt={doc.label}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = `
              <div class="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-gray-500 text-sm">Preview not available</span>
              </div>
            `;
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm truncate text-gray-600">{doc.file}</span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                                Click to view
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {otherDocuments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <span className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </span>
                      Other Documents ({otherDocuments.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {otherDocuments.map((doc, index) => (
                        <a
                          key={index}
                          href={getFileUrl(doc.file) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${doc.color} border-2 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:scale-[1.02] group block`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/50 rounded-lg">{doc.icon}</div>
                            <span className="font-semibold">{doc.label}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm truncate text-gray-600">{doc.file}</span>
                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {documentCards.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 text-gray-400 rounded-full mb-4">
                      <File className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents available</h3>
                    <p className="text-gray-500">No files have been uploaded for this tender.</p>
                  </div>
                )}
              </section>

              {tender.remark && (
                <section className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed">{tender.remark}</p>
                  </div>
                </section>
              )}

              <section className="pt-8 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                    <p className="text-sm text-gray-600 mb-1">Created At</p>
                    <p className="font-semibold text-gray-900">{formatDate(tender.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="font-semibold text-gray-900">{formatDate(tender.updatedAt)}</p>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all font-medium"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back to List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageViewerModal
          images={selectedImage.images}
          initialIndex={selectedImage.initialIndex}
          onClose={() => setSelectedImage(null)}
          getFileUrl={getFileUrl}
        />
      )}
    </>
  );
};

interface TenderFormProps {
  initialData?: any;
  onSubmit: (data: any, status: 'draft' | 'finalized' | 'draft_update') => void | Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  originalData?: any;
}

const initialToFormMap: Record<string, string[]> = {
  division_id: ['division_id', 'division_name'],
  work_id: ['work_id', 'work_name'],
  tender_ref_no: ['tender_ref_no', 'tenderRefNo'],
  authority: ['authority', 'tenderAuthority'],
  work_cost: ['work_cost', 'emdfee'],
  bid_security: ['bid_security'],
  validity: ['validity', 'tenderValidity'],
  agreement_number: ['agreement_number', 'agreement_no'],
  remark: ['remark'],

  existing_newspaper_file: ['newspaperdetails'],
  existing_nit_file: ['nitfile'],
  existing_sale_file: ['salesfile'],
  existing_pre_bid_file: ['preBidUpload'],
  existing_corrigendum_file: ['corrigendumUpload'],
  existing_bids_file: ['bidsUpload'],
  existing_tech_open_file: ['techBidopeningUpload'],
  existing_tech_eval_file: ['techbidevaluationUpload'],
  existing_financial_eval_file: ['financialEvaluation'],
  existing_loa_file: ['loaUpload'],
  existing_contract_file: ['contractUpload'],

  newsdate: ['newsdate'],
  nit_date: ['nitDate'],
  sale_start_date: ['saleStartDate'],
  pre_bid_date: ['preBidDate'],
  corrigendum_date: ['corrigendumDate'],
  bid_receipt_date: ['bidReceiptDate'],
  tech_bid_ope_date: ['techBidopeningDate'],
  tech_bid_eva_date: ['techBidevaluationDate'],
  financial_eval_date: ['financial_eval_date'],
  loa_date: ['loa_date'],
  contract_date: ['contract_date']
};

function computePrefilledFromInitial(initial: any): Set<string> {
  const set = new Set<string>();
  if (!initial) return set;

  Object.entries(initialToFormMap).forEach(([formKey, initialKeys]) => {
    for (const key of initialKeys) {
      const v = initial?.[key];
      if (v !== null && v !== undefined && v !== '') {
        const s = String(v).trim();
        if (s !== '' && s !== 'null' && s !== 'undefined') {
          set.add(formKey);
          break;
        }
      }
    }
  });

  const fileFields = [
    'newspaper_file', 'nit_file', 'sale_file', 'pre_bid_file',
    'corrigendum_file', 'bids_file', 'tech_open_file', 'tech_eval_file',
    'financial_eval_file', 'loa_file', 'contract_file'
  ];

  fileFields.forEach(field => {
    const existingField = `existing_${field}`;
    if (initial?.[existingField]) {
      const v = initial[existingField];
      if (v && v.trim() !== '' && v !== 'null') {
        set.add(field);
        set.add(existingField);
      }
    }
  });

  return set;
}

const TenderForm: React.FC<TenderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  originalData
}) => {
  const { data: divisions, isLoading: divisionsLoading } = useDivisions();
  const [selectedDivision, setSelectedDivision] = useState<string | number>("");
  const { data: works, isLoading: worksLoading } = useWorksByDivision(selectedDivision);
   const [formData, setFormData] = useState<any>(() => getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const getFileUrl = useFileUrl();
  const isDraftStatus = initialData?.status === 'draft';
  const isFinalizedStatus = initialData?.status === 'finalized';
  const isDraftContinuation = isEditing && isDraftStatus;
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Step-by-step workflow states
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialData) {
      const steps = [
        'nit_file',
        'newspaper_file',
        'sale_file',
        'pre_bid_file',
        'corrigendum_file',
        'bids_file',
        'tech_open_file',
        'tech_eval_file',
        'financial_eval_file',
        'loa_file',
        'contract_file'
      ];

      for (let i = steps.length - 1; i >= 0; i--) {
        const field = steps[i];
        const existingField = `existing_${field}`;
        if (initialData[field] || initialData[existingField]) {
          return i + 1;
        }
      }
    }
    return 0;
  });

  const stepConfig = useMemo(() => [
    {
      name: 'NIT Document',
      fields: ['nit_date', 'nit_time', 'nit_file', 'existing_nit_file'],
      requiredForNext: ['nit_file', 'existing_nit_file'],
      icon: <FileText className="w-4 h-4" />,
      description: 'Upload Notice Inviting Tender (NIT) document'
    },
    {
      name: 'Newspaper Publication',
      fields: ['newsdate', 'newsdate_time', 'newspaper_file', 'existing_newspaper_file'],
      requiredForNext: ['newspaper_file', 'existing_newspaper_file'],
      icon: <FileText className="w-4 h-4" />,
      description: 'Upload newspaper publication document'
    },
    {
      name: 'Sale of Bidding Document',
      fields: ['sale_start_date', 'sale_start_time', 'sale_file', 'existing_sale_file'],
      requiredForNext: ['sale_file', 'existing_sale_file'],
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Upload sale of bidding document'
    },
    {
      name: 'Pre-Bid Meeting',
      fields: ['pre_bid_date', 'pre_bid_time', 'pre_bid_file', 'existing_pre_bid_file'],
      requiredForNext: ['pre_bid_file', 'existing_pre_bid_file'],
      icon: <MessageSquare className="w-4 h-4" />,
      description: 'Upload pre-bid meeting document'
    },
    {
      name: 'Amendment/Corrigendum',
      fields: ['corrigendum_date', 'corrigendum_time', 'corrigendum_file', 'existing_corrigendum_file'],
      requiredForNext: ['corrigendum_file', 'existing_corrigendum_file'],
      icon: <FileCheck className="w-4 h-4" />,
      description: 'Upload amendment/corrigendum document'
    },
    {
      name: 'Last Date for Receipt of Bids',
      fields: ['bid_receipt_date', 'bid_receipt_time', 'bids_file', 'existing_bids_file'],
      requiredForNext: ['bids_file', 'existing_bids_file'],
      icon: <Clock className="w-4 h-4" />,
      description: 'Upload last date for receipt of bids document'
    },
    {
      name: 'Technical Bids Opening',
      fields: ['tech_bid_ope_date', 'tech_bid_ope_time', 'tech_open_file', 'existing_tech_open_file'],
      requiredForNext: ['tech_open_file', 'existing_tech_open_file'],
      icon: <Award className="w-4 h-4" />,
      description: 'Upload technical bids opening document'
    },
    {
      name: 'Technical Bid Evaluation',
      fields: ['tech_bid_eva_date', 'tech_bid_eva_time', 'tech_eval_file', 'existing_tech_eval_file'],
      requiredForNext: ['tech_eval_file', 'existing_tech_eval_file'],
      icon: <Award className="w-4 h-4" />,
      description: 'Upload technical bid evaluation document'
    },
    {
      name: 'Financial Bid Evaluation',
      fields: ['financial_eval_date', 'financial_eval_time', 'financial_eval_file', 'existing_financial_eval_file'],
      requiredForNext: ['financial_eval_file', 'existing_financial_eval_file'],
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Upload financial bid evaluation document'
    },
    {
      name: 'Letter of Award (LOA)',
      fields: ['loa_date', 'loa_time', 'loa_file', 'existing_loa_file'],
      requiredForNext: ['loa_file', 'existing_loa_file'],
      icon: <FileText className="w-4 h-4" />,
      description: 'Upload Letter of Award document'
    },
    {
      name: 'Signed Agreement',
      fields: ['contract_date', 'contract_file', 'existing_contract_file'],
      requiredForNext: ['contract_file', 'existing_contract_file'],
      icon: <FileCheck className="w-4 h-4" />,
      description: 'Upload signed agreement document'
    }
  ], [ ]);

  useEffect(() => {
    if (initialData && !isFinalizedStatus) {
      let highestCompletedStep = 0;

      stepConfig.forEach((step, index) => {
        const isCompleted = step.requiredForNext.some(field => {
          const fileField = field.includes('_file') ? field : `${field}_file`;
          const existingField = `existing_${fileField}`;
          return initialData[fileField] || initialData[existingField];
        });

        if (isCompleted) {
          highestCompletedStep = index + 1;
        }
      });

      setCurrentStep(Math.min(highestCompletedStep, stepConfig.length - 1));
    }
  }, [initialData, isFinalizedStatus, stepConfig]);

  const isStepCompleted = (stepIndex: number): boolean => {
    if (stepIndex > currentStep) return false;

    const step = stepConfig[stepIndex];
    return step.requiredForNext.some(field => {
      const isNewFile = formData[field];
      const existingField = `existing_${field}`;
      const isExistingFile = formData[existingField];

      return isNewFile || isExistingFile;
    });
  };

  const isCurrentStepComplete = (): boolean => {
    const step = stepConfig[currentStep];
    return step.requiredForNext.some(field => {
      const isNewFile = formData[field];
      const existingField = `existing_${field}`;
      const isExistingFile = formData[existingField];

      return isNewFile || isExistingFile;
    });
  };

  const handleNextStep = () => {
    if (isCurrentStepComplete() && currentStep < stepConfig.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const areAllStepsComplete = (): boolean => {
    return stepConfig.every((step, index) => isStepCompleted(index));
  };

  const isFieldEnabledByStep = (fieldName: string): boolean => {
    if (isFinalizedStatus && isEditing) return false;

    const basicFields = [
      'division_id', 'work_id', 'tender_ref_no', 'authority',
      'work_cost', 'bid_security', 'validity', 'agreement_number',
      'remark'
    ];

    if (basicFields.includes(fieldName)) {
      return true;
    }

    for (let i = 0; i < stepConfig.length; i++) {
      if (stepConfig[i].fields.includes(fieldName)) {
        return i <= currentStep;
      }
    }

    return true;
  };



  const [lockOnDraft, setLockOnDraft] = useState<boolean>(false);
  const [previouslyFilledFields, setPreviouslyFilledFields] = useState<Set<string>>(() =>
    computePrefilledFromInitial(initialData || {})
  );

  useEffect(() => {
    if (lockOnDraft) {
      const newFilledFields = computePrefilledFromInitial(formData);
      setPreviouslyFilledFields(prev => {
        const updated = new Set(prev);
        newFilledFields.forEach(field => updated.add(field));
        return updated;
      });
    }
  }, [lockOnDraft, formData]);

 const fileSections = useMemo(() => [
  { label: "Notice Inviting Tender (NIT)", dateField: "nit_date", timeField: "nit_time", fileField: "nit_file", existingFileField: "existing_nit_file", icon: <FileText className="w-4 h-4" />, required: false, showTime: false },
  { label: "Published in Newspaper", dateField: "newsdate", timeField: "newsdate_time", fileField: "newspaper_file", existingFileField: "existing_newspaper_file", icon: <FileText className="w-4 h-4" />, required: false, showTime: false },
  { label: "Start of Sale of Bidding Document", dateField: "sale_start_date", timeField: "sale_start_time", fileField: "sale_file", existingFileField: "existing_sale_file", icon: <BookOpen className="w-4 h-4" />, required: false, showTime: true },
  { label: "Pre-Bid Meeting", dateField: "pre_bid_date", timeField: "pre_bid_time", fileField: "pre_bid_file", existingFileField: "existing_pre_bid_file", icon: <MessageSquare className="w-4 h-4" />, required: false, showTime: true },
  { label: "Amendment / Corrigendum", dateField: "corrigendum_date", timeField: "corrigendum_time", fileField: "corrigendum_file", existingFileField: "existing_corrigendum_file", icon: <FileCheck className="w-4 h-4" />, required: false, showTime: false },
  { label: "Last Date for Receipt of Bids", dateField: "bid_receipt_date", timeField: "bid_receipt_time", fileField: "bids_file", existingFileField: "existing_bids_file", icon: <Clock className="w-4 h-4" />, required: false, showTime: true },
  { label: "Technical Bids Opening", dateField: "tech_bid_ope_date", timeField: "tech_bid_ope_time", fileField: "tech_open_file", existingFileField: "existing_tech_open_file", icon: <Award className="w-4 h-4" />, required: false, showTime: true },
  { label: "Technical Bid Evaluation", dateField: "tech_bid_eva_date", timeField: "tech_bid_eva_time", fileField: "tech_eval_file", existingFileField: "existing_tech_eval_file", icon: <Award className="w-4 h-4" />, required: false, showTime: true },
  { label: "Financial Bid Evaluation", dateField: "financial_eval_date", timeField: "financial_eval_time", fileField: "financial_eval_file", existingFileField: "existing_financial_eval_file", icon: <DollarSign className="w-4 h-4" />, required: false, showTime: true },
  { label: "Letter of Award (LOA)", dateField: "loa_date", timeField: "loa_time", fileField: "loa_file", existingFileField: "existing_loa_file", icon: <FileText className="w-4 h-4" />, required: false, showTime: false },
  { label: "Signed Agreement", dateField: "contract_date", timeField: "", fileField: "contract_file", existingFileField: "existing_contract_file", icon: <FileCheck className="w-4 h-4" />, required: false, showTime: false },
], []);

  const extractDateTime = (dateString: string | undefined): { date: string, time: string } => {
    if (!dateString) return { date: "", time: "" };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const [datePart, timePart] = dateString.split(' ');
        return { date: datePart || "", time: timePart ? timePart.substring(0, 5) : "" };
      }
      return { date: date.toISOString().split('T')[0], time: date.toTimeString().substring(0, 5) };
    } catch {
      return { date: "", time: "" };
    }
  };

  const getInitialFormData = () => {
    const divisionId = initialData?.division_id || "";
    const workId = initialData?.work_id || "";
    const workCost = initialData?.work_cost || "";

    const formData = {
      id: initialData?.id || null,
      division_id: divisionId,
      work_id: workId,
      tender_ref_no: initialData?.tenderRefNo || initialData?.tender_ref_no || "",
      authority: initialData?.tenderAuthority || initialData?.authority || "",
      work_cost: workCost || initialData?.work_cost || initialData?.emdfee || "",
      bid_security: initialData?.bid_security || "",
      validity: initialData?.tenderValidity || initialData?.validity || "",
      nameofpiu: initialData?.nameofpiu || "",
      newsprno: initialData?.newsprno || "",
      agreement_number: initialData?.agreement_no || initialData?.agreement_number || "",
      remark: initialData?.remark || "",
      newspaper_file: null,
      nit_file: null,
      sale_file: null,
      pre_bid_file: null,
      corrigendum_file: null,
      bids_file: null,
      tech_open_file: null,
      tech_eval_file: null,
      financial_eval_file: null,
      loa_file: null,
      contract_file: null,
      existing_newspaper_file: initialData?.newspaperdetails || null,
      existing_nit_file: initialData?.nitfile || null,
      existing_sale_file: initialData?.salesfile || null,
      existing_pre_bid_file: initialData?.preBidUpload || null,
      existing_corrigendum_file: initialData?.corrigendumUpload || null,
      existing_bids_file: initialData?.bidsUpload || null,
      existing_tech_open_file: initialData?.techBidopeningUpload || null,
      existing_tech_eval_file: initialData?.techbidevaluationUpload || null,
      existing_financial_eval_file: initialData?.financialEvaluation || null,
      existing_loa_file: initialData?.loaUpload || null,
      existing_contract_file: initialData?.contractUpload || null,
      newsdate: extractDateTime(initialData?.newsdate).date,
      newsdate_time: extractDateTime(initialData?.newsdate).time,
      nit_date: extractDateTime(initialData?.nitDate).date,
      nit_time: extractDateTime(initialData?.nitDate).time,
      sale_start_date: extractDateTime(initialData?.saleStartDate).date,
      sale_start_time: extractDateTime(initialData?.saleStartDate).time,
      pre_bid_date: extractDateTime(initialData?.preBidDate).date,
      pre_bid_time: extractDateTime(initialData?.preBidDate).time,
      corrigendum_date: extractDateTime(initialData?.corrigendumDate).date,
      corrigendum_time: extractDateTime(initialData?.corrigendumDate).time,
      bid_receipt_date: extractDateTime(initialData?.bidReceiptDate).date,
      bid_receipt_time: extractDateTime(initialData?.bidReceiptDate).time,
      tech_bid_ope_date: extractDateTime(initialData?.techBidopeningDate).date,
      tech_bid_ope_time: extractDateTime(initialData?.techBidopeningDate).time,
      tech_bid_eva_date: extractDateTime(initialData?.techBidevaluationDate).date,
      tech_bid_eva_time: extractDateTime(initialData?.techBidevaluationDate).time,
      financial_eval_date: extractDateTime(initialData?.financial_eval_date).date,
      financial_eval_time: extractDateTime(initialData?.financial_eval_date).time,
      loa_date: extractDateTime(initialData?.loa_date).date,
      loa_time: extractDateTime(initialData?.loa_time).time,
    };
    return formData;
  };

  //const [formData, setFormData] = useState<any>(() => getInitialFormData());

  useEffect(() => {
    if (!formData.division_id && initialData?.division_name && divisions?.length) {
      const match = divisions.find((d: any) => d.division_name?.toLowerCase() === initialData.division_name?.toLowerCase());
      if (match?.id) {
        setSelectedDivision(match.id);
        setFormData((prev: any) => ({ ...prev, division_id: match.id }));
      }
    } else if (formData.division_id) {
      setSelectedDivision(formData.division_id);
    }
  }, [divisions, initialData, formData.division_id,selectedDivision]);

  useEffect(() => {
    if (works && initialData?.work_name && selectedDivision && !formData.work_id) {
      const work = works.find((w: any) => w.work_name?.toLowerCase() === initialData.work_name?.toLowerCase());
      if (work?.id) {
        setFormData((prev: any) => ({
          ...prev,
          work_id: work.id,
          work_cost: work?.work_cost || initialData?.work_cost || initialData?.emdfee || ""
        }));
      }
    }
  }, [works, initialData, selectedDivision, formData.work_id]);

  const isFieldDisabled = (fieldName: string): boolean => {
    if (!isFieldEnabledByStep(fieldName)) {
      return true;
    }

    if (isFinalizedStatus && isEditing) return true;

    const draftLockActive = (isEditing && isDraftStatus) || lockOnDraft;
    if (draftLockActive) {
      if (previouslyFilledFields.has(fieldName)) {
        return true;
      }

      if (fieldName.endsWith('_file') && !fieldName.includes('existing_')) {
        const existingField = `existing_${fieldName}`;
        if (formData[existingField] || previouslyFilledFields.has(existingField)) {
          return true;
        }
      }

      const sec = fileSections.find(
        s => s.fileField === fieldName || s.dateField === fieldName || s.timeField === fieldName
      );
      if (sec) {
        const hasExisting = formData[`existing_${sec.fileField}`] || previouslyFilledFields.has(`existing_${sec.fileField}`);
        if (hasExisting) {
          if (fieldName === sec.dateField || fieldName === sec.timeField) return true;
        }
      }
    }

    return false;
  };

  const isFieldShown = (fieldName: string): boolean => {
    return true;
  };

  const validateForm = (isFinalSubmit = false): boolean => {
    const newErrors: ValidationErrors = {};
    if (isFinalSubmit) {
      const required = ['division_id', 'work_id', 'authority', 'validity', 'agreement_number'];
      required.forEach(field => {
        const value = formData[field];
        const missing =
          value === null || value === undefined ||
          (typeof value === 'string' && value.trim() === '') ||
          (typeof value === 'number' && isNaN(value));
        if (missing) {
          const labels: Record<string, string> = {
            division_id: 'Division',
            work_id: 'Work',
            authority: 'Officer Inviting Bid',
            validity: 'Bid Validity Period',
            agreement_number: 'Agreement Number',
          };
          newErrors[field] = `${labels[field] || field} is required for final submission`;
        }
      });
      if (!formData.contract_file && !formData.existing_contract_file) {
        newErrors.contract_file = 'Signed Agreement file is required for final submission';
      }
    }

    if (formData.work_cost) {
      const raw = String(formData.work_cost).replace(/,/g, '').trim();
      if (raw !== '' && !/^\d+(\.\d{1,2})?$/.test(raw)) {
        newErrors.work_cost = 'Please enter a valid amount (e.g., 1000 or 1000.50)';
      }
    }
    if (formData.bid_security) {
      const raw = String(formData.bid_security).replace(/,/g, '').trim();
      if (raw !== '' && !/^\d+(\.\d{1,2})?$/.test(raw)) {
        newErrors.bid_security = 'Please enter a valid amount (e.g., 1000 or 1000.50)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isFieldDisabled(name)) {
      alert(`This field is locked because it has already been filled. Clear it to edit.`);
      return;
    }
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setTouched(prev => new Set(prev).add(name));
    if (errors[name]) setErrors(prev => { const ne = { ...prev }; delete ne[name]; return ne; });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, existingFileField: string) => {
    const fieldName = e.target.name;
    if (isFieldDisabled(fieldName)) {
      alert(`This file field is locked because an existing file is already uploaded. Clear it to edit.`);
      return;
    }
    const { name, files } = e.target;
    const file = files && files[0];

    if (file && file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [name]: 'File size must be less than 5MB' }));
      return;
    }
    if (file) {
      const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      if (!allowed.includes(file.type)) {
        setErrors(prev => ({ ...prev, [name]: 'File type not allowed. Use PDF, DOC, DOCX, JPEG, or PNG' }));
        return;
      }
    }

    setFormData((prev: any) => ({ ...prev, [name]: file, [existingFileField]: file ? null : prev[existingFileField] }));
    setTouched(prev => new Set(prev).add(name));
    if (errors[name]) setErrors(prev => { const ne = { ...prev }; delete ne[name]; return ne; });

    if (isCurrentStepComplete() && currentStep < stepConfig.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 500);
    }
  };

  const clearFieldValue = (fieldName: string) => {
    if (window.confirm(`Clear this field and unlock it for editing? This will allow you to modify this previously saved value.`)) {
      setFormData((prev: any) => {
        const next = { ...prev, [fieldName]: fieldName.includes('_file') ? null : '' };
        if (fieldName.includes('_file') && !fieldName.includes('existing_')) {
          const existingField = `existing_${fieldName}`;
          next[existingField] = null;
        }
        const dateTimeToFileMap: Record<string, string> = {
          newsdate: 'newspaper_file', newsdate_time: 'newspaper_file',
          nit_date: 'nit_file', nit_time: 'nit_file',
          sale_start_date: 'sale_file', sale_start_time: 'sale_file',
          pre_bid_date: 'pre_bid_file', pre_bid_time: 'pre_bid_file',
          corrigendum_date: 'corrigendum_file', corrigendum_time: 'corrigendum_file',
          bid_receipt_date: 'bids_file', bid_receipt_time: 'bids_file',
          tech_bid_ope_date: 'tech_open_file', tech_bid_ope_time: 'tech_open_file',
          tech_bid_eva_date: 'tech_eval_file', tech_bid_eva_time: 'tech_eval_file',
          financial_eval_date: 'financial_eval_file', financial_eval_time: 'financial_eval_file',
          loa_date: 'loa_file', loa_time: 'loa_file',
        };
        if (dateTimeToFileMap[fieldName]) {
          const fileField = dateTimeToFileMap[fieldName];
          next[fileField] = null;
          next[`existing_${fileField}`] = null;
        }
        return next;
      });

      setPreviouslyFilledFields(prev => {
        const updated = new Set(prev);
        updated.delete(fieldName);
        return updated;
      });
    }
  };

  const handleDateChange = (dateField: string, timeField: string, dateValue: string, timeValue: string) => {
    if (isFieldDisabled(dateField)) return;
    setFormData((prev: any) => ({ ...prev, [dateField]: dateValue, [timeField]: timeValue }));
    setTouched(prev => new Set([...prev, dateField, timeField]));
    if (errors[dateField] || errors[timeField]) setErrors(prev => { const ne = { ...prev }; delete ne[dateField]; delete ne[timeField]; return ne; });
  };

  const handleDivisionChange = (divisionId: string | number) => {
    if (isFieldDisabled('division_id')) return;
    setSelectedDivision(divisionId);
    setFormData((prev: any) => ({ ...prev, division_id: divisionId, work_id: "", work_cost: "", bid_security: "" }));
    if (errors.division_id) setErrors(prev => { const ne = { ...prev }; delete ne.division_id; return ne; });
  };

  const handleWorkChange = (workId: string | number) => {
    if (isFieldDisabled('work_id')) return;
    const selectedWork = works?.find((w: any) => w.id === workId);
    setFormData((prev: any) => ({ ...prev, work_id: workId, work_cost: selectedWork?.work_cost || "" }));
    if (errors.work_id) setErrors(prev => { const ne = { ...prev }; delete ne.work_id; return ne; });
  };

  const handleBlur = (field: string) => setTouched(prev => new Set(prev).add(field));

  useEffect(() => {
    if (isEditing && isDraftStatus && initialData) {
      const filledFields = computePrefilledFromInitial(initialData);
      setPreviouslyFilledFields(filledFields);
      setLockOnDraft(true);
    }
  }, [isEditing, isDraftStatus, initialData]);

  useEffect(() => {
    const getUserData = () => {
      try {
        setUserLoading(true);

        if (typeof window !== "undefined") {
          const userDetails = sessionStorage.getItem("userdetail");

          if (userDetails) {
            try {
              const parsedData = JSON.parse(userDetails);
              const userData: UserData = {
                username: parsedData.full_name || "Unknown User",
                email: parsedData.email || "unknown@example.com",
                dept_id: parsedData.department_id || 1,
                role: parsedData.role_name || "user",
                department: parsedData.department_name,
                designation: parsedData.designation_name,
                levelname: parsedData.level_name,
                levelid: parsedData.user_level_id,
                zone_id: parsedData.zone_id,
                circle_id: parsedData.circle_id,
                division_id: parsedData.division_id
              };

              setUser(userData);

              if (userData.division_id && !formData.division_id && !selectedDivision) {
                console.log("Auto-selecting user's division:", userData.division_id);
                setSelectedDivision(userData.division_id);
                setFormData((prev: any) => ({
                  ...prev,
                  division_id: userData.division_id!.toString()
                }));
              }
            } catch (parseError) {
              console.error("Error parsing user data:", parseError);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setUserLoading(false);
      }
    };

    getUserData();
  }, [formData.division_id, selectedDivision]);

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'finalized' | 'draft_update') => {
    e.preventDefault();
    setTouched(new Set(Object.keys(formData)));

    const isFinalSubmit = status === 'finalized';

    let actionType = '';
    if (isFinalSubmit) {
      actionType = 'FINAL_SUBMIT';
    } else if (isEditing && formData.id) {
      actionType = 'UPDATE';
    } else {
      actionType = 'DRAFT_SAVE';
    }

    console.log(`🔍 Setting action_type to: ${actionType} for status: ${status}`);

    if (isFinalSubmit && !validateForm(true)) {
      alert('Please fix the errors in the form before Final Submission.');
      return;
    }
    if (!isFinalSubmit && !validateForm(false)) {
      alert('Please fix the format errors in the form.');
      return;
    }

    if (isFinalSubmit && !areAllStepsComplete()) {
      alert('Please complete all document steps before final submission.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        emdfee: formData.work_cost || formData.emdfee,
        status: isFinalSubmit ? 'finalized' : 'draft',
        action_type: actionType,
        _isUpdate: isEditing,
        _originalData: originalData,
        work_id: formData.work_id || selectedDivision,
      };

      await onSubmit(submitData, status);
      console.log(submitData, 'my submot data-----------');

      const currentFilledFields = computePrefilledFromInitial(formData);
      setPreviouslyFilledFields(prev => {
        const updated = new Set(prev);
        currentFilledFields.forEach(field => updated.add(field));
        return updated;
      });

      if (!isFinalSubmit) {
        setLockOnDraft(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLockStatus = () => {
    const lockedFields = Array.from(previouslyFilledFields).filter(field =>
      formData[field] && formData[field].toString().trim() !== ''
    );

    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-700">Locked Fields ({lockedFields.length})</span>
        </div>
        {lockedFields.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {lockedFields.map(field => (
              <span
                key={field}
                className="px-2 py-1 bg-white text-blue-600 text-xs rounded border border-blue-200"
                title="Click 'Clear to edit' to modify this field"
              >
                {field.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-blue-600 text-sm">No fields are locked yet. Fields will lock after saving.</p>
        )}
      </div>
    );
  };

  const isFinalSubmitReady =
    formData.agreement_number && formData.agreement_number.trim() !== '' &&
    (formData.corrigendum_file || formData.existing_corrigendum_file) &&
    (formData.bids_file || formData.existing_bids_file) &&
    (formData.contract_file || formData.existing_contract_file);

  const workOptions = works?.map((w: any) => ({
    value: w.id,
    label: `${w.work_name} (Package: ${w.package_number || 'N/A'})`
  })) || [];

  const formatCurrency = (amount: string) => {
    if (!amount) return '0';
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(num);
  };

  if (divisionsLoading || (isEditing && !selectedDivision && initialData?.division_name)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className={`p-6 lg:p-8 ${isFinalizedStatus && isEditing
            ? 'bg-gradient-to-r from-gray-600 to-gray-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-700'
            }`}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    {isFinalizedStatus && isEditing
                      ? 'View Finalized Tender'
                      : (isDraftContinuation || lockOnDraft)
                        ? 'Continue'
                        : isEditing
                          ? 'Edit Tender'
                          : 'Create New Tender'}
                  </h1>
                  <p className="text-white/80 mt-2">
                    {isFinalizedStatus && isEditing
                      ? 'This tender is finalized and cannot be edited.'
                      : (isDraftContinuation || lockOnDraft)
                        ? 'Continuation mode. Previously filled fields are locked. Clear to edit.'
                        : isEditing
                          ? `Status: ${initialData?.status?.toUpperCase() || 'DRAFT'} • All fields are optional for drafts`
                          : 'Fill in tender details. All fields are optional for drafts.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
                {isFinalizedStatus && isEditing ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>

          {isFinalizedStatus && isEditing && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 p-6">
              <div className="flex items-start gap-3 text-red-800">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">Read-Only Mode - Finalized Tender</p>
                  <p className="text-red-700 mt-1">This tender has been finalized and cannot be edited. All fields are locked.</p>
                </div>
              </div>
            </div>
          )}

          {(isDraftContinuation || lockOnDraft) && !isFinalizedStatus && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 p-6">
              <div className="flex items-start gap-3 text-amber-800">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">Draft Continuation Mode</p>
                  <p className="text-amber-700 mt-1">Previously filled fields are locked. Use &quot;Clear to edit&quot; if needed.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step Progress Indicator */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Document Upload Steps</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full">
                  Step {currentStep + 1} of {stepConfig.length}
                </span>
              </div>

              <div className="relative">
                {/* Progress line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
                <div
                  className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${(currentStep / (stepConfig.length - 1)) * 100}%` }}
                ></div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {stepConfig.map((step, index) => {
                    const isCompleted = isStepCompleted(index);
                    const isCurrent = index === currentStep;
                    const isEnabled = index <= currentStep;

                    return (
                      <div key={index} className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCompleted || isEnabled) {
                              setCurrentStep(index);
                            }
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 relative z-10
                            ${isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-110'
                              : isCurrent
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg ring-4 ring-blue-200'
                                : isEnabled
                                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 border-2 border-blue-300 hover:bg-blue-300'
                                  : 'bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
                            }`}
                          disabled={!isEnabled && !isCompleted}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="font-semibold">{index + 1}</span>
                          )}
                        </button>
                        <span className={`text-xs font-medium text-center max-w-[80px] ${isCurrent ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                          {step.name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Step Information */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {stepConfig[currentStep].icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-blue-800">
                    Current Step: {stepConfig[currentStep].name}
                  </h3>
                  <p className="text-blue-600 mt-1">{stepConfig[currentStep].description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {isCurrentStepComplete() ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Step Complete
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Required: Upload document to proceed
                      </span>
                    )}
                  </div>
                </div>

                {/* Step Navigation Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className={`px-4 py-2 rounded-lg font-medium ${currentStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isCurrentStepComplete() || currentStep === stepConfig.length - 1}
                    className={`px-4 py-2 rounded-lg font-medium ${!isCurrentStepComplete() || currentStep === stepConfig.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      }`}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          </div>

          <form className="p-6 lg:p-8 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                  <p className="text-gray-600 text-sm mt-1">All fields are optional for drafts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isFieldShown('division_id') && (
                  <div>
                    <label className="font-medium text-gray-700 mb-2 block">Division Name</label>
                    {userLoading ? (
                      <div className="px-4 py-3 bg-gray-100 rounded-xl animate-pulse">
                        Loading user data...
                      </div>
                    ) : user?.division_id ? (
                      <div className="relative">
                        <div className="w-full px-4 py-3 border border-blue-300 rounded-xl bg-blue-50">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-medium">
                              {divisions?.data?.find((d: any) => d.id === user.division_id)?.division_name ||
                                `Division ${user.division_id}`}
                            </span>
                          </div>
                        </div>
                        <input
                          type="hidden"
                          name="division_id"
                          value={user.division_id}
                        />
                      </div>
                    ) : (
                      <CustomSelect
                        options={divisions?.data?.map((d: any) => ({ value: d.id, label: d.division_name })) || []}
                        value={formData.division_id}
                        onChange={handleDivisionChange}
                        placeholder="Select Division"
                        error={touched.has('division_id') ? errors.division_id : undefined}
                        disabled={isFieldDisabled('division_id')}
                      />
                    )}
                  </div>
                )}

                {isFieldShown('work_id') && (
                  <div>
                    <label className="font-medium text-gray-700 mb-2 block">Work:(Scheme)</label>
                    <CustomSelect
                      options={workOptions}
                      value={formData.work_id}
                      onChange={handleWorkChange}
                      placeholder={selectedDivision ? "Select Work" : "Select Division first"}
                      disabled={isFieldDisabled('work_id') || !selectedDivision || worksLoading}
                      error={touched.has('work_id') ? errors.work_id : undefined}
                    />
                    {worksLoading && (
                      <div className="mt-2 flex items-center gap-2 text-blue-600 text-sm">
                        <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span>Loading works...</span>
                      </div>
                    )}
                  </div>
                )}

                {isFieldShown('tender_ref_no') && (
                  <ModernInput
                    label="Tender Reference Number"
                    name="tender_ref_no"
                    value={formData.tender_ref_no}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('tender_ref_no')}
                    placeholder="T-2024-001"
                    error={errors.tender_ref_no}
                    disabled={isFieldDisabled('tender_ref_no')}
                    readOnly={isFieldDisabled('tender_ref_no')}
                    icon={<FileEdit className="w-4 h-4" />}
                    onClear={isFieldDisabled('tender_ref_no') ? () => clearFieldValue('tender_ref_no') : undefined}
                  />
                )}

                {isFieldShown('authority') && (
                  <ModernInput
                    label="Officer Inviting Bid"
                    name="authority"
                    value={formData.authority}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('authority')}
                    placeholder="Enter officer name"
                    error={errors.authority}
                    disabled={isFieldDisabled('authority')}
                    readOnly={isFieldDisabled('authority')}
                    icon={<User className="w-4 h-4" />}
                    onClear={isFieldDisabled('authority') ? () => clearFieldValue('authority') : undefined}
                  />
                )}

                {isFieldShown('work_cost') && (
                  <ModernInput
                    label="Estimated Cost (in Cr.)"
                    name="work_cost"
                    value={formData.work_cost ? formatCurrency(formData.work_cost) : ''}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('work_cost')}
                    placeholder="Auto-filled from Work"
                    error={errors.work_cost}
                    readOnly={true}
                    disabled={isFieldDisabled('work_cost')}
                    icon={<FaRupeeSign className="w-4 h-4" />}
                    onClear={isFieldDisabled('work_cost') ? () => clearFieldValue('work_cost') : undefined}
                  />
                )}

                {isFieldShown('bid_security') && (
                  <ModernInput
                    label="Bid Security"
                    name="bid_security"
                    value={formData.bid_security}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('bid_security')}
                    placeholder="Enter amount"
                    error={errors.bid_security}
                    disabled={isFieldDisabled('bid_security')}
                    readOnly={isFieldDisabled('bid_security')}
                    icon={<FaRupeeSign className="w-4 h-4" />}
                    onClear={isFieldDisabled('bid_security') ? () => clearFieldValue('bid_security') : undefined}
                  />
                )}

                {isFieldShown('validity') && (
                  <ModernInput
                    label="Bid Validity Period (Days)"
                    name="validity"
                    value={formData.validity}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('validity')}
                    placeholder="e.g., 90, 180"
                    error={errors.validity}
                    type="number"
                    disabled={isFieldDisabled('validity')}
                    readOnly={isFieldDisabled('validity')}
                    icon={<Calendar className="w-4 h-4" />}
                    onClear={isFieldDisabled('validity') ? () => clearFieldValue('validity') : undefined}
                  />
                )}

                {isFieldShown('remark') && (
                  <div className="lg:col-span-2">
                    <label className="font-medium text-gray-700 mb-2 block">Remarks</label>
                    <textarea
                      name="remark"
                      value={formData.remark}
                      onChange={handleInputChange}
                      placeholder="Enter any additional remarks or notes..."
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none min-h-[120px] bg-white"
                      rows={3}
                      disabled={isFieldDisabled('remark')}
                      readOnly={isFieldDisabled('remark')}
                    />
                    {isFieldDisabled('remark') && (
                      <button
                        type="button"
                        onClick={() => clearFieldValue('remark')}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                      >
                        Clear to edit
                      </button>
                    )}
                  </div>
                )}
              </div>

              {(isDraftContinuation || lockOnDraft) && showLockStatus()}
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Documents & Timeline</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Complete steps in sequence. Current step: {currentStep + 1}. {stepConfig[currentStep].name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {fileSections
                  .filter(f => {
                    const stepIndex = stepConfig.findIndex(step =>
                      step.fields.includes(f.fileField)
                    );
                    return stepIndex <= currentStep;
                  })
                  .map((f) => {
                    const stepIndex = stepConfig.findIndex(step =>
                      step.fields.includes(f.fileField)
                    );
                    const isCurrentStepField = stepIndex === currentStep;
                    const isCompleted = stepIndex < currentStep;

                    const sectionStyle = isCurrentStepField
                      ? 'border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-white shadow-md relative'
                      : isCompleted
                        ? 'border-2 border-green-200 bg-gradient-to-br from-green-50 to-white'
                        : 'border-2 border-gray-100 bg-white hover:border-blue-200';

                    return (
                      <div
                        key={f.fileField}
                        className={`space-y-4 p-5 rounded-xl transition-all duration-300 ${sectionStyle}`}
                      >
                        {isCurrentStepField && (
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full animate-pulse">
                              Current
                            </span>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Done
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isCurrentStepField ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-50'}`}>
                              <div className={`${isCurrentStepField ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>{f.icon}</div>
                            </div>
                            <h3 className={`font-semibold ${isCurrentStepField ? 'text-blue-800' : isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                              {f.label}
                            </h3>
                          </div>

                          {isCompleted && (
                            <ChevronRightIcon className="w-4 h-4 text-green-500" />
                          )}
                        </div>

                        {f.dateField && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className={`text-sm font-medium ${isFieldDisabled(f.dateField) ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                                {isFieldDisabled(f.dateField) && (
                                  <button
                                    type="button"
                                    onClick={() => clearFieldValue(f.dateField)}
                                    className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-1 py-0.5 rounded transition-colors"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                              <input
                                type="date"
                                value={formData[f.dateField]}
                                onChange={e => handleDateChange(f.dateField, f.timeField, e.target.value, formData[f.timeField] || '00:00')}
                                onBlur={() => handleBlur(f.dateField)}
                                disabled={isFieldDisabled(f.dateField)}
                                readOnly={isFieldDisabled(f.dateField)}
                                className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${isFieldDisabled(f.dateField) ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                  : errors[f.dateField] ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
                                  }`}
                              />
                            </div>

                            {f.showTime && (
                              <div>
                                <div className="flex justify-between items-center mb-1.5">
                                  <label className={`text-sm font-medium ${isFieldDisabled(f.timeField) ? 'text-gray-400' : 'text-gray-600'}`}>Time</label>
                                  {isFieldDisabled(f.timeField) && (
                                    <button
                                      type="button"
                                      onClick={() => clearFieldValue(f.timeField)}
                                      className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-1 py-0.5 rounded transition-colors"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="time"
                                  value={formData[f.timeField]}
                                  onChange={e => handleDateChange(f.dateField, f.timeField, formData[f.dateField] || '', e.target.value)}
                                  onBlur={() => handleBlur(f.timeField)}
                                  disabled={isFieldDisabled(f.timeField)}
                                  readOnly={isFieldDisabled(f.timeField)}
                                  className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${isFieldDisabled(f.timeField) ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                    : errors[f.timeField] ? 'border-red-500 bg-red-50'
                                      : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'
                                    }`}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <ModernFileUpload
                          label={`${f.label} File`}
                          name={f.fileField}
                          onChange={(e) => handleFileChange(e, f.existingFileField)}
                          error={errors[f.fileField]}
                          existingFile={formData[f.existingFileField]}
                          getFileUrl={(filename) => getFileUrl(filename) || "#"}
                          icon={<Upload className="w-4 h-4" />}
                          disabled={isFieldDisabled(f.fileField)}
                          onClear={isFieldDisabled(f.fileField) ? () => clearFieldValue(f.fileField) : undefined}
                        />
                      </div>
                    );
                  })}
                     {isFieldShown('agreement_number') && (
                  <ModernInput
                    label="Agreement Number / Work Order"
                    name="agreement_number"
                    value={formData.agreement_number}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('agreement_number')}
                    placeholder="WO-2024-001"
                    error={errors.agreement_number}
                    disabled={isFieldDisabled('agreement_number')}
                    readOnly={isFieldDisabled('agreement_number')}
                    icon={<FileCheck className="w-4 h-4" />}
                    onClear={isFieldDisabled('agreement_number') ? () => clearFieldValue('agreement_number') : undefined}
                  />
                )}
              </div>
            </section>

            <div className="pt-8 border-t border-gray-100">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Finalized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Draft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Current Step</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Locked/Disabled</span>
                  </div>
                  {(isFinalizedStatus && isEditing) && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Read Only</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {!isFinalizedStatus && (
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, isDraftContinuation ? 'draft_update' : 'draft')}
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-[180px]"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          {isDraftContinuation ? 'Update' : 'Save'}
                        </>
                      )}
                    </button>
                  )}

                  {!isFinalizedStatus && isFinalSubmitReady && areAllStepsComplete() && (
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'finalized')}
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-[180px]"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Final Submit
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isFinalizedStatus && (!isFinalSubmitReady || !areAllStepsComplete()) && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {!isFinalSubmitReady
                      ? 'To enable Final Submit, please fill: Agreement Number, Amendment/Corrigendum, Last Date for Receipt of Bids, and Signed Agreement.'
                      : `Complete all document steps (${currentStep + 1}/${stepConfig.length}) to enable Final Submit.`
                    }
                  </p>
                </div>
              )}

              {/* Progress Summary */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-800">Document Progress</p>
                    <p className="text-blue-600 text-sm mt-1">
                      {stepConfig.filter((_, index) => isStepCompleted(index)).length} of {stepConfig.length} steps completed
                    </p>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                      style={{
                        width: `${(stepConfig.filter((_, index) => isStepCompleted(index)).length / stepConfig.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const TenderModule: React.FC = () => {
  const { data: tenders, refetch: refetchTenders } = useTenders();
  const saveTenderMutation = useSaveTender();
  const getFileUrl = useFileUrl();

  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLogModal, setShowLogModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const getUserData = () => {
      try {
        setUserLoading(true);

        if (typeof window !== "undefined") {
          const userDetails = sessionStorage.getItem("userdetail");

          if (userDetails) {
            try {
              const parsedData = JSON.parse(userDetails);
              const userData: UserData = {
                username: parsedData.full_name || "Unknown User",
                email: parsedData.email || "unknown@example.com",
                dept_id: parsedData.department_id || 1,
                role: parsedData.role_id || "user",
                department: parsedData.department,
                designation: parsedData.designation,
                levelname: parsedData.level,
                levelid: parsedData.user_level_id,
                zone_id: parsedData.zone_id,
                circle_id: parsedData.circle_id,
                division_id: parsedData.division_id
              };

              setUser(userData);
              console.log("✅ User loaded with division_id:", userData.division_id);
            } catch (parseError) {
              console.error("❌ Error parsing user data:", parseError);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
      } finally {
        setUserLoading(false);
      }
    };

    getUserData();
  }, []);

  const filteredTenders = tenders?.filter((tender: Tender) => {
    if (user?.division_id) {
      const isUserDivisionTender =
        tender.division_id === user.division_id ||
        (tender.division_name &&
          tender.division_name.toLowerCase().includes(
            user.division_id.toString().toLowerCase()
          ));
      if (!isUserDivisionTender) return false;
    }
    else if (user?.circle_id) {
      const isUserCircleTender =
        tender.circle_id === user.circle_id ||
        (tender.circle_name &&
          tender.circle_name.toLowerCase().includes(
            user.circle_id.toString().toLowerCase()
          ));
      if (!isUserCircleTender) return false;

    }
    else if (user?.zone_id) {
      const isUserZoneTender =
        tender.zone_id === user.zone_id ||
        (tender.zone_name &&
          tender.zone_name.toLowerCase().includes(
            user.zone_id.toString().toLowerCase()
          ));
      if (!isUserZoneTender) return false;

    }
    const matchesSearch = searchTerm === '' ||
      (tender.division_name && tender.division_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tender.work_name && tender.work_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tender.tenderRefNo && tender.tenderRefNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tender.tenderAuthority && tender.tenderAuthority.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDivision = !user?.division_id &&
      (filterDivision === '' || tender.division_name === filterDivision);

    return matchesSearch && (user?.division_id ? true : matchesDivision);
  }) || [];

  const totalPages = Math.ceil((filteredTenders?.length || 0) / itemsPerPage);
  const paginatedTenders = filteredTenders?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const divisionOptions = Array.from(
    new Set(
      tenders
        ?.filter((t: Tender) =>
          !user?.division_id ||
          t.division_id === user.division_id ||
          t.division_name?.includes(user.division_id.toString())
        )
        ?.map((t: Tender) => t.division_name) || []
    )
  );

  const handleSaveTender = async (formData: any, status: 'draft' | 'finalized' | 'draft_update') => {
    try {
      const submitData = new FormData();

      const dateTimeCombinations = [
        { dateField: 'newsdate', timeField: 'newsdate_time', combinedField: 'newsdate' },
        { dateField: 'nit_date', timeField: 'nit_time', combinedField: 'nitDate' },
        { dateField: 'sale_start_date', timeField: 'sale_start_time', combinedField: 'saleStartDate' },
        { dateField: 'pre_bid_date', timeField: 'pre_bid_time', combinedField: 'preBidDate' },
        { dateField: 'corrigendum_date', timeField: 'corrigendum_time', combinedField: 'corrigendumDate' },
        { dateField: 'bid_receipt_date', timeField: 'bid_receipt_time', combinedField: 'bidReceiptDate' },
        { dateField: 'tech_bid_ope_date', timeField: 'tech_bid_ope_time', combinedField: 'techBidopeningDate' },
        { dateField: 'tech_bid_eva_date', timeField: 'tech_bid_eva_time', combinedField: 'techBidevaluationDate' },
        { dateField: 'financial_eval_date', timeField: 'financial_eval_time', combinedField: 'financial_eval_date' },
        { dateField: 'loa_date', timeField: 'loa_time', combinedField: 'loa_date' },
      ];

      const processedData: any = { ...formData };

      dateTimeCombinations.forEach(({ dateField, timeField, combinedField }) => {
        const dateValue = processedData[dateField];
        const timeValue = processedData[timeField];

        if (dateValue) {
          if (timeValue) {
            processedData[combinedField] = `${dateValue}T${timeValue}:00`;
          } else {
            processedData[combinedField] = `${dateValue}T00:00:00`;
          }
          console.log(`✅ Combined ${combinedField}:`, processedData[combinedField]);
        } else {
          processedData[combinedField] = null;
        }
      });

      const basicFields = [
        'id', 'division_id', 'work_id', 'tender_ref_no', 'authority',
        'work_cost', 'bid_security', 'validity', 'agreement_number', 'remark',
        'nameofpiu', 'newsprno'
      ];

      basicFields.forEach(field => {
        if (processedData[field] !== undefined && processedData[field] !== null && processedData[field] !== '') {
          submitData.append(field, String(processedData[field]));
          console.log(`➕ Appended ${field}:`, processedData[field]);
        }
      });

      const emdfeeValue = processedData.work_cost || processedData.emdfee;
      if (emdfeeValue && emdfeeValue !== '') {
        submitData.append('emdfee', String(emdfeeValue));
        console.log(`💰 Appended emdfee:`, emdfeeValue);
      }

      dateTimeCombinations.forEach(({ combinedField }) => {
        if (processedData[combinedField] !== undefined && processedData[combinedField] !== null && processedData[combinedField] !== '') {
          submitData.append(combinedField, processedData[combinedField]);
          console.log(`📅 Appended date ${combinedField}:`, processedData[combinedField]);
        }
      });

      const fileFields = [
        'newspaper_file', 'nit_file', 'sale_file', 'pre_bid_file',
        'corrigendum_file', 'bids_file', 'tech_open_file', 'tech_eval_file',
        'financial_eval_file', 'loa_file', 'contract_file'
      ];

      fileFields.forEach(field => {
        const file = processedData[field];

        const isFile = file &&
          typeof file === 'object' &&
          'name' in file &&
          'size' in file &&
          'type' in file;

        if (isFile) {
          submitData.append(field, file);
          console.log(`📎 Appended file ${field}:`, file.name);
        }
      });

      const existingFileFields = [
        'existing_newspaper_file', 'existing_nit_file', 'existing_sale_file', 'existing_pre_bid_file',
        'existing_corrigendum_file', 'existing_bids_file', 'existing_tech_open_file', 'existing_tech_eval_file',
        'existing_financial_eval_file', 'existing_loa_file', 'existing_contract_file'
      ];

      existingFileFields.forEach(field => {
        if (processedData[field] && !processedData[field.replace('existing_', '')]) {
          submitData.append(field, processedData[field]);
          console.log(`📎 Appended existing file ${field}:`, processedData[field]);
        }
      });

      const actionType = status === 'finalized' ? 'FINAL_SUBMIT' :
        (formData.id ? 'UPDATE' : 'DRAFT_SAVE');

      submitData.append('action_type', actionType);
      submitData.append('status', status === 'finalized' ? 'finalized' : 'draft');

      console.log(`🎯 Action type: ${actionType}, Status: ${status === 'finalized' ? 'finalized' : 'draft'}`);

      console.log('📤 Final FormData being sent:');
      for (const [key, value] of submitData.entries()) {
        const isFile = value &&
          typeof value === 'object' &&
          'name' in value &&
          'size' in value &&
          'type' in value;

        if (isFile) {
          console.log(`  ${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      await new Promise<void>((resolve, reject) => {
        saveTenderMutation.mutate(submitData, {
          onSuccess: async (response: any) => {
            console.log("✅ Save successful:", response);

            if (status === 'finalized') {
              alert('Tender finalized successfully!');
              setPageMode('list');
              setSelectedTender(null);
            } else {
              alert('Draft saved successfully!');
              setPageMode('list');
            }

            await refetchTenders?.();

            resolve();
          },
          onError: (error: any) => {
            console.error('❌ Error saving tender:', error);
            alert(`Error saving tender: ${error.message || 'Unknown error'}`);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Form preparation error:', error);
      alert('Failed to prepare form data');
    }
  };

  const handleViewTender = (tender: Tender) => {
    setSelectedTender(tender);
    setPageMode('view');
  };

  const handleEditTender = (tender: Tender) => {
    setSelectedTender(tender);
    setPageMode('edit');
  };

  const handleViewLogs = (tender: Tender) => {
    setSelectedTender(tender);
    setShowLogModal(true);
  };

  const handleAddNew = () => {
    setSelectedTender(null);
    setPageMode('create');
  };

  const handleBackToList = () => {
    setPageMode('list');
    setSelectedTender(null);
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '0';
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(num);
  };

  if (pageMode === 'create' || pageMode === 'edit') {
    return (
      <TenderForm
        initialData={selectedTender}
        onSubmit={handleSaveTender}
        onCancel={handleBackToList}
        isEditing={pageMode === 'edit'}
        originalData={selectedTender}
      />
    );
  }

  if (pageMode === 'view' && selectedTender) {
    return (
      <TenderDetailView
        tender={selectedTender}
        onBack={handleBackToList}
        onViewLogs={() => handleViewLogs(selectedTender)}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tender Management</h1>
                <p className="text-gray-600 mt-2">Manage all tender processes in one place</p>
              </div>
            </div>
            {user?.role == '5' && (
              <button
                onClick={handleAddNew}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <Plus className="w-5 h-5" />
                New Tender
              </button>)}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenders by division, work, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterDivision}
                    onChange={(e) => setFilterDivision(e.target.value)}
                    className="pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white font-medium min-w-[180px]"
                  >
                    <option value="">All Divisions</option>
                    {(divisionOptions as string[]).map((division: string, index: number) => (
                      <option key={index} value={division}>{division}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Tender List</h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                    {filteredTenders?.length || 0} Tenders
                  </div>
                  <div className="flex items-center gap-2 p-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Finalized</span>
                  </div>
                  <div className="flex items-center gap-2 p-4">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Draft</span>
                  </div>
                </div>
              </div>

              {paginatedTenders && paginatedTenders.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full">
                        <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="p-4 text-left font-semibold">Division Name</th>
                          <th className="p-4 text-left font-semibold">Name of Work</th>
                          <th className="p-4 text-left font-semibold">Tender Reference No</th>
                          <th className="p-4 text-left font-semibold">Work Order</th>
                          <th className="p-4 text-left font-semibold">Status</th>
                          <th className="p-4 text-left font-semibold">Work Cost</th>
                          <th className="p-4 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedTenders.map((t: Tender) => (
                          <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building className="w-4 h-4" /></div>
                                <span className="font-medium text-gray-800">{t.division_name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div
                                className="font-medium text-gray-800 line-clamp-3 max-w-[200px]"
                                title={t.work_name}
                              >
                                {t.work_name}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">{t.tenderRefNo}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-gray-700">{t.agreement_no}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${t.status === 'finalized' ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-800">₹{t.emdfee ? formatCurrency(t.emdfee) : '0'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewTender(t)}
                                  className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {t.status === 'draft' && (
                                  <button
                                    onClick={() => handleEditTender(t)}
                                    className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                    title="Continue"
                                  >
                                    <FileText className="w-4 h-5" />
                                  </button>
                                )}

                                {t.status !== 'draft' && (
                                  <div className="p-2.5 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed" title="Cannot edit finalized tender">
                                    <Lock className="w-4 h-4" />
                                  </div>
                                )}

                                <button
                                  onClick={() => handleViewLogs(t)}
                                  className="p-2.5 bg-gradient-to-r from-green-50 to-green-100 text-green-600 hover:from-green-100 hover:to-green-200 rounded-lg transition-colors shadow-sm hover:shadow"
                                  title="View History"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col lg:flex-row justify-between items-center mt-8 gap-4 p-4">
                    <div className="text-gray-600 font-medium">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTenders?.length || 0)} of {filteredTenders?.length || 0} tenders
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 border-2 border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2.5 font-medium rounded-lg transition-colors ${currentPage === page ? 'bg-blue-600 text-white'
                            : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 border-2 border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl mb-6">
                    <Layers className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No tenders found</h3>
                  <p className="text-gray-500 mb-8">Start by creating your first tender</p>

                  {user?.role == '5' && (
                    <button
                      onClick={handleAddNew}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                      <Plus className="w-5 h-5" />
                      Create New Tender
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLogModal && selectedTender && (
        <LogModal
          tenderId={selectedTender.id}
          onClose={() => setShowLogModal(false)}
          isOpen={showLogModal}
        />
      )}
    </>
  );
};

export default TenderModule;