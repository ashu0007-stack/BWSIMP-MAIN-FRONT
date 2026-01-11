import React, { useState, useEffect } from "react";
import { useWUAMaster, useCreateVLC } from "@/hooks/wrdHooks/useWuaMaster";
import VLCListPage from "./vlcList";
import {
  Users,
  Building,
  UserPlus,
  UserCheck,
  Award,
  MapPin,
  Calendar,
  FileText,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Crown,
  Shield,
  BookOpen,
  Wallet,
  Hash,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

interface FormData {
  wua_id: string;
  vlc_name: string;
  formation_date: string;
  vlc_formed: boolean;
}

interface Village {
  id: number;
  village_name: string;
  gp_name: string;
  block_name: string;
  district_name: string;
}

interface GBMember {
  sl_no: number;
  name: string;
  gender: string;
  category: string;
  khata_no: string;
  plot_no: string;
  rakaba: string;
  position: string;
  land_size: string;
  landless: boolean;
  seasonal_migrant: boolean;
  ration_card: string;
  contact_no: string;
  village_name: string;
  gp_name: string;
  block_name: string;
  district_name: string;
  is_executive?: boolean;
  executive_designation?: string;
  election_date?: string;
}

interface VLCFormationProps {
  preselectedWUA?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  editId?: number;
  onViewVLCs?: () => void;
}

interface ValidationErrors {
  [key: string]: string[];
}

const VLCFormation: React.FC<VLCFormationProps> = ({ editId, preselectedWUA, onSuccess, onCancel, onViewVLCs }) => {
  const { data: wuaMaster = [], isLoading: wuasLoading, error: wuasError } = useWUAMaster();
  const { mutate: createVLC, isPending } = useCreateVLC();
  const [showVLCList, setShowVLCList] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    wua_id: "",
    vlc_name: "",
    formation_date: "",
    vlc_formed: true,
  });
  const [village, setVillage] = useState<Village>({
    id: 1,
    village_name: "",
    gp_name: "",
    block_name: "",
    district_name: "",
  });
  const [gbMembers, setGbMembers] = useState<GBMember[]>([
    {
      sl_no: 1,
      name: "",
      gender: "",
      category: "",
      khata_no: "",
      plot_no: "",
      rakaba: "",
      position: "",
      land_size: "",
      landless: false,
      seasonal_migrant: false,
      ration_card: "",
      contact_no: "",
      village_name: "",
      gp_name: "",
      block_name: "",
      district_name: "",
      is_executive: false
    }
  ]);
  const [selectedWUADetails, setSelectedWUADetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'gb' | 'executive'>('basic');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // Executive designations
  const executiveDesignations = [
    { value: "Chairman", label: "Chairman", icon: Crown },
    { value: "Secretary", label: "Secretary", icon: BookOpen },
    { value: "Treasurer", label: "Treasurer", icon: Wallet },
    { value: "Member", label: "Member", icon: Users }
  ];

  // Land size options
  const landSizeOptions = [
    "Marginal <1 Ha",
    "Small 1-2 Ha",
    "Semi Medium 2-4 Ha",
    "Medium 4-10 Ha",
    "Large >10 Ha"
  ];

  // Position options
  const positionOptions = [
    "Head Reach",
    "Middle Reach",
    "Tail Reach"
  ];

  // Category options
  const categoryOptions = [
    "General",
    "SC",
    "ST",
    "OBC",
    "Other"
  ];

  // Ration card options
  const rationCardOptions = [
    "Yes",
    "No"
  ];

  // Get executive members from GB members
  const executiveMembers = gbMembers.filter(member => member.is_executive);

  // Validation functions
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Basic form validation
    if (!formData.wua_id.trim()) {
      errors.wua_id = ["WUA selection is required"];
    }
    
    if (!formData.vlc_name.trim()) {
      errors.vlc_name = ["VLC name is required"];
    } else if (formData.vlc_name.trim().length < 3) {
      errors.vlc_name = ["VLC name must be at least 3 characters long"];
    }
    
    if (!village.village_name.trim()) {
      errors.village_name = ["Village name is required"];
    }
    
    if (formData.formation_date && new Date(formData.formation_date) > new Date()) {
      errors.formation_date = ["Formation date cannot be in the future"];
    }
    
    // GB Members validation
    const gbErrors: string[] = [];
    gbMembers.forEach((member, index) => {
      // Name validation (only alphabets and spaces)
      if (!member.name.trim()) {
        gbErrors.push(`GB Member ${index + 1}: Name is required`);
      } else if (member.name.trim().length < 2) {
        gbErrors.push(`GB Member ${index + 1}: Name must be at least 2 characters`);
      } else if (!/^[A-Za-z\s]+$/.test(member.name.trim())) {
        gbErrors.push(`GB Member ${index + 1}: Name should contain only alphabets`);
      }
      
      if (!member.gender) {
        gbErrors.push(`GB Member ${index + 1}: Gender is required`);
      }
      
      if (!member.category) {
        gbErrors.push(`GB Member ${index + 1}: Category is required`);
      }
      
      // Contact number validation (10 digits)
      if (member.contact_no) {
        const cleanedContact = member.contact_no.replace(/\D/g, '');
        if (!/^\d{10}$/.test(cleanedContact)) {
          gbErrors.push(`GB Member ${index + 1}: Contact number must be exactly 10 digits`);
        }
      }
      
      // Khata number validation (only numbers, required if not landless)
      if (!member.landless && member.khata_no) {
        if (!/^\d+$/.test(member.khata_no)) {
          gbErrors.push(`GB Member ${index + 1}: Khata number should contain only numbers`);
        }
      }
      
      // Plot number validation (only numbers, required if not landless)
      if (!member.landless && member.plot_no) {
        if (!/^\d+$/.test(member.plot_no)) {
          gbErrors.push(`GB Member ${index + 1}: Plot number should contain only numbers`);
        }
      }
      
      // Rakaba validation (decimal numbers, required if not landless)
      if (!member.landless && member.rakaba) {
        if (!/^\d*\.?\d+$/.test(member.rakaba)) {
          gbErrors.push(`GB Member ${index + 1}: Rakaba should be a valid decimal number`);
        }
      }
    });
    
    if (gbErrors.length > 0) {
      errors.gbMembers = gbErrors;
    }
    
    // Executive Members validation
    const executiveErrors: string[] = [];
    
    // Validate office bearers
    const chairman = executiveMembers.filter(m => m.executive_designation === "Chairman");
    const secretary = executiveMembers.filter(m => m.executive_designation === "Secretary");
    const treasurer = executiveMembers.filter(m => m.executive_designation === "Treasurer");
    
    if (chairman.length > 1) {
      executiveErrors.push("Only one Chairman is allowed");
    }
    if (secretary.length > 1) {
      executiveErrors.push("Only one Secretary is allowed");
    }
    if (treasurer.length > 1) {
      executiveErrors.push("Only one Treasurer is allowed");
    }
    
    if (executiveErrors.length > 0) {
      errors.executiveMembers = executiveErrors;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation for specific fields
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'vlc_name':
        if (!value.trim()) return 'VLC name is required';
        if (value.trim().length < 3) return 'VLC name must be at least 3 characters';
        return null;
     
      case 'formation_date':
        if (value && new Date(value) > new Date()) return 'Formation date cannot be in the future';
        return null;
     
      case 'village_name':
        if (!value.trim()) return 'Village name is required';
        return null;
     
      default:
        return null;
    }
  };

  // Real-time validation for GB member fields
  const validateGBMemberField = (index: number, field: string, value: string, isLandless: boolean = false): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[A-Za-z\s]+$/.test(value.trim())) return 'Name should contain only alphabets';
        return null;
     
      case 'contact_no':
        if (value) {
          const cleaned = value.replace(/\D/g, '');
          if (!/^\d{10}$/.test(cleaned)) return 'Contact number must be exactly 10 digits';
        }
        return null;
     
      case 'gender':
        if (!value) return 'Gender is required';
        return null;
     
      case 'category':
        if (!value) return 'Category is required';
        return null;
     
      case 'khata_no':
        if (!isLandless && value && !/^\d+$/.test(value)) return 'Khata number should contain only numbers';
        return null;
     
      case 'plot_no':
        if (!isLandless && value && !/^\d+$/.test(value)) return 'Plot number should contain only numbers';
        return null;
     
      case 'rakaba':
        if (!isLandless && value && !/^\d*\.?\d+$/.test(value)) return 'Rakaba should be a valid decimal number';
        return null;
     
      default:
        return null;
    }
  };

  // Clear validation errors for a specific field
  const clearValidationError = (field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Preselected WUA को set करें
  useEffect(() => {
    if (preselectedWUA) {
      const wuaId = preselectedWUA.id?.toString() || preselectedWUA.sl_no?.toString() || "";
      setFormData(prev => ({
        ...prev,
        wua_id: wuaId
      }));
     
      const selectedWUA = wuaMaster.find((w: { id: { toString: () => any; }; sl_no: { toString: () => any; }; }) =>
        w.id.toString() === wuaId || w.sl_no.toString() === wuaId
      );
     
      if (selectedWUA) {
        setSelectedWUADetails(selectedWUA);
        // WUA details से village details pre-fill करें
        setVillage({
          id: 1,
          village_name: "",
          gp_name: selectedWUA.gram_panchayats || "",
          block_name: selectedWUA.block_name || "",
          district_name: selectedWUA.district_name || "",
        });
      }
    }
  }, [preselectedWUA, wuaMaster]);

  // Handle WUA selection change
  const handleWUAChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWuaId = e.target.value;
    setFormData(prev => ({ ...prev, wua_id: selectedWuaId }));
    clearValidationError('wua_id');
    
    if (selectedWuaId) {
      const selectedWUA = wuaMaster.find((w: { id: { toString: () => string; }; }) => w.id.toString() === selectedWuaId);
      if (selectedWUA) {
        setSelectedWUADetails(selectedWUA);
        // WUA details से village details pre-fill करें
        setVillage({
          id: 1,
          village_name: "",
          gp_name: selectedWUA.gram_panchayats || "",
          block_name: selectedWUA.block_name || "",
          district_name: selectedWUA.district_name || "",
        });
      }
    } else {
      setSelectedWUADetails(null);
      setVillage({
        id: 1,
        village_name: "",
        gp_name: "",
        block_name: "",
        district_name: "",
      });
    }
  };

  // Handle input change with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: [error]
      }));
    } else {
      clearValidationError(name);
    }
  };

  // Handle village details change
  const handleVillageChange = (field: keyof Village, value: string) => {
    setVillage(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: [error]
      }));
    } else {
      clearValidationError(field);
    }
  };

  // GB Members Functions
  const addGBMember = () => {
    const newSlNo = gbMembers.length + 1;
   
    setGbMembers([...gbMembers, {
      sl_no: newSlNo,
      name: "",
      gender: "",
      category: "",
      khata_no: "",
      plot_no: "",
      rakaba: "",
      position: "",
      land_size: "",
      landless: false,
      seasonal_migrant: false,
      ration_card: "",
      contact_no: "",
      village_name: village.village_name,
      gp_name: village.gp_name,
      block_name: village.block_name,
      district_name: village.district_name,
      is_executive: false
    }]);
  };

  const removeGBMember = (index: number) => {
    if (gbMembers.length > 1) {
      const updated = gbMembers.filter((_, i) => i !== index);
      const renumbered = updated.map((member, idx) => ({
        ...member,
        sl_no: idx + 1
      }));
      setGbMembers(renumbered);
      if (validationErrors.gbMembers) {
        clearValidationError('gbMembers');
      }
    }
  };

  const handleGBChange = (index: number, field: keyof GBMember, value: string | boolean) => {
    const updated = [...gbMembers];
    updated[index][field] = value as never;
    
    // अगर landless checked है, तो khata_no, plot_no, rakaba clear करें
    if (field === 'landless' && value === true) {
      updated[index].khata_no = "";
      updated[index].plot_no = "";
      updated[index].rakaba = "";
      updated[index].land_size = "";
    }
    
    // अगर landless unchecked है और land_size नहीं है, तो default set करें
    if (field === 'landless' && value === false && !updated[index].land_size) {
      updated[index].land_size = "Marginal <1 Ha";
    }
    
    setGbMembers(updated);
    
    // Real-time validation
    if (typeof value === 'string') {
      const error = validateGBMemberField(index, field, value, updated[index].landless);
      if (error && validationErrors.gbMembers) {
        const gbErrors = [...validationErrors.gbMembers];
        const errorIndex = gbErrors.findIndex(err => err.startsWith(`GB Member ${index + 1}`));
        if (errorIndex !== -1) {
          gbErrors[errorIndex] = `GB Member ${index + 1}: ${error}`;
          setValidationErrors(prev => ({ ...prev, gbMembers: gbErrors }));
        }
      }
    }
  };

  // Format input based on field type
  const formatInput = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        // Only allow alphabets and spaces
        return value.replace(/[^A-Za-z\s]/g, '');
      
      case 'khata_no':
      case 'plot_no':
      case 'contact_no':
        // Only allow numbers
        return value.replace(/\D/g, '');
      
      case 'rakaba':
        // Allow numbers and one decimal point
        return value.replace(/[^\d.]/g, '')
          .replace(/^\./g, '')
          .replace(/\.{2,}/g, '.')
          .replace(/(\..*)\./g, '$1');
      
      default:
        return value;
    }
  };

  // Handle GB input with formatting
  const handleGBInputChange = (index: number, field: keyof GBMember, value: string) => {
    const formattedValue = formatInput(field, value);
    handleGBChange(index, field, formattedValue);
  };

  // Executive Member Functions
  const toggleExecutiveMember = (index: number) => {
    const updated = [...gbMembers];
    const currentStatus = updated[index].is_executive;
   
    if (currentStatus) {
      updated[index].is_executive = false;
      updated[index].executive_designation = "";
      updated[index].election_date = "";
    } else {
      updated[index].is_executive = true;
      updated[index].executive_designation = "Member";
      updated[index].election_date = formData.formation_date || new Date().toISOString().split('T')[0];
    }
   
    setGbMembers(updated);
    if (validationErrors.executiveMembers) {
      clearValidationError('executiveMembers');
    }
  };

  const handleExecutiveDesignationChange = (index: number, designation: string) => {
    const updated = [...gbMembers];
    updated[index].executive_designation = designation;
    setGbMembers(updated);
    if (validationErrors.executiveMembers) {
      clearValidationError('executiveMembers');
    }
  };

  const handleExecutiveElectionDateChange = (index: number, date: string) => {
    const updated = [...gbMembers];
    updated[index].election_date = date;
    setGbMembers(updated);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Prepare data for VLC
      const submitData = {
        vlcData: {
          wua_id: formData.wua_id,
          vlc_name: formData.vlc_name,
          village_name: village.village_name,
          gp_name: village.gp_name || "",
          block_name: village.block_name || "",
          district_name: village.district_name || "",
          formation_date: formData.formation_date || null,
          vlc_formed: formData.vlc_formed,
        },
        villages: [{
          village_name: village.village_name.trim(),
          gp_name: village.gp_name || null,
          block_name: village.block_name || null,
          district_name: village.district_name || null,
        }],
        gbMembers: gbMembers
          .filter(member => member.name.trim() !== "")
          .map(member => {
            const isExecutive = executiveMembers.some(exec => exec.sl_no === member.sl_no);
           
            return {
              sl_no: member.sl_no,
              name: member.name.trim(),
              gender: member.gender || null,
              category: member.category || null,
              khata_no: member.landless ? null : (member.khata_no || null),
              plot_no: member.landless ? null : (member.plot_no || null),
              rakaba: member.landless ? null : (member.rakaba || null),
              position: member.position || null,
              land_size: member.landless ? null : (member.land_size || null),
              landless: member.landless ? 1 : 0,
              seasonal_migrant: member.seasonal_migrant ? 1 : 0,
              ration_card: member.ration_card || null,
              contact_no: member.contact_no || null,
              village_name: member.village_name || village.village_name,
              gp_name: member.gp_name || village.gp_name,
              block_name: member.block_name || village.block_name,
              district_name: member.district_name || village.district_name,
              is_executive: isExecutive ? 1 : 0
            }
          }),
        executiveMembers: executiveMembers.map(member => ({
          name: member.name.trim(),
          designation: member.executive_designation || 'Member',
          election_date: member.election_date || formData.formation_date || new Date().toISOString().split('T')[0],
          gender: member.gender || null,
          category: member.category || null,
          land_size: member.landless ? null : (member.land_size || null),
          landless: member.landless ? 1 : 0,
          ration_card: member.ration_card === "Yes" ? 1 : 0,
          contact_no: member.contact_no || null,
          khata_no: member.landless ? null : (member.khata_no || null),
          plot_no: member.landless ? null : (member.plot_no || null),
          rakaba: member.landless ? null : (member.rakaba || null),
          position: member.position || null,
          seasonal_migrant: member.seasonal_migrant ? 1 : 0,
          village_name: member.village_name || village.village_name,
          gp_name: member.gp_name || village.gp_name,
          block_name: member.block_name || village.block_name,
          district_name: member.district_name || village.district_name
        }))
      };
      
      console.log(`Creating VLC for village: ${village.village_name}`, submitData);
     
      // VLC create करें
      createVLC(submitData, {
        onSuccess: (data) => {
          console.log(`VLC created for ${village.village_name}:`, data);
          alert(`✅ VLC created successfully!`);
          if (onSuccess) onSuccess();
          resetForm();
        },
        onError: (error) => {
          console.error(`Failed to create VLC for ${village.village_name}:`, error);
          alert("❌ Error creating VLC: " + error.message);
        }
      });
      
    } catch (error: any) {
      console.error("VLC creation failed:", error);
      alert("❌ Error creating VLC: " + error.message);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleViewVLCs = () => {
    if (onViewVLCs) {
      onViewVLCs();
    }
    setShowVLCList(true);
  };

  const resetForm = () => {
    setFormData({
      wua_id: "",
      vlc_name: "",
      formation_date: "",
      vlc_formed: true,
    });
    setVillage({
      id: 1,
      village_name: "",
      gp_name: "",
      block_name: "",
      district_name: "",
    });
    setGbMembers([{
      sl_no: 1,
      name: "",
      gender: "",
      category: "",
      khata_no: "",
      plot_no: "",
      rakaba: "",
      position: "",
      land_size: "",
      landless: false,
      seasonal_migrant: false,
      ration_card: "",
      contact_no: "",
      village_name: "",
      gp_name: "",
      block_name: "",
      district_name: "",
      is_executive: false
    }]);
    setSelectedWUADetails(null);
    setValidationErrors({});
    setShowValidationSummary(false);
  };

  // Check if form is valid for enabling submit button
  const isFormValid = () => {
    return formData.wua_id &&
           formData.vlc_name.trim().length >= 3 &&
           village.village_name.trim() &&
           gbMembers.length > 0 &&
           gbMembers.every(m => {
             const nameValid = m.name.trim().length >= 2 && /^[A-Za-z\s]+$/.test(m.name.trim());
             const genderValid = !!m.gender;
             const categoryValid = !!m.category;
             
             // Contact number validation (if provided)
             let contactValid = true;
             if (m.contact_no) {
               const cleaned = m.contact_no.replace(/\D/g, '');
               contactValid = /^\d{10}$/.test(cleaned);
             }
             
             // Land-related fields validation if not landless
             let landFieldsValid = true;
             if (!m.landless) {
               if (m.khata_no && !/^\d+$/.test(m.khata_no)) landFieldsValid = false;
               if (m.plot_no && !/^\d+$/.test(m.plot_no)) landFieldsValid = false;
               if (m.rakaba && !/^\d*\.?\d+$/.test(m.rakaba)) landFieldsValid = false;
             }
             
             return nameValid && genderValid && categoryValid && contactValid && landFieldsValid;
           });
  };

  if (showVLCList) {
    return (
      <VLCListPage
        onBack={() => setShowVLCList(false)}
        onCreateNew={() => setShowVLCList(false)}
        onViewDetails={(vlc) => {
          alert(`Viewing details of ${vlc.vlc_name}`);
        }}
        onEdit={(vlc) => {
          alert(`Edit VLC: ${vlc.vlc_name}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">VLC Formation</h1>
                  <p className="text-green-100">Create Single VLC for One Village</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleViewVLCs}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"
              >
                <Eye className="w-5 h-5" />
                View VLCs
              </button>
            </div>
          </div>

          {/* Validation Summary */}
          {showValidationSummary && Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg mx-6 mt-6 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Please fix the following errors:</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(validationErrors).map(([field, errors]) => (
                  <div key={field} className="border-l-4 border-red-500 pl-3">
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
            {/* WUA Selection */}
            <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">Associated WUA</h2>
                <span className="text-red-500">*</span>
              </div>
             
              {wuasError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">
                    Error loading WUA data: {wuasError.message}
                  </p>
                </div>
              )}
             
              <select
                name="wua_id"
                value={formData.wua_id}
                onChange={handleWUAChange}
                required
                disabled={wuasLoading || !!preselectedWUA}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  validationErrors.wua_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select WUA</option>
                {wuaMaster?.map((wua: { id: React.Key | readonly string[] | null | undefined; wua_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; division_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; ayacut_area_ha: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                  <option key={String(wua.id)} value={String(wua.id)}>
                  
                    
                    
                    {wua.wua_name} - {wua.division_name} ({wua.ayacut_area_ha} Ha)
                  </option>
                ))}
              </select>
             
              {validationErrors.wua_id && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.wua_id[0]}
                </div>
              )}
             
              {wuasLoading && (
                <div className="text-green-600 text-sm mt-2 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  Loading WUAs...
                </div>
              )}
             
              {selectedWUADetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-green-800 mb-2">Selected WUA Details:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div><span className="font-medium">WUA Name:</span> {selectedWUADetails.wua_name}</div>
                    <div><span className="font-medium">Division:</span> {selectedWUADetails.division_name}</div>
                    <div><span className="font-medium">Sub-Division:</span> {selectedWUADetails.subdivision_name}</div>
                    <div><span className="font-medium">Circle:</span> {selectedWUADetails.circle_name}</div>
                    <div><span className="font-medium">Zone:</span> {selectedWUADetails.ce_zone}</div>
                    <div><span className="font-medium">Ayacut Area:</span> {selectedWUADetails.ayacut_area_ha} Ha</div>
                    <div><span className="font-medium">Villages:</span> {selectedWUADetails.villages_covered}</div>
                    <div><span className="font-medium">Gram Panchayats:</span> {selectedWUADetails.gram_panchayats}</div>
                    <div><span className="font-medium">Block:</span> {selectedWUADetails.block_name}</div>
                    <div><span className="font-medium">District:</span> {selectedWUADetails.district_name}</div>
                  </div>
                </div>
              )}
            </section>

            {/* VLC Basic Info and Village Details */}
            <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">VLC Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VLC Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vlc_name"
                    placeholder="Enter VLC name"
                    value={formData.vlc_name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      validationErrors.vlc_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.vlc_name && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.vlc_name[0]}
                    </div>
                  )}
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formation Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="formation_date"
                      value={formData.formation_date}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        validationErrors.formation_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {validationErrors.formation_date && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.formation_date[0]}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Village Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Village Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={village.village_name}
                      onChange={(e) => handleVillageChange("village_name", e.target.value)}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        validationErrors.village_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter village name"
                    />
                    {validationErrors.village_name && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.village_name[0]}
                      </div>
                    )}
                  </div>
                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gram Panchayat</label>
                    <input
                      type="text"
                      value={village.gp_name}
                      onChange={(e) => handleVillageChange("gp_name", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter Gram Panchayat name"
                    />
                  </div>
                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Block Name</label>
                    <input
                      type="text"
                      value={village.block_name}
                      onChange={(e) => handleVillageChange("block_name", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter Block name"
                    />
                  </div>
                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District Name</label>
                    <input
                      type="text"
                      value={village.district_name}
                      onChange={(e) => handleVillageChange("district_name", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter District name"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Members Section with Tabs */}
            <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    VLC Members Management
                  </h2>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Village:</strong> {village.village_name || "Not set"} |
                  <strong> GB Members:</strong> {gbMembers.length} |
                  <strong> Executive:</strong> {executiveMembers.length}
                </div>
              </div>

              {/* Executive Body Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Executive Body Information:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Select Executive Members from GB Members by clicking the checkbox</li>
                  <li>• <strong>Recommended office bearers:</strong> Chairman, Secretary, Treasurer</li>
                  <li>• Remaining members can be designated as Executive Members</li>
                  <li>• <strong>No minimum requirement</strong> - You can have 0 or more executive members</li>
                </ul>
               
                {/* Executive Statistics */}
                {executiveMembers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-blue-600">
                        <span className="font-medium">Total Executive:</span> {executiveMembers.length}
                      </div>
                      <div className="text-blue-600">
                        <span className="font-medium">Chairman:</span> {executiveMembers.filter(m => m.executive_designation === "Chairman").length}
                      </div>
                      <div className="text-blue-600">
                        <span className="font-medium">Secretary:</span> {executiveMembers.filter(m => m.executive_designation === "Secretary").length}
                      </div>
                      <div className="text-blue-600">
                        <span className="font-medium">Treasurer:</span> {executiveMembers.filter(m => m.executive_designation === "Treasurer").length}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('gb')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${
                      activeTab === 'gb'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    General Body Members ({gbMembers.length})
                    {validationErrors.gbMembers && <XCircle className="w-4 h-4 text-red-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('executive')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${
                      activeTab === 'executive'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Executive Body ({executiveMembers.length})
                    {validationErrors.executiveMembers && <XCircle className="w-4 h-4 text-red-500" />}
                  </button>
                </div>
              </div>

              {!formData.wua_id && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-700 text-sm">
                    Please select a WUA first to add members
                  </p>
                </div>
              )}

              {/* General Body Members Tab */}
              {activeTab === 'gb' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">General Body Members</h3>
                    <button
                      type="button"
                      onClick={addGBMember}
                      disabled={!formData.wua_id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Add GB Member
                    </button>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-yellow-700 text-sm">
                      <strong>Validation Rules:</strong><br/>
                      1. Name: Only alphabets and spaces<br/>
                      2. Contact: Exactly 10 digits<br/>
                      3. Khata/Plot: Only numbers (required if not landless)<br/>
                      4. Rakaba: Decimal numbers (required if not landless)<br/>
                      5. If Landless is checked, land-related fields will be hidden
                    </p>
                  </div>
                  
                  {validationErrors.gbMembers && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <h4 className="font-medium text-red-800">GB Member Validation Errors:</h4>
                      </div>
                      <ul className="list-disc list-inside text-red-600 text-sm">
                        {validationErrors.gbMembers.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Executive
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            <Hash className="w-4 h-4 inline mr-1" />
                            Sl No
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Name of Village Member *
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Male/Female *
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Category *
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Landless
                          </th>
                          {!gbMembers.some(m => m.landless) && (
                            <>
                              <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                                Khata No
                              </th>
                              <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                                Plot No
                              </th>
                              <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                                Rakaba
                              </th>
                              <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                                Land Size
                              </th>
                            </>
                          )}
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Position
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Seasonal Migrant
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Ration Card
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Contact No
                          </th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gbMembers.map((member, index) => (
                          <tr key={member.sl_no} className={`bg-white hover:bg-gray-50 ${member.is_executive ? 'bg-blue-50' : ''}`}>
                            <td className="border border-gray-300 p-2 text-center">
                              <button
                                type="button"
                                onClick={() => toggleExecutiveMember(index)}
                                disabled={!member.name.trim()}
                                className={`p-1 rounded transition-colors ${
                                  member.is_executive
                                    ? 'text-green-600 hover:text-green-800'
                                    : 'text-gray-400 hover:text-gray-600'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                              >
                                {member.is_executive ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                              </button>
                            </td>
                           
                            <td className="border border-gray-300 p-2 text-center">
                              {member.sl_no}
                            </td>
                           
                            <td className="border border-gray-300 p-2">
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => handleGBInputChange(index, "name", e.target.value)}
                                className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                  !member.name.trim() && showValidationSummary ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Full name (alphabets only)"
                                disabled={!formData.wua_id}
                              />
                              {member.name && !/^[A-Za-z\s]+$/.test(member.name.trim()) && (
                                <div className="text-red-500 text-xs mt-1">Only alphabets allowed</div>
                              )}
                            </td>
                           
                            <td className="border border-gray-300 p-2">
                              <select
                                value={member.gender}
                                onChange={(e) => handleGBChange(index, "gender", e.target.value)}
                                className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                  !member.gender && showValidationSummary ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={!formData.wua_id}
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </td>
                           
                            <td className="border border-gray-300 p-2">
                              <select
                                value={member.category}
                                onChange={(e) => handleGBChange(index, "category", e.target.value)}
                                className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                  !member.category && showValidationSummary ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={!formData.wua_id}
                              >
                                <option value="">Select</option>
                                {categoryOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </td>
                           
                            <td className="border border-gray-300 p-2 text-center">
                              <input
                                type="checkbox"
                                checked={member.landless}
                                onChange={(e) => handleGBChange(index, "landless", e.target.checked)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                disabled={!formData.wua_id}
                              />
                            </td>
                           
                            {/* Land-related fields - only show if not landless */}
                            {!member.landless && (
                              <>
                                <td className="border border-gray-300 p-2">
                                  <input
                                    type="text"
                                    value={member.khata_no}
                                    onChange={(e) => handleGBInputChange(index, "khata_no", e.target.value)}
                                    className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                      member.khata_no && !/^\d+$/.test(member.khata_no) && showValidationSummary ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Numbers only"
                                    disabled={!formData.wua_id}
                                  />
                                  {member.khata_no && !/^\d+$/.test(member.khata_no) && (
                                    <div className="text-red-500 text-xs mt-1">Only numbers allowed</div>
                                  )}
                                </td>
                               
                                <td className="border border-gray-300 p-2">
                                  <input
                                    type="text"
                                    value={member.plot_no}
                                    onChange={(e) => handleGBInputChange(index, "plot_no", e.target.value)}
                                    className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                      member.plot_no && !/^\d+$/.test(member.plot_no) && showValidationSummary ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Numbers only"
                                    disabled={!formData.wua_id}
                                  />
                                  {member.plot_no && !/^\d+$/.test(member.plot_no) && (
                                    <div className="text-red-500 text-xs mt-1">Only numbers allowed</div>
                                  )}
                                </td>
                               
                                <td className="border border-gray-300 p-2">
                                  <input
                                    type="text"
                                    value={member.rakaba}
                                    onChange={(e) => handleGBInputChange(index, "rakaba", e.target.value)}
                                    className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                      member.rakaba && !/^\d*\.?\d+$/.test(member.rakaba) && showValidationSummary ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Decimal number"
                                    disabled={!formData.wua_id}
                                  />
                                  {member.rakaba && !/^\d*\.?\d+$/.test(member.rakaba) && (
                                    <div className="text-red-500 text-xs mt-1">Valid decimal number required</div>
                                  )}
                                </td>
                               
                                <td className="border border-gray-300 p-2">
                                  <select
                                    value={member.land_size}
                                    onChange={(e) => handleGBChange(index, "land_size", e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                    disabled={!formData.wua_id}
                                  >
                                    <option value="">Select</option>
                                    {landSizeOptions.map(option => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                </td>
                              </>
                            )}
                           
                            <td className="border border-gray-300 p-2">
                              <select
                                value={member.position}
                                onChange={(e) => handleGBChange(index, "position", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                disabled={!formData.wua_id}
                              >
                                <option value="">Select</option>
                                {positionOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </td>
                           
                            <td className="border border-gray-300 p-2 text-center">
                              <input
                                type="checkbox"
                                checked={member.seasonal_migrant}
                                onChange={(e) => handleGBChange(index, "seasonal_migrant", e.target.checked)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                disabled={!formData.wua_id}
                              />
                            </td>
                           
                            <td className="border border-gray-300 p-2">
                              <select
                                value={member.ration_card}
                                onChange={(e) => handleGBChange(index, "ration_card", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                disabled={!formData.wua_id}
                              >
                                <option value="">Select</option>
                                {rationCardOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </td>
                           
                            <td className="border border-gray-300 p-2">
                              <input
                                type="text"
                                value={member.contact_no}
                                onChange={(e) => handleGBInputChange(index, "contact_no", e.target.value)}
                                maxLength={10}
                                className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                  member.contact_no && !/^\d{10}$/.test(member.contact_no.replace(/\D/g, '')) && showValidationSummary ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="10 digits"
                                disabled={!formData.wua_id}
                              />
                              {member.contact_no && !/^\d{10}$/.test(member.contact_no.replace(/\D/g, '')) && (
                                <div className="text-red-500 text-xs mt-1">Exactly 10 digits required</div>
                              )}
                            </td>
                           
                            <td className="border border-gray-300 p-2 text-center">
                              {gbMembers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeGBMember(index)}
                                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                  disabled={!formData.wua_id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Executive Body Members Tab */}
              {activeTab === 'executive' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Executive Body Members</h3>
                    <div className="text-sm text-blue-600">
                      {executiveMembers.length} members selected from GB
                    </div>
                  </div>
                  
                  {validationErrors.executiveMembers && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <h4 className="font-medium text-red-800">Executive Body Validation Errors:</h4>
                      </div>
                      <ul className="list-disc list-inside text-red-600 text-sm">
                        {validationErrors.executiveMembers.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {executiveMembers.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <Award className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-yellow-800 mb-2">No Executive Members Selected</h4>
                      <p className="text-yellow-700">
                        You can select Executive Members from the <strong>General Body Members</strong> tab by clicking the checkbox in the first column.
                        <br />
                        <strong>Note:</strong> Executive members are optional - you can create VLC without executive members.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                              <Hash className="w-4 h-4 inline mr-1" />
                              Sl No
                            </th>
                            <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                              Name
                            </th>
                            <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                              Designation
                            </th>
                            <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                              Election Date
                            </th>
                            <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                              Gender
                            </th>
                            <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                              Category
                            </th>
                            <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {executiveMembers.map((member, index) => {
                            const originalIndex = gbMembers.findIndex(m => m.sl_no === member.sl_no);
                            return (
                              <tr key={member.sl_no} className="bg-white hover:bg-blue-50">
                                <td className="border border-gray-300 p-2 text-center">
                                  {member.sl_no}
                                </td>
                               
                                <td className="border border-gray-300 p-2 font-medium">
                                  {member.name}
                                </td>
                               
                                <td className="border border-gray-300 p-2">
                                  <select
                                    value={member.executive_designation || "Member"}
                                    onChange={(e) => handleExecutiveDesignationChange(originalIndex, e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={!formData.wua_id}
                                  >
                                    {executiveDesignations.map(designation => (
                                      <option key={designation.value} value={designation.value}>
                                        {designation.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                               
                                <td className="border border-gray-300 p-2">
                                  <input
                                    type="date"
                                    value={member.election_date || formData.formation_date || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => handleExecutiveElectionDateChange(originalIndex, e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={!formData.wua_id}
                                  />
                                </td>
                               
                                <td className="border border-gray-300 p-2">
                                  {member.gender}
                                </td>
                               
                                <td className="border border-gray-300 p-2">
                                  {member.category}
                                </td>
                               
                                <td className="border border-gray-300 p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleExecutiveMember(originalIndex)}
                                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                    disabled={!formData.wua_id}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Reset Form
                </button>
              </div>
             
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowValidationSummary(true)}
                  className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Validate Form
                </button>
                <button
                  type="submit"
                  disabled={isPending || !formData.wua_id}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isPending ? 'Creating VLC...' : 'Create VLC'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VLCFormation;