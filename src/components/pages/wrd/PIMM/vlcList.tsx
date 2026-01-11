import React, { useState, useEffect } from "react";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Download,
  Plus,
  Users,
  Building,
  MapPin,
  Calendar,
  ArrowLeft,
  Award,
  Loader,
  User,
  BarChart3
} from "lucide-react";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";


// पहले एक export interface define करें
interface VLCExportRow {
  'VLC ID': number;
  'VLC Name': string;
  'WUA Name': string;
  'Village': string;
  'Gram Panchayat': string;
  'Block': string;
  'District': string;
  'Formation Date': string;
  'Status': string;
  'GB Members': number;
  'Executive Members': number;
  'Chairman': string;
  'Contact': string;
  'Created At': string;
  [key: string]: string | number; 
}

interface VLC {
  id: number;
  vlc_name: string;
  wua_name: string;
  village_name: string;
  gp_name: string;
  block_name: string;
  district_name: string;
  formation_date: string;
  //registration_no: string;
  vlc_formed: boolean;
  created_at: string;
  gb_members_count: number;
  executive_members_count: number;
  chairman_name?: string;
  chairman_contact?: string;
}

interface VLCListProps {
  onBack: () => void;
  onViewDetails: (vlc: VLC) => void;
  onEdit: (vlc: VLC) => void;
  onCreateNew: () => void;
}

const VLCListPage: React.FC<VLCListProps> = ({ onBack, onViewDetails, onEdit, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [selectedVLC, setSelectedVLC] = useState<VLC | null>(null);
  const [vlcs, setVlcs] = useState<VLC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time data fetch
  useEffect(() => {
    fetchVLCs();
  }, []);

  const fetchVLCs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/wua/vlc');
      const result = response.data;
      
      if (result.success) {
        setVlcs(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch VLCs');
      }
    } catch (err) {
      console.error('Error fetching VLCs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load VLC data');
    } finally {
      setLoading(false);
    }
  };

  // Filters
  const filteredVLCs = vlcs.filter(vlc => {
    const matchesSearch = vlc.vlc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vlc.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vlc.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vlc.wua_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && vlc.vlc_formed) ||
                         (statusFilter === "inactive" && !vlc.vlc_formed);
    
    const matchesDistrict = districtFilter === "all" || vlc.district_name === districtFilter;
    
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  // Unique districts for filter
  const districts = Array.from(new Set(vlcs.map(vlc => vlc.district_name))).filter(Boolean);

  // Handle view details
  const handleViewDetails = (vlc: VLC) => {
    setSelectedVLC(vlc);
  };

  // Handle back from detail view
  const handleBackFromDetail = () => {
    setSelectedVLC(null);
  };

  // Handle delete VLC
  // const handleDeleteVLC = async (vlcId: number, vlcName: string) => {
  //   if (!confirm(`Are you sure you want to delete VLC "${vlcName}"? This action cannot be undone.`)) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/wua/vlc/${vlcId}`, {
  //       method: 'DELETE',
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       alert('VLC deleted successfully!');
  //       fetchVLCs(); // Refresh the list
  //     } else {
  //       throw new Error(result.error || 'Failed to delete VLC');
  //     }
  //   } catch (err) {
  //     console.error('Error deleting VLC:', err);
  //     alert(err instanceof Error ? err.message : 'Failed to delete VLC');
  //   }
  // };

  // Export functionality for ALL data
 // Export functionality for ALL data - FIXED VERSION
const handleExport = async () => {
  try {
    setLoading(true);
    
    // Try to get export from backend API first
    try {
      const response = await axiosInstance.get('/wua/vlc/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `vlc-list-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      return;
    } catch (apiError) {
      console.log('Backend export API not available, using client-side export');
    }
    
    // Fallback: Client-side CSV export
    const exportData = vlcs.map(vlc => {
      // ✅ Type assertion करें
      const row: Record<string, string | number> = {
        'VLC ID': vlc.id,
        'VLC Name': vlc.vlc_name,
        'WUA Name': vlc.wua_name,
        'Village': vlc.village_name,
        'Gram Panchayat': vlc.gp_name,
        'Block': vlc.block_name,
        'District': vlc.district_name,
        'Formation Date': vlc.formation_date ? new Date(vlc.formation_date).toLocaleDateString('en-IN') : '',
        'Status': vlc.vlc_formed ? 'Active' : 'Inactive',
        'GB Members': vlc.gb_members_count,
        'Executive Members': vlc.executive_members_count,
        'Chairman': vlc.chairman_name || '',
        'Contact': vlc.chairman_contact || '',
        'Created At': vlc.created_at ? new Date(vlc.created_at).toLocaleDateString('en-IN') : ''
      };
      return row;
    });

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          // ✅ Type assertion करें
          const cell = (row as Record<string, string | number>)[header];
          return typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VLCs-Export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
    
  } catch (err) {
    console.error('Error exporting VLCs:', err);
    alert('Failed to export VLC data. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // If VLC detail is selected, show detail view
  if (selectedVLC) {
    return <VLCDetail vlc={selectedVLC} onBack={handleBackFromDetail} />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading VLC data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load VLC Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchVLCs}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">VLC List</h1>
                  <p className="text-green-100">View and manage all Village Level Committees</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
                <button
                  onClick={fetchVLCs}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Loader className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={onCreateNew}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Create New VLC
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total VLCs</p>
                    <p className="text-2xl font-bold text-blue-700">{vlcs.length}</p>
                  </div>
                  <Building className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active VLCs</p>
                    <p className="text-2xl font-bold text-green-700">
                      {vlcs.filter(v => v.vlc_formed).length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Total Members</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {vlcs.reduce((sum, vlc) => sum + (vlc.gb_members_count || 0), 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Executive Members</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {vlcs.reduce((sum, vlc) => sum + (vlc.executive_members_count || 0), 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search VLCs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by VLC name, village, district, or WUA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Districts</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* VLCs Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    VLC Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    WUA & Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Members
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Formation Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVLCs.map((vlc) => (
                  <tr key={vlc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{vlc.vlc_name}</h3>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {vlc.village_name}
                        </div>
                        {vlc.chairman_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Chairman: {vlc.chairman_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{vlc.wua_name}</p>
                        <p className="text-sm text-gray-600">{vlc.gp_name}</p>
                        <p className="text-sm text-gray-600">{vlc.block_name}, {vlc.district_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">
                            <strong>{vlc.gb_members_count || 0}</strong> Total
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            <strong>{vlc.executive_members_count || 0}</strong> Executive
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {vlc.formation_date ? new Date(vlc.formation_date).toLocaleDateString('en-IN') : 'Not set'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        vlc.vlc_formed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vlc.vlc_formed ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(vlc)}
                          className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => onEdit(vlc)}
                          className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        {/* <button 
                          onClick={() => handleDeleteVLC(vlc.id, vlc.vlc_name)}
                          className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredVLCs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No VLCs Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || districtFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No VLCs have been created yet'
                }
              </p>
              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First VLC
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredVLCs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <strong>1</strong> to <strong>{filteredVLCs.length}</strong> of{' '}
                  <strong>{vlcs.length}</strong> results
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// VLC Detail Component
interface VLCDetailProps {
  vlc: VLC;
  onBack: () => void;
}

const VLCDetail: React.FC<VLCDetailProps> = ({ vlc, onBack }) => {
  const [detailedVLC, setDetailedVLC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchVLCDetails = async () => {
      try {
        console.log('🔄 Fetching VLC details for ID:', vlc.id);
        setError(null);
        
        const response = await axiosInstance.get(`/wua/vlc/${vlc.id}`, {
          signal: controller.signal
        });
        console.log('✅ API Response:', response);
        
        if (!isMounted) return;
        
        if (response.data && response.data.success) {
          setDetailedVLC(response.data.data);
          console.log('✅ VLC Data set:', response.data.data);
        } else {
          console.warn('❌ No data in response or API returned failure');
          setDetailedVLC(vlc);
          setError('Failed to load detailed VLC information');
        }
      } catch (err) {
        if (!isMounted) return;
        
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        console.error('❌ Error fetching VLC details:', err);
        setDetailedVLC(vlc);
        setError(err instanceof Error ? err.message : 'Failed to load VLC details');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVLCDetails();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [vlc.id, vlc]); 

  // Download single VLC details as text file
  const downloadVLCDetails = (vlcData: any) => {
    try {
      // Create a formatted text file with all details
      const content = `
VLC DETAIL REPORT
================

Basic Information
----------------
VLC Name: ${vlcData.vlc_name}
WUA Name: ${vlcData.wua_name}
Village: ${vlcData.village_name}
Gram Panchayat: ${vlcData.gp_name || 'N/A'}
Block: ${vlcData.block_name || 'N/A'}
District: ${vlcData.district_name}
Formation Date: ${vlcData.formation_date ? new Date(vlcData.formation_date).toLocaleDateString('en-IN') : 'N/A'}

Status: ${vlcData.vlc_formed ? 'Active' : 'Inactive'}

Executive Committee Members (${vlcData.executiveMembers?.length || 0})
--------------------------------------------------------------------
${vlcData.executiveMembers?.map((member: any, index: number) => `
${index + 1}. ${member.name}
    Designation: ${member.designation || 'N/A'}
    Gender: ${member.gender || 'N/A'}
    Category: ${member.category || 'N/A'}
    Contact: ${member.contact_no || 'N/A'}
    Election Date: ${member.election_date ? new Date(member.election_date).toLocaleDateString('en-IN') : 'N/A'}
`).join('') || 'No executive members found'}

General Body Members (${vlcData.gbMembers?.length || 0})
------------------------------------------------------
${vlcData.gbMembers?.map((member: any, index: number) => `
${index + 1}. ${member.name}
    Position: ${member.position || 'N/A'}
    Gender: ${member.gender || 'N/A'}
    Category: ${member.category || 'N/A'}
    Contact: ${member.contact_no || 'N/A'}
`).join('') || 'No general body members found'}

Report Generated: ${new Date().toLocaleString('en-IN')}
      `.trim();

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${vlcData.vlc_name.replace(/\s+/g, '-')}-Report-${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      console.error('Error downloading VLC details:', err);
      alert('Failed to download VLC details.');
    }
  };

  // Download single VLC details as CSV
  const downloadVLCDetailsCSV = (vlcData: any) => {
    try {
      // Prepare executive members data
      const executiveMembersData = vlcData.executiveMembers?.map((member: any) => ({
        'Type': 'Executive',
        'Name': member.name,
        'Designation': member.designation || '',
        'Gender': member.gender || '',
        'Category': member.category || '',
        'Contact': member.contact_no || '',
        'Election Date': member.election_date ? new Date(member.election_date).toLocaleDateString('en-IN') : ''
      })) || [];

      // Prepare general body members data
      const gbMembersData = vlcData.gbMembers?.map((member: any) => ({
        'Type': 'General Body',
        'Name': member.name,
        'Position': member.position || '',
        'Gender': member.gender || '',
        'Category': member.category || '',
        'Contact': member.contact_no || ''
      })) || [];

      // Combine all members
      const allMembers = [
        {
          'Type': 'VLC Info',
          'Name': vlcData.vlc_name,
          'Designation': 'Basic Information',
          'Gender': '',
          'Category': '',
          'Contact': '',
          'Election Date': ''
        },
        {
          'Type': 'VLC Info',
          'Name': `WUA: ${vlcData.wua_name}`,
          'Designation': `Village: ${vlcData.village_name}`,
          'Gender': `GP: ${vlcData.gp_name || 'N/A'}`,
          'Category': `Block: ${vlcData.block_name || 'N/A'}`,
          'Contact': `District: ${vlcData.district_name}`,
          'Election Date': `Formation Date: ${vlcData.formation_date ? new Date(vlcData.formation_date).toLocaleDateString('en-IN') : 'N/A'}`
        },
        ...executiveMembersData,
        ...gbMembersData
      ];

      // Convert to CSV
      const headers = ['Type', 'Name', 'Designation', 'Gender', 'Category', 'Contact', 'Election Date'];
      const csvRows = [
        headers.join(','),
        ...allMembers.map(row => 
          headers.map(header => {
            const cell = row[header];
            return typeof cell === 'string' && cell.includes(',') 
              ? `"${cell}"` 
              : cell;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${vlcData.vlc_name.replace(/\s+/g, '-')}-Details-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      console.error('Error downloading VLC details as CSV:', err);
      alert('Failed to download VLC details.');
    }
  };

  // Use detailedVLC if available, otherwise fallback to basic vlc data
  const displayData = detailedVLC || vlc;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to List
                </button>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{displayData.vlc_name}</h1>
                  <p className="text-green-100">VLC Details and Member Information</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadVLCDetails(displayData)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <div className="text-right">
                  <p className="text-white/80">VLC ID: {displayData.id}</p>
                  <p className="text-white/80">WUA: {displayData.wua_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VLC Name</label>
                  <p className="text-gray-900 font-medium">{displayData.vlc_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WUA Name</label>
                  <p className="text-gray-900 font-medium">{displayData.wua_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                  <p className="text-gray-900">{displayData.village_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gram Panchayat</label>
                  <p className="text-gray-900">{displayData.gp_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
                  <p className="text-gray-900">{displayData.block_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <p className="text-gray-900">{displayData.district_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formation Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">
                      {displayData.formation_date ? new Date(displayData.formation_date).toLocaleDateString('en-IN') : 'Not set'}
                    </p>
                  </div>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration No</label>
                  <p className="text-gray-900">{displayData.registration_no || 'Not registered'}</p>
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    displayData.vlc_formed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {displayData.vlc_formed ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Members */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Executive Committee Members ({displayData.executiveMembers?.length || 0})
                </h2>
                {displayData.executiveMembers && displayData.executiveMembers.length > 0 && (
                  <button
                    onClick={() => {
                      const executiveData = displayData.executiveMembers.map((member: any) => ({
                        'Name': member.name,
                        'Designation': member.designation || '',
                        'Gender': member.gender || '',
                        'Category': member.category || '',
                        'Contact': member.contact_no || '',
                        'Election Date': member.election_date ? new Date(member.election_date).toLocaleDateString('en-IN') : ''
                      }));
                      
                      const csvContent = [
                        ['Name', 'Designation', 'Gender', 'Category', 'Contact', 'Election Date'].join(','),
                        ...executiveData.map((row: any) => 
                          Object.values(row).map(cell => 
                            typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
                          ).join(',')
                        )
                      ].join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `${displayData.vlc_name}-Executive-Members-${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                )}
              </div>
              {displayData.executiveMembers && displayData.executiveMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Name</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Designation</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Gender</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Category</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Contact</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Election Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.executiveMembers.map((member: any, index: number) => (
                        <tr key={member.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium">{member.name}</td>
                          <td className="border border-gray-300 p-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {member.designation}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">{member.gender || '-'}</td>
                          <td className="border border-gray-300 p-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {member.category || '-'}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">{member.contact_no || '-'}</td>
                          <td className="border border-gray-300 p-2">
                            {member.election_date ? new Date(member.election_date).toLocaleDateString('en-IN') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No executive members found</p>
                </div>
              )}
            </div>

            {/* General Body Members */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  General Body Members ({displayData.gbMembers?.length || 0})
                </h2>
                {displayData.gbMembers && displayData.gbMembers.length > 0 && (
                  <button
                    onClick={() => {
                      const gbData = displayData.gbMembers.map((member: any) => ({
                        'S.No': member.sl_no || '',
                        'Name': member.name,
                        'Gender': member.gender || '',
                        'Category': member.category || '',
                        'Position': member.position || '',
                        'Contact': member.contact_no || ''
                      }));
                      
                      const csvContent = [
                        ['S.No', 'Name', 'Gender', 'Category', 'Position', 'Contact'].join(','),
                        ...gbData.map((row: any) => 
                          Object.values(row).map(cell => 
                            typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
                          ).join(',')
                        )
                      ].join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `${displayData.vlc_name}-GB-Members-${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                )}
              </div>
              {displayData.gbMembers && displayData.gbMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">S.No</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Name</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Gender</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Category</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Position</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.gbMembers.map((member: any, index: number) => (
                        <tr key={member.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-center">{member.sl_no || index + 1}</td>
                          <td className="border border-gray-300 p-2 font-medium">{member.name}</td>
                          <td className="border border-gray-300 p-2">{member.gender || '-'}</td>
                          <td className="border border-gray-300 p-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {member.category || '-'}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {member.position || '-'}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">{member.contact_no || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No general body members found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats and Actions */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">General Body Members</span>
                  <span className="text-lg font-bold text-blue-700">{displayData.gbMembers?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-700">Executive Members</span>
                  <span className="text-lg font-bold text-green-700">{displayData.executiveMembers?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Download Options
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => downloadVLCDetails(displayData)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Full Report (TXT)
                </button>
                <button
                  onClick={() => downloadVLCDetailsCSV(displayData)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download as CSV
                </button>
                {/* <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Report
                </button> */}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {displayData.executiveMembers?.find((m: any) => m.designation === 'Chairman') && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Chairman</label>
                    <p className="text-blue-900 font-medium">
                      {displayData.executiveMembers.find((m: any) => m.designation === 'Chairman')?.name}
                    </p>
                    <p className="text-sm text-blue-600">
                      {displayData.executiveMembers.find((m: any) => m.designation === 'Chairman')?.contact_no || 'Contact not available'}
                    </p>
                  </div>
                )}
                {displayData.executiveMembers?.find((m: any) => m.designation === 'Secretary') && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <label className="block text-sm font-medium text-green-700 mb-1">Secretary</label>
                    <p className="text-green-900 font-medium">
                      {displayData.executiveMembers.find((m: any) => m.designation === 'Secretary')?.name}
                    </p>
                    <p className="text-sm text-green-600">
                      {displayData.executiveMembers.find((m: any) => m.designation === 'Secretary')?.contact_no || 'Contact not available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VLCListPage;