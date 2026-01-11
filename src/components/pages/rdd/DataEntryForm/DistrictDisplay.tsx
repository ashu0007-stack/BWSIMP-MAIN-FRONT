import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { DataEntryFormData, District } from "../types";

interface DistrictDisplayProps {
  districts: District[];
  loading: boolean;
  districtResolved: boolean;
  formData: DataEntryFormData;
}

export default function DistrictDisplay({ 
  districts, 
  loading, 
  districtResolved, 
  formData 
}: DistrictDisplayProps) {
  
  console.log("🔍 DistrictDisplay Props:", {
    districtsType: typeof districts,
    districtsIsArray: Array.isArray(districts),
    districtsLength: districts?.length || 0,
    formDataDistrict: formData.district,
    districtType: typeof formData.district,
    districtResolved,
    loading
  });

  // Safe district lookup - formData.district is now number
  const resolvedDistrict = formData.district && formData.district !== 0 && Array.isArray(districts)
    ? districts.find((d: District) => d.district_id === formData.district)
    : undefined;
  
  const districtName = resolvedDistrict 
    ? resolvedDistrict.district_name 
    : formData.districts || "Not available";

  // 1. Loading State
  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          District Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value="Loading districts..."
            className="w-full border border-blue-300 rounded-lg px-4 py-2.5 bg-blue-50 text-blue-600 cursor-not-allowed pr-10"
            disabled
            readOnly
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        </div>
        <p className="text-xs text-blue-600 animate-pulse">Synchronizing location data...</p>
      </div>
    );
  }

  // 2. Missing User Data
  if (!formData.districts && (!formData.district || formData.district === 0)) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          District Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value="District not assigned"
            className="w-full border border-red-300 rounded-lg px-4 py-2.5 bg-red-50 text-red-600 cursor-not-allowed pr-10"
            disabled
            readOnly
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        </div>
        <p className="text-xs text-red-600 font-medium">
          Error: Your user account is not linked to a specific district.
        </p>
      </div>
    );
  }

  // 3. Resolution Error
  if (formData.districts && !districtResolved && (!formData.district || formData.district === 0)) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          District Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.districts}
            className="w-full border border-amber-300 rounded-lg px-4 py-2.5 bg-amber-50 text-amber-700 cursor-not-allowed pr-10"
            disabled
            readOnly
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <p className="text-xs text-amber-700">
          {formData.districts}
        </p>
      </div>
    );
  }

  // 4. Success State
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        District Name <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={districtName}
          className="w-full border border-green-300 rounded-lg px-4 py-2.5 bg-green-50 text-green-700 cursor-not-allowed pr-10 font-semibold"
          disabled
          readOnly
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-green-600 font-medium">
          District ID {formData.district || "Not resolved"}
        </span>
        <span className="text-gray-500">
          {resolvedDistrict ? "Auto-resolved" : "Manual entry"}
        </span>
      </div>
      {/* Hidden input for form submission - value is number */}
      <input type="hidden" name="district" value={formData.district} />
    </div>
  );
}