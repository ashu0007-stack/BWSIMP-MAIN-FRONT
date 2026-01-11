// components/UserForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Building2, Ruler, DollarSign, AlertTriangle, Upload, File, Image as LucideImage } from 'lucide-react';
import Image from 'next/image';
import { useWorkLogRdd, useCreateOrUpdateWorkLogRdd } from '@/hooks/useWorkLogRdd';
import toast from 'react-hot-toast';

interface UserFormData {
  user_id?: number;
  agency_name: string;
  command_area: number;
  proposed_length: number;
  proposed_width: number;
  proposed_height: number;
  wages_amount: number;
  material_amount: number;
  total_sanction_amount: number;
  initial_upload: File | null;  // Remove the ? to make it non-optional
  final_upload: File | null; 
}

interface FormErrors {
  agency_name?: string;
  command_area?: string;
  proposed_length?: string;
  proposed_width?: string;
  proposed_height?: string;
  wages_amount?: string;
  material_amount?: string;
  total_sanction_amount?: string;
  initial_upload?: string;
  final_upload?: string;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingEntry: any | null;
  isLoading?: boolean;
}

// Helper function to map upload field to progress key
const getProgressKey = (field: 'initial_upload' | 'final_upload'): 'initial' | 'final' => {
  return field === 'initial_upload' ? 'initial' : 'final';
};

export default function UserForm({ isOpen, onClose, editingEntry }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    agency_name: '',
    command_area: 0,
    proposed_length: 0,
    proposed_width: 0,
    proposed_height: 0,
    wages_amount: 0,
    material_amount: 0,
    total_sanction_amount: 0,
    initial_upload: null,
    final_upload: null,
  });

  const [initialValues, setInitialValues] = useState({
    command_area: 0,
    proposed_length: 0,
    proposed_width: 0,
    proposed_height: 0,
    wages_amount: 0,
    material_amount: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadProgress, setUploadProgress] = useState({
    initial: 0,
    final: 0
  });

  const { data: existingWorkLog, isLoading: isLoadingWorkLog } = useWorkLogRdd(
    editingEntry?.id
  );

  const { mutate: saveWorkLog, isPending: isSaving } = useCreateOrUpdateWorkLogRdd();

  useEffect(() => {
    if (editingEntry) {
      const wages = Number(editingEntry.sanction_amt_wages) || 0;
      const material = Number(editingEntry.sanction_amt_material) || 0;
      const total = wages + material;

      // Set initial values from data_entries table
      const initialVals = {
        command_area: Number(editingEntry.command_area) || 0,
        proposed_length: Number(editingEntry.prop_length) || 0,
        proposed_width: Number(editingEntry.prop_width) || 0,
        proposed_height: Number(editingEntry.prop_height) || 0,
        wages_amount: wages,
        material_amount: material,
      };

      setInitialValues(initialVals);

      const baseFormData = {
        user_id: editingEntry.id,
        agency_name: editingEntry.agency || '',
        command_area: Number(editingEntry.command_area) || 0,
        proposed_length: Number(editingEntry.prop_length) || 0,
        proposed_width: Number(editingEntry.prop_width) || 0,
        proposed_height: Number(editingEntry.prop_height) || 0,
        wages_amount: wages,
        material_amount: material,
        total_sanction_amount: total,
        initial_upload: null,
        final_upload: null,
      };

      if (existingWorkLog) {
        setFormData({
          ...baseFormData,
          agency_name: existingWorkLog.agency_name || baseFormData.agency_name,
          command_area: existingWorkLog.command_area || baseFormData.command_area,
          proposed_length: existingWorkLog.proposed_length || baseFormData.proposed_length,
          proposed_width: existingWorkLog.proposed_width || baseFormData.proposed_width,
          proposed_height: existingWorkLog.proposed_height || baseFormData.proposed_height,
          wages_amount: existingWorkLog.wages_amount || baseFormData.wages_amount,
          material_amount: existingWorkLog.material_amount || baseFormData.material_amount,
          total_sanction_amount: existingWorkLog.total_sanction_amount || baseFormData.total_sanction_amount,
        });
      } else {
        setFormData(baseFormData);
      }
    } else {
      setFormData({
        agency_name: '',
        command_area: 0,
        proposed_length: 0,
        proposed_width: 0,
        proposed_height: 0,
        wages_amount: 0,
        material_amount: 0,
        total_sanction_amount: 0,
        initial_upload: null,
        final_upload: null,
      });
      setInitialValues({
        command_area: 0,
        proposed_length: 0,
        proposed_width: 0,
        proposed_height: 0,
        wages_amount: 0,
        material_amount: 0,
      });
    }
    setErrors({});
    setUploadProgress({ initial: 0, final: 0 });
  }, [editingEntry, existingWorkLog]);

  useEffect(() => {
    const total = formData.wages_amount + formData.material_amount;
    setFormData(prev => ({
      ...prev,
      total_sanction_amount: total
    }));
  }, [formData.wages_amount, formData.material_amount]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.agency_name.trim()) {
      newErrors.agency_name = 'Agency name is required';
    }

    // Validate against initial values
    const commandArea = formData.command_area ?? 0;
    const proposedLength = formData.proposed_length ?? 0;
    const proposedWidth = formData.proposed_width ?? 0;
    const proposedHeight = formData.proposed_height ?? 0;
    const wagesAmount = formData.wages_amount ?? 0;
    const materialAmount = formData.material_amount ?? 0;

    if (commandArea < 0) {
      newErrors.command_area = 'Command area cannot be negative';
    } else if (commandArea > initialValues.command_area) {
      newErrors.command_area = `Command area cannot exceed initial value (${initialValues.command_area} Hac.)`;
    }

    if (proposedLength < 0) {
      newErrors.proposed_length = 'Length cannot be negative';
    } else if (proposedLength > initialValues.proposed_length) {
      newErrors.proposed_length = `Length cannot exceed initial value (${initialValues.proposed_length}m)`;
    }

    if (proposedWidth < 0) {
      newErrors.proposed_width = 'Width cannot be negative';
    } else if (proposedWidth > initialValues.proposed_width) {
      newErrors.proposed_width = `Width cannot exceed initial value (${initialValues.proposed_width}m)`;
    }

    if (proposedHeight < 0) {
      newErrors.proposed_height = 'Height cannot be negative';
    } else if (proposedHeight > initialValues.proposed_height) {
      newErrors.proposed_height = `Height cannot exceed initial value (${initialValues.proposed_height}m)`;
    }

    if (wagesAmount < 0) {
      newErrors.wages_amount = 'Wages amount cannot be negative';
    } else if (wagesAmount > initialValues.wages_amount) {
      newErrors.wages_amount = `Wages amount cannot exceed initial value (₹${initialValues.wages_amount.toLocaleString('en-IN')})`;
    }

    if (materialAmount < 0) {
      newErrors.material_amount = 'Material amount cannot be negative';
    } else if (materialAmount > initialValues.material_amount) {
      newErrors.material_amount = `Material amount cannot exceed initial value (₹${initialValues.material_amount.toLocaleString('en-IN')})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateImageFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleFileUpload = (field: 'initial_upload' | 'final_upload', file: File) => {
    if (!validateImageFile(file)) {
      return;
    }

    // Map the field to the correct progress key
    const progressKey = getProgressKey(field);
    
    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev[progressKey] + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return { ...prev, [progressKey]: 100 };
        }
        return { ...prev, [progressKey]: newProgress };
      });
    }, 100);

    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const removeFile = (field: 'initial_upload' | 'final_upload') => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
    const progressKey = getProgressKey(field);
    setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id) {
      toast.error('No data entry ID found');
      return;
    }
    
    if (validateForm()) {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('data_entry_id', formData.user_id.toString());
      formDataToSend.append('agency_name', formData.agency_name);
      formDataToSend.append('command_area', formData.command_area.toString());
      formDataToSend.append('proposed_length', formData.proposed_length.toString());
      formDataToSend.append('proposed_width', formData.proposed_width.toString());
      formDataToSend.append('proposed_height', formData.proposed_height.toString());
      formDataToSend.append('wages_amount', formData.wages_amount.toString());
      formDataToSend.append('material_amount', formData.material_amount.toString());
      formDataToSend.append('total_sanction_amount', formData.total_sanction_amount.toString());

      // Append files if they exist
      if (formData.initial_upload) {
        formDataToSend.append('initial_upload', formData.initial_upload);
      }
      if (formData.final_upload) {
        formDataToSend.append('final_upload', formData.final_upload);
      }

      // Convert FormData to regular object for the hook (if your hook doesn't support FormData)
      const workLogData = {
        data_entry_id: formData.user_id,
        agency_name: formData.agency_name,
        command_area: formData.command_area,
        proposed_length: formData.proposed_length,
        proposed_width: formData.proposed_width,
        proposed_height: formData.proposed_height,
        wages_amount: formData.wages_amount,
        material_amount: formData.material_amount,
        total_sanction_amount: formData.total_sanction_amount,
        initial_upload: formData.initial_upload,
        final_upload: formData.final_upload,
      };

      saveWorkLog(workLogData, {
        onSuccess: () => {
          toast.success('Work progress saved successfully!');
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to save work progress');
        }
      });
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClose = () => {
    if (!isSaving && !isLoadingWorkLog) {
      setErrors({});
      setUploadProgress({ initial: 0, final: 0 });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modern Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {editingEntry ? 'Edit Work Progress' : 'Add Work Progress'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {editingEntry ? 'Update existing work details' : 'Enter new work progress information'}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSaving || isLoadingWorkLog}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingWorkLog && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 size={48} className="animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 font-medium">Loading work progress data...</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        {!isLoadingWorkLog && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">
              {/* Work Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Work Code" value={editingEntry?.work_code} />
                  <InfoItem label="Work Name" value={editingEntry?.work_name} />
                  <InfoItem label="District" value={editingEntry?.district_name || editingEntry?.district} />
                  <InfoItem label="Block" value={editingEntry?.block_name || editingEntry?.block} />
                </div>
              </div>

              {/* Initial Values Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Important Notice</p>
                    <p>All values must be less than or equal to the initial sanctioned values from the original data entry.</p>
                  </div>
                </div>
              </div>

              {/* Agency & Command Area */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agency Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.agency_name}
                    onChange={(e) => handleInputChange('agency_name', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                      errors.agency_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="">Select Agency Name</option>
                    <option value="Agency A">Agency A</option>
                    <option value="Agency B">Agency B</option>
                    <option value="Agency C">Agency C</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.agency_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.agency_name}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Command Area (Hac.)
                    </label>
                    <span className="text-xs text-gray-500">
                      Initial: {initialValues.command_area} Hac.
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.command_area || ''}
                    onChange={(e) => handleInputChange('command_area', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                      errors.command_area ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                    }`}
                    placeholder="0.00"
                    disabled={isSaving}
                    max={initialValues.command_area}
                  />
                  {errors.command_area && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.command_area}
                    </p>
                  )}
                </div>
              </div>

              {/* Measurements Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Ruler className="text-gray-700" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Proposed Dimensions</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DimensionInput
                    label="Length (m)"
                    value={formData.proposed_length}
                    initialValue={initialValues.proposed_length}
                    onChange={(val) => handleInputChange('proposed_length', val)}
                    error={errors.proposed_length}
                    disabled={isSaving}
                  />
                  <DimensionInput
                    label="Width (m)"
                    value={formData.proposed_width}
                    initialValue={initialValues.proposed_width}
                    onChange={(val) => handleInputChange('proposed_width', val)}
                    error={errors.proposed_width}
                    disabled={isSaving}
                  />
                  <DimensionInput
                    label="Height (m)"
                    value={formData.proposed_height}
                    initialValue={initialValues.proposed_height}
                    onChange={(val) => handleInputChange('proposed_height', val)}
                    error={errors.proposed_height}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <LucideImage className="text-gray-700" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Image Uploads</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUpload
                    label="Initial Upload"
                    file={formData.initial_upload}
                    progress={uploadProgress.initial}
                    onFileUpload={(file) => handleFileUpload('initial_upload', file)}
                    onRemoveFile={() => removeFile('initial_upload')}
                    disabled={isSaving}
                  />
                  <ImageUpload
                    label="Final Upload"
                    file={formData.final_upload}
                    progress={uploadProgress.final}
                    onFileUpload={(file) => handleFileUpload('final_upload', file)}
                    onRemoveFile={() => removeFile('final_upload')}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Financial Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-gray-700" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FinanceInput
                    label="Wages Amount"
                    value={formData.wages_amount}
                    initialValue={initialValues.wages_amount}
                    onChange={(val) => handleInputChange('wages_amount', val)}
                    error={errors.wages_amount}
                    disabled={isSaving}
                  />
                  <FinanceInput
                    label="Material Amount"
                    value={formData.material_amount}
                    initialValue={initialValues.material_amount}
                    onChange={(val) => handleInputChange('material_amount', val)}
                    error={errors.material_amount}
                    disabled={isSaving}
                  />
                </div>

                {/* Total Amount Display */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Sanction Amount</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ₹{formData.total_sanction_amount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Initial Total: ₹{(initialValues.wages_amount + initialValues.material_amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <DollarSign className="text-green-600" size={32} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Progress
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Helper Components
const InfoItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="bg-white/60 rounded-lg px-4 py-3">
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value || '—'}</p>
  </div>
);

const DimensionInput = ({ 
  label, 
  value, 
  initialValue,
  onChange, 
  error, 
  disabled 
}: { 
  label: string; 
  value: number; 
  initialValue: number;
  onChange: (val: number) => void; 
  error?: string; 
  disabled: boolean;
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <span className="text-xs text-gray-500">
        Initial: {initialValue}m
      </span>
    </div>
    <input
      type="number"
      step="0.01"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className={`w-full px-4 py-3 bg-white border-2 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
      }`}
      disabled={disabled}
      placeholder="0.00"
      max={initialValue}
    />
    {error && (
      <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
        {error}
      </p>
    )}
  </div>
);

const FinanceInput = ({ 
  label, 
  value, 
  initialValue,
  onChange, 
  error, 
  disabled 
}: { 
  label: string; 
  value: number; 
  initialValue: number;
  onChange: (val: number) => void; 
  error?: string; 
  disabled: boolean;
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <span className="text-xs text-gray-500">
        Initial: ₹{initialValue.toLocaleString('en-IN')}
      </span>
    </div>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
      <input
        type="number"
        step="0.01"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`w-full pl-8 pr-4 py-3 bg-white border-2 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
        }`}
        disabled={disabled}
        placeholder="0.00"
        max={initialValue}
      />
    </div>
    {error && (
      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
        {error}
      </p>
    )}
  </div>
);

interface ImageUploadProps { 
  label: string; 
  file: File | null; 
  progress: number;
  onFileUpload: (file: File) => void; 
  onRemoveFile: () => void; 
  disabled: boolean;
}

const ImageUpload = ({ 
  label, 
  file, 
  progress, 
  onFileUpload, 
  onRemoveFile, 
  disabled 
}: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileUpload(droppedFile);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-xl p-6 shadow-sm">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>
      
      {!file ? (
        <div 
          className="flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-lg p-6 text-center transition-all hover:border-purple-300 hover:bg-white/50 cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <LucideImage className="text-purple-400 mb-2" size={32} />
          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500 mb-3">JPG, JPEG, PNG, GIF, WEBP (Max 5MB)</p>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id={`image-upload-${label.toLowerCase().replace(' ', '-')}`}
            disabled={disabled}
            accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/jpg,image/png,image/gif,image/webp"
          />
          <label
            htmlFor={`image-upload-${label.toLowerCase().replace(' ', '-')}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg cursor-pointer transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose Image
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LucideImage className="text-blue-500" size={20}  />
              <div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              disabled={disabled}
              className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Image Preview */}
          {previewUrl && (
            <div className="relative w-full h-32 mt-3">
              <Image 
                src={previewUrl} 
                alt={`${label} preview`}
                fill
                className="object-cover rounded-lg border border-gray-200"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          
          {progress > 0 && progress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
          {progress === 100 && (
            <div className="flex items-center gap-2 text-green-600 text-sm mt-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Upload Complete
            </div>
          )}
        </div>
      )}
    </div>
  );
};