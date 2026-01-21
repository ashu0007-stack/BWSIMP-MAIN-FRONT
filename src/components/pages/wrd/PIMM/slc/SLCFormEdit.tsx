// components/pages/wrd/PIMM/slc/SLCFormEdit.tsx

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Building,
  Calendar,
  MapPin,
  Users,
  UserCheck,
  AlertCircle,
  Save,
  ArrowLeft,
  IndianRupee,
  Shield,
  X,
  CheckCircle
} from 'lucide-react';
import { useUpdateSLC, useSLCById } from '@/hooks/wrdHooks/useSlc';
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

interface SLCFormEditProps {
  slcId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const SLCFormEdit: React.FC<SLCFormEditProps> = ({ slcId, onCancel, onSuccess }) => {
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
  const [generalBodyMembers, setGeneralBodyMembers] = useState<Array<{
    id: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const { mutate: updateSLC, isPending: isUpdating } = useUpdateSLC();
  const { data: slcData, refetch: refetchSLC } = useSLCById(slcId);

  // Load SLC data for editing
  useEffect(() => {
    const loadSLCData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/slc/${slcId}`);
        
        if (response.data && response.data.success) {
          const backendData = response.data.data;
          
          // Set form data
          setFormData({
            slc_name: backendData.slc_name || '',
            section: backendData.section || '',
            subdivision: backendData.subdivision || '',
            circle: backendData.circle || '',
            zone: backendData.zone || '',
            formation_date: backendData.formation_date || '',
            last_election_date: backendData.last_election_date || '',
            next_election_date: backendData.next_election_date || ''
          });
          
          // Set general body members
          if (backendData.slc_general_body_members) {
            setGeneralBodyMembers(backendData.slc_general_body_members.map((member: any) => ({
              id: `gb_${member.id}`,
              name: member.name,
              vlc_represented: member.vlc_represented,
              designation: member.designation || 'Member',
              is_executive: Boolean(member.is_executive)
            })));
          }
          
          // Set executive members
          if (backendData.executive_members) {
            setExecutiveMembers(backendData.executive_members.map((member: any) => ({
              name: member.name,
              vlc_represented: member.vlc_represented,
              designation: member.designation as ExecutiveMember['designation'],
              election_date: member.election_date || backendData.formation_date
            })));
          }
          
          // Set water tax details
          if (backendData.water_tax_details) {
            setWaterTaxDetails({
              year: backendData.water_tax_details.year || new Date().getFullYear(),
              kharif_tax: backendData.water_tax_details.kharif_tax?.toString() || '',
              rabi_tax: backendData.water_tax_details.rabi_tax?.toString() || '',
              total_tax: backendData.water_tax_details.total_tax?.toString() || '',
              deposited_govt: backendData.water_tax_details.deposited_govt?.toString() || '',
              retained_wua: backendData.water_tax_details.retained_wua?.toString() || '',
              expenditure: backendData.water_tax_details.expenditure?.toString() || '',
              balance: backendData.water_tax_details.balance?.toString() || ''
            });
          }
        }
      } catch (error: any) {
        console.error('❌ Error loading SLC for editing:', error);
        alert(`Failed to load SLC: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (slcId) {
      loadSLCData();
    }
  }, [slcId]);

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
    const updatedMembers = [...generalBodyMembers];
    updatedMembers[index].is_executive = isChecked;
    setGeneralBodyMembers(updatedMembers);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const errors: {[key: string]: string} = {};

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
      slc_name: formData.slc_name,
      section: formData.section,
      subdivision: formData.subdivision,
      circle: formData.circle,
      zone: formData.zone,
      formation_date: formData.formation_date,
      last_election_date: formData.last_election_date || null,
      next_election_date: formData.next_election_date || null,
      status: 'Active',
      
      slc_general_body_members: generalBodyMembers.map(member => ({
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

    updateSLC({ id: slcId, slcData: updateData }, {
      onSuccess: (data) => {
        console.log('✅ SLC Updated Successfully:', data);
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess();
        }, 3000);
      },
      onError: (error: any) => {
        console.error('❌ Error updating SLC:', error);
        alert(`Failed to update SLC: ${error.message}`);
      }
    });
  };

  const inputClass = "w-full px-4 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]";
  const sectionClass = "bg-gray-50 border border-gray-300 rounded p-6";
  const sectionHeaderClass = "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003087] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SLC data...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
          <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">SLC Updated Successfully!</h1>
            </div>
            <div className="p-6 text-center">
              <button
                onClick={onSuccess}
                className="bg-[#003087] text-white px-6 py-3 rounded hover:bg-[#00205b] transition-colors font-medium"
              >
                Back to List
              </button>
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
                  Edit Section Level Committee
                </h1>
                <p className="text-blue-200 text-sm">
                  Editing: {formData.slc_name || 'SLC'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Cancel Edit
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* SLC Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <MapPin className="w-5 h-5 text-[#003087]" />
                SLC Details
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
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className={inputClass}
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
                      required
                    />
                  </div>
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
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* General Body Members */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <UserCheck className="w-5 h-5 text-[#003087]" />
                General Body Members
              </h3>
              
              <div className="space-y-3">
                {generalBodyMembers.map((member, index) => (
                  <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-400">
                    <div className="flex items-start gap-3">
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
                          <span className="text-sm text-gray-600">
                            {member.vlc_represented} - {member.designation}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Body */}
            {executiveMembers.length > 0 && (
              <div className={sectionClass}>
                <h3 className={sectionHeaderClass}>
                  <Users className="w-5 h-5 text-[#003087]" />
                  Executive Body ({executiveMembers.length} Members)
                </h3>
                
                <div className="space-y-4">
                  {executiveMembers.map((member, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-green-300">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
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
                  ))}
                </div>
              </div>
            )}

            {/* Water Tax Collection Details */}
            <div className={sectionClass}>
              <h3 className={sectionHeaderClass}>
                <IndianRupee className="w-5 h-5 text-[#003087]" />
                Water Tax Collection Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={waterTaxDetails.year}
                    onChange={handleWaterTaxChange}
                    className={inputClass}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kharif Tax (₹)</label>
                  <input
                    type="number"
                    name="kharif_tax"
                    value={waterTaxDetails.kharif_tax}
                    onChange={handleWaterTaxChange}
                    className={inputClass}
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rabi Tax (₹)</label>
                  <input
                    type="number"
                    name="rabi_tax"
                    value={waterTaxDetails.rabi_tax}
                    onChange={handleWaterTaxChange}
                    className={inputClass}
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Tax (₹)</label>
                  <input
                    type="number"
                    name="total_tax"
                    value={waterTaxDetails.total_tax}
                    className={`${inputClass} bg-gray-100 text-gray-600`}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-300">
              <button
                type="button"
                onClick={onCancel}
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
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SLCFormEdit;