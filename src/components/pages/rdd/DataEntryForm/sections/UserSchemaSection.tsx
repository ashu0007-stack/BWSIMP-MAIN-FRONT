import { FileText } from "lucide-react";
import { FormProps } from "../../types";

export default function UserSchemaSection({ formData, handleChange, getFieldError }: FormProps) {
  
  const getUserName = () => {
    const userDetail = sessionStorage.getItem('userdetail');
    if (userDetail) {
      try {
        const user = JSON.parse(userDetail);
        return user.username || user.name || `User ${user.id}`;
      } catch (error) {
        return `User ${formData.userId}`;
      }
    }
    return `User ${formData.userId}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
        <FileText className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-800">User & Scheme Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="hidden" name="userId" value={formData.userId} />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">User</label>
          <input
            type="text"
            value={getUserName()}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-slate-100 text-slate-600 cursor-not-allowed"
            disabled
            readOnly
          />
          <p className="text-xs text-slate-500">User ID is automatically set from your session</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Scheme Type <span className="text-red-500">*</span>
          </label>
          <select
            name="schemaType"
            value={formData.schemaType}
            onChange={handleChange}
            className={`w-full border ${getFieldError('schemaType') ? 'border-red-500' : 'border-slate-300'} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white`}
            required
          >
            <option value="">Select Scheme Type</option>
            <option value="OFD">OFD</option>
            <option value="MG NREGA">MGNREGA</option>
          </select>
          {getFieldError('schemaType') && <p className="text-red-500 text-sm mt-1">{getFieldError('schemaType')}</p>}
        </div>
      </div>
    </div>
  );
}