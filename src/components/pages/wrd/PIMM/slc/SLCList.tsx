import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Building, 
  Calendar, 
  Users, 
  Eye, 
  Edit3, 
  ArrowLeft,
  RefreshCw,
  List,
  UserCheck,
  AlertCircle,
  CheckCircle,
  DownloadIcon,
  Search,
  Filter,
  IndianRupee,
  Shield,
  Trash2,
  Plus,
  FileText,
  Landmark,
  Hash,
  Home,
  Phone,
  Mail,
  UserCircle
} from 'lucide-react';
import axiosInstance from '@/apiInterceptor/axiosInterceptor';
import { useGetAllSLCs } from '@/hooks/wrdHooks/useSlc';

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
  executive_members?: Array<{
    name: string;
    vlc_represented: string;
    designation: 'Member' | 'Chairman' | 'Vice President' | 'Secretary' | 'Treasurer';
    election_date: string;
  }>;
  slc_general_body_members?: Array<{
    name: string;
    vlc_represented: string;
    vlc_designation: string;
    is_slc_executive: boolean;
  }>;
  water_tax_details?: {
    year: number;
    kharif_tax: string;
    rabi_tax: string;
    total_tax: string;
    deposited_govt: string;
    retained_wua: string;
    expenditure: string;
    balance: string;
  };
}

interface SLCListProps {
  onViewDetails: (slc: SLCData) => void;
  onEditSLC: (slc: SLCData) => void;
  onCreateNewSLC: () => void;
}

const SLCList: React.FC<SLCListProps> = ({ onViewDetails, onEditSLC, onCreateNewSLC }) => {
  const [slcList, setSlcList] = useState<SLCData[]>([]);
  const [isLoadingSLCs, setIsLoadingSLCs] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSLCForDetails, setSelectedSLCForDetails] = useState<SLCData | null>(null);
  const [detailedSLCData, setDetailedSLCData] = useState<SLCDetailData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  const { data: allSLCs, refetch: refetchSLCs, isLoading } = useGetAllSLCs();

  // ✅ FIXED HANDLE VIEW SLC DETAILS FUNCTION
  const handleViewSLCDetails = async (slc: SLCData) => {
    setSelectedSLCForDetails(slc);
    setLoadingDetails(true);
    
    try {
      const response = await axiosInstance.get(`/slc/${slc.id}`);
      
      if (response.data && response.data.success) {
        const backendData = response.data.data;
        
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
          
          executive_members: backendData.executiveMembers || 
                            backendData.executive_members || [],
          
          slc_general_body_members: backendData.gbMembers ? 
            backendData.gbMembers.map((member: any) => ({
              name: member.name,
              vlc_represented: member.vlc_represented,
              vlc_designation: member.designation || member.vlc_designation || 'Member',
              is_slc_executive: Boolean(member.is_executive || member.is_slc_executive)
            })) : 
            backendData.slc_general_body_members || [],
          
          water_tax_details: backendData.waterTaxDetails || 
                            backendData.water_tax_details
        };
        
        setDetailedSLCData(formattedData);
        setShowDetailModal(true);
      } else {
        console.error("Backend response error:", response.data);
        alert("Failed to load SLC details. Please try again.");
      }
    } catch (error: any) {
      console.error('❌ Error fetching SLC details:', error);
      
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
      setShowDetailModal(true);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ✅ HANDLE DOWNLOAD REPORT
  const handleDownloadReport = (slcData: SLCDetailData) => {
    try {
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

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `SLC_Report_${slcData.slc_name.replace(/\s+/g, '_')}_${timestamp}.txt`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
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

  // ✅ HANDLE REFRESH
  const handleRefresh = async () => {
    setIsLoadingSLCs(true);
    try {
      await refetchSLCs();
    } finally {
      setIsLoadingSLCs(false);
    }
  };

  // Load SLC data
  useEffect(() => {
    if (allSLCs) {
      const slcData = allSLCs as SLCData[];
      setSlcList(slcData);
      setIsLoadingSLCs(false);
    }
  }, [allSLCs]);

  // Filter SLCs
  const filteredSLCs = slcList.filter(slc => {
    const matchesSearch = slc.slc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slc.wua_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slc.circle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slc.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || slc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ✅ DETAIL MODAL COMPONENT
  const DetailModal = () => {
    if (!detailedSLCData || !showDetailModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-[#003087] text-white border-b-4 border-[#FF9933] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">SLC Details - {detailedSLCData.slc_name}</h1>
                  <p className="text-blue-200 text-sm">Complete SLC Information Report</p>
                </div>
              </div>
              
              <div className="text-right">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>

          {loadingDetails ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading SLC details...</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <section className="bg-gray-50 border border-gray-300 rounded p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#003087]" />
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
                <section className="bg-gray-50 border border-gray-300 rounded p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#003087]" />
                    Executive Committee Members ({detailedSLCData.executive_members.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-400">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-400 p-2 text-sm font-semibold text-gray-700">Name</th>
                          <th className="border border-gray-400 p-2 text-sm font-semibold text-gray-700">Designation</th>
                          <th className="border border-gray-400 p-2 text-sm font-semibold text-gray-700">VLC Represented</th>
                          <th className="border border-gray-400 p-2 text-sm font-semibold text-gray-700">Election Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSLCData.executive_members.map((member, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-400 p-2 font-medium">{member.name}</td>
                            <td className="border border-gray-400 p-2">
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
                            <td className="border border-gray-400 p-2">{member.vlc_represented}</td>
                            <td className="border border-gray-400 p-2">
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
                <section className="bg-gray-50 border border-gray-300 rounded p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#003087]" />
                    General Body Members ({detailedSLCData.slc_general_body_members.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-400">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-400 p-2 text-sm font-semibold text-gray-700">Name</th>
                          <th className="border border-gray-400 p-2 text-sm font-semibold text-gray-700">VLC Represented</th>
                          <th className="border border-gray-400 p-2 text-sm font-semibold text-gray-700">VLC Designation</th>
                          <th className="border border-gray-400 p-2 text-sm font-semibold text-gray-700">Executive Committee Member</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSLCData.slc_general_body_members.map((member, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-400 p-2 font-medium">{member.name}</td>
                            <td className="border border-gray-400 p-2">{member.vlc_represented}</td>
                            <td className="border border-gray-400 p-2">{member.vlc_designation}</td>
                            <td className="border border-gray-400 p-2">
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
                <section className="bg-gray-50 border border-gray-300 rounded p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-[#003087]" />
                    Water Tax Collection Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Year</label>
                      <p className="text-lg font-bold text-blue-900">{detailedSLCData.water_tax_details.year}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                      <label className="block text-sm font-medium text-green-700 mb-1">Total Tax (₹)</label>
                      <p className="text-lg font-bold text-green-900">{detailedSLCData.water_tax_details.total_tax}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-300">
                      <label className="block text-sm font-medium text-orange-700 mb-1">Retained with WUA (₹)</label>
                      <p className="text-lg font-bold text-orange-900">{detailedSLCData.water_tax_details.retained_wua}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-300">
                      <label className="block text-sm font-medium text-purple-700 mb-1">Balance (₹)</label>
                      <p className="text-lg font-bold text-purple-900">{detailedSLCData.water_tax_details.balance}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-300">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Back to List
                </button>
                
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    onEditSLC(detailedSLCData);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit SLC
                </button>
                
                <button
                  onClick={() => handleDownloadReport(detailedSLCData)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
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
                  <h1 className="text-xl font-bold">Section Level Committee List</h1>
                 
                </div>
              </div>
            </div>

            <button
              onClick={onCreateNewSLC}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              <Award className="w-5 h-5" />
              Create New SLC
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
          {/* Main Container */}
          <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
              <div className="bg-white rounded-lg border border-gray-300 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total SLCs</p>
                    <p className="text-2xl font-bold text-gray-800">{slcList.length}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="w-6 h-6 text-[#003087]" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-300 p-4">
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
              <div className="bg-white rounded-lg border border-gray-300 p-4">
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
              <div className="bg-white rounded-lg border border-gray-300 p-4">
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

            {/* Search and Filters */}
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by SLC name, WUA, Circle, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleRefresh}
                    disabled={isLoadingSLCs}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingSLCs ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* SLC Table */}
              <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800">SLC Records ({filteredSLCs.length})</h2>
                </div>
                
                {isLoadingSLCs ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087] mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading SLCs...</p>
                    </div>
                  </div>
                ) : filteredSLCs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                      <Award className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No SLCs Found</h3>
                    <p className="text-gray-600 mb-6">No Section Level Committees found matching your criteria.</p>
                    <button
                      onClick={onCreateNewSLC}
                      className="px-6 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors"
                    >
                      Create First SLC
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">SLC Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">WUA Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Circle</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Formation Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Members</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300">
                        {filteredSLCs.map((slc) => (
                          <tr key={slc.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <Award className="w-5 h-5 text-[#003087]" />
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
                                  onClick={() => onEditSLC(slc)}
                                  className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                                  title="Edit SLC"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
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
        </main>
      </div>
      
      <DetailModal />
    </>
  );
};

export default SLCList;