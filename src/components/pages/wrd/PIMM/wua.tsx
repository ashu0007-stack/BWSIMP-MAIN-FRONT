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
import WUACreationView from "./WUACreationView"; // ✅ View component import karein

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

// ✅ Date validation helper function
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  
  try {
    // Remove any timezone issues and parse the date
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return "";
    }
    
    // Format as YYYY-MM-DD for input[type="date"]
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
          // ✅ VLC data भी save करें
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
          // Check if this village has VLC
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
    // ✅ सिर्फ GB members count use करें
    const gbMembers = vlc.gb_members_count || 0;
    
    console.log(`VLC ${vlc.vlc_name || vlc.id}: GB Members = ${gbMembers}`);
    
    return total + gbMembers;
  }, 0);
};

const WUACreation = () => {
  // State
  const [selectedWuaId, setSelectedWuaId] = useState<string>("");
  const [selectedWuaDetails, setSelectedWuaDetails] = useState<any>(null);
  const [showView, setShowView] = useState<boolean>(false); // ✅ View toggle state
  
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
  
  // Hooks
  const { mutate: createWUA, isPending } = useCreateWUA();
  const { data: allWUAs = [], isLoading: wuasLoading } = useWUAMaster();
  const { data: wuaMasterData } = useWUAMasterById(selectedWuaId);
  const { data: vlcs = [] } = useVLCsByWUA(selectedWuaId);
  const { data: slcs = [] } = useSLCsByWUA(selectedWuaId);
  
  // ✅ useWUAsWithBothVLCandSLC hook use karein
  const { 
    data: wuasWithBothVLCandSLC = [], 
    isLoading: bothLoading, 
    error: bothError 
  } = useWUAsWithBothVLCandSLC(selectedWuaId);

  // ✅ All created WUAs hook
  const { data: allCreatedWUAs = [] } = useWUAs();

  console.log("✅ WUAs with both VLC and SLC:", wuasWithBothVLCandSLC);

  // ✅ WUA SELECT HONE PAR AUTOMATICALLY DATA FILL
  useEffect(() => {
    if (wuaMasterData && selectedWuaId) {
      console.log("🔄 Auto-filling WUA data:", wuaMasterData);
      console.log("📊 VLCs data for beneficiaries:", vlcs);
      
      // ✅ Calculate total beneficiaries
      const totalBeneficiaries = calculateTotalBeneficiaries(vlcs);
      console.log("✅ Total beneficiaries calculated:", totalBeneficiaries);

      // Calculate VLC statistics
      const totalVlcsFormed = vlcs.length;
      
      // ✅ WUA Master se villages list banayein
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

  // Handle WUA selection
  const handleWuaSelect = (wuaId: string) => {
    setSelectedWuaId(wuaId);
    
    if (!wuaId) {
      // Reset form if no WUA selected
      setFormData({
        project_name: "", project_id: "", ce_zone: "", se_circle: "",
        division: "", subdivision: "", section: "", wua_name: "", wua_id: "",
        formation_year: "", tenure_completion_year: "", registration_no: "",
        account_holder: "", bank_name: "", account_number: "", ifsc_code: "",
        wua_cca: "", total_outlets: "", total_plots: "", total_beneficiaries: 0,
        branch_canal: "", canal_category: "", canal_name: "",
        total_villages: "", total_vlcs_formed: "", vlcs_not_formed: "",
        total_gps: "", total_blocks: "",
      });
      setVillages([]);
      setSelectedWuaDetails(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addVillage = () => {
    setVillages((prev) => [
      ...prev,
      { village_name: "", vlc_formed: false, gp_name: "", block_name: "", district_name: "" },
    ]);
  };

  const removeVillage = (index: number) => {
    setVillages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVillageChange = (index: number, field: keyof Village, value: string | boolean) => {
    const updated = [...villages];
    (updated[index][field] as string | boolean) = value;
    setVillages(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    // Reset after submission
    setSelectedWuaId("");
    setFormData({
      project_name: "", project_id: "", ce_zone: "", se_circle: "",
      division: "", subdivision: "", section: "", wua_name: "", wua_id: "",
      formation_year: "", tenure_completion_year: "", registration_no: "",
      account_holder: "", bank_name: "", account_number: "", ifsc_code: "",
      wua_cca: "", total_outlets: "", total_plots: "", total_beneficiaries: 0,
      branch_canal: "", canal_category: "", canal_name: "",
      total_villages: "", total_vlcs_formed: "", vlcs_not_formed: "",
      total_gps: "", total_blocks: "",
    });
    setVillages([]);
    setSelectedWuaDetails(null);
  };

  // Input field styling
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";
  const sectionClass = "bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6";
  const sectionHeaderClass = "text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2";

  const isLoading = bothLoading || wuasLoading;

  // ✅ Agar showView true hai toh view component dikhao
  if (showView) {
    return <WUACreationView onBack={() => setShowView(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">WUA Management Form</h2>
                <p className="text-blue-100">Select WUA with VLCs & SLCs to auto-populate data</p>
              </div>
               <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowView(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center gap-2"
          >
            View WUAs ({allCreatedWUAs.length || 0})
          </button>
        </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* ✅ WUA SELECTION SECTION */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="bg-blue-100 p-2 rounded-lg">🔍</span>
                Select WUA (With VLCs & SLCs)
                <span className="text-red-500 text-sm ml-2">* Required</span>
              </h3>
              
              <div className="mb-6">
                <label className={labelClass}>Select WUA with VLCs & SLCs *</label>
                <select
                  value={selectedWuaId}
                  onChange={(e) => handleWuaSelect(e.target.value)}
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
                  <p className="text-blue-600 text-sm mt-2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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
                  <p className="text-green-600 text-sm mt-2">
                    ✅ Found {wuasWithBothVLCandSLC.length} WUA(s) with both VLCs & SLCs
                  </p>
                )}
              </div>

              {/* ✅ SELECTED WUA SUMMARY */}
              {selectedWuaDetails && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                  <h4 className="font-semibold text-green-800 mb-3 text-lg">Selected WUA Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">WUA Name:</span>
                      <div className="text-green-800">{selectedWuaDetails.wua_name}</div>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Division:</span>
                      <div className="text-green-800">{selectedWuaDetails.division_name}</div>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Villages:</span>
                      <div className="text-green-800">{selectedWuaDetails.villages_covered}</div>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">CCA (Ha):</span>
                      <div className="text-green-800">{selectedWuaDetails.ayacut_area_ha}</div>
                    </div>
                  </div>

                  {/* ✅ VLC & SLC STATISTICS */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="text-green-600 font-semibold flex items-center gap-2">
                        <span>🏘️</span>
                        VLCs
                      </div>
                      <div className="text-2xl font-bold text-green-700 mt-1">{vlcs.length}</div>
                      <div className="text-green-600 text-sm">Village Committees</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <div className="text-blue-600 font-semibold flex items-center gap-2">
                        <span>🏢</span>
                        SLCs
                      </div>
                      <div className="text-2xl font-bold text-blue-700 mt-1">{slcs?.length || 0}</div>
                      <div className="text-blue-600 text-sm">Section Committees</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                      <div className="text-purple-600 font-semibold flex items-center gap-2">
                        <span>👥</span>
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
                        <span>📊</span>
                        Average per VLC
                      </div>
                      <div className="text-2xl font-bold text-orange-700 mt-1">
                        {vlcs.length > 0 ? Math.round(calculateTotalBeneficiaries(vlcs) / vlcs.length) : 0}
                      </div>
                      <div className="text-orange-600 text-sm">Beneficiaries per VLC</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="bg-blue-100 p-2 rounded-lg">📋</span>
                Project Details
                <span className="text-red-500 text-sm ml-2">* Required</span>
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
                <span className="bg-green-100 p-2 rounded-lg">🏢</span>
                WUA Details
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
                  <input
                    type="date"
                    name="formation_year"
                    value={formData.formation_year}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                
                {/* MANUAL FIELDS */}
                <div>
                  <label className={labelClass}>Tenure Completion</label>
                  <input
                    type="date"
                    name="tenure_completion_year"
                    value={formData.tenure_completion_year}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
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
              </div>
            </div>

            {/* Bank Account Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="bg-purple-100 p-2 rounded-lg">💳</span>
                Bank Account Details
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
                </div>
                <div>
                  <label className={labelClass}>IFSC Code</label>
                  <input
                    type="text"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>
            </div>

            {/* CCA & Statistics Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="bg-orange-100 p-2 rounded-lg">📊</span>
                WUA Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* ✅ AUTO-FILLED STATISTICS */}
                <div>
                  <label className={labelClass}>WUA CCA (Ha)</label>
                  <input
                    type="text"
                    value={formData.wua_cca}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
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
                    type="text"
                    value={formData.total_beneficiaries.toString()}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                
                {/* MANUAL FIELDS */}
                <div>
                  <label className={labelClass}>Total Outlets</label>
                  <input
                    type="number"
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
                    type="number"
                    name="total_plots"
                    value={formData.total_plots}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter total plots"
                  />
                </div>
              </div>
            </div>

            {/* Canal Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <span className="bg-cyan-100 p-2 rounded-lg">💧</span>
                Canal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ✅ AUTO-FILLED CANAL DETAILS */}
                <div>
                  <label className={labelClass}>Main canal Name</label>
                  <input
                    type="text"
                    value={formData.canal_name}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                
                {/* MANUAL FIELDS */}
                <div>
                  <label className={labelClass}>Canal Category</label>
                  <select
                    name="canal_category"
                    value={formData.canal_category}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select Canal Category</option>
                    <option value="Distributary">Distributary</option>
                    <option value="Sub-Distributary">Sub-Distributary</option>
                    <option value="Minor">Minor</option>
                    <option value="Sub-minor">Sub-minor</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Branch Canal</label>
                  <input
                    type="text"
                    name="branch_canal"
                    value={formData.branch_canal}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter branch canal"
                  />
                </div>
              </div>
            </div>

            {/* Villages Section - WUA Master se villages aayenge */}
            {/* <div className={sectionClass}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className={sectionHeaderClass}>
                  <span className="bg-green-100 p-2 rounded-lg">🏘️</span>
                  Villages Covered
                  <span className="text-gray-500 text-sm font-normal ml-2">
                    ({villages.length} villages from WUA Master)
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={addVillage}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-md"
                >
                  <span>+</span>
                  <span>Add Additional Village</span>
                </button>
              </div>

              {villages.length > 0 ? (
                <div className="space-y-4">
                  {villages.map((village, index) => (
                    <div key={index} className={`rounded-xl p-6 border ${village.vlc_formed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-700">Village {index + 1}</h4>
                          {village.vlc_formed ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              ✓ VLC Formed
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              ⚠️ VLC Not Formed
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVillage(index)}
                          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Village Name</label>
                          <input
                            type="text"
                            value={village.village_name}
                            onChange={(e) => handleVillageChange(index, "village_name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Village name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">VLC Status</label>
                          <select
                            value={village.vlc_formed ? "true" : "false"}
                            onChange={(e) => handleVillageChange(index, "vlc_formed", e.target.value === "true")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="false">VLC Not Formed</option>
                            <option value="true">VLC Formed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">GP Name</label>
                          <input
                            type="text"
                            value={village.gp_name}
                            onChange={(e) => handleVillageChange(index, "gp_name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="GP name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Block Name</label>
                          <input
                            type="text"
                            value={village.block_name}
                            onChange={(e) => handleVillageChange(index, "block_name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Block name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">District Name</label>
                          <input
                            type="text"
                            value={village.district_name}
                            onChange={(e) => handleVillageChange(index, "district_name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="District name"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-4xl mb-3">🏘️</div>
                  <p className="text-gray-500">No villages available</p>
                  <p className="text-gray-400 text-sm">Select a WUA to auto-populate village details</p>
                </div>
              )}
            </div> */}

            {/* Submit Button */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isPending || !selectedWuaId}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating WUA...
                  </>
                ) : (
                  <>
                    <span>🏢</span>
                    {selectedWuaId ? "Update WUA Details" : "Create WUA"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Only WUAs with both VLCs and SLCs are shown in the dropdown</p>
        </div>
      </div>
    </div>
  );
};

export default WUACreation;