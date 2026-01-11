import { Calendar, Upload, AlertCircle } from "lucide-react";
import { FormProps } from "../../types";
import { useState, useEffect } from "react";

export default function TimelineDocumentsSection({ 
  formData, 
  setFormData, 
  errors,
  setErrors,
  today, 
  getFieldError 
}: FormProps) {
  
  const [fileError, setFileError] = useState("");
  const [completionMinDate, setCompletionMinDate] = useState(today);

  // Update completion date minimum when start date changes
  useEffect(() => {
    if (formData.workStartDate) {
      setCompletionMinDate(formData.workStartDate);
    } else {
      setCompletionMinDate(today);
    }
  }, [formData.workStartDate, today]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (fileError && name === 'asUpload') {
      setFileError("");
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If start date changed and completion date is before it, clear completion date
    if (name === 'workStartDate' && formData.workCompletionDate) {
      const startDate = new Date(value);
      const completionDate = new Date(formData.workCompletionDate);
      
      if (completionDate < startDate) {
        setFormData(prev => ({ ...prev, workCompletionDate: "" }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clear previous errors
    setFileError("");
    if (errors.asUpload) {
      setErrors(prev => ({ ...prev, asUpload: "" }));
    }

    if (file) {
      console.log("File selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeMB: (file.size / 1024 / 1024).toFixed(2)
      });

      // Validate file extension first (case-insensitive)
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'pdf') {
        const errorMsg = "Only .pdf files are allowed";
        setFileError(errorMsg);
        setErrors(prev => ({ ...prev, asUpload: errorMsg }));
        e.target.value = '';
        return;
      }

      // Validate MIME type
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = "Invalid file type. Only PDF files are allowed";
        setFileError(errorMsg);
        setErrors(prev => ({ ...prev, asUpload: errorMsg }));
        e.target.value = '';
        return;
      }

      // Validate file size (5MB max)
      const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxFileSize) {
        const errorMsg = `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 5MB`;
        setFileError(errorMsg);
        setErrors(prev => ({ ...prev, asUpload: errorMsg }));
        e.target.value = '';
        return;
      }

      console.log("✅ Valid PDF file selected:", {
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB"
      });
    }

    setFormData(prev => ({ ...prev, asUpload: file }));
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, asUpload: null }));
    setFileError("");
    if (errors.asUpload) {
      setErrors(prev => ({ ...prev, asUpload: "" }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-800">Timeline & Documents</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Start Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Work Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="workStartDate"
              value={formData.workStartDate}
              onChange={handleDateChange}
              min={today}
              className={`w-full border ${
                getFieldError('workStartDate') ? 'border-red-500' : 'border-slate-300'
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
              required
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          {getFieldError('workStartDate') && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {getFieldError('workStartDate')}
            </p>
          )}
          {formData.workStartDate && !getFieldError('workStartDate') && (
            <p className="text-green-600 text-sm mt-1">Selected: {formData.workStartDate}</p>
          )}
        </div>

        {/* Completion Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Completion Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="workCompletionDate"
              value={formData.workCompletionDate}
              onChange={handleDateChange}
              min={completionMinDate}
              disabled={!formData.workStartDate}
              className={`w-full border ${
                getFieldError('workCompletionDate') ? 'border-red-500' : 'border-slate-300'
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 disabled:cursor-not-allowed`}
              required
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          {getFieldError('workCompletionDate') && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {getFieldError('workCompletionDate')}
            </p>
          )}
          {!formData.workStartDate && (
            <p className="text-amber-600 text-sm mt-1">Please select a start date first</p>
          )}
        </div>

        {/* File upload with PDF-only validation */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            AS Upload <span className="text-red-500">*</span>
            <span className="text-xs text-slate-500 ml-2">(PDF only, max 5MB)</span>
          </label>
          
          {/* File Upload Area */}
          <div className={`relative border-2 border-dashed ${
            getFieldError('asUpload') || fileError ? 'border-red-300 bg-red-50' : 
            formData.asUpload ? 'border-green-300 bg-green-50' : 'border-slate-300'
          } rounded-lg p-6 transition-colors`}>
            <input
              type="file"
              id="asUpload"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept=".pdf,application/pdf"
              required
            />
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-blue-100 rounded-full mb-3">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              
              {formData.asUpload ? (
                <div className="w-full">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded">
                        <Upload className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-800 truncate max-w-[300px]">
                          {formData.asUpload.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(formData.asUpload.size / 1024 / 1024).toFixed(2)} MB • PDF
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-green-600 text-sm">
                    ✓ File uploaded successfully. Click to change.
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-medium text-slate-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-slate-500 mb-3">
                    PDF only (Maximum size: 5MB)
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={() => document.getElementById('asUpload')?.click()}
                  >
                    Browse Files
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Error messages */}
          {(getFieldError('asUpload') || fileError) && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{getFieldError('asUpload') || fileError}</span>
              </p>
            </div>
          )}
          
          {/* File requirements */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Only PDF files allowed</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Maximum file size: 5MB</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Required for submission</span>
            </div>
          </div>
        </div>

        {/* Remarks/Additional Information */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Physical & Financial Closure of Scheme, if required
            <span className="text-xs text-slate-500 ml-2">(Optional)</span>
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            placeholder="Enter any additional remarks, observations, or notes about physical and financial closure..."
            rows={4}
            maxLength={1000}
          ></textarea>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Optional field for additional information</span>
            <span>{formData.remarks.length}/1000 characters</span>
          </div>
        </div>
      </div>
    </div>
  );
}