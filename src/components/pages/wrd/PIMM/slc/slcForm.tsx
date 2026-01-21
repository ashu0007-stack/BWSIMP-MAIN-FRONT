import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Award,
  Building,
  Calendar,
  MapPin,
  Users,
  UserCheck,
  AlertCircle,
  X,
  Save,
  ArrowLeft,
  Edit3,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  List,
  Shield,
  Plus,
  Trash2,
  FileText,
  Landmark,
  Hash,
  Home,
  Phone,
  Mail,
  UserCircle
} from 'lucide-react';
import { useWUAsWithVLCs, useVLCsByWUA, useWUAMasterforSLcById } from '@/hooks/wrdHooks/useWuaMaster';
import { useCreateSLC, useUpdateSLC, useGetAllSLCs } from '@/hooks/wrdHooks/useSlc';
import axiosInstance from '@/apiInterceptor/axiosInterceptor';

interface ExecutiveMember {
  name: string;
  vlc_represented: string;
  designation: 'Member' | 'Chairman' | 'Vice President' | 'Secretary' | 'Treasurer';
  election_date: string;
}

interface FormData {
  slc_name: string;
  section: string;
  subdivision: string;
  circle: string;
  zone: string;
  formation_date: string;
  last_election_date: string;
  next_election_date: string;
}

interface WaterTaxDetails {
  year: number;
  kharif_tax: string;
  rabi_tax: string;
  total_tax: string;
  deposited_govt: string;
  retained_wua: string;
  expenditure: string;
  balance: string;
}

interface SLCData {
  id: number;
  slc_name: string;
  wua_name: string;
  wua_id: string;
  formation_date: string;
  executive_members_count: number;
  status: string;
  circle?: string;
  subdivision?: string;
  zone?: string;
  section?: string;
  last_election_date?: string;
  next_election_date?: string;
  created_at?: string;
}

interface SLCFormProps {
  onBackToList: () => void;
  editingSLC?: SLCData | null;
  onCancelEdit?: () => void;
}

const SLCForm: React.FC<SLCFormProps> = ({ onBackToList, editingSLC, onCancelEdit }) => {
  const [selectedWua, setSelectedWua] = useState<string>('');
  const [selectedWuaDetails, setSelectedWuaDetails] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    slc_name: '', 
    section: '', 
    subdivision: '', 
    circle: '', 
    zone: '',
    formation_date: '', 
    last_election_date: '', 
    next_election_date: ''
  });

  const [executiveMembers, setExecutiveMembers] = useState<ExecutiveMember[]>([]);
  const [vlcExecutiveMembers, setVlcExecutiveMembers] = useState<Array<{
    id: string;
    vlc_id: any;
    name: string;
    vlc_represented: string;
    designation: string;
    is_executive: boolean;
  }>>([]);
  
  const [waterTaxDetails, setWaterTaxDetails] = useState<WaterTaxDetails>({
    year: new Date().getFullYear(),
    kharif_tax: '',
    rabi_tax: '',
    total_tax: '',
    deposited_govt: '',
    retained_wua: '',
    expenditure: '',
    balance: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showVlcDetails, setShowVlcDetails] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingSLCId, setEditingSLCId] = useState<number | null>(null);

  const { data: wuasWithVlcs = [], isLoading: wuasLoading, error: wuasError } = useWUAsWithVLCs();
  const { mutate: createSLC, isPending: isCreating } = useCreateSLC();
  const { mutate: updateSLC, isPending: isUpdating } = useUpdateSLC();
  const { data: allSLCs, refetch: refetchSLCs } = useGetAllSLCs();
  const { 
    data: actualVlcs = [], 
    isLoading: vlcsLoading, 
    error: vlcsError 
  } = useVLCsByWUA(selectedWua);
  const { data: wuaMasterData } = useWUAMasterforSLcById(selectedWua);

  const [wuasWithExistingSLCs, setWuasWithExistingSLCs] = useState<Set<string>>(new Set());

  // Load existing SLCs for validation
  useEffect(() => {
    if (allSLCs) {
      const slcData = allSLCs as SLCData[];
      const wuaIdsWithSLCs = new Set(slcData.map(slc => slc.wua_id));
      setWuasWithExistingSLCs(wuaIdsWithSLCs);
    }
  }, [allSLCs]);

  // Handle editing mode
  useEffect(() => {
    if (editingSLC) {
      setIsEditing(true);
      setEditingSLCId(editingSLC.id);
      loadSLCForEditing(editingSLC);
    }
  }, [editingSLC]);

  // Load SLC data for editing
  const loadSLCForEditing = async (slc: SLCData) => {
    try {
      const response = await axiosInstance.get(`/slc/${slc.id}`);
      
      if (response.data && response.data.success) {
        const backendData = response.data.data;
        
        setFormData({
          slc_name: backendData.slc_name || slc.slc_name,
          section: backendData.section || '',
          subdivision: backendData.subdivision || '',
          circle: backendData.circle || '',
          zone: backendData.zone || '',
          formation_date: backendData.formation_date || slc.formation_date,
          last_election_date: backendData.last_election_date || '',
          next_election_date: backendData.next_election_date || ''
        });
        
        setSelectedWua(backendData.wua_id || slc.wua_id);
        setSelectedWuaDetails({ 
          wua_name: backendData.wua_name || slc.wua_name 
        });
        
        if (backendData.gbMembers && backendData.gbMembers.length > 0) {
          const vlcMembers = backendData.gbMembers.map((member: any, index: number) => ({
            id: `edit_gb_${index}`,
            vlc_id: null,
            name: member.name,
            vlc_represented: member.vlc_represented,
            designation: member.designation || 'Member',
            is_executive: Boolean(member.is_executive)
          }));
          setVlcExecutiveMembers(vlcMembers);
        }
        
        if (backendData.executiveMembers && backendData.executiveMembers.length > 0) {
          const execMembers = backendData.executiveMembers.map((member: any) => ({
            name: member.name,
            vlc_represented: member.vlc_represented,
            designation: member.designation as ExecutiveMember['designation'],
            election_date: member.election_date || backendData.formation_date
          }));
          setExecutiveMembers(execMembers);
        }
        
        if (backendData.waterTaxDetails) {
          setWaterTaxDetails({
            year: backendData.waterTaxDetails.year || new Date().getFullYear(),
            kharif_tax: backendData.waterTaxDetails.kharif_tax?.toString() || '',
            rabi_tax: backendData.waterTaxDetails.rabi_tax?.toString() || '',
            total_tax: backendData.waterTaxDetails.total_tax?.toString() || '',
            deposited_govt: backendData.waterTaxDetails.deposited_govt?.toString() || '',
            retained_wua: backendData.waterTaxDetails.retained_wua?.toString() || '',
            expenditure: backendData.waterTaxDetails.expenditure?.toString() || '',
            balance: backendData.waterTaxDetails.balance?.toString() || ''
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading SLC for editing:', error);
      alert(`Failed to load SLC for editing: ${error.message}`);
    }
  };

  // Auto-fill WUA data
  useEffect(() => {
    if (!wuaMasterData || !selectedWua) return;

    setFormData(prev => {
      const updated = {
        ...prev,
        circle: wuaMasterData.circle_name || '',
        zone: wuaMasterData.ce_zone || '',
        subdivision: wuaMasterData.subdivision_name || '',
        slc_name: `${wuaMasterData.wua_name} SLC`
      };

      if (JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }

      return updated;
    });
  }, [wuaMasterData, selectedWua]);

  // Setup VLC executive members
  useEffect(() => {
    if (!Array.isArray(actualVlcs)) return;

    const allExecutiveMembers: { 
      id: string; 
      vlc_id: any; 
      name: any; 
      vlc_represented: any; 
      designation: any; 
      is_executive: boolean; 
    }[] = [];
    
    actualVlcs.forEach(vlc => {
      if (Array.isArray(vlc.executive_members)) {
        vlc.executive_members.forEach((member: { name: any; designation: any; }, idx: number) => {
          allExecutiveMembers.push({
            id: `${vlc.id}_exec_${idx}`,
            vlc_id: vlc.id,
            name: member.name || `Executive Member ${idx + 1}`,
            vlc_represented: vlc.vlc_name,
            designation: member.designation || 'Member',
            is_executive: false
          });
        });
      } else {
        if (vlc.chairman_name) {
          allExecutiveMembers.push({
            id: `${vlc.id}_chairman`,
            vlc_id: vlc.id,
            name: vlc.chairman_name,
            vlc_represented: vlc.vlc_name,
            designation: 'Chairman',
            is_executive: false
          });
        }
        
        if (vlc.secretary_name) {
          allExecutiveMembers.push({
            id: `${vlc.id}_secretary`,
            vlc_id: vlc.id,
            name: vlc.secretary_name,
            vlc_represented: vlc.vlc_name,
            designation: 'Secretary',
            is_executive: false
          });
        }
        
        if (vlc.treasurer_name) {
          allExecutiveMembers.push({
            id: `${vlc.id}_treasurer`,
            vlc_id: vlc.id,
            name: vlc.treasurer_name,
            vlc_represented: vlc.vlc_name,
            designation: 'Treasurer',
            is_executive: false
          });
        }
      }
    });

    if (allExecutiveMembers.length === 0 && actualVlcs.length > 0) {
      actualVlcs.forEach(vlc => {
        if (vlc.chairman_name) {
          allExecutiveMembers.push({
            id: `${vlc.id}_chairman`,
            vlc_id: vlc.id,
            name: vlc.chairman_name,
            vlc_represented: vlc.vlc_name,
            designation: 'Chairman',
            is_executive: false
          });
        }
        
        ['Secretary', 'Treasurer', 'Member 1', 'Member 2'].forEach((designation, idx) => {
          allExecutiveMembers.push({
            id: `${vlc.id}_${designation.toLowerCase().replace(' ', '_')}_${idx}`,
            vlc_id: vlc.id,
            name: `${designation} - ${vlc.vlc_name}`,
            vlc_represented: vlc.vlc_name,
            designation: designation,
            is_executive: false
          });
        });
      });
    }

    setVlcExecutiveMembers(prev => {
      if (JSON.stringify(prev) === JSON.stringify(allExecutiveMembers))
        return prev;
      return allExecutiveMembers;
    });

  }, [actualVlcs]);

  // Tax calculations
  useEffect(() => {
    const kharif = parseFloat(waterTaxDetails.kharif_tax) || 0;
    const rabi = parseFloat(waterTaxDetails.rabi_tax) || 0;
    const total = kharif + rabi;
    
    setWaterTaxDetails(prev => ({ 
      ...prev, 
      total_tax: total.toString()
    }));
  }, [waterTaxDetails.kharif_tax, waterTaxDetails.rabi_tax]);

  useEffect(() => {
    const total = parseFloat(waterTaxDetails.total_tax) || 0;
    const deposited = total * 0.3;
    const retained = total * 0.7;
    
    setWaterTaxDetails(prev => ({
      ...prev,
      deposited_govt: deposited.toFixed(2),
      retained_wua: retained.toFixed(2)
    }));
  }, [waterTaxDetails.total_tax]);

  useEffect(() => {
    const retained = parseFloat(waterTaxDetails.retained_wua) || 0;
    const expenditure = parseFloat(waterTaxDetails.expenditure) || 0;
    const balance = retained - expenditure;
    
    setWaterTaxDetails(prev => ({
      ...prev,
      balance: balance.toFixed(2)
    }));
  }, [waterTaxDetails.retained_wua, waterTaxDetails.expenditure]);

  // Handlers
  const handleWuaSelect = async (wuaId: string) => {
    if (wuasWithExistingSLCs.has(wuaId)) {
      alert('This WUA already has an SLC. You cannot create another SLC for the same WUA.');
      return;
    }
    
    setSelectedWua(wuaId);
    const wuaDetails = wuasWithVlcs.find((w: { wua_id: string; }) => w.wua_id === wuaId);
    setSelectedWuaDetails(wuaDetails);
    
    if (!wuaId) {
      setVlcExecutiveMembers([]);
      setExecutiveMembers([]);
      setFormData({
        slc_name: '', section: '', subdivision: '', circle: '', zone: '',
        formation_date: '', last_election_date: '', next_election_date: ''
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleWaterTaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWaterTaxDetails(prev => ({ 
      ...prev, 
      [name]: name === 'year' ? parseInt(value) || new Date().getFullYear() : value 
    }));
  };

  const handleExecutiveDesignationChange = (index: number, designation: ExecutiveMember['designation']) => {
    const updated = [...executiveMembers];
    updated[index].designation = designation;
    setExecutiveMembers(updated);
  };

  const handleGBMemberCheckbox = (index: number, isChecked: boolean) => {
    const updatedMembers = [...vlcExecutiveMembers];
    updatedMembers[index].is_executive = isChecked;
    setVlcExecutiveMembers(updatedMembers);

    const selectedMember = updatedMembers[index];

    if (isChecked) {
      const newExecutiveMember: ExecutiveMember = {
        name: selectedMember.name,
        vlc_represented: selectedMember.vlc_represented,
        designation: selectedMember.designation as ExecutiveMember['designation'],
        election_date: formData.formation_date || new Date().toISOString().split('T')[0]
      };
      
      setExecutiveMembers(prev => {
        const exists = prev.some(member => 
          member.name === selectedMember.name && 
          member.vlc_represented === selectedMember.vlc_represented
        );
        
        if (exists) return prev;
        return [...prev, newExecutiveMember];
      });
    } else {
      setExecutiveMembers(prev => 
        prev.filter(member => 
          !(member.name === selectedMember.name && 
            member.vlc_represented === selectedMember.vlc_represented)
        )
      );
    }
  };

  const handleSelectAllVLCExecutives = () => {
    const updatedMembers = vlcExecutiveMembers.map(member => ({
      ...member,
      is_executive: true
    }));
    
    setVlcExecutiveMembers(updatedMembers);

    const newExecutiveMembers = updatedMembers.map(member => ({
      name: member.name,
      vlc_represented: member.vlc_represented,
      designation: member.designation as ExecutiveMember['designation'],
      election_date: formData.formation_date || new Date().toISOString().split('T')[0]
    }));

    setExecutiveMembers(prev => {
      const combined = [...prev, ...newExecutiveMembers];
      const unique = combined.filter((member, index, self) =>
        index === self.findIndex(m => 
          m.name === member.name && 
          m.vlc_represented === member.vlc_represented
        )
      );
      return unique;
    });
  };

  const resetForm = () => {
    if (isEditing) {
      if (!window.confirm('Are you sure you want to reset? All changes will be lost.')) {
        return;
      }
    }
    
    setSelectedWua('');
    setSelectedWuaDetails(null);
    setFormData({
      slc_name: '', section: '', subdivision: '', circle: '', zone: '',
      formation_date: '', last_election_date: '', next_election_date: ''
    });
    setVlcExecutiveMembers([]);
    setExecutiveMembers([]);
    setWaterTaxDetails({
      year: new Date().getFullYear(),
      kharif_tax: '', rabi_tax: '', total_tax: '',
      deposited_govt: '', retained_wua: '', expenditure: '', balance: ''
    });
    setFormErrors({});
    
    if (isEditing) {
      setIsEditing(false);
      setEditingSLCId(null);
      if (onCancelEdit) onCancelEdit();
    }
  };

  const cancelEdit = () => {
    if (window.confirm('Are you sure you want to cancel editing? All changes will be lost.')) {
      setIsEditing(false);
      setEditingSLCId(null);
      if (onCancelEdit) onCancelEdit();
    }
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!editingSLCId) return;
    
    const errors: {[key: string]: string} = {};
    
    if (!selectedWua) {
      errors.wua = 'WUA is required';
    }

    if (!formData.slc_name.trim()) {
      errors.slc_name = 'SLC name is required';
    }

    if (!formData.formation_date) {
      errors.formation_date = 'Formation date is required';
    }

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    const updateData = {
      wua_id: selectedWua,
      slc_name: formData.slc_name,
      section: formData.section,
      subdivision: formData.subdivision,
      circle: formData.circle,
      zone: formData.zone,
      formation_date: formData.formation_date,
      last_election_date: formData.last_election_date || null,
      next_election_date: formData.next_election_date || null,
      status: 'Active',
      
      slc_general_body_members: vlcExecutiveMembers.map(member => ({
        name: member.name,
        vlc_represented: member.vlc_represented,
        is_executive: member.is_executive || false
      })),
      
      executive_members: executiveMembers.map(member => ({
        name: member.name,
        vlc_represented: member.vlc_represented,
        designation: member.designation,
        election_date: member.election_date
      })),
      
      water_tax_details: {
        year: waterTaxDetails.year,
        kharif_tax: waterTaxDetails.kharif_tax || "0",
        rabi_tax: waterTaxDetails.rabi_tax || "0",
        total_tax: waterTaxDetails.total_tax || "0",
        deposited_govt: waterTaxDetails.deposited_govt || "0",
        retained_wua: waterTaxDetails.retained_wua || "0",
        expenditure: waterTaxDetails.expenditure || "0",
        balance: waterTaxDetails.balance || "0"
      }
    };

    updateSLC({ id: editingSLCId, slcData: updateData }, {
      onSuccess: (data) => {
        console.log('✅ SLC Updated Successfully:', data);
        alert('SLC updated successfully!');
        resetForm();
        refetchSLCs();
        onBackToList();
      },
      onError: (error: any) => {
        console.error('❌ Error updating SLC:', error);
        alert(`Failed to update SLC: ${error.message}`);
      }
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const errors: {[key: string]: string} = {};

    if (!selectedWua) {
      errors.wua = 'Please select a WUA';
    }

    if (!formData.slc_name.trim()) {
      errors.slc_name = 'SLC name is required';
    }

    if (!formData.formation_date) {
      errors.formation_date = 'Formation date is required';
    }

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (wuasWithExistingSLCs.has(selectedWua)) {
      alert('This WUA already has an SLC. You cannot create another SLC for the same WUA.');
      return;
    }

    const submitData = {
      wua_id: selectedWua,
      slc_name: formData.slc_name,
      section: formData.section,
      subdivision: formData.subdivision,
      circle: formData.circle,
      zone: formData.zone,
      formation_date: formData.formation_date,
      last_election_date: formData.last_election_date || null,
      next_election_date: formData.next_election_date || null,
      
      slc_general_body_members: vlcExecutiveMembers.map(member => ({
        name: member.name,
        vlc_represented: member.vlc_represented,
        is_executive: member.is_executive || false
      })),
      
      executive_members: executiveMembers.map(member => ({
        name: member.name,
        vlc_represented: member.vlc_represented,
        designation: member.designation,
        election_date: member.election_date
      })),
      
      water_tax_details: {
        year: waterTaxDetails.year,
        kharif_tax: waterTaxDetails.kharif_tax || "0",
        rabi_tax: waterTaxDetails.rabi_tax || "0",
        total_tax: waterTaxDetails.total_tax || "0",
        deposited_govt: waterTaxDetails.deposited_govt || "0",
        retained_wua: waterTaxDetails.retained_wua || "0",
        expenditure: waterTaxDetails.expenditure || "0",
        balance: waterTaxDetails.balance || "0"
      }
    };

    createSLC(submitData, {
      onSuccess: (data) => {
        console.log('✅ SLC Created Successfully:', data);
        setShowSuccess(true);
        setWuasWithExistingSLCs(prev => new Set([...prev, selectedWua]));
        refetchSLCs();
        
        setTimeout(() => {
          resetForm();
          setShowSuccess(false);
          onBackToList();
        }, 3000);
      },
      onError: (error: any) => {
        console.error('❌ Error creating SLC:', error);
        alert(`Failed to create SLC: ${error?.message ?? 'Unknown error'}`);
        
        if (error?.response?.data) {
          console.error('Backend error details:', error.response.data);
        }
      }
    });
  };

  const inputClass = "w-full px-4 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]";
  const sectionClass = "bg-gray-50 border border-gray-300 rounded p-6";
  const sectionHeaderClass = "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2";

  // Success message
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
          <div className="max-w-[1800px] mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SLC Created Successfully!</h1>
                <p className="text-blue-200 text-sm">Section Level Committee has been successfully formed.</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
          <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">SLC Created Successfully!</h1>
              <p className="text-green-100">Section Level Committee has been successfully formed.</p>
            </div>
            <div className="p-6 text-center">
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">SLC Details:</h3>
                <p className="text-green-700"><strong>Name:</strong> {formData.slc_name}</p>
                <p className="text-green-700"><strong>Formation Date:</strong> {formData.formation_date}</p>
                <p className="text-green-700"><strong>Executive Members:</strong> {executiveMembers.length}</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    resetForm();
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors font-medium"
                >
                  Create Another SLC
                </button>
                <button
                  onClick={onBackToList}
                  className="bg-[#003087] text-white px-6 py-3 rounded hover:bg-[#00205b] transition-colors font-medium flex items-center gap-2"
                >
                  <List className="w-4 h-4" />
                  View SLC List
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold">
                  {isEditing ? 'Edit Section Level Committee' : 'Section Level Committee Formation'}
                </h1>
                <p className="text-blue-200 text-sm">
                  {isEditing 
                    ? `Editing: ${formData.slc_name || 'SLC'}`
                    : ''
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToList}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          {/* Success Alert */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-300 rounded m-6 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">SLC Created Successfully!</h3>
                  <p className="text-green-700 text-sm">
                    The SLC has been created. You will be redirected to the list in 3 seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={isEditing ? handleUpdateSubmit : handleSubmit} className="p-6 space-y-8">
            {/* WUA Selection */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <Building className="w-5 h-5 text-[#003087]" />
                {isEditing ? 'SLC Details' : 'Select WUA (With VLCs)'}
                {!isEditing && <span className="text-red-500">*</span>}
              </h3>

              {isEditing ? (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-blue-800 font-medium">
                        WUA: <span className="font-bold">{selectedWuaDetails?.wua_name || 'Loading...'}</span>
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        Note: WUA cannot be changed in edit mode. 
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <select 
                    value={selectedWua} 
                    onChange={(e) => handleWuaSelect(e.target.value)}
                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                      formErrors.wua ? 'border-red-500' : 'border-gray-400'
                    }`}
                    required
                    disabled={wuasLoading || isEditing}
                  >
                    <option value="">Select WUA with VLCs *</option>
                    {wuasLoading ? (
                      <option disabled>Loading WUAs...</option>
                    ) : wuasError ? (
                      <option disabled>Error loading WUAs</option>
                    ) : wuasWithVlcs.filter((wua: { wua_id: string; }) => !wuasWithExistingSLCs.has(wua.wua_id)).length === 0 ? (
                      <option disabled>No WUAs available or all WUAs already have SLCs</option>
                    ) : (
                      wuasWithVlcs
                        .filter((wua: { wua_id: string; }) => !wuasWithExistingSLCs.has(wua.wua_id))
                        .map((wua: { wua_id: any; wua_name: any; vlcs: string | any[]; }) => (
                          <option key={String(wua.wua_id)} value={String(wua.wua_id)}>
                            {wua.wua_name} 
                            {wua.vlcs && wua.vlcs.length > 0 && ` (${wua.vlcs.length} VLC${wua.vlcs.length > 1 ? 's' : ''})`}
                          </option>
                        ))
                    )}
                  </select>

                  {formErrors.wua && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.wua}
                    </p>
                  )}
                </>
              )}

              {wuasLoading && (
                <div className="text-[#003087] text-sm mt-2 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#003087]"></div>
                  Loading WUAs with VLCs...
                </div>
              )}
              
              {selectedWua && vlcsLoading && (
                <p className="text-blue-600 text-sm mt-2 flex items-center gap-2">
                  Loading VLCs and auto-filling data...
                </p>
              )}
              
              {/* Selected WUA Display */}
              {selectedWua && selectedWuaDetails && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-4 mt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <strong className="text-green-800">Selected WUA:</strong> 
                    <span className="font-semibold text-green-900">{selectedWuaDetails.wua_name}</span>
                    <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded-full border border-green-300">
                      {actualVlcs.length} VLC{actualVlcs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-green-700 mb-3">
                    {wuaMasterData?.ce_zone && (
                      <div className="flex flex-col">
                        <span className="font-medium text-green-600">CE Zone</span>
                        <span>{wuaMasterData.ce_zone}</span>
                      </div>
                    )}
                    {wuaMasterData?.circle_name && (
                      <div className="flex flex-col">
                        <span className="font-medium text-green-600">Circle</span>
                        <span>{wuaMasterData.circle_name}</span>
                      </div>
                    )}
                    {wuaMasterData?.division_name && (
                      <div className="flex flex-col">
                        <span className="font-medium text-green-600">Division</span>
                        <span>{wuaMasterData.division_name}</span>
                      </div>
                    )}
                    {wuaMasterData?.subdivision_name && (
                      <div className="flex flex-col">
                        <span className="font-medium text-green-600">Subdivision</span>
                        <span>{wuaMasterData.subdivision_name}</span>
                      </div>
                    )}
                  </div>

                  {/* VLC DETAILS SECTION */}
                  {actualVlcs.length > 0 && (
                    <div className="border-t border-green-300 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowVlcDetails(!showVlcDetails)}
                        className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-2"
                      >
                        {showVlcDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        VLC Details ({actualVlcs.length})
                      </button>
                      
                      {showVlcDetails && (
                        <div className="bg-white rounded-lg border border-green-300 p-3">
                          <div className="grid gap-3">
                            {actualVlcs.map((vlc: any, index: number) => (
                              <div key={vlc.id} className="flex items-center justify-between p-2 border-b border-green-200 last:border-b-0">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                      <h4 className="font-medium text-gray-800">{vlc.vlc_name}</h4>
                                      {vlc.chairman_name && (
                                        <p className="text-sm text-gray-600">
                                          Chairman: <span className="font-medium">{vlc.chairman_name}</span>
                                        </p>
                                      )}
                                      {vlc.formation_date && (
                                        <p className="text-xs text-gray-500">
                                          Formed: {new Date(vlc.formation_date).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300">
                                    VLC {index + 1}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {actualVlcs.length === 0 && !vlcsLoading && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-2">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">No VLCs found for this WUA</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SLC Basic Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <MapPin className="w-5 h-5 text-[#003087]" />
                SLC Basic Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SLC Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slc_name"
                    value={formData.slc_name}
                    onChange={handleInputChange}
                    className={`${inputClass} ${formErrors.slc_name ? 'border-red-500' : ''}`}
                    required
                    disabled={!selectedWua}
                  />
                  {formErrors.slc_name && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.slc_name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    name="section"
                    placeholder="Section (Optional)"
                    value={formData.section}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={!selectedWua}
                  />
                </div>
                
                {/* AUTO-FILLED READ-ONLY FIELDS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subdivision</label>
                  <input
                    type="text"
                    value={formData.subdivision}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Circle</label>
                  <input
                    type="text"
                    value={formData.circle}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <input
                    type="text"
                    value={formData.zone}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formation Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="formation_date"
                      value={formData.formation_date}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-10 ${formErrors.formation_date ? 'border-red-500' : ''}`}
                      disabled={!selectedWua}
                      required
                    />
                  </div>
                  {formErrors.formation_date && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.formation_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Election Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="last_election_date"
                      value={formData.last_election_date}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-10`}
                      disabled={!selectedWua}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Election Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="next_election_date"
                      value={formData.next_election_date}
                      onChange={handleInputChange}
                      className={`${inputClass} pl-10`}
                      disabled={!selectedWua}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GENERAL BODY MEMBERS */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={sectionHeaderClass}>
                  <UserCheck className="w-5 h-5 text-[#003087]" />
                  General Body Members (All VLC Executive Members)
                  {vlcExecutiveMembers.length > 0 && ` - ${vlcExecutiveMembers.length} Members`}
                </h3>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleSelectAllVLCExecutives}
                    className="bg-[#003087] text-white px-4 py-2 rounded hover:bg-[#00205b] transition-colors text-sm font-medium"
                  >
                    Select All as Executive
                  </button>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-700 text-sm font-medium">
                      All VLC Executive Members (Chairman, Secretary, Treasurer, etc.) are automatically General Body Members
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      Select which executive members should be in SLC Executive Body
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {vlcExecutiveMembers.length > 0 ? (
                  vlcExecutiveMembers.map((member, index) => (
                    <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-400 hover:border-[#003087] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            {!isEditing ? (
                              <label className="flex items-start gap-3 cursor-pointer mt-1">
                                <input
                                  type="checkbox"
                                  checked={member.is_executive || false}
                                  onChange={(e) => handleGBMemberCheckbox(index, e.target.checked)}
                                  className="h-5 w-5 text-[#003087] focus:ring-[#003087] border-gray-400 rounded"
                                />
                                <div>
                                  <span className="text-lg font-semibold text-gray-900 block">
                                    {member.name}
                                  </span>
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium mt-1 border border-blue-300">
                                    {member.designation}
                                  </span>
                                </div>
                              </label>
                            ) : (
                              <div className="flex items-start gap-3 mt-1">
                                <div>
                                  <span className="text-lg font-semibold text-gray-900 block">
                                    {member.name}
                                  </span>
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium mt-1 border border-blue-300">
                                    {member.designation}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 ml-8">
                            <div className="flex items-center gap-2">
                              <Building className="w-3 h-3 text-gray-400" />
                              <span className="font-medium">VLC:</span>
                              <span className="text-gray-800">{member.vlc_represented}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${member.is_executive ? "text-green-600 font-medium" : "text-gray-500"}`}>
                              {member.is_executive ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  <span>✓ Selected for Executive Body</span>
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3" />
                                  <span>General Body Only</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 text-xs rounded-full border ${
                            member.is_executive 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          }`}>
                            {member.is_executive ? 'Selected' : 'Not Selected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-100 border border-gray-400 rounded-lg p-8 text-center">
                    <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No VLC Executive Members</h3>
                    <p className="text-gray-500 text-sm">
                      {selectedWua 
                        ? "No VLCs found for this WUA" 
                        : "Please select a WUA to load VLC executive members"}
                    </p>
                  </div>
                )}
              </div>
              
              {/* SELECTED COUNT SUMMARY */}
              {vlcExecutiveMembers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-400">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium">{executiveMembers.length}</span> of <span className="font-medium">{vlcExecutiveMembers.length}</span> members selected for Executive Body
                    </div>
                    <div className="text-green-600 font-medium">
                      {executiveMembers.length > 0 ? `${executiveMembers.length} selected` : 'None selected'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* EXECUTIVE BODY */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={sectionHeaderClass}>
                  <Award className="w-5 h-5 text-[#003087]" />
                  SLC Executive Body ({executiveMembers.length} Members)
                </h3>
              </div>
              
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-700 text-sm font-medium">
                      Executive Body Members ({executiveMembers.length} selected)
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      You can select any number of executive members. No minimum requirements.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {executiveMembers.length > 0 ? (
                  executiveMembers.map((member, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-green-300">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* READ-ONLY DETAILS */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
                          <input
                            type="text"
                            value={member.name}
                            className={`${inputClass} bg-gray-100 text-gray-600`}
                            readOnly
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">VLC</label>
                          <input
                            type="text"
                            value={member.vlc_represented}
                            className={`${inputClass} bg-gray-100 text-gray-600`}
                            readOnly
                          />
                        </div>

                        {/* ONLY EDITABLE FIELD - DESIGNATION */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Designation <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={member.designation}
                            onChange={(e) => handleExecutiveDesignationChange(index, e.target.value as ExecutiveMember['designation'])}
                            className={inputClass}
                          >
                            <option value="Member">Member</option>
                            <option value="Chairman">Chairman</option>
                            <option value="Vice President">Vice President</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Treasurer">Treasurer</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">No Executive Members Selected</h3>
                    <p className="text-yellow-700 text-sm">
                      Select VLC Chairmen from General Body to add them to Executive Body
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Water Tax Collection Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <IndianRupee className="w-5 h-5 text-[#003087]" />
                Water Tax Collection Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'year', label: 'Year', type: 'number', readOnly: false },
                  { name: 'kharif_tax', label: 'Kharif Tax (₹)', type: 'number', readOnly: false },
                  { name: 'rabi_tax', label: 'Rabi Tax (₹)', type: 'number', readOnly: false },
                  { name: 'total_tax', label: 'Total Tax (₹)', type: 'number', readOnly: true },
                  { name: 'deposited_govt', label: 'Deposited to Govt (30%)', type: 'number', readOnly: true },
                  { name: 'retained_wua', label: 'Retained with WUA (70%)', type: 'number', readOnly: true },
                  { name: 'expenditure', label: 'Expenditure (₹)', type: 'number', readOnly: false },
                  { name: 'balance', label: 'Balance (₹)', type: 'number', readOnly: true },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={waterTaxDetails[field.name as keyof WaterTaxDetails]}
                      onChange={handleWaterTaxChange}
                      className={`${inputClass} ${field.readOnly ? 'bg-gray-100 text-gray-600' : ''}`}
                      disabled={!selectedWua}
                      readOnly={field.readOnly}
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-300">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-8 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] disabled:opacity-50 transition-colors font-medium"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating SLC...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update SLC
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !selectedWua}
                    className="flex items-center gap-2 px-8 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] disabled:opacity-50 transition-colors font-medium"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating SLC...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create SLC
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SLCForm;