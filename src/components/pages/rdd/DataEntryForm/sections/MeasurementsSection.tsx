import { Layers } from "lucide-react";
import { FormProps } from "../../types";

export default function MeasurementsSection({ 
  formData, 
  setFormData, 
  totalAmount, 
  getFieldError 
}: FormProps) {
  
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
        <Layers className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-800">Measurements & Finances</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Proposed Dimensions (m) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                inputMode="decimal"
                name="propLength"
                value={formData.propLength}
                onChange={handleNumberChange}
                placeholder="Length"
                className={`w-full border ${getFieldError('propLength') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                pattern="^\d{1,3}(\.\d{0,2})?$"
                required
              />
              {getFieldError('propLength') && <p className="text-red-500 text-xs mt-1">{getFieldError('propLength')}</p>}
            </div>
            <div>
              <input
                type="text"
                inputMode="decimal"
                name="propWidth"
                value={formData.propWidth}
                onChange={handleNumberChange}
                placeholder="Width"
                className={`w-full border ${getFieldError('propWidth') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                pattern="^\d{1,3}(\.\d{0,2})?$"
                required
              />
              {getFieldError('propWidth') && <p className="text-red-500 text-xs mt-1">{getFieldError('propWidth')}</p>}
            </div>
            <div>
              <input
                type="text"
                inputMode="decimal"
                name="propHeight"
                value={formData.propHeight}
                onChange={handleNumberChange}
                placeholder="Height"
                className={`w-full border ${getFieldError('propHeight') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                pattern="^\d{1,3}(\.\d{0,2})?$"
                required
              />
              {getFieldError('propHeight') && <p className="text-red-500 text-xs mt-1">{getFieldError('propHeight')}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Total Sanctioned Amount (₹) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                inputMode="decimal"
                name="sanctionAmtWages"
                value={formData.sanctionAmtWages}
                onChange={handleNumberChange}
                placeholder="Wages"
                className={`w-full border ${getFieldError('sanctionAmtWages') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                pattern="^\d*(\.\d{0,2})?$"
                required
              />
              {getFieldError('sanctionAmtWages') && <p className="text-red-500 text-xs mt-1">{getFieldError('sanctionAmtWages')}</p>}
            </div>
            <div>
              <input
                type="text"
                inputMode="decimal"
                name="sanctionAmtMaterial"
                value={formData.sanctionAmtMaterial}
                onChange={handleNumberChange}
                placeholder="Material"
                className={`w-full border ${getFieldError('sanctionAmtMaterial') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                pattern="^\d*(\.\d{0,2})?$"
                required
              />
              {getFieldError('sanctionAmtMaterial') && <p className="text-red-500 text-xs mt-1">{getFieldError('sanctionAmtMaterial')}</p>}
            </div>
          </div>

          {/* Real-time Total Amount Display */}
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-800">Total Sanction Amount:</span>
              <span className="text-xl font-bold text-green-700">
                ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {totalAmount > 0 && (
              <p className="text-xs text-green-600 mt-2 text-center">
                {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}