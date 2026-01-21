import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building, 
  Users, 
  Award, 
  MapPin, 
  Calendar, 
  IndianRupee,
  UserCheck,
  Printer,
  Mail,
  Download as DownloadIcon,
  Eye,
  Edit3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Loader,
  FileText,
  FileSpreadsheet,
  File,
  PlusCircle,
  Shield,
  BarChart3,
  Home,
  Phone,
  Globe,
  Download,
  Plus,
  Users as UsersIcon
} from 'lucide-react';
import { useWUAs } from '@/hooks/wrdHooks/useWuaMaster';

interface WUAViewData {
  id: number;
  wua_name: string;
  wua_id: string;
  project_name: string;
  project_id: string;
  ce_zone: string;
  se_circle: string;
  division: string;
  subdivision: string;
  section: string;
  formation_year: string;
  tenure_completion_year: string;
  registration_no: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  wua_cca: number;
  total_outlets: number;
  total_plots: number;
  total_beneficiaries: number;
  branch_canal: string;
  canal_category: string;
  canal_name: string;
  total_villages: number;
  total_vlcs_formed: number;
  vlcs_not_formed: number;
  total_gps: number;
  total_blocks: number;
  created_at: string;
  updated_at: string;
  status: 'Active' | 'Inactive';
}

interface WUACreationListProps {
  onCreateNew: () => void;
  onViewWUA: (wuaId: string) => void;
}

const WUACreationList = ({ onCreateNew, onViewWUA }: WUACreationListProps) => {
  const { data: allCreatedWUAs = [], isLoading, refetch } = useWUAs();
  const [filteredWUAs, setFilteredWUAs] = useState<WUAViewData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Convert all WUAs to WUAViewData format
  useEffect(() => {
    if (allCreatedWUAs && Array.isArray(allCreatedWUAs)) {
      const formattedWUAs: WUAViewData[] = allCreatedWUAs.map((wua: any) => ({
        id: wua.id || wua.wua_id || 0,
        wua_name: wua.wua_name || 'N/A',
        wua_id: wua.wua_id?.toString() || 'N/A',
        project_name: wua.project_name || 'N/A',
        project_id: wua.project_id || 'N/A',
        ce_zone: wua.ce_zone || wua.zone || 'N/A',
        se_circle: wua.se_circle || wua.circle || 'N/A',
        division: wua.division || wua.division_name || 'N/A',
        subdivision: wua.subdivision || wua.subdivision_name || 'N/A',
        section: wua.section || 'N/A',
        formation_year: wua.formation_year || '',
        tenure_completion_year: wua.tenure_completion_date || wua.tenure_completion_year || '',
        registration_no: wua.registration_no || 'N/A',
        account_holder: wua.account_holder || 'N/A',
        bank_name: wua.bank_name || 'N/A',
        account_number: wua.account_number || 'N/A',
        ifsc_code: wua.ifsc_code || 'N/A',
        wua_cca: parseFloat(wua.wua_cca) || 0,
        total_outlets: parseInt(wua.total_outlets) || 0,
        total_plots: parseInt(wua.total_plots) || 0,
        total_beneficiaries: parseInt(wua.total_beneficiaries) || 0,
        branch_canal: wua.branch_canal || 'N/A',
        canal_category: wua.canal_category || 'N/A',
        canal_name: wua.canal_name || 'N/A',
        total_villages: parseInt(wua.total_villages) || 0,
        total_vlcs_formed: parseInt(wua.total_vlcs_formed) || 0,
        vlcs_not_formed: parseInt(wua.vlcs_not_formed) || 0,
        total_gps: parseInt(wua.total_gps) || 0,
        total_blocks: parseInt(wua.total_blocks) || 0,
        created_at: wua.created_at || '',
        updated_at: wua.updated_at || '',
        status: wua.status || 'Active'
      }));
      
      setFilteredWUAs(formattedWUAs);
    }
  }, [allCreatedWUAs]);

  // Filter WUAs based on search and filters
  useEffect(() => {
    let filtered = allCreatedWUAs || [];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((wua: any) => {
        return (
          (wua.wua_name?.toLowerCase().includes(searchLower)) ||
          (wua.wua_id?.toString().includes(searchTerm)) ||
          (wua.project_name?.toLowerCase().includes(searchLower)) ||
          (wua.division?.toLowerCase().includes(searchLower)) ||
          (wua.circle?.toLowerCase().includes(searchLower))
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((wua: any) => 
        statusFilter === 'active' ? wua.status === 'Active' : wua.status === 'Inactive'
      );
    }

    setFilteredWUAs(filtered as any[]);
  }, [searchTerm, statusFilter, districtFilter, allCreatedWUAs]);

  const handleViewDetails = (wua: WUAViewData) => {
    onViewWUA(wua.wua_id);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Calculate statistics
  const stats = {
    totalWUAs: filteredWUAs.length,
    activeWUAs: filteredWUAs.filter(w => w.status === 'Active').length,
    totalVillages: filteredWUAs.reduce((sum, wua) => sum + (wua.total_villages || 0), 0),
    totalBeneficiaries: filteredWUAs.reduce((sum, wua) => sum + (wua.total_beneficiaries || 0), 0),
    totalVLCs: filteredWUAs.reduce((sum, wua) => sum + (wua.total_vlcs_formed || 0), 0),
    totalCCA: filteredWUAs.reduce((sum, wua) => sum + (wua.wua_cca || 0), 0),
  };

  const handleExport = () => {
    try {
      const exportData = filteredWUAs.map(wua => {
        const row: Record<string, string | number> = {
          'WUA ID': wua.wua_id,
          'WUA Name': wua.wua_name,
          'Project Name': wua.project_name,
          'Project ID': wua.project_id,
          'CE Zone': wua.ce_zone,
          'SE Circle': wua.se_circle,
          'Division': wua.division,
          'Subdivision': wua.subdivision,
          'Section': wua.section,
          'Formation Year': wua.formation_year || '',
          'Tenure Completion Year': wua.tenure_completion_year || '',
          'Registration No': wua.registration_no,
          'Status': wua.status,
          'WUA CCA (Ha)': wua.wua_cca,
          'Total Villages': wua.total_villages,
          'Total VLCs Formed': wua.total_vlcs_formed,
          'Total Beneficiaries': wua.total_beneficiaries,
          'Total Outlets': wua.total_outlets,
          'Total Plots': wua.total_plots,
          'Account Holder': wua.account_holder,
          'Bank Name': wua.bank_name,
          'Account Number': wua.account_number,
          'IFSC Code': wua.ifsc_code,
          'Branch Canal': wua.branch_canal,
          'Canal Category': wua.canal_category,
          'Canal Name': wua.canal_name,
          'Created At': wua.created_at ? new Date(wua.created_at).toLocaleDateString('en-IN') : '',
          'Updated At': wua.updated_at ? new Date(wua.updated_at).toLocaleDateString('en-IN') : ''
        };
        return row;
      });

      const headers = Object.keys(exportData[0]);
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const cell = row[header];
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
      link.setAttribute('download', `WUAs-Export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      console.error('Error exporting WUAs:', err);
      alert('Failed to export WUA data. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[#003087]" />
          <p className="mt-4 text-gray-700 font-medium">Loading Water Users Associations...</p>
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
                <h1 className="text-xl font-bold">Water Users Associations (WUAs)</h1>
                <p className="text-sm text-blue-200">View and manage all created WUAs</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Government Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[
            { title: "Total WUAs", value: stats.totalWUAs, icon: Building, color: "blue" },
            { title: "Active WUAs", value: stats.activeWUAs, icon: UserCheck, color: "green" },
            { title: "Total Villages", value: stats.totalVillages, icon: MapPin, color: "purple" },
            { title: "Total Beneficiaries", value: stats.totalBeneficiaries, icon: UsersIcon, color: "orange" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-300 rounded shadow-sm p-5 hover:border-[#003087] transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 ${
                  stat.color === 'blue' ? 'bg-blue-50' :
                  stat.color === 'green' ? 'bg-green-50' :
                  stat.color === 'purple' ? 'bg-purple-50' : 'bg-orange-50'
                } rounded`}>
                  <stat.icon className={`w-8 h-8 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {[
            { title: "Total VLCs Formed", value: stats.totalVLCs, icon: Home, color: "indigo" },
            { title: "Total CCA (Ha)", value: stats.totalCCA, icon: BarChart3, color: "cyan" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-300 rounded shadow-sm p-5 hover:border-[#003087] transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 ${
                  stat.color === 'indigo' ? 'bg-indigo-50' : 'bg-cyan-50'
                } rounded`}>
                  <stat.icon className={`w-8 h-8 ${
                    stat.color === 'indigo' ? 'text-indigo-600' : 'text-cyan-600'
                  }`} />
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
                Search WUAs
              </label>
              <input
                type="text"
                placeholder="Search by name, ID, division, or circle..."
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

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="px-5 py-2 bg-[#FF9933] text-white font-medium rounded hover:bg-[#e68a00] flex items-center gap-2 transition-colors"
              >
                <Download size={18} /> Export Data
              </button>

              <button
                onClick={onCreateNew}
                className="px-6 py-2 bg-green-700 text-white font-medium rounded hover:bg-green-800 flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Create New WUA
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
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">WUA Details</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Project & Location</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Statistics</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Status</th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWUAs.map((wua) => (
                  <tr key={wua.id} className="hover:bg-gray-50 transition-colors">
                    {/* WUA Details */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{wua.wua_name}</div>
                      <div className="text-xs text-gray-600 mt-1">ID: {wua.wua_id}</div>
                      <div className="text-xs text-gray-500 mt-1">{wua.subdivision}</div>
                    </td>

                    {/* Project & Location */}
                    <td className="px-6 py-4">
                      <div className="font-medium">{wua.project_name}</div>
                      <div className="text-sm text-gray-600">{wua.division}</div>
                      <div className="text-xs text-gray-500">{wua.se_circle}</div>
                    </td>

                    {/* Statistics */}
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-600">Villages</div>
                          <div className="font-medium">{wua.total_villages}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Beneficiaries</div>
                          <div className="font-medium">{wua.total_beneficiaries}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">CCA (Ha)</div>
                          <div className="font-medium">{wua.wua_cca}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">VLCs Formed</div>
                          <div className="font-medium">{wua.total_vlcs_formed}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                        wua.status === 'Active' 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {wua.status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Formed: {wua.formation_year || 'N/A'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewDetails(wua)}
                          className="text-[#003087] hover:text-[#00205b] flex items-center gap-1 text-sm font-medium"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => handleViewDetails(wua)}
                          className="text-green-700 hover:text-green-800 flex items-center gap-1 text-sm font-medium"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport();
                          }}
                          className="text-[#FF9933] hover:text-[#e68a00] flex items-center gap-1 text-sm font-medium"
                        >
                          <DownloadIcon size={16} /> Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWUAs.length === 0 && (
            <div className="py-16 text-center text-gray-600">
              <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">No WUAs Found</p>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No Water Users Associations have been created yet'
                }
              </p>
              <button
                onClick={onCreateNew}
                className="mt-6 px-6 py-2 bg-[#003087] text-white font-medium rounded hover:bg-[#00205b] inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create First WUA
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredWUAs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <strong>1</strong> to <strong>{filteredWUAs.length}</strong> of{' '}
                  <strong>{(allCreatedWUAs as any[]).length}</strong> WUAs
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
    </div>
  );
};

export default WUACreationList;