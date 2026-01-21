import React, { useState, useEffect } from "react";
import { useCreateWUA } from "@/hooks/wrdHooks/useWuaMaster";
import { 
  useWUAMaster, 
  useWUAMasterById, 
  useVLCsByWUA, 
  useWUAsWithBothVLCandSLC,
  useWUAs
} from "@/hooks/wrdHooks/useWuaMaster";
import { useSLCsByWUA } from "@/hooks/wrdHooks/useSlc";
import { 
  ArrowLeft, 
  Building, 
  Users, 
  FileText, 
  Landmark, 
  CreditCard, 
  MapPin, 
  Calendar,
  Eye,
  Shield,
  Home,
  BanknoteIcon,
  Clipboard,
  CheckCircle,
  AlertCircle,
  XCircle,
  Save,
  Plus,
  Trash2
} from "lucide-react";

interface FormData {
  project_name: string;
  project_id: string;
  ce_zone: string;
  se_circle: string;
  division: string;
  subdivision: string;
  section: string;
  wua_name: string;
  wua_id: string;
  formation_year: string;
  tenure_completion_year: string;
  registration_no: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  wua_cca: string;
  total_outlets: string;
  total_plots: string;
  total_beneficiaries: number;
  branch_canal: string;
  canal_category: string;
  canal_name: string;
  total_villages: string;
  total_vlcs_formed: string;
  vlcs_not_formed: string;
  total_gps: string;
  total_blocks: string;
}

interface Village {
  village_name: string;
  vlc_formed: boolean;
  gp_name: string;
  block_name: string;
  district_name: string;
  vlc_data?: any;
}

interface WUACreationFormProps {
  selectedWuaId?: string;
  onBack: () => void;
}

// ✅ Date validation helper function
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return "";
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// ✅ Extract villages from WUA Master data
const extractVillagesFromWUA = (wuaMasterData: any, vlcs: any[] = []) => {
  const villages: Village[] = [];
  
  if (!wuaMasterData) return villages;

  // पहले VLCs से villages निकालें
  if (vlcs.length > 0) {
    vlcs.forEach(vlc => {
      if (vlc.village_name) {
        villages.push({
          village_name: vlc.village_name,
          vlc_formed: true,
          gp_name: vlc.gp_name || "",
          block_name: vlc.block_name || wuaMasterData?.block_name || "",
          district_name: vlc.district_name || wuaMasterData?.district_name || "",
          vlc_data: vlc
        });
      }
    });
  }

  // फिर villages_covered से add करें
  if (wuaMasterData.villages_covered && villages.length === 0) {
    try {
      let villageNames: string[] = [];
      
      if (Array.isArray(wuaMasterData.villages_covered)) {
        villageNames = wuaMasterData.villages_covered;
      } else if (typeof wuaMasterData.villages_covered === 'string') {
        villageNames = wuaMasterData.villages_covered
          .split(',')
          .map((v: string) => v.trim())
          .filter((v: string) => v.length > 0);
      }
      
      villageNames.forEach((villageName: string) => {
        if (villageName) {
          const vlcForThisVillage = vlcs.find(vlc => 
            vlc.village_name && 
            vlc.village_name.toLowerCase().includes(villageName.toLowerCase())
          );
          
          villages.push({
            village_name: villageName,
            vlc_formed: !!vlcForThisVillage,
            gp_name: vlcForThisVillage?.gp_name || wuaMasterData.gp_name || "",
            block_name: vlcForThisVillage?.block_name || wuaMasterData.block_name || "",
            district_name: vlcForThisVillage?.district_name || wuaMasterData.district_name || "",
            vlc_data: vlcForThisVillage
          });
        }
      });
    } catch (error) {
      console.error("Error extracting villages:", error);
    }
  }

  return villages;
};

const calculateTotalBeneficiaries = (vlcs: any[]) => {
  if (!Array.isArray(vlcs) || vlcs.length === 0) return 0;
  
  return vlcs.reduce((total, vlc) => {
    const gbMembers = vlc.gb_members_count || 0;
    return total + gbMembers;
  }, 0);
};

const WUACreationForm = ({ selectedWuaId, onBack }: WUACreationFormProps) => {
  // State
  const [formData, setFormData] = useState<FormData>({
    project_name: "", project_id: "", ce_zone: "", se_circle: "",
    division: "", subdivision: "", section: "", wua_name: "", wua_id: "",
    formation_year: "", tenure_completion_year: "", registration_no: "",
    account_holder: "", bank_name: "", account_number: "", ifsc_code: "",
    wua_cca: "", total_outlets: "", total_plots: "", total_beneficiaries: 0,
    branch_canal: "", canal_category: "", canal_name: "",
    total_villages: "", total_vlcs_formed: "", vlcs_not_formed: "",
    total_gps: "", total_blocks: "",
  });

  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedWuaDetails, setSelectedWuaDetails] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  
  // Hooks
  const { mutate: createWUA, isPending } = useCreateWUA();
  const { data: allWUAs = [], isLoading: wuasLoading } = useWUAMaster();
  const { data: wuaMasterData } = useWUAMasterById(selectedWuaId || "");
  const { data: vlcs = [] } = useVLCsByWUA(selectedWuaId || "");
  const { data: slcs = [] } = useSLCsByWUA(selectedWuaId || "");
  
  const { 
    data: wuasWithBothVLCandSLC = [], 
    isLoading: bothLoading, 
    error: bothError 
  } = useWUAsWithBothVLCandSLC(selectedWuaId || "");

  const { data: allCreatedWUAs = [] } = useWUAs();

  // ✅ WUA SELECT HONE PAR AUTOMATICALLY DATA FILL
  useEffect(() => {
    if (wuaMasterData && selectedWuaId) {
      console.log("🔄 Auto-filling WUA data:", wuaMasterData);
      
      const totalBeneficiaries = calculateTotalBeneficiaries(vlcs);
      const totalVlcsFormed = vlcs.length;
      const villagesFromWUA = extractVillagesFromWUA(wuaMasterData, vlcs);

      setFormData(prev => ({
        ...prev,
        wua_name: wuaMasterData.wua_name || "",
        wua_id: wuaMasterData.wua_id?.toString() || "",
        ce_zone: wuaMasterData.ce_zone || wuaMasterData.zone || "",
        se_circle: wuaMasterData.circle_name || wuaMasterData.circle || "",
        division: wuaMasterData.division_name || "",
        subdivision: wuaMasterData.subdivision_name || wuaMasterData.subdivision || "",
        project_name: wuaMasterData.system_name || "",
        section: wuaMasterData.section || "",
        wua_cca: wuaMasterData.ayacut_area_ha?.toString() || "",
        canal_name: wuaMasterData.canal_name || "",
        formation_year: formatDateForInput(wuaMasterData.constitution_date || wuaMasterData.formation_date),
        tenure_completion_year: formatDateForInput(wuaMasterData.expiry_date || wuaMasterData.next_election_date),
        total_villages: villagesFromWUA.length.toString(),
        total_gps: wuaMasterData.gram_panchayats?.toString() || "0",
        total_beneficiaries: totalBeneficiaries,
        total_vlcs_formed: totalVlcsFormed.toString(),
        vlcs_not_formed: "0",
        total_blocks: wuaMasterData.block_name ? "1" : "0"
      }));

      setVillages(villagesFromWUA);
      setSelectedWuaDetails(wuaMasterData);
    }
  }, [wuaMasterData, selectedWuaId, vlcs]);

  // Validation functions
  const validateForm = (): boolean => {
    const errors: {[key: string]: string[]} = {};
    
    // Required fields validation
    if (!formData.project_name.trim()) {
      errors.project_name = ["Project name is required"];
    }
    
    if (!formData.project_id.trim()) {
      errors.project_id = ["Project ID is required"];
    }
    
    if (!formData.wua_name.trim()) {
      errors.wua_name = ["WUA name is required"];
    }
    
    if (!formData.wua_id.trim()) {
      errors.wua_id = ["WUA ID is required"];
    }
    
    // Date validation
    if (formData.formation_year) {
      const formationDate = new Date(formData.formation_year);
      if (formationDate > new Date()) {
        errors.formation_year = ["Formation year cannot be in the future"];
      }
    }
    
    if (formData.tenure_completion_year && formData.formation_year) {
      const tenureDate = new Date(formData.tenure_completion_year);
      const formationDate = new Date(formData.formation_year);
      if (tenureDate <= formationDate) {
        errors.tenure_completion_year = ["Tenure completion must be after formation year"];
      }
    }
    
    // Bank account validation
    if (formData.account_number && !/^\d+$/.test(formData.account_number)) {
      errors.account_number = ["Account number should contain only numbers"];
    }
    
    if (formData.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
      errors.ifsc_code = ["IFSC code must be in valid format (e.g., SBIN0000123)"];
    }
    
    // Numeric fields validation
    if (formData.total_beneficiaries < 0) {
      errors.total_beneficiaries = ["Total beneficiaries cannot be negative"];
    }
    
    if (formData.wua_cca && !/^\d*\.?\d+$/.test(formData.wua_cca)) {
      errors.wua_cca = ["CCA must be a valid number"];
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationSummary(true);

    if (!validateForm()) {
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!selectedWuaId) {
      alert("Please select a WUA first");
      return;
    }

    if (!formData.project_name || !formData.project_id) {
      alert("Please fill Project Name and Project ID");
      return;
    }

    console.log("📤 Submitting WUA Data:", { formData, villages });
    createWUA();

    // Reset and go back to list
    onBack();
  };

  const inputClass = `w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
    showValidationSummary ? 'border-gray-400' : 'border-gray-400'
  }`;
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";
  const sectionClass = "bg-gray-50 border border-gray-300 rounded p-6";
  const sectionHeaderClass = "text-lg font-semibold text-gray-800 mb-4";

  const isLoading = bothLoading || wuasLoading;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Government Header */}
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Water Users' Association Creation</h1>
                <p className="text-blue-200 text-sm">Create and manage WUA with VLCs & SLCs</p>
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
        {/* Form Container */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          {/* Form Header Banner */}
          {/* <div className="bg-gradient-to-r from-[#003087] to-[#00205b] px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Building className="w-10 h-10" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedWuaId ? "Edit WUA Details" : "Create New WUA"}
                  </h2>
                  <p className="text-blue-200">
                    {selectedWuaId 
                      ? "Update existing WUA information" 
                      : "Select WUA with VLCs & SLCs to auto-populate data"}
                  </p>
                </div>
              </div>
              {selectedWuaDetails && (
                <div className="text-right">
                  <div className="text-lg font-semibold">{selectedWuaDetails.wua_name}</div>
                  <div className="text-sm text-blue-200">{selectedWuaDetails.division_name}</div>
                </div>
              )}
            </div>
          </div> */}

          {/* Validation Summary */}
          {showValidationSummary && Object.keys(validationErrors).length > 0 && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-300 rounded">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-700" />
                <h3 className="text-lg font-semibold text-red-800">Form Validation Errors</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(validationErrors).map(([field, errors]) => (
                  <div key={field} className="border-l-4 border-red-700 pl-3">
                    <h4 className="font-medium text-red-700 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</h4>
                    <ul className="list-disc list-inside text-red-600 text-sm">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* ✅ WUA SELECTION SECTION - Only show for new creation */}
            {!selectedWuaId && (
              <div className={sectionClass}>
                <h3 className={sectionHeaderClass}>
                  <span className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#003087]" />
                    Select WUA (With VLCs & SLCs)
                    <span className="text-red-500">*</span>
                  </span>
                </h3>
                
                <div className="mb-4">
                  <label className={labelClass}>Select WUA with VLCs & SLCs *</label>
                  <select
                    value={selectedWuaId}
                    onChange={(e) => {
                      if (e.target.value) {
                        window.location.href = `/wua/create/${e.target.value}`;
                      }
                    }}
                    className={inputClass}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select WUA with VLCs & SLCs</option>
                    {wuasWithBothVLCandSLC.map((wua: any) => (
                      <option key={wua.wua_id} value={wua.wua_id}>
                        {wua.wua_name} 
                        {wua.vlcs && ` (${wua.vlcs.length} VLCs)`}
                        {wua.slc_data && ` - SLC: ${wua.slc_data.slc_name}`}
                        {wua.division_name && ` - ${wua.division_name}`}
                      </option>
                    ))}
                  </select>
                  
                  {isLoading && (
                    <p className="text-[#003087] text-sm mt-2 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#003087]"></div>
                      Loading WUAs with VLCs & SLCs...
                    </p>
                  )}
                  
                  {bothError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                      <div className="flex items-start gap-3">
                        <span className="text-red-600 text-lg">❌</span>
                        <div>
                          <p className="text-red-800 font-medium">Error Loading WUAs</p>
                          <p className="text-red-700 text-sm mt-1">
                            {bothError.message || "Failed to load WUAs with VLCs and SLCs"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isLoading && wuasWithBothVLCandSLC.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 text-lg">⚠️</span>
                        <div>
                          <p className="text-yellow-800 font-medium">No WUAs Found</p>
                          <p className="text-yellow-700 text-sm mt-1">
                            No WUAs found with both VLCs and SLCs. Please create VLCs and SLCs first.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isLoading && wuasWithBothVLCandSLC.length > 0 && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Found {wuasWithBothVLCandSLC.length} WUA(s) with both VLCs & SLCs
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Show selected WUA summary if editing */}
            {selectedWuaDetails && (
              <div className={sectionClass}>
                <h3 className={sectionHeaderClass}>
                  <span className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#003087]" />
                    Selected WUA: {selectedWuaDetails.wua_name}
                  </span>
                </h3>
                
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-6 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-blue-700">WUA Name:</span>
                      <div className="text-blue-800 font-medium">{selectedWuaDetails.wua_name}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Division:</span>
                      <div className="text-blue-800">{selectedWuaDetails.division_name}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Villages:</span>
                      <div className="text-blue-800">{selectedWuaDetails.villages_covered}</div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">CCA (Ha):</span>
                      <div className="text-blue-800">{selectedWuaDetails.ayacut_area_ha}</div>
                    </div>
                  </div>

                  {/* ✅ VLC & SLC STATISTICS */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="text-green-600 font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        VLCs
                      </div>
                      <div className="text-2xl font-bold text-green-700 mt-1">{vlcs.length}</div>
                      <div className="text-green-600 text-sm">Village Committees</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <div className="text-blue-600 font-semibold flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        SLCs
                      </div>
                      <div className="text-2xl font-bold text-blue-700 mt-1">{slcs?.length || 0}</div>
                      <div className="text-blue-600 text-sm">Section Committees</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                      <div className="text-purple-600 font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Total Beneficiaries
                      </div>
                      <div className="text-2xl font-bold text-purple-700 mt-1">
                        {calculateTotalBeneficiaries(vlcs)}
                      </div>
                      <div className="text-purple-600 text-sm">
                        {vlcs.length > 0 ? `From ${vlcs.length} VLCs` : 'No VLCs found'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                      <div className="text-orange-600 font-semibold flex items-center gap-2">
                        <Clipboard className="w-4 h-4" />
                        Average per VLC
                      </div>
                      <div className="text-2xl font-bold text-orange-700 mt-1">
                        {vlcs.length > 0 ? Math.round(calculateTotalBeneficiaries(vlcs) / vlcs.length) : 0}
                      </div>
                      <div className="text-orange-600 text-sm">Beneficiaries per VLC</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#003087]" />
                  Project Details
                  <span className="text-red-500">*</span>
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Project Name *</label>
                  <input
                    type="text"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter project name"
                    required
                  />
                  {validationErrors.project_name && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.project_name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Project ID *</label>
                  <input
                    type="text"
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter project ID"
                    required
                  />
                  {validationErrors.project_id && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.project_id[0]}
                    </div>
                  )}
                </div>
                
                {/* ✅ SECTION FIELD ADD KIA - Manual Input */}
                <div>
                  <label className={labelClass}>Section</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter section"
                  />
                </div>
                
                {/* ✅ AUTO-FILLED FIELDS (Read-only) */}
                <div>
                  <label className={labelClass}>CE Zone</label>
                  <input
                    type="text"
                    value={formData.ce_zone}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>SE Circle</label>
                  <input
                    type="text"
                    value={formData.se_circle}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>Division</label>
                  <input
                    type="text"
                    value={formData.division}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>Subdivision</label>
                  <input
                    type="text"
                    value={formData.subdivision}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* WUA Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#003087]" />
                  WUA Details
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* ✅ AUTO-FILLED WUA FIELDS */}
                <div>
                  <label className={labelClass}>WUA Name</label>
                  <input
                    type="text"
                    value={formData.wua_name}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>WUA ID</label>
                  <input
                    type="text"
                    value={formData.wua_id}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                
                {/* ✅ FORMATION YEAR - Date Input (Safe) */}
                <div>
                  <label className={labelClass}>Formation Year</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      name="formation_year"
                      value={formData.formation_year}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  {validationErrors.formation_year && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.formation_year[0]}
                    </div>
                  )}
                </div>
                
                {/* MANUAL FIELDS */}
                <div>
                  <label className={labelClass}>Tenure Completion</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      name="tenure_completion_year"
                      value={formData.tenure_completion_year}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  {validationErrors.tenure_completion_year && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.tenure_completion_year[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Registration No</label>
                  <input
                    type="text"
                    name="registration_no"
                    value={formData.registration_no}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter registration number"
                  />
                </div>
                <div>
                  <label className={labelClass}>WUA CCA (Ha)</label>
                  <input
                    type="text"
                    name="wua_cca"
                    value={formData.wua_cca}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter CCA in hectares"
                  />
                  {validationErrors.wua_cca && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.wua_cca[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Canal Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#003087]" />
                  Canal Details
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Branch Canal</label>
                  <input
                    type="text"
                    name="branch_canal"
                    value={formData.branch_canal}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter branch canal name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Canal Category</label>
                  <select
                    name="canal_category"
                    value={formData.canal_category}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select Category</option>
                    <option value="Main Canal">Main Canal</option>
                    <option value="Branch Canal">Branch Canal</option>
                    <option value="Distributary">Distributary</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Canal Name</label>
                  <input
                    type="text"
                    value={formData.canal_name}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="flex items-center gap-2">
                  <Clipboard className="w-5 h-5 text-[#003087]" />
                  Statistics
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelClass}>Total Villages</label>
                  <input
                    type="text"
                    value={formData.total_villages}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>Total VLCs Formed</label>
                  <input
                    type="text"
                    value={formData.total_vlcs_formed}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>Total Beneficiaries</label>
                  <input
                    type="number"
                    name="total_beneficiaries"
                    value={formData.total_beneficiaries}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                  {validationErrors.total_beneficiaries && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.total_beneficiaries[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Total GPs</label>
                  <input
                    type="text"
                    value={formData.total_gps}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>Total Outlets</label>
                  <input
                    type="text"
                    name="total_outlets"
                    value={formData.total_outlets}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter total outlets"
                  />
                </div>
                <div>
                  <label className={labelClass}>Total Plots</label>
                  <input
                    type="text"
                    name="total_plots"
                    value={formData.total_plots}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter total plots"
                  />
                </div>
                <div>
                  <label className={labelClass}>VLCs Not Formed</label>
                  <input
                    type="text"
                    name="vlcs_not_formed"
                    value={formData.vlcs_not_formed}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter VLCs not formed"
                  />
                </div>
                <div>
                  <label className={labelClass}>Total Blocks</label>
                  <input
                    type="text"
                    value={formData.total_blocks}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Bank Account Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#003087]" />
                  Bank Account Details
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Account Holder Name</label>
                  <input
                    type="text"
                    name="account_holder"
                    value={formData.account_holder}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter account holder name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Account Number</label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter account number"
                  />
                  {validationErrors.account_number && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.account_number[0]}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>IFSC Code</label>
                  <input
                    type="text"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter IFSC code (e.g., SBIN0000123)"
                  />
                  {validationErrors.ifsc_code && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.ifsc_code[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-300">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
             
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowValidationSummary(true)}
                  className="px-6 py-3 border border-blue-400 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                >
                  Validate Form
                </button>
                <button
                  type="submit"
                  disabled={isPending || !selectedWuaId}
                  className="flex items-center gap-2 px-8 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isPending 
                    ? (selectedWuaId ? "Updating WUA..." : "Creating WUA...")
                    : (selectedWuaId ? "Update WUA" : "Create WUA")
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default WUACreationForm;