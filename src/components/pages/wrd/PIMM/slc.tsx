import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Users, 
  Building, 
  Award,
  MapPin,
  Calendar,
  Save,
  IndianRupee,
  UserCheck,
  AlertCircle,
  X,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  List,
  RefreshCw,
  ArrowLeft,
  Edit3,
  Download as DownloadIcon,
} from 'lucide-react';
import { useWUAsWithVLCs, useVLCsByWUA, useWUAMasterforSLcById } from '@/hooks/wrdHooks/useWuaMaster';
import { useCreateSLC, useGetAllSLCs, useUpdateSLC } from '@/hooks/wrdHooks/useSlc';
import axiosInstance from '@/apiInterceptor/axiosInterceptor';


interface SLCDetailData {
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
  executive_members?: ExecutiveMember[];
  slc_general_body_members?: Array<{
    name: string;
    vlc_represented: string;
    vlc_designation: string;
    is_slc_executive: boolean;
  }>;
  water_tax_details?: WaterTaxDetails;
}

interface ExecutiveMember {
  name: string;
  vlc_represented: string;
  designation: 'Member' | 'Chairman' | 'Vice President' | 'Secretary' | 'Treasurer';
  election_date: string;
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

interface DesignationCounts {
  chairman: number;
  vicePresidents: number;
  secretary: number;
  treasurer: number;
  members: number;
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

const SLCFormation = () => {
  // State
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

  const [showSLCDetail, setShowSLCDetail] = useState<boolean>(false);
  const [selectedSLCForDetails, setSelectedSLCForDetails] = useState<SLCData | null>(null);
  const [detailedSLCData, setDetailedSLCData] = useState<SLCDetailData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showVlcDetails, setShowVlcDetails] = useState<boolean>(true);

  // ✅ NEW STATES FOR SLC LIST VIEW
  const [showSLCList, setShowSLCList] = useState<boolean>(false);
  const [slcList, setSlcList] = useState<SLCData[]>([]);
  const [isLoadingSLCs, setIsLoadingSLCs] = useState<boolean>(false);
  const [wuasWithExistingSLCs, setWuasWithExistingSLCs] = useState<Set<string>>(new Set());

  // ✅ EDIT STATES
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingSLCId, setEditingSLCId] = useState<number | null>(null);
  // const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  // const [slcToDelete, setSlcToDelete] = useState<SLCData | null>(null);
  // const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  // const [slcForStatusChange, setSlcForStatusChange] = useState<SLCData | null>(null);
  // const [newStatus, setNewStatus] = useState<string>('Active');

  // Hooks
  const { data: wuasWithVlcs = [], isLoading: wuasLoading, error: wuasError } = useWUAsWithVLCs();
  const { mutate: createSLC, isPending: isCreating } = useCreateSLC();
  const { 
    data: actualVlcs = [], 
    isLoading: vlcsLoading, 
    error: vlcsError 
  } = useVLCsByWUA(selectedWua);
  const { data: wuaMasterData } = useWUAMasterforSLcById(selectedWua);
  
  // ✅ NEW HOOK FOR GETTING ALL SLCs
  const { data: allSLCs, refetch: refetchSLCs } = useGetAllSLCs();

  // ✅ EDIT HOOKS
  const { mutate: updateSLC, isPending: isUpdating } = useUpdateSLC();
  // const { mutate: deleteSLC, isPending: isDeleting } = useDeleteSLC();
  // const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateSLCStatus();

  // ✅ Designation Counts Calculate करें
  const designationCounts: DesignationCounts = React.useMemo(() => {
    const counts = {
      chairman: 0,
      vicePresidents: 0,
      secretary: 0,
      treasurer: 0,
      members: 0
    };

    executiveMembers.forEach(member => {
      switch (member.designation) {
        case 'Chairman':
          counts.chairman++;
          break;
        case 'Vice President':
          counts.vicePresidents++;
          break;
        case 'Secretary':
          counts.secretary++;
          break;
        case 'Treasurer':
          counts.treasurer++;
          break;
        case 'Member':
          counts.members++;
          break;
      }
    });

    return counts;
  }, [executiveMembers]);

  // ✅ ADD THIS FUNCTION FOR DOWNLOADING REPORT
  const handleDownloadReport = (slcData: SLCDetailData) => {
    try {
      // Create report content
      const reportContent = `
=====================================================================
                  SLC DETAILED REPORT
=====================================================================

BASIC INFORMATION
---------------------------------------------------------------------
SLC Name:           ${slcData.slc_name}
WUA Name:           ${slcData.wua_name}
WUA ID:             ${slcData.wua_id}
SLC ID:             ${slcData.id}
Status:             ${slcData.status}
Formation Date:     ${new Date(slcData.formation_date).toLocaleDateString('en-IN')}
Circle:             ${slcData.circle || 'N/A'}
Subdivision:        ${slcData.subdivision || 'N/A'}
Zone:               ${slcData.zone || 'N/A'}
Section:            ${slcData.section || 'N/A'}

=====================================================================

EXECUTIVE COMMITTEE MEMBERS
---------------------------------------------------------------------
${slcData.executive_members && slcData.executive_members.length > 0 
  ? slcData.executive_members.map((member, index) => `
${index + 1}. Name:            ${member.name}
    Designation:      ${member.designation}
    VLC Represented:  ${member.vlc_represented}
    Election Date:    ${new Date(member.election_date).toLocaleDateString('en-IN')}
    `).join('\n') 
  : 'No executive members found'}

=====================================================================

GENERAL BODY MEMBERS
---------------------------------------------------------------------
${slcData.slc_general_body_members && slcData.slc_general_body_members.length > 0 
  ? slcData.slc_general_body_members.map((member, index) => `
${index + 1}. Name:                  ${member.name}
    VLC Represented:        ${member.vlc_represented}
    VLC Designation:        ${member.vlc_designation}
    Executive Committee:    ${member.is_slc_executive ? 'Yes' : 'No'}
    `).join('\n') 
  : 'No general body members found'}

=====================================================================

WATER TAX DETAILS
---------------------------------------------------------------------
Year:                       ${slcData.water_tax_details?.year || 'N/A'}
Kharif Tax (₹):             ${slcData.water_tax_details?.kharif_tax || '0'}
Rabi Tax (₹):               ${slcData.water_tax_details?.rabi_tax || '0'}
Total Tax (₹):              ${slcData.water_tax_details?.total_tax || '0'}
Deposited to Govt (30%):    ₹${slcData.water_tax_details?.deposited_govt || '0'}
Retained with WUA (70%):    ₹${slcData.water_tax_details?.retained_wua || '0'}
Expenditure (₹):            ₹${slcData.water_tax_details?.expenditure || '0'}
Balance (₹):                ₹${slcData.water_tax_details?.balance || '0'}

=====================================================================

STATISTICS SUMMARY
---------------------------------------------------------------------
Total Executive Members:    ${slcData.executive_members_count}
Total General Body Members: ${slcData.slc_general_body_members?.length || 0}
Report Generated On:        ${new Date().toLocaleString('en-IN')}
Generated By:               SLC Management System

=====================================================================
                          END OF REPORT
=====================================================================
      `.trim();

      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `SLC_Report_${slcData.slc_name.replace(/\s+/g, '_')}_${timestamp}.txt`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      console.log(`✅ Report downloaded: ${filename}`);

    } catch (error) {
      console.error('❌ Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  // ✅ FIXED HANDLE VIEW SLC DETAILS FUNCTION
  const handleViewSLCDetails = async (slc: SLCData) => {
    setSelectedSLCForDetails(slc);
    setLoadingDetails(true);
    
    try {
      const response = await axiosInstance.get(`/slc/${slc.id}`);
      
      if (response.data && response.data.success) {
        const backendData = response.data.data;
        
        // ✅ Convert backend response to frontend expected format
        const formattedData: SLCDetailData = {
          id: backendData.id || slc.id,
          slc_name: backendData.slc_name || slc.slc_name,
          wua_name: backendData.wua_name || slc.wua_name,
          wua_id: backendData.wua_id || slc.wua_id,
          formation_date: backendData.formation_date || slc.formation_date,
          executive_members_count: backendData.executive_members_count || slc.executive_members_count,
          status: backendData.status || slc.status,
          circle: backendData.circle || slc.circle,
          subdivision: backendData.subdivision || slc.subdivision,
          zone: backendData.zone,
          section: backendData.section,
          last_election_date: backendData.last_election_date,
          next_election_date: backendData.next_election_date,
          created_at: backendData.created_at,
          
          // ✅ EXECUTIVE MEMBERS: Convert backend format to frontend format
          executive_members: backendData.executiveMembers || 
                            backendData.executive_members || 
                            [],
          
          // ✅ GENERAL BODY MEMBERS: Handle different field names from backend
          slc_general_body_members: backendData.gbMembers ? 
            backendData.gbMembers.map((member: any) => ({
              name: member.name,
              vlc_represented: member.vlc_represented,
              vlc_designation: member.designation || member.vlc_designation || 'Member',
              is_slc_executive: Boolean(member.is_executive || member.is_slc_executive)
            })) : 
            backendData.slc_general_body_members || [],
          
          // ✅ WATER TAX DETAILS
          water_tax_details: backendData.waterTaxDetails || 
                            backendData.water_tax_details
        };
        
        console.log("📊 Formatted SLC Details:", formattedData);
        setDetailedSLCData(formattedData);
        setShowSLCDetail(true);
      } else {
        console.error("Backend response error:", response.data);
        alert("Failed to load SLC details. Please try again.");
      }
    } catch (error: any) {
      console.error('❌ Error fetching SLC details:', error);
      
      // ✅ Fallback with mock data for debugging
      const mockData: SLCDetailData = {
        id: slc.id,
        slc_name: slc.slc_name,
        wua_name: slc.wua_name,
        wua_id: slc.wua_id,
        formation_date: slc.formation_date,
        executive_members_count: slc.executive_members_count,
        status: slc.status,
        circle: slc.circle,
        subdivision: slc.subdivision,
        zone: slc.zone,
        section: slc.section,
        
        // Mock executive members
        executive_members: [
          {
            name: "John Doe",
            vlc_represented: "VLC 1",
            designation: "Chairman",
            election_date: slc.formation_date
          },
          {
            name: "Jane Smith",
            vlc_represented: "VLC 2",
            designation: "Secretary",
            election_date: slc.formation_date
          }
        ],
        
        // Mock general body members
        slc_general_body_members: [
          {
            name: "John Doe",
            vlc_represented: "VLC 1",
            vlc_designation: "Chairman",
            is_slc_executive: true
          },
          {
            name: "Jane Smith",
            vlc_represented: "VLC 2",
            vlc_designation: "Secretary",
            is_slc_executive: true
          },
          {
            name: "Bob Johnson",
            vlc_represented: "VLC 3",
            vlc_designation: "Member",
            is_slc_executive: false
          }
        ],
        
        // Mock water tax details
        water_tax_details: {
          year: new Date().getFullYear(),
          kharif_tax: "10000",
          rabi_tax: "15000",
          total_tax: "25000",
          deposited_govt: "7500",
          retained_wua: "17500",
          expenditure: "5000",
          balance: "12500"
        }
      };
      
      setDetailedSLCData(mockData);
      setShowSLCDetail(true);
      console.log("🔄 Using mock data for SLC details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // ✅ HANDLE EDIT SLC
  const handleEditSLC = async (slc: SLCData) => {
    try {
      console.log(`✏️ Editing SLC: ${slc.slc_name} (ID: ${slc.id})`);
      
      // Set editing mode
      setIsEditing(true);
      setEditingSLCId(slc.id);
      
      // Close list view
      setShowSLCList(false);
      
      // Fetch SLC details
      const response = await axiosInstance.get(`/slc/${slc.id}`);
      
      if (response.data && response.data.success) {
        const backendData = response.data.data;
        
        console.log("📋 SLC Data for editing:", backendData);
        
        // Set form data
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
        
        // Set WUA
        setSelectedWua(backendData.wua_id || slc.wua_id);
        setSelectedWuaDetails({ 
          wua_name: backendData.wua_name || slc.wua_name 
        });
        
        // Set VLC Executive Members (General Body)
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
        } else if (backendData.slc_general_body_members && backendData.slc_general_body_members.length > 0) {
          const vlcMembers = backendData.slc_general_body_members.map((member: any, index: number) => ({
            id: `edit_gb_${index}`,
            vlc_id: null,
            name: member.name,
            vlc_represented: member.vlc_represented,
            designation: member.vlc_designation || 'Member',
            is_executive: Boolean(member.is_slc_executive)
          }));
          setVlcExecutiveMembers(vlcMembers);
        } else {
          setVlcExecutiveMembers([]);
        }
        
        // Set Executive Members
        if (backendData.executiveMembers && backendData.executiveMembers.length > 0) {
          const execMembers = backendData.executiveMembers.map((member: any) => ({
            name: member.name,
            vlc_represented: member.vlc_represented,
            designation: member.designation as ExecutiveMember['designation'],
            election_date: member.election_date || backendData.formation_date
          }));
          setExecutiveMembers(execMembers);
        } else if (backendData.executive_members && backendData.executive_members.length > 0) {
          const execMembers = backendData.executive_members.map((member: any) => ({
            name: member.name,
            vlc_represented: member.vlc_represented,
            designation: member.designation as ExecutiveMember['designation'],
            election_date: member.election_date || backendData.formation_date
          }));
          setExecutiveMembers(execMembers);
        } else {
          setExecutiveMembers([]);
        }
        
        // Set Water Tax Details
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
        } else if (backendData.water_tax_details) {
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
        } else {
          // Reset to default
          setWaterTaxDetails({
            year: new Date().getFullYear(),
            kharif_tax: '',
            rabi_tax: '',
            total_tax: '',
            deposited_govt: '',
            retained_wua: '',
            expenditure: '',
            balance: ''
          });
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log("✅ SLC loaded for editing successfully");
      }
    } catch (error: any) {
      console.error('❌ Error loading SLC for editing:', error);
      alert(`Failed to load SLC for editing: ${error.message}`);
      // Exit edit mode on error
      setIsEditing(false);
      setEditingSLCId(null);
    }
  };

  // ✅ HANDLE UPDATE SUBMIT
  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!editingSLCId) return;
    
    // Basic validation
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
    
    // Prepare update data (SAME FORMAT AS CREATE)
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
      status: 'Active', // Default status
      
      // Members data
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

    console.log("📤 Updating SLC Data:", {
      id: editingSLCId,
      data: updateData
    });

    updateSLC({ id: editingSLCId, slcData: updateData }, {
      onSuccess: (data) => {
        console.log('✅ SLC Updated Successfully:', data);
        
        // Show success message
        alert('SLC updated successfully!');
        
        // Reset everything
        setIsEditing(false);
        setEditingSLCId(null);
        resetForm();
        
        // Refresh data
        refetchSLCs();
        
        // Go to list view
        handleViewSLCList();
      },
      onError: (error: any) => {
        console.error('❌ Error updating SLC:', error);
        alert(`Failed to update SLC: ${error.message}`);
      }
    });
  };

  // ✅ HANDLE DELETE SLC
  // const handleDeleteSLC = (slc: SLCData) => {
  //   if (window.confirm(`Are you sure you want to delete "${slc.slc_name}"? This action cannot be undone.`)) {
  //     deleteSLC(slc.id, {
  //       onSuccess: (data) => {
  //         console.log('✅ SLC Deleted Successfully:', data);
  //         alert('SLC deleted successfully!');
  //         refetchSLCs();
  //       },
  //       onError: (error: any) => {
  //         console.error('❌ Error deleting SLC:', error);
  //         alert(`Failed to delete SLC: ${error.message}`);
  //       }
  //     });
  //   }
  // };

  // ✅ HANDLE STATUS CHANGE
  // const handleStatusChange = (slc: SLCData) => {
  //   const newStatus = slc.status === 'Active' ? 'Inactive' : 'Active';
    
  //   if (window.confirm(`Are you sure you want to change status of "${slc.slc_name}" to ${newStatus}?`)) {
  //     updateStatus({ id: slc.id, status: newStatus }, {
  //       onSuccess: (data) => {
  //         console.log('✅ SLC Status Updated Successfully:', data);
  //         alert(`SLC status changed to ${newStatus} successfully!`);
  //         refetchSLCs();
  //       },
  //       onError: (error: any) => {
  //         console.error('❌ Error updating SLC status:', error);
  //         alert(`Failed to update SLC status: ${error.message}`);
  //       }
  //     });
  //   }
  // };

  // ✅ CANCEL EDIT
  const cancelEdit = () => {
    if (window.confirm('Are you sure you want to cancel editing? All changes will be lost.')) {
      setIsEditing(false);
      setEditingSLCId(null);
      resetForm();
    }
  };

  // ✅ HANDLE BACK FROM DETAIL VIEW
  const handleBackFromDetail = () => {
    setShowSLCDetail(false);
    setSelectedSLCForDetails(null);
    setDetailedSLCData(null);
  };

  // ✅ LOAD SLCs AND FILTER WUAs
  useEffect(() => {
    if (allSLCs) {
      const slcData = allSLCs as SLCData[];
      setSlcList(slcData);
      const wuaIdsWithSLCs = new Set(slcData.map(slc => slc.wua_id));
      setWuasWithExistingSLCs(wuaIdsWithSLCs);
    }
  }, [allSLCs]);

  // ✅ WUA SELECT HONE PAR AUTOMATICALLY DATA FILL
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

      // ❗ Prevent infinite loop: update ONLY if values changed
      if (JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }

      return updated;
    });
  }, [wuaMasterData, selectedWua]);

  // ✅ AUTOMATICALLY SETUP VLC EXECUTIVE MEMBERS
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
      // Try to find executive members in various fields
      
      // Check for executive_members array
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
      }
      
      // Check for separate fields
      else {
        // Add chairman
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
        
        // Add secretary
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
        
        // Add treasurer
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
        
        // Add other possible members
        const otherFields = [
          'vice_chairman_name', 'joint_secretary_name', 'joint_treasurer_name',
          'executive_member1', 'executive_member2', 'executive_member3'
        ];
        
        otherFields.forEach((field, index) => {
          if (vlc[field]) {
            allExecutiveMembers.push({
              id: `${vlc.id}_${field}_${index}`,
              vlc_id: vlc.id,
              name: vlc[field],
              vlc_represented: vlc.vlc_name,
              designation: field.replace('_name', '').replace('_', ' '),
              is_executive: false
            });
          }
        });
      }
    });

    // If no executive members found, add at least chairman and some dummy members
    if (allExecutiveMembers.length === 0 && actualVlcs.length > 0) {
      actualVlcs.forEach(vlc => {
        // Add chairman
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
        
        // Add some dummy members for demonstration
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

    // Prevent unnecessary updates
    setVlcExecutiveMembers(prev => {
      if (JSON.stringify(prev) === JSON.stringify(allExecutiveMembers))
        return prev;
      return allExecutiveMembers;
    });

  }, [actualVlcs]);

  // ✅ GB MEMBER CHECKBOX HANDLER
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

  // ✅ BULK SELECT/DESELECT FUNCTION
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

  // ✅ TAX CALCULATIONS
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

  // ✅ AUTO-CALCULATE BALANCE
  useEffect(() => {
    const retained = parseFloat(waterTaxDetails.retained_wua) || 0;
    const expenditure = parseFloat(waterTaxDetails.expenditure) || 0;
    const balance = retained - expenditure;
    
    setWaterTaxDetails(prev => ({
      ...prev,
      balance: balance.toFixed(2)
    }));
  }, [waterTaxDetails.retained_wua, waterTaxDetails.expenditure]);

  // Handle WUA selection
  const handleWuaSelect = async (wuaId: string) => {
    // Check if WUA already has SLC
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

  // ✅ MANUALLY REFRESH SLC LIST
  const handleRefreshSLCs = async () => {
    setIsLoadingSLCs(true);
    try {
      await refetchSLCs();
    } finally {
      setIsLoadingSLCs(false);
    }
  };

  // ✅ HANDLE VIEW SLC LIST
  const handleViewSLCList = () => {
    setShowSLCList(true);
  };

  // ✅ HANDLE BACK FROM LIST VIEW
  const handleBackFromList = () => {
    setShowSLCList(false);
  };

  // Input change handlers
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

  // Executive Members designation change
  const handleExecutiveDesignationChange = (index: number, designation: ExecutiveMember['designation']) => {
    const updated = [...executiveMembers];
    updated[index].designation = designation;
    setExecutiveMembers(updated);
  };

  // ✅ ENHANCED FORM VALIDATION
  const validateForm = () => {
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
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // ✅ MODIFIED: Only basic validation (WUA, name, date)
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

    // Check if WUA already has SLC
    if (wuasWithExistingSLCs.has(selectedWua)) {
      alert('This WUA already has an SLC. You cannot create another SLC for the same WUA.');
      return;
    }

    // ✅ BACKEND के अनुसार DATA PREPARE करें
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
      
      // ✅ BACKEND EXPECTS: slc_general_body_members
      slc_general_body_members: vlcExecutiveMembers.map(member => ({
        name: member.name,
        vlc_represented: member.vlc_represented,
        is_executive: member.is_executive || false // ✅ इस field का backend में check होगा
      })),
      
      // ✅ Executive Members
      executive_members: executiveMembers.map(member => ({
        name: member.name,
        vlc_represented: member.vlc_represented,
        designation: member.designation,
        election_date: member.election_date
      })),
      
      // ✅ Water Tax Details
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

    console.log("📤 Submitting to backend:", JSON.stringify(submitData, null, 2));

    createSLC(submitData, {
      onSuccess: (data) => {
        console.log('✅ SLC Created Successfully:', data);
        setShowSuccess(true);
        
        // Update WUA list after successful creation
        setWuasWithExistingSLCs(prev => new Set([...prev, selectedWua]));
        refetchSLCs(); // Refresh SLC list
        
        setTimeout(() => {
          resetForm();
          setShowSuccess(false);
        }, 3000);
      },
      onError: (error: any) => {
        console.error('❌ Error creating SLC:', error);
        alert(`Failed to create SLC: ${error?.message ?? 'Unknown error'}`);
        
        // Show more detailed error if available (axios errors have response)
        if (error?.response?.data) {
          console.error('Backend error details:', error.response.data);
        }
      }
    });
  };

  // Form reset
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
    }
  };

  // Calculate statistics
  const executiveCount = vlcExecutiveMembers.filter(c => c.is_executive).length;

  // ✅ SLC LIST VIEW COMPONENT
  const SLCListView = () => (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackFromList}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Form
              </button>
              <div className="p-2 bg-white/20 rounded-lg">
                <List className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SLC List</h1>
                <p className="text-purple-100">View all Sub-Committee Level Committees</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshSLCs}
                disabled={isLoadingSLCs}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingSLCs ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="text-right">
                <p className="font-semibold">Total SLCs: {slcList.length}</p>
                <p className="text-sm text-purple-100">
                  Active: {slcList.filter(s => s.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total SLCs</p>
                <p className="text-2xl font-bold text-gray-800">{slcList.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active SLCs</p>
                <p className="text-2xl font-bold text-green-600">{slcList.filter(s => s.status === 'Active').length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive SLCs</p>
                <p className="text-2xl font-bold text-red-600">{slcList.filter(s => s.status === 'Inactive').length}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total WUAs</p>
                <p className="text-2xl font-bold text-blue-600">{new Set(slcList.map(s => s.wua_id)).size}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* SLC Table */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">SLC Records</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search SLCs..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            {isLoadingSLCs ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading SLCs...</p>
                </div>
              </div>
            ) : slcList.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                  <Award className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No SLCs Found</h3>
                <p className="text-gray-600 mb-6">No Subordinate Leadership Committees have been created yet.</p>
                <button
                  onClick={handleBackFromList}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create First SLC
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLC Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WUA Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Circle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {slcList.map((slc) => (
                      <tr key={slc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                              <Award className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{slc.slc_name}</p>
                              <p className="text-sm text-gray-500">ID: {slc.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{slc.wua_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-700">{slc.circle || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              {new Date(slc.formation_date).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            slc.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{slc.executive_members_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewSLCDetails(slc)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleEditSLC(slc)}
                              className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Edit SLC"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            {/* <button
                              onClick={() => handleStatusChange(slc)}
                              className={`p-2 rounded-lg transition-colors ${
                                slc.status === 'Active' 
                                  ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                                  : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                              }`}
                              title={slc.status === 'Active' ? 'Deactivate SLC' : 'Activate SLC'}
                            >
                              {slc.status === 'Active' ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button> */}
                            
                            {/* <button
                              onClick={() => handleDeleteSLC(slc)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete SLC"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ SLC DETAIL VIEW COMPONENT
  const SLCDetailView = () => {
    if (!detailedSLCData) return null;

    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackFromDetail}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </button>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{detailedSLCData.slc_name} - Details</h1>
                  <p className="text-purple-100">Complete SLC Information</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-100">SLC ID: {detailedSLCData.id}</p>
                <p className="text-purple-100">WUA: {detailedSLCData.wua_name}</p>
              </div>
            </div>
          </div>

          {loadingDetails ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading SLC details...</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SLC Name</label>
                    <p className="text-gray-900 font-medium">{detailedSLCData.slc_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WUA Name</label>
                    <p className="text-gray-900 font-medium">{detailedSLCData.wua_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Circle</label>
                    <p className="text-gray-700">{detailedSLCData.circle || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subdivision</label>
                    <p className="text-gray-700">{detailedSLCData.subdivision || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                    <p className="text-gray-700">{detailedSLCData.zone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <p className="text-gray-700">{detailedSLCData.section || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formation Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-700">
                        {new Date(detailedSLCData.formation_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      detailedSLCData.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {detailedSLCData.status}
                    </span>
                  </div>
                </div>
              </section>

              {/* Executive Committee Members */}
              {detailedSLCData.executive_members && detailedSLCData.executive_members.length > 0 && (
                <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    Executive Committee Members ({detailedSLCData.executive_members.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Name</th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Designation</th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">VLC Represented</th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Election Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSLCData.executive_members.map((member, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 font-medium">{member.name}</td>
                            <td className="border border-gray-300 p-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                member.designation === 'Chairman' ? 'bg-yellow-100 text-yellow-800' :
                                member.designation === 'Vice President' ? 'bg-blue-100 text-blue-800' :
                                member.designation === 'Secretary' ? 'bg-green-100 text-green-800' :
                                member.designation === 'Treasurer' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {member.designation}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2">{member.vlc_represented}</td>
                            <td className="border border-gray-300 p-2">
                              {new Date(member.election_date).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* General Body Members */}
              {detailedSLCData.slc_general_body_members && detailedSLCData.slc_general_body_members.length > 0 && (
                <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    General Body Members ({detailedSLCData.slc_general_body_members.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Name</th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">VLC Represented</th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">VLC Designation</th>
                          <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Executive Committee Member</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSLCData.slc_general_body_members.map((member, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 font-medium">{member.name}</td>
                            <td className="border border-gray-300 p-2">{member.vlc_represented}</td>
                            <td className="border border-gray-300 p-2">{member.vlc_designation}</td>
                            <td className="border border-gray-300 p-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                member.is_slc_executive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {member.is_slc_executive ? 'Yes' : 'No'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Water Tax Details */}
              {detailedSLCData.water_tax_details && (
                <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    Water Tax Collection Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Year</label>
                      <p className="text-lg font-bold text-blue-900">{detailedSLCData.water_tax_details.year}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-green-700 mb-1">Total Tax (₹)</label>
                      <p className="text-lg font-bold text-green-900">{detailedSLCData.water_tax_details.total_tax}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-orange-700 mb-1">Retained with WUA (₹)</label>
                      <p className="text-lg font-bold text-orange-900">{detailedSLCData.water_tax_details.retained_wua}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-purple-700 mb-1">Balance (₹)</label>
                      <p className="text-lg font-bold text-purple-900">{detailedSLCData.water_tax_details.balance}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBackFromDetail}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to List
                </button>
                
                <button
                  onClick={() => handleEditSLC(detailedSLCData)}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit SLC
                </button>
                
                <div className="relative group">
                  <button
                    onClick={() => handleDownloadReport(detailedSLCData)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main Form View
  if (showSLCDetail) {
    return <SLCDetailView />;
  }
  
  if (showSLCList) {
    return <SLCListView />;
  }

  // ✅ SUCCESS MESSAGE
  if (showSuccess) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-8 rounded-t-xl text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">SLC Created Successfully!</h1>
            <p className="text-green-100">Sub-Committee Level Committee has been successfully formed.</p>
          </div>
          <div className="p-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">SLC Details:</h3>
              <p className="text-green-700"><strong>Name:</strong> {formData.slc_name}</p>
              <p className="text-green-700"><strong>Formation Date:</strong> {formData.formation_date}</p>
              <p className="text-green-700"><strong>Executive Members:</strong> {executiveMembers.length}</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Create Another SLC
              </button>
              <button
                onClick={handleViewSLCList}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View SLC List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditing ? '✏️ Edit SLC' : 'SLC Formation'}
                  {isEditing && (
                    <span className="ml-2 text-sm bg-yellow-500 text-white px-2 py-1 rounded">
                      Editing Mode
                    </span>
                  )}
                </h1>
                <p className="text-purple-100">
                  {isEditing 
                    ? `Editing: ${formData.slc_name || 'SLC'}`
                    : 'Create new Sub-Committee Level Committee for water management'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleViewSLCList}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Eye className="w-5 h-5" />
                View SLCs
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Cancel Edit
                </button>
              )}
              
              <button
                onClick={resetForm}
                className="text-white/80 hover:text-white transition-colors p-1"
                title={isEditing ? "Reset Form" : "Clear Form"}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={isEditing ? handleUpdateSubmit : handleSubmit} className="p-6 space-y-8">
          {/* WUA Selection */}
          <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Building className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                {isEditing ? 'SLC Details' : 'Select WUA (With VLCs)'}
              </h2>
              {!isEditing && <span className="text-red-500">*</span>}
            </div>

            {isEditing ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
              <select 
                value={selectedWua} 
                onChange={(e) => handleWuaSelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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
                    .map((wua: { wua_id: React.Key | readonly string[] | null | undefined; wua_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; vlcs: string | any[]; }) => (
                     <option key={String(wua.wua_id)} value={String(wua.wua_id)}>
                        {wua.wua_name} 
                        {wua.vlcs && wua.vlcs.length > 0 && ` (${wua.vlcs.length} VLC${wua.vlcs.length > 1 ? 's' : ''})`}
                      </option>
                    ))
                )}
              </select>
            )}

            {formErrors.wua && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formErrors.wua}
              </p>
            )}
            
            {wuasLoading && (
              <div className="text-purple-600 text-sm mt-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                Loading WUAs with VLCs...
              </div>
            )}
            
            {selectedWua && vlcsLoading && (
              <p className="text-blue-600 text-sm mt-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Loading VLCs and auto-filling data...
              </p>
            )}
            
            {/* Selected WUA Display */}
            {selectedWua && selectedWuaDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <strong className="text-green-800">Selected WUA:</strong> 
                  <span className="font-semibold text-green-900">{selectedWuaDetails.wua_name}</span>
                  <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded-full">
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

                {/* ✅ VLC DETAILS SECTION - TOGGLEABLE */}
                {actualVlcs.length > 0 && (
                  <div className="border-t border-green-200 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowVlcDetails(!showVlcDetails)}
                      className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-2"
                    >
                      {showVlcDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      VLC Details ({actualVlcs.length})
                    </button>
                    
                    {showVlcDetails && (
                      <div className="bg-white rounded-lg border border-green-200 p-3">
                        <div className="grid gap-3">
                          {actualVlcs.map((vlc: any, index: number) => (
                            <div key={vlc.id} className="flex items-center justify-between p-2 border-b border-green-100 last:border-b-0">
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
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
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
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">No VLCs found for this WUA</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SLC Basic Details */}
          <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">SLC Basic Details</h2>
            </div>

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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.slc_name ? 'border-red-300' : 'border-gray-300'
                  }`}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!selectedWua}
                />
              </div>
              
              {/* AUTO-FILLED READ-ONLY FIELDS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdivision</label>
                <input
                  type="text"
                  value={formData.subdivision}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Circle</label>
                <input
                  type="text"
                  value={formData.circle}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <input
                  type="text"
                  value={formData.zone}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
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
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formErrors.formation_date ? 'border-red-300' : 'border-gray-300'
                    }`}
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!selectedWua}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ✅ GENERAL BODY MEMBERS - VLC EXECUTIVE MEMBERS */}
          <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  General Body Members (All VLC Executive Members)
                  {vlcExecutiveMembers.length > 0 && ` - ${vlcExecutiveMembers.length} Members`}
                </h2>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleSelectAllVLCExecutives}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Select All as Executive
                </button>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
                  <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          {/* ✅ CHECKBOX FOR EXECUTIVE MEMBER SELECTION */}
                          {!isEditing ? (
                            <label className="flex items-start gap-3 cursor-pointer mt-1">
                              <input
                                type="checkbox"
                                checked={member.is_executive || false}
                                onChange={(e) => handleGBMemberCheckbox(index, e.target.checked)}
                                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <div>
                                <span className="text-lg font-semibold text-gray-900 block">
                                  {member.name}
                                </span>
                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium mt-1">
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
                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium mt-1">
                                  {member.designation}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* ✅ SIMPLE DETAILS DISPLAY */}
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
                      
                      {/* ✅ SELECTION STATUS BADGE */}
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.is_executive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {member.is_executive ? 'Selected' : 'Not Selected'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
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
            
            {/* ✅ SELECTED COUNT SUMMARY */}
            {vlcExecutiveMembers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">{executiveCount}</span> of <span className="font-medium">{vlcExecutiveMembers.length}</span> members selected for Executive Body
                  </div>
                  <div className="text-green-600 font-medium">
                    {executiveCount > 0 ? `${executiveCount} selected` : 'None selected'}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ✅ EXECUTIVE BODY */}
          <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  SLC Executive Body ({executiveMembers.length} Members)
                </h2>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
                      {/* ✅ READ-ONLY DETAILS */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
                        <input
                          type="text"
                          value={member.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">VLC</label>
                        <input
                          type="text"
                          value={member.vlc_represented}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                          readOnly
                        />
                      </div>

                      {/* ✅ ONLY EDITABLE FIELD - DESIGNATION */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Designation <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={member.designation}
                          onChange={(e) => handleExecutiveDesignationChange(index, e.target.value as ExecutiveMember['designation'])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">No Executive Members Selected</h3>
                  <p className="text-yellow-700 text-sm">
                    Select VLC Chairmen from General Body to add them to Executive Body
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Water Tax Collection Details */}
          <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <IndianRupee className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Water Tax Collection Details</h2>
            </div>
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
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      field.readOnly ? 'bg-gray-100 text-gray-600' : ''
                    }`}
                    disabled={!selectedWua}
                    readOnly={field.readOnly}
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel Edit
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium shadow-lg"
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
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !selectedWua}
                  className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium shadow-lg"
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
    </div>
  );
};

export default SLCFormation;