import { Building2, AlertCircle } from "lucide-react";
import { FormProps } from "../../types";

export default function WorkDetailsSection({ 
  formData,  // Changed from DataEntryFormData to formData
  setFormData, 
  workCategories, 
  subCategories, 
  subCategoriesLoading, 
  getFieldError 
}: FormProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^\d.]/g, '');
    const parts = sanitizedValue.split('.');
    let finalValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('') 
      : sanitizedValue;
    
    if (finalValue.includes('.')) {
      const decimalParts = finalValue.split('.');
      if (decimalParts[1].length > 2) {
        finalValue = decimalParts[0] + '.' + decimalParts[1].slice(0, 2);
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const currentSubCategory = subCategories.find(s => s.id === parseInt(formData.workType)); // Fixed: formData.workType

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-800">Work Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Financial Year <span className="text-red-500">*</span>
          </label>
          <select
            name="financialYear"
            value={formData.financialYear} // Fixed: formData.financialYear
            onChange={handleChange}
            className={`w-full border ${getFieldError('financialYear') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white`}
            required
          >
            <option value="">Select Financial Year</option>
            <option value="2024-25">2024-25</option>
            <option value="2025-26">2025-26</option>
          </select>
          {getFieldError('financialYear') && <p className="text-red-500 text-sm mt-1">{getFieldError('financialYear')}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Work Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="workCode"
            value={formData.workCode} // Fixed: formData.workCode
            onChange={handleChange}
            className={`w-full border ${getFieldError('workCode') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="Enter work code"
            required
          />
          {getFieldError('workCode') && <p className="text-red-500 text-sm mt-1">{getFieldError('workCode')}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Work Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="workName"
            value={formData.workName} // Fixed: formData.workName
            onChange={handleChange}
            className={`w-full border ${getFieldError('workName') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="Enter work name"
            required
          />
          {getFieldError('workName') && <p className="text-red-500 text-sm mt-1">{getFieldError('workName')}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Work Category <span className="text-red-500">*</span>
          </label>
          <select
            name="workCategory"
            value={formData.workCategory} // Fixed: formData.workCategory
            onChange={handleChange}
            className={`w-full border ${getFieldError('workCategory') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white`}
            required
          >
            <option value="">Select Work Category</option>
            {workCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
          {getFieldError('workCategory') && <p className="text-red-500 text-sm mt-1">{getFieldError('workCategory')}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Work Type <span className="text-red-500">*</span>
          </label>
          <select
            name="workType"
            value={formData.workType} // Fixed: formData.workType
            onChange={handleChange}
            className={`w-full border ${getFieldError('workType') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-slate-100 disabled:cursor-not-allowed`}
            disabled={!formData.workCategory || subCategoriesLoading} // Fixed: formData.workCategory
            required
          >
            <option value="">Select Work Type</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.sub_category_name}
              </option>
            ))}
          </select>
          {getFieldError('workType') && <p className="text-red-500 text-sm mt-1">{getFieldError('workType')}</p>}
          {!formData.workCategory && ( // Fixed: formData.workCategory
            <p className="text-sm text-slate-500">Please select a work category first</p>
          )}
          {formData.workCategory && subCategoriesLoading && ( // Fixed: formData.workCategory
            <p className="text-sm text-blue-600">Loading work types...</p>
          )}
        </div>

        {currentSubCategory?.requires_mgnrega && (
          <div className="md:col-span-2 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800">MGNREGA Work ID Required</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {currentSubCategory.condition_note}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Agency Name <span className="text-red-500">*</span>
          </label>
          <select
            name="agency"
            value={formData.agency} // Fixed: formData.agency
            onChange={handleChange}
            className={`w-full border ${getFieldError('agency') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white`}
            required
          >
            <option value="">Select Agency Name</option>
            <option value="Panchayat samiti/PS/Block">Panchayat samiti/PS/Block</option>
            <option value="Gram Panchayat">Gram Panchayat</option>
          </select>
          {getFieldError('agency') && <p className="text-red-500 text-sm mt-1">{getFieldError('agency')}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Command Area (Hac.)
          </label>
          <input
            type="text"
            inputMode="decimal"
            name="commandArea"
            value={formData.commandArea} // Fixed: formData.commandArea
            onChange={handleNumberChange}
            className={`w-full border ${getFieldError('commandArea') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="0.00"
            pattern="^\d*(\.\d{0,2})?$"
          />
          {getFieldError('commandArea') && <p className="text-red-500 text-sm mt-1">{getFieldError('commandArea')}</p>}
        </div>
      </div>
    </div>
  );
}