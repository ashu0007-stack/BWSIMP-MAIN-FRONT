import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Save,
  CheckCircle,
  AlertCircle,
  MapPin,
  Package,
  Ruler,
  Calendar,
  IndianRupee,
  Users,
  Home,
  FileText,
  Eye,
  EyeOff,
  X,
  Shield,
  Building,
  Download,
  Printer,
  BarChart3,
  DollarSign,
  Award,
  Loader
} from "lucide-react";

import {
  useWorkById,
  useUpdateWork,
  useUpdateBeneficiaries,
  useUpdateVillages,
  useUpdateComponents
} from "@/hooks/wrdHooks/useWorks";

import {
  Work,
  Village,
  WorkComponent,
  Beneficiaries,
  UserData,
  ValidationErrors
} from "@/components/shared/work";

interface ViewWorkPageProps {
  workId: number;
  user: UserData | null;
  onBackToList: () => void;
  onEditWork: () => void;
}

const ViewWorkPage: React.FC<ViewWorkPageProps> = ({ 
  workId, 
  user, 
  onBackToList,
  onEditWork 
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  
  // Work data
  const [workDetails, setWorkDetails] = useState<Work | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiaries | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [components, setComponents] = useState<WorkComponent[]>([]);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    work_name: "",
    package_number: "",
    work_cost: "",
    target_km: "",
    work_start_range: "",
    work_end_range: "",
    work_period_months: "",
    zone_id: "",
    circle_id: "",
    division_id: "",
    component_id: "",
    subcomponent_id: "",
    workcomponentId: "",
    Area_Under_improved_Irrigation: "",
    award_status: ""
  });

  // React Query Hooks
  const { data: fetchedWorkDetails, refetch: refetchWorkDetails, isLoading } = useWorkById(workId);
  const updateWorkMutation = useUpdateWork();
  const updateBeneficiariesMutation = useUpdateBeneficiaries();
  const updateVillagesMutation = useUpdateVillages();
  const updateComponentsMutation = useUpdateComponents();

  // Load work details when workId changes
  useEffect(() => {
    if (workId && fetchedWorkDetails) {
      setWorkDetails(fetchedWorkDetails);

      setEditFormData({
        work_name: fetchedWorkDetails.work_name || "",
        package_number: fetchedWorkDetails.package_number || "",
        work_cost: fetchedWorkDetails.work_cost || "",
        target_km: fetchedWorkDetails.target_km || "",
        work_start_range: fetchedWorkDetails.work_start_range || "",
        work_end_range: fetchedWorkDetails.work_end_range || "",
        work_period_months: fetchedWorkDetails.work_period_months || "",
        zone_id: fetchedWorkDetails.zone_id?.toString() || "",
        circle_id: fetchedWorkDetails.circle_id?.toString() || "",
        division_id: fetchedWorkDetails.division_id?.toString() || "",
        component_id: fetchedWorkDetails.component_id?.toString() || "",
        subcomponent_id: fetchedWorkDetails.subcomponent_id?.toString() || "",
        workcomponentId: fetchedWorkDetails.subworkcoponent_id?.toString() || "",
        Area_Under_improved_Irrigation: fetchedWorkDetails.Area_Under_improved_Irrigation || "",
        award_status: fetchedWorkDetails.award_status || ""
      });

      if (fetchedWorkDetails.beneficiaries) {
        setBeneficiaries({
          total_population: fetchedWorkDetails.beneficiaries.total_population || "",
          beneficiaries_male: fetchedWorkDetails.beneficiaries.beneficiaries_male || "",
          beneficiaries_female: fetchedWorkDetails.beneficiaries.beneficiaries_female || "",
          beneficiaries_youth_15_28: fetchedWorkDetails.beneficiaries.beneficiaries_youth_15_28 || ""
        });
      }

      if (fetchedWorkDetails.villages) {
        setVillages(fetchedWorkDetails.villages);
      }

      if (fetchedWorkDetails.components) {
        const formattedComponents = fetchedWorkDetails.components.map((comp: any) => ({
          nameofcomponent: comp.nameofcomponent || comp.componentname || "",
          unitname: comp.unitname || comp.unit || "",
          total_qty: comp.total_qty || comp.totalQty || "",
          num_of_milestones: comp.num_of_milestones || comp.Numberofmilestone || "0",
          milestone1_qty: comp.milestone1_qty || "",
          milestone2_qty: comp.milestone2_qty || "",
          milestone3_qty: comp.milestone3_qty || "",
          componentname: comp.componentname || comp.nameofcomponent || "",
          unit: comp.unit || comp.unitname || "",
          totalQty: comp.totalQty || comp.total_qty || "",
          Numberofmilestone: comp.Numberofmilestone || comp.num_of_milestones || "0",
          milestonedetails: comp.milestonedetails || ""
        }));
        setComponents(formattedComponents);
      }
    }
  }, [workId, fetchedWorkDetails]);

  // Format functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return "₹0";
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber)) return "₹0";
    if (amountNumber >= 10000000) {
      return `₹${(amountNumber / 10000000).toFixed(2)} Cr`;
    }
    return `₹${amountNumber.toLocaleString('en-IN')}`;
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "Awarded":
          return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", label: "Awarded" };
        case "In Progress":
          return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", label: "In Progress" };
        case "Completed":
          return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", label: "Completed" };
        case "Pending":
          return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", label: "Pending" };
        default:
          return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300", label: status || "Not Awarded" };
      }
    };
    
    const config = getStatusConfig(status);
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  // Edit mode handlers
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBeneficiariesChange = (field: keyof Beneficiaries, value: string) => {
    if (!beneficiaries) return;
    
    if (field === "total_population") {
      setMessage("");

      if (value.length > 7) {
        setMessage("❌ Total population should not exceed 7 digits (99,99,999)");
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        setMessage("❌ Total population should contain only numbers");
        return;
      }

      if (value) {
        const numValue = parseInt(value, 10);
        if (numValue > 9999999) {
          setMessage("❌ Total population should not exceed 99,99,999");
          return;
        }
      }

      const total = parseInt(value) || 0;

      const femaleCount = Math.round(total * 0.49);
      const maleCount = total - femaleCount;
      const youthCount = Math.round(total * 0.29);

      setBeneficiaries({
        ...beneficiaries,
        total_population: value,
        beneficiaries_female: femaleCount.toString(),
        beneficiaries_male: maleCount.toString(),
        beneficiaries_youth_15_28: youthCount.toString()
      });
    } else if (field === "beneficiaries_male" || field === "beneficiaries_female" || field === "beneficiaries_youth_15_28") {
      if (value) {
        if (value.length > 7) {
          setMessage(`❌ ${field.replace('_', ' ').toUpperCase()} should not exceed 7 digits (99,99,999)`);
          return;
        }

        if (!/^\d*$/.test(value)) {
          setMessage(`❌ ${field.replace('_', ' ').toUpperCase()} should contain only numbers`);
          return;
        }

        const numValue = parseInt(value, 10);
        if (numValue > 9999999) {
          setMessage(`❌ ${field.replace('_', ' ').toUpperCase()} should not exceed 99,99,999`);
          return;
        }
      }

      setBeneficiaries({ ...beneficiaries, [field]: value });
    } else {
    }

    if (!value || /^\d*$/.test(value) && value.length <= 7) {
      const numValue = parseInt(value || '0');
      if (numValue <= 9999999) {
        setMessage("");
      }
    }
  };

  const handleVillageChange = (i: number, field: keyof Village, value: string) => {
    const updated = [...villages];

    if (field === "census_population") {
      if (value.length > 7) {
        setMessage("❌ Population should not exceed 7 digits (99,99,999)");
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        setMessage("❌ Population should contain only numbers");
        return;
      }

      if (value) {
        const numValue = parseInt(value, 10);
        if (numValue > 9999999) {
          setMessage("❌ Population should not exceed 99,99,999");
          return;
        }
      }

      const total = parseInt(value) || 0;

      const femaleCount = Math.round(total * 0.49);
      const maleCount = total - femaleCount;

      updated[i] = {
        ...updated[i],
        [field]: value,
        female_population: femaleCount.toString(),
        male_population: maleCount.toString()
      };
    } else if (["village_name", "block_name", "district_name", "gram_panchayat"].includes(field)) {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        setMessage("❌ Only alphabets and spaces allowed for text fields");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };
    } else {
      updated[i] = { ...updated[i], [field]: value };
    }

    setVillages(updated);
    setMessage("");
  };

  const handleComponentChange = (i: number, field: keyof WorkComponent, value: string) => {
    const updated = [...components];
    if (field === "total_qty" || field === "totalQty") {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        setMessage("❌ Please enter a valid number for quantity");
        return;
      }

      if (value) {
        const digitCount = value.replace('.', '').length;
        if (digitCount > 10) {
          setMessage("❌ Quantity should not exceed 10 digits");
          return;
        }

        const decimalParts = value.split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
          setMessage("❌ Maximum 2 decimal places allowed");
          return;
        }
      }

      updated[i] = { ...updated[i], [field]: value };

      if (field === "total_qty") {
        updated[i].totalQty = value;
      } else if (field === "totalQty") {
        updated[i].total_qty = value;
      }
    }
    if (field === "nameofcomponent" || field === "componentname") {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        setMessage("❌ Only alphabets and spaces allowed for component name");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };

      if (field === "nameofcomponent") {
        updated[i].componentname = value;
      } else if (field === "componentname") {
        updated[i].nameofcomponent = value;
      }
    }
    else if (field === "unitname" || field === "unit") {
      if (value && !/^[A-Za-z]+$/.test(value)) {
        setMessage("❌ Only alphabets allowed for unit (e.g., m, km, kg)");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };

      if (field === "unitname") {
        updated[i].unit = value;
      } else if (field === "unit") {
        updated[i].unitname = value;
      }
    }
    else if (field === "milestone1_qty" || field === "milestone2_qty" || field === "milestone3_qty") {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        setMessage("❌ Please enter a valid number for milestone quantity");
        return;
      }
      updated[i] = { ...updated[i], [field]: value };
    }
    else {
      updated[i] = { ...updated[i], [field]: value };
    }

    setComponents(updated);
  };

  // Update functions
  const handleUpdateWork = async () => {
    if (!workId) return;

    try {
      setMessage("🔄 Updating work details...");
      await updateWorkMutation.mutateAsync({ workId, data: editFormData });
      setMessage("✅ Work updated successfully!");
      refetchWorkDetails();
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.error || "Failed to update work"}`);
    }
  };

  const handleUpdateBeneficiaries = async () => {
    if (!workId || !beneficiaries) return;

    try {
      setMessage("🔄 Updating beneficiaries...");
      await updateBeneficiariesMutation.mutateAsync({
        workId,
        data: beneficiaries
      });
      setMessage("✅ Beneficiaries updated successfully!");
      refetchWorkDetails();
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.error || "Failed to update beneficiaries"}`);
    }
  };

  const handleUpdateVillages = async () => {
    if (!workId) return;

    try {
      setMessage("🔄 Updating villages...");
      await updateVillagesMutation.mutateAsync({
        workId,
        data: { villages }
      });
      setMessage("✅ Villages updated successfully!");
      refetchWorkDetails();
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.error || "Failed to update villages"}`);
    }
  };

  const handleUpdateComponents = async () => {
    if (!workId) return;

    try {
      setMessage("🔄 Updating components...");
      await updateComponentsMutation.mutateAsync({
        workId,
        data: { components }
      });
      setMessage("✅ Components updated successfully!");
      refetchWorkDetails();
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.error || "Failed to update components"}`);
    }
  };

  // Toggle edit mode
  const handleToggleEdit = () => {
    if (mode === "view") {
      setMode("edit");
      onEditWork();
    } else {
      setMode("view");
    }
  };

  // Calculate stats
  // const calculateStats = () => {
  //   if (!workDetails) return null;
    
  //   const totalCost = parseFloat(workDetails.work_cost || "0") || 0;
  //   const totalBeneficiaries = parseInt(beneficiaries?.total_population || "0") || 0;
  //   const totalVillages = villages.length;
  //   const totalComponents = components.length;
    
  //   return {
  //     totalCost: formatCurrency(totalCost.toString()),
  //     totalBeneficiaries: totalBeneficiaries.toLocaleString('en-IN'),
  //     totalVillages,
  //     totalComponents
  //   };
  // };

  // const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[#003087]" />
          <p className="mt-4 text-gray-700 font-medium">Loading Work Details...</p>
        </div>
      </div>
    );
  }

  if (!workDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white border border-red-300 rounded p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 text-lg font-medium">Work package not found</p>
          <button
            onClick={onBackToList}
            className="mt-6 px-6 py-2 bg-[#003087] text-white font-medium rounded hover:bg-[#00205b] inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Work List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Government Header */}
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{workDetails.work_name}</h1>
                <p className="text-sm text-blue-100">
                  Package: {workDetails.package_number} • Created: {formatDate(workDetails.created_at || "")}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onBackToList}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            <ArrowLeft size={18} /> Back to List
          </button>
        </div>
      </header>

      {/* Message Banner */}
      {message && (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${
              message.includes("✅") || message.includes("successfully")
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <div className="flex items-center">
                {message.includes("✅") || message.includes("successfully") ? (
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                )}
                <span className="font-medium">{message}</span>
              </div>
              <button
                onClick={() => setMessage("")}
                className="ml-4 flex-shrink-0 hover:opacity-75"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gray-100 flex flex-col py-3">
        {/* Status and Action Bar */}
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-600 block mb-1">Work Status</span>
                <StatusBadge status={workDetails.award_status || ""} />
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">Period of Completion</span>
                <span className="text-lg font-bold text-gray-900">
                  {workDetails.work_period_months || "0"} months
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">Length of Work</span>
                <span className="text-lg font-bold text-gray-900">
                  {workDetails.target_km || "0"} km
                </span>
              </div>
               <div>
                <span className="text-sm text-gray-600 block mb-1">Work start Range</span>
                <span className="text-lg font-bold text-gray-900">
                  {workDetails.work_start_range || "0"} km
                </span>
              </div>
               <div>
                <span className="text-sm text-gray-600 block mb-1">Work end Range</span>
                <span className="text-lg font-bold text-gray-900">
                  {workDetails.work_end_range || "0"} km
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleToggleEdit}
                className={`flex items-center gap-2 px-5 py-2 font-medium rounded transition-colors ${
                  mode === "view"
                    ? "bg-[#003087] text-white hover:bg-[#00205b]"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                {mode === "view" ? (
                  <>
                    <Edit size={18} />
                    Edit Work
                  </>
                ) : (
                  <>
                    <EyeOff size={18} />
                    Cancel Edit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-300 rounded shadow-sm mb-6">
          <div className="flex border-b border-gray-300 overflow-x-auto">
            {["overview", "beneficiaries", "villages", "components"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? "border-b-2 border-[#003087] text-[#003087] bg-blue-50"
                    : "text-gray-600 hover:text-[#003087] hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#003087]" />
                    Work Overview
                  </h2>
                  {mode === "edit" && (
                    <button
                      onClick={handleUpdateWork}
                      disabled={updateWorkMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2 bg-green-700 text-white font-medium rounded hover:bg-green-800 transition-colors disabled:opacity-50"
                    >
                      <Save size={18} />
                      {updateWorkMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded border border-gray-300">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-1">
                            <FileText size={16} />
                            Name of Work *
                          </span>
                        </label>
                        {mode === "edit" ? (
                          <input
                            type="text"
                            name="work_name"
                            value={editFormData.work_name}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                        ) : (
                          <div className="text-lg font-medium text-gray-900">{workDetails.work_name}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-1">
                            <Package size={16} />
                            Package Number *
                          </span>
                        </label>
                        {mode === "edit" ? (
                          <input
                            type="text"
                            name="package_number"
                            value={editFormData.package_number}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                        ) : (
                          <div className="text-lg font-medium text-gray-900">{workDetails.package_number}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-1">
                            <IndianRupee size={16} />
                            Estimated Cost (₹) *
                          </span>
                        </label>
                        {mode === "edit" ? (
                          <input
                            type="number"
                            name="work_cost"
                            value={editFormData.work_cost}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                        ) : (
                          <div className="text-lg font-medium text-gray-900">
                            {formatCurrency(workDetails.work_cost || "0")}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-1">
                            <Ruler size={16} />
                            Length of Work (KM) *
                          </span>
                        </label>
                        {mode === "edit" ? (
                          <input
                            type="text"
                            name="target_km"
                            value={editFormData.target_km}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                        ) : (
                          <div className="text-lg font-medium text-gray-900">{workDetails.target_km} km</div>
                        )}
                      </div>

                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-1">
                            <Ruler size={16} />
                            Work start Range (KM) *
                          </span>
                        </label>
                        {mode === "edit" ? (
                          <input
                            type="text"
                            name="work_start_range"
                            value={editFormData.work_start_range}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                        ) : (
                          <div className="text-lg font-medium text-gray-900">{workDetails.work_start_range} km</div>
                        )}
                      </div>

                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-1">
                            <Ruler size={16} />
                            Work end Range (KM) *
                          </span>
                        </label>
                        {mode === "edit" ? (
                          <input
                            type="text"
                            name="work_end_range"
                            value={editFormData.work_end_range}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                        ) : (
                          <div className="text-lg font-medium text-gray-900">{workDetails.work_end_range} km</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            Period of Completion (months) *
                          </span>
                        </label>
                        {mode === "edit" ? (
                          <input
                            type="number"
                            name="work_period_months"
                            value={editFormData.work_period_months}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                        ) : (
                          <div className="text-lg font-medium text-gray-900">
                            {workDetails.work_period_months} months
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area Under improved Irrigation Services (ha) Targeted
                        </label>
                        {mode === "edit" ? (
                          <input
                            type="number"
                            name="Area_Under_improved_Irrigation"
                            value={editFormData.Area_Under_improved_Irrigation}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          />
                        ) : (
                          <div className="text-lg font-medium text-gray-900">
                            {workDetails.Area_Under_improved_Irrigation || "0"} ha
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded border border-gray-300">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">Location Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            Zone
                          </span>
                        </label>
                        <div className="text-lg font-medium text-gray-900">{workDetails.zone_name || "N/A"}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Circle</label>
                        <div className="text-lg font-medium text-gray-900">{workDetails.circle_name || "N/A"}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                        <div className="text-lg font-medium text-gray-900">{workDetails.division_name || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Beneficiaries Tab */}
          {activeTab === "beneficiaries" && (
            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#003087]" />
                    Beneficiaries
                  </h2>
                  {mode === "edit" && (
                    <button
                      onClick={handleUpdateBeneficiaries}
                      disabled={updateBeneficiariesMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2 bg-green-700 text-white font-medium rounded hover:bg-green-800 transition-colors disabled:opacity-50"
                    >
                      <Save size={18} />
                      {updateBeneficiariesMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>

                <div className="p-6 bg-gray-50 rounded border border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-1">
                          <Users size={16} />
                          Total Population *
                        </span>
                      </label>
                      {mode === "edit" ? (
                        <input
                          type="number"
                          value={beneficiaries?.total_population || ""}
                          onChange={(e) => handleBeneficiariesChange("total_population", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                          placeholder="Enter total population"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-900">
                          {beneficiaries?.total_population || "0"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Male Beneficiaries
                      </label>
                      {mode === "edit" ? (
                        <input
                          type="number"
                          value={beneficiaries?.beneficiaries_male || ""}
                          onChange={(e) => handleBeneficiariesChange("beneficiaries_male", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-blue-50"
                          readOnly
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-900">
                          {beneficiaries?.beneficiaries_male || "0"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Female Beneficiaries
                      </label>
                      {mode === "edit" ? (
                        <input
                          type="number"
                          value={beneficiaries?.beneficiaries_female || ""}
                          onChange={(e) => handleBeneficiariesChange("beneficiaries_female", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-pink-50"
                          readOnly
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-900">
                          {beneficiaries?.beneficiaries_female || "0"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Youth (15-28 years)
                      </label>
                      {mode === "edit" ? (
                        <input
                          type="number"
                          value={beneficiaries?.beneficiaries_youth_15_28 || ""}
                          onChange={(e) => handleBeneficiariesChange("beneficiaries_youth_15_28", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-green-50"
                          readOnly
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-900">
                          {beneficiaries?.beneficiaries_youth_15_28 || "0"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Villages Tab */}
          {activeTab === "villages" && (
            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Home className="w-5 h-5 text-[#003087]" />
                    Area Covered
                  </h2>
                  {mode === "edit" && (
                    <button
                      onClick={handleUpdateVillages}
                      disabled={updateVillagesMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2 bg-green-700 text-white font-medium rounded hover:bg-green-800 transition-colors disabled:opacity-50"
                    >
                      <Save size={18} />
                      {updateVillagesMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {villages.length > 0 ? (
                    villages.map((village, i) => (
                      <div key={village.id || i} className="p-6 bg-gray-50 rounded border border-gray-300">
                        <h3 className="text-md font-semibold text-gray-800 mb-4">
                          <span className="flex items-center gap-2">
                            <Home size={16} />
                            Village {i + 1}
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              District Name
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="text"
                                value={village.district_name}
                                onChange={(e) => handleVillageChange(i, "district_name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                                placeholder="Enter district name"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{village.district_name}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Block Name
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="text"
                                value={village.block_name}
                                onChange={(e) => handleVillageChange(i, "block_name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                                placeholder="Enter block name"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{village.block_name}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gram Panchayat
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="text"
                                value={village.gram_panchayat}
                                onChange={(e) => handleVillageChange(i, "gram_panchayat", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                                placeholder="Enter gram panchayat"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{village.gram_panchayat}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Village Name
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="text"
                                value={village.village_name}
                                onChange={(e) => handleVillageChange(i, "village_name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                                placeholder="Enter village name"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{village.village_name}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Population *
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="number"
                                value={village.census_population}
                                onChange={(e) => handleVillageChange(i, "census_population", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                                placeholder="Enter total population"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{village.census_population}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Male Population
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="number"
                                value={village.male_population}
                                onChange={(e) => handleVillageChange(i, "male_population", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-blue-50"
                                readOnly
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{village.male_population}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Female Population
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="number"
                                value={village.female_population}
                                onChange={(e) => handleVillageChange(i, "female_population", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-pink-50"
                                readOnly
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{village.female_population}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded border border-gray-300">
                      <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No villages added</p>
                      <p className="text-gray-600">Add villages to this work package</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Components Tab */}
          {activeTab === "components" && (
            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#003087]" />
                    Components & Milestones
                  </h2>
                  {mode === "edit" && (
                    <button
                      onClick={handleUpdateComponents}
                      disabled={updateComponentsMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2 bg-green-700 text-white font-medium rounded hover:bg-green-800 transition-colors disabled:opacity-50"
                    >
                      <Save size={18} />
                      {updateComponentsMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {components.length > 0 ? (
                    components.map((component, i) => (
                      <div key={component.id || i} className="p-6 bg-gray-50 rounded border border-gray-300">
                        <h3 className="text-md font-semibold text-gray-800 mb-4">
                          Component {i + 1}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="text"
                                value={component.nameofcomponent}
                                onChange={(e) => handleComponentChange(i, "componentname", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{component.nameofcomponent}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Unit
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="text"
                                value={component.unitname}
                                onChange={(e) => handleComponentChange(i, "unit", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{component.unitname}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Quantity
                            </label>
                            {mode === "edit" ? (
                              <input
                                type="number"
                                value={component.total_qty as string}
                                onChange={(e) => handleComponentChange(i, "totalQty", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{component.total_qty as string}</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Milestones
                            </label>
                            <div className="font-medium text-gray-900">{component.num_of_milestones || "0"}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded border border-gray-300">
                      <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No components added</p>
                      <p className="text-gray-600">Add components to this work package</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
     
    </div>
  );
};

export default ViewWorkPage;