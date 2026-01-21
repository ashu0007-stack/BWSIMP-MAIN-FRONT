import React, { useState, useEffect } from "react";
import { 
  Eye, 
  Edit, 
  Search, 
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
  BarChart3,
  Shield,
  FileText,
  Home,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";

interface VLC {
  id: number;
  vlc_name: string;
  wua_name: string;
  village_name: string;
  gp_name: string;
  block_name: string;
  district_name: string;
  formation_date: string;
  vlc_formed: boolean;
  created_at: string;
  gb_members_count: number;
  executive_members_count: number;
  chairman_name?: string;
  chairman_contact?: string;
}

interface VLCListProps {
  onBack?: () => void;
  onViewDetails: (vlc: VLC) => void;
  onEdit: (vlc: VLC) => void;
  onCreateNew: (wua?: any) => void;
}

const VLCListPage: React.FC<VLCListProps> = ({ 
  onBack, 
  onViewDetails, 
  onEdit, 
  onCreateNew 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [selectedVLC, setSelectedVLC] = useState<VLC | null>(null);
  const [vlcs, setVlcs] = useState<VLC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const districts = Array.from(new Set(vlcs.map(vlc => vlc.district_name))).filter(Boolean);

  const handleViewDetails = (vlc: VLC) => {
    setSelectedVLC(vlc);
  };

  const handleBackFromDetail = () => {
    setSelectedVLC(null);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      try {
        const response = await axiosInstance.get('/wua/vlc/export', {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
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
      
      const exportData = vlcs.map(vlc => {
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

      const headers = Object.keys(exportData[0]);
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const cell = (row as Record<string, string | number>)[header];
            return typeof cell === 'string' && cell.includes(',') 
              ? `"${cell}"` 
              : cell;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      
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

  if (selectedVLC) {
    return <VLCDetail vlc={selectedVLC} onBack={handleBackFromDetail} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[#003087]" />
          <p className="mt-4 text-gray-700 font-medium">Loading Village Level Committees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white border border-red-300 rounded p-8 text-center">
            <p className="text-red-700 text-lg font-medium">{error}</p>
            <button
              onClick={fetchVLCs}
              className="mt-6 px-6 py-2 bg-[#003087] text-white font-medium rounded hover:bg-[#00205b]"
            >
              Retry
            </button>
          </div>
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
            {/* Government Logo/Emblem Placeholder */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Village Level Committees (VLC)</h1>
                
              </div>
            </div>
          </div>

          {/* {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              <ArrowLeft size={18} /> Back
            </button>
          )} */}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Government Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[
            { title: "Total VLCs", value: vlcs.length, icon: Building, color: "blue" },
            { title: "Active VLCs", value: vlcs.filter(v => v.vlc_formed).length, icon: Users, color: "green" },
            { title: "Total Members", value: vlcs.reduce((s, v) => s + (v.gb_members_count || 0), 0), icon: Users, color: "orange" },
            { title: "Executive Members", value: vlcs.reduce((s, v) => s + (v.executive_members_count || 0), 0), icon: Award, color: "purple" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-300 rounded shadow-sm p-5 hover:border-[#003087] transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-50 rounded`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Government Filter Panel */}
        <div className="bg-white border border-gray-300 rounded shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Search className="inline w-4 h-4 mr-2" />
                Search VLCs
              </label>
              <input
                type="text"
                placeholder="Search by VLC name, village, district, or WUA..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-400 rounded focus:border-[#003087] w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select
                value={districtFilter}
                onChange={e => setDistrictFilter(e.target.value)}
                className="px-4 py-2 border border-gray-400 rounded focus:border-[#003087] w-48"
              >
                <option value="all">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="px-5 py-2 bg-[#FF9933] text-white font-medium rounded hover:bg-[#e68a00] flex items-center gap-2 transition-colors"
              >
                <Download size={18} /> Export Data
              </button>

              <button
                onClick={() => onCreateNew()}
                className="px-6 py-2 bg-green-700 text-white font-medium rounded hover:bg-green-800 flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Create New VLC
              </button>
            </div>
          </div>
        </div>

        {/* Government Data Table */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">VLC Details</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">WUA & Location</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Members</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Formation Date</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Status</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVLCs.map(vlc => (
                  <tr key={vlc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{vlc.vlc_name}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <MapPin size={14} /> {vlc.village_name}
                      </div>
                      {vlc.chairman_name && (
                        <div className="text-xs text-gray-500 mt-1">
                          Chairman: {vlc.chairman_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{vlc.wua_name}</div>
                      <div>{vlc.gp_name} • {vlc.block_name}, {vlc.district_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>GB: <strong className="text-blue-700">{vlc.gb_members_count || 0}</strong></div>
                      <div>Executive: <strong className="text-green-700">{vlc.executive_members_count || 0}</strong></div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {vlc.formation_date 
                          ? new Date(vlc.formation_date).toLocaleDateString('en-IN') 
                          : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                        vlc.vlc_formed 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {vlc.vlc_formed ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewDetails(vlc)}
                          className="text-[#003087] hover:text-[#00205b] flex items-center gap-1 text-sm font-medium"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => onEdit(vlc)}
                          className="text-green-700 hover:text-green-800 flex items-center gap-1 text-sm font-medium"
                        >
                          <Edit size={16} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredVLCs.length === 0 && (
            <div className="py-16 text-center text-gray-600">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">No VLCs Found</p>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter !== 'all' || districtFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No VLCs have been created yet'
                }
              </p>
              <button
                onClick={() => onCreateNew()}
                className="mt-6 px-6 py-2 bg-[#003087] text-white font-medium rounded hover:bg-[#00205b] inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create First VLC
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredVLCs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <strong>1</strong> to <strong>{filteredVLCs.length}</strong> of{' '}
                  <strong>{vlcs.length}</strong> VLCs
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-gray-400 rounded text-sm hover:bg-gray-100">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-[#003087] text-white rounded text-sm">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-400 rounded text-sm hover:bg-gray-100">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Government Footer */}
      
    </div>
  );
};

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

  const displayData = detailedVLC || vlc;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[#003087]" />
          <p className="mt-4 text-gray-700 font-medium">Loading VLC Details...</p>
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
                <h1 className="text-xl font-bold">{displayData.vlc_name}</h1>
               
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            <ArrowLeft size={18} /> Back to List
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#003087]" />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    displayData.vlc_formed 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}>
                    {displayData.vlc_formed ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Members Card */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#003087]" />
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
                    className="flex items-center gap-1 px-3 py-2 text-sm text-[#003087] hover:bg-blue-50 rounded border border-gray-300"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                )}
              </div>
              {displayData.executiveMembers && displayData.executiveMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Name</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Designation</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Gender</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Category</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Contact</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Election Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.executiveMembers.map((member: any, index: number) => (
                        <tr key={member.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-medium">{member.name}</td>
                          <td className="border border-gray-300 p-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300">
                              {member.designation}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3">{member.gender || '-'}</td>
                          <td className="border border-gray-300 p-3">
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full border border-gray-300">
                              {member.category || '-'}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3">{member.contact_no || '-'}</td>
                          <td className="border border-gray-300 p-3">
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

            {/* General Body Members Card */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#003087]" />
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
                    className="flex items-center gap-1 px-3 py-2 text-sm text-[#003087] hover:bg-blue-50 rounded border border-gray-300"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                )}
              </div>
              {displayData.gbMembers && displayData.gbMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">S.No</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Name</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Gender</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Category</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Position</th>
                        <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.gbMembers.map((member: any, index: number) => (
                        <tr key={member.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 text-center">{member.sl_no || index + 1}</td>
                          <td className="border border-gray-300 p-3 font-medium">{member.name}</td>
                          <td className="border border-gray-300 p-3">{member.gender || '-'}</td>
                          <td className="border border-gray-300 p-3">
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full border border-gray-300">
                              {member.category || '-'}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-300">
                              {member.position || '-'}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3">{member.contact_no || '-'}</td>
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Statistics Card */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#003087]" />
                Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">General Body Members</span>
                  <span className="text-xl font-bold text-blue-700">{displayData.gbMembers?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded border border-green-200">
                  <span className="text-sm font-medium text-green-700">Executive Members</span>
                  <span className="text-xl font-bold text-green-700">{displayData.executiveMembers?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {displayData.executiveMembers?.find((m: any) => m.designation === 'Chairman') && (
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Chairman</label>
                    <p className="text-blue-900 font-medium">
                      {displayData.executiveMembers.find((m: any) => m.designation === 'Chairman')?.name}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      {displayData.executiveMembers.find((m: any) => m.designation === 'Chairman')?.contact_no || 'Contact not available'}
                    </p>
                  </div>
                )}
                {displayData.executiveMembers?.find((m: any) => m.designation === 'Secretary') && (
                  <div className="p-4 bg-green-50 rounded border border-green-200">
                    <label className="block text-sm font-medium text-green-700 mb-1">Secretary</label>
                    <p className="text-green-900 font-medium">
                      {displayData.executiveMembers.find((m: any) => m.designation === 'Secretary')?.name}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {displayData.executiveMembers.find((m: any) => m.designation === 'Secretary')?.contact_no || 'Contact not available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

     
    </div>
  );
};

export default VLCListPage;