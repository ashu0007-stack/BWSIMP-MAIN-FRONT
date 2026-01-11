import React, { useState, useEffect, useCallback } from "react";
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
  UserCheck,
  Award,
  Printer,
  Mail,
  Loader,
  User,
  BarChart3,
  IndianRupee,
  Droplets,
  Zap,
  HardDrive,
  AlertCircle
} from "lucide-react";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

interface SLC {
  id: number;
  slc_name: string;
  wua_name: string;
  wua_id: string;
  village_name: string;
  gp_name: string;
  block_name: string;
  district_name: string;
  formation_date: string;
  registration_no: string;
  status: 'Active' | 'Inactive' | 'Under Maintenance';
  created_at: string;
  executive_members_count: number;
  gb_members_count: number;
  lift_scheme_type: 'Electric' | 'Diesel' | 'Solar' | 'Hybrid';
  motor_hp: number;
  water_lifting_capacity: string; // e.g., "1000 LPH"
  irrigation_area: number; // in acres
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  total_investment?: number;
  subsidy_received?: number;
  chairman_name?: string;
  secretary_name?: string;
}

interface SLCListProps {
  onBack: () => void;
  onViewDetails: (slc: SLC) => void;
  onEdit: (slc: SLC) => void;
  onCreateNew: () => void;
}

const SLCListPage: React.FC<SLCListProps> = ({ onBack, onViewDetails, onEdit, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [schemeTypeFilter, setSchemeTypeFilter] = useState<string>("all");
  const [selectedSLC, setSelectedSLC] = useState<SLC | null>(null);
  const [slcs, setSlcs] = useState<SLC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time data fetch
  useEffect(() => {
    fetchSLCs();
  }, []);

  const fetchSLCs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ CORRECTED: Use the right endpoint for SLCs
      const response = await axiosInstance.get('/slc');
      
      const result = response.data;
      
      if (result.success) {
        setSlcs(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch SLCs');
      }
    } catch (err) {
      console.error('Error fetching SLCs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load SLC data');
    } finally {
      setLoading(false);
    }
  };

  // Filters
  const filteredSLCs = slcs.filter(slc => {
    const matchesSearch = slc.slc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slc.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slc.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slc.wua_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && slc.status === 'Active') ||
                         (statusFilter === "inactive" && slc.status === 'Inactive') ||
                         (statusFilter === "maintenance" && slc.status === 'Under Maintenance');
    
    const matchesDistrict = districtFilter === "all" || slc.district_name === districtFilter;
    const matchesSchemeType = schemeTypeFilter === "all" || slc.lift_scheme_type === schemeTypeFilter;
    
    return matchesSearch && matchesStatus && matchesDistrict && matchesSchemeType;
  });

  // Unique values for filters
  const districts = Array.from(new Set(slcs.map(slc => slc.district_name))).filter(Boolean);
  const schemeTypes = Array.from(new Set(slcs.map(slc => slc.lift_scheme_type))).filter(Boolean);

  // Handle view details
  const handleViewDetails = (slc: SLC) => {
    setSelectedSLC(slc);
  };

  // Handle back from detail view
  const handleBackFromDetail = () => {
    setSelectedSLC(null);
  };

  // Handle delete SLC
  const handleDeleteSLC = async (slcId: number, slcName: string) => {
    if (!confirm(`Are you sure you want to delete SLC "${slcName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // ✅ CORRECTED: Use the right delete endpoint for SLCs
      const response = await axiosInstance.delete(`/slc/${slcId}`);
      const result = response.data;

      if (result.success) {
        alert('SLC deleted successfully!');
        fetchSLCs(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to delete SLC');
      }
    } catch (err) {
      console.error('Error deleting SLC:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete SLC');
    }
  };

  // Export functionality
 // Export functionality - FIXED VERSION
const handleExport = async () => {
  try {
    // ✅ First try to get the export data
    const response = await axiosInstance.get('/slc/export', {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream'
      }
    });

    // ✅ Check if response is valid
    if (!response.data) {
      throw new Error('No data received from server');
    }

    // ✅ Check if it's an error response (JSON instead of blob)
    if (response.headers['content-type']?.includes('application/json')) {
      // Try to parse as JSON to get error message
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonResponse = JSON.parse(reader.result as string);
          throw new Error(jsonResponse.message || 'Failed to export data');
        } catch {
          throw new Error('Failed to parse error response');
        }
      };
      reader.readAsText(response.data);
      return;
    }

    // ✅ Create blob with correct content type
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // ✅ Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // ✅ Get filename from headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `slc-list-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // ✅ Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
  } catch (err: any) {
    console.error('❌ Error exporting SLCs:', err);
    
    // ✅ Better error messages
    let errorMessage = 'Failed to export SLC data';
    
    if (err.response) {
      if (err.response.status === 404) {
        errorMessage = 'Export endpoint not found on server';
      } else if (err.response.status === 500) {
        errorMessage = 'Server error occurred while exporting';
      } else if (err.response.data) {
        // Try to get error message from response
        try {
          const errorData = typeof err.response.data === 'string' 
            ? JSON.parse(err.response.data) 
            : err.response.data;
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = 'Failed to export data';
        }
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    alert(`Export failed: ${errorMessage}`);
  }
};

  // Calculate statistics
  const totalSLCs = slcs.length;
  const activeSLCs = slcs.filter(s => s.status === 'Active').length;
  const totalMembers = slcs.reduce((sum, slc) => sum + (slc.gb_members_count || 0), 0);
  const totalExecutiveMembers = slcs.reduce((sum, slc) => sum + (slc.executive_members_count || 0), 0);
  const totalArea = slcs.reduce((sum, slc) => sum + (slc.irrigation_area || 0), 0);
  const maintenanceSLCs = slcs.filter(s => s.status === 'Under Maintenance').length;

  // If SLC detail is selected, show detail view
  if (selectedSLC) {
    return <SLCDetail slc={selectedSLC} onBack={handleBackFromDetail} />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading SLC data...</p>
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
              <Droplets className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load SLC Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchSLCs}
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
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6">
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
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">State Lift Committees (SLC)</h1>
                  <p className="text-teal-100">View and manage all State Lift Committees</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSLCs}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Loader className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={onCreateNew}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Create New SLC
                </button>
              </div>
            </div>
          </div>

          {/* ✅ FIXED: Statistics Section - Now showing proper counts like VLC page */}
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-600">Total SLCs</p>
                    <p className="text-2xl font-bold text-teal-700">{totalSLCs}</p>
                  </div>
                  <Droplets className="w-8 h-8 text-teal-500" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active SLCs</p>
                    <p className="text-2xl font-bold text-green-700">{activeSLCs}</p>
                  </div>
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Members</p>
                    <p className="text-2xl font-bold text-blue-700">{totalMembers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Executive Members</p>
                    <p className="text-2xl font-bold text-purple-700">{totalExecutiveMembers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Total Area (Acres)</p>
                    <p className="text-2xl font-bold text-orange-700">{totalArea}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Under Maintenance</p>
                    <p className="text-2xl font-bold text-yellow-700">{maintenanceSLCs}</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Inactive SLCs</p>
                    <p className="text-2xl font-bold text-red-700">
                      {slcs.filter(s => s.status === 'Inactive').length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FIXED: Search and Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-2" />
                Search SLCs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by SLC name, village, district, or WUA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Districts</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheme Type
              </label>
              <select
                value={schemeTypeFilter}
                onChange={(e) => setSchemeTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {schemeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
              
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
          
          {/* ✅ Search Results Info - Like VLC page */}
          {searchTerm || statusFilter !== 'all' || districtFilter !== 'all' || schemeTypeFilter !== 'all' ? (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Showing <span className="font-semibold">{filteredSLCs.length}</span> out of <span className="font-semibold">{totalSLCs}</span> SLCs
                {searchTerm && ` for search: "${searchTerm}"`}
                {statusFilter !== 'all' && ` | Status: ${statusFilter}`}
                {districtFilter !== 'all' && ` | District: ${districtFilter}`}
                {schemeTypeFilter !== 'all' && ` | Scheme Type: ${schemeTypeFilter}`}
              </p>
            </div>
          ) : null}
        </div>

        {/* SLCs Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    SLC Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Location & WUA
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Scheme Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Members
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
                {filteredSLCs.map((slc) => (
                  <tr key={slc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{slc.slc_name}</h3>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {slc.village_name}
                        </div>
                        {slc.chairman_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Chairman: {slc.chairman_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{slc.wua_name}</p>
                        <p className="text-sm text-gray-600">{slc.gp_name}</p>
                        <p className="text-sm text-gray-600">{slc.block_name}, {slc.district_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">
                            {slc.lift_scheme_type} • {slc.motor_hp} HP
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{slc.water_lifting_capacity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{slc.irrigation_area} acres</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">
                            <strong>{slc.gb_members_count || 0}</strong> Total
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            <strong>{slc.executive_members_count || 0}</strong> Executive
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          slc.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : slc.status === 'Under Maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {slc.status}
                        </span>
                        {slc.next_maintenance_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Next Maintenance: {new Date(slc.next_maintenance_date).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(slc)}
                          className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => onEdit(slc)}
                          className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteSLC(slc.id, slc.slc_name)}
                          className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredSLCs.length === 0 && (
            <div className="text-center py-12">
              <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No SLCs Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || districtFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No SLCs have been created yet'
                }
              </p>
              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First SLC
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredSLCs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <strong>1</strong> to <strong>{filteredSLCs.length}</strong> of{' '}
                  <strong>{slcs.length}</strong> results
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-teal-600 text-white rounded text-sm">
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

// SLC Detail Component - Updated for real data
interface SLCDetailProps {
  slc: SLC;
  onBack: () => void;
}

const SLCDetail: React.FC<SLCDetailProps> = ({ slc, onBack }) => {
  const [detailedSLC, setDetailedSLC] = useState<any>(null);
  const [loading, setLoading] = useState(true);

 const fetchSLCDetails = useCallback(async () => {
  try {
    console.log('🔄 Fetching SLC details for ID:', slc.id);
    
    const response = await axiosInstance.get(`/slc/${slc.id}`);
    console.log('✅ API Response:', response);
    
    if (response.data && response.data.success) {
      setDetailedSLC(response.data.data);
      console.log('✅ SLC Data set:', response.data.data);
    } else {
      console.warn('❌ No data in response or API returned failure');
      setDetailedSLC(slc);
    }
  } catch (err) {
    console.error('❌ Error fetching SLC details:', err);
    setDetailedSLC(slc);
  } finally {
    setLoading(false);
  }
}, [ slc]); 

useEffect(() => {
  fetchSLCDetails();
}, [fetchSLCDetails]); 

  const displayData = detailedSLC || slc;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-teal-600" />
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
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6">
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
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{displayData.slc_name}</h1>
                  <p className="text-teal-100">State Lift Committee Details</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80">SLC ID: {displayData.id}</p>
                <p className="text-white/80">WUA: {displayData.wua_name}</p>
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
                <Building className="w-5 h-5 text-teal-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SLC Name</label>
                  <p className="text-gray-900 font-medium">{displayData.slc_name}</p>
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
                  <p className="text-gray-900">{displayData.block_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <p className="text-gray-900">{displayData.district_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration No</label>
                  <p className="text-gray-900">{displayData.registration_no || 'Not registered'}</p>
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
              </div>
            </div>

            {/* Scheme Technical Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Scheme Technical Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-blue-700 mb-1">Scheme Type</label>
                  <p className="text-lg font-bold text-blue-900">{displayData.lift_scheme_type}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-green-700 mb-1">Motor HP</label>
                  <p className="text-lg font-bold text-green-900">{displayData.motor_hp} HP</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-purple-700 mb-1">Water Lifting Capacity</label>
                  <p className="text-lg font-bold text-purple-900">{displayData.water_lifting_capacity}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-orange-700 mb-1">Irrigation Area</label>
                  <p className="text-lg font-bold text-orange-900">{displayData.irrigation_area} acres</p>
                </div>
                {displayData.total_investment && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-teal-700 mb-1">Total Investment</label>
                    <p className="text-lg font-bold text-teal-900">₹{displayData.total_investment.toLocaleString()}</p>
                  </div>
                )}
                {displayData.subsidy_received && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-700 mb-1">Subsidy Received</label>
                    <p className="text-lg font-bold text-green-900">₹{displayData.subsidy_received.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Executive Members */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Executive Committee Members ({displayData.executiveMembers?.length || 0})
              </h2>
              {displayData.executiveMembers && displayData.executiveMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Name</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Designation</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Contact</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Since</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.executiveMembers.map((member: any, index: number) => (
                        <tr key={member.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium">{member.name}</td>
                          <td className="border border-gray-300 p-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              member.designation === 'Chairman' ? 'bg-yellow-100 text-yellow-800' :
                              member.designation === 'Secretary' ? 'bg-green-100 text-green-800' :
                              member.designation === 'Treasurer' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {member.designation}
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
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No executive members found</p>
                </div>
              )}
            </div>

            {/* General Body Members */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                General Body Members ({displayData.gbMembers?.length || 0})
              </h2>
              {displayData.gbMembers && displayData.gbMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Name</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Contact</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Is Executive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.gbMembers.map((member: any, index: number) => (
                        <tr key={member.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium">{member.name}</td>
                          <td className="border border-gray-300 p-2">{member.contact_no || '-'}</td>
                          <td className="border border-gray-300 p-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              member.is_executive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.is_executive ? 'Yes' : 'No'}
                            </span>
                          </td>
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

            {/* Maintenance History */}
            {displayData.maintenanceHistory && displayData.maintenanceHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-orange-600" />
                  Maintenance History
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Date</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Type</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Description</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Cost</th>
                        <th className="border border-gray-300 p-2 text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.maintenanceHistory.map((record: any, index: number) => (
                        <tr key={record.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">
                            {new Date(record.maintenance_date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {record.maintenance_type}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">{record.description}</td>
                          <td className="border border-gray-300 p-2">₹{record.cost?.toLocaleString() || '-'}</td>
                          <td className="border border-gray-300 p-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              record.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats and Actions */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
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
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-700">Beneficiary Families</span>
                  <span className="text-lg font-bold text-orange-700">{displayData.beneficiary_families || 0}</span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Information</h2>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    displayData.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : displayData.status === 'Under Maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {displayData.status}
                  </span>
                </div>
                {displayData.last_maintenance_date && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Last Maintenance</label>
                    <p className="text-blue-900">
                      {new Date(displayData.last_maintenance_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}
                {displayData.next_maintenance_date && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Next Maintenance</label>
                    <p className="text-yellow-900">
                      {new Date(displayData.next_maintenance_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Printer className="w-4 h-4" />
                  Print Report
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <AlertCircle className="w-4 h-4" />
                  Report Issue
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLCListPage;