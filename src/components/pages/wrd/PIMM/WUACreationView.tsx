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
  File
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

const WUACreationView = ({ onBack }: { onBack: () => void }) => {
  const { data: allCreatedWUAs = [], isLoading, refetch } = useWUAs();
  const [filteredWUAs, setFilteredWUAs] = useState<WUAViewData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWUA, setSelectedWUA] = useState<WUAViewData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [downloadMenu, setDownloadMenu] = useState<{
    open: boolean;
    wua: WUAViewData | null;
    position: { x: number; y: number };
  }>({
    open: false,
    wua: null,
    position: { x: 0, y: 0 }
  });

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

  // Filter WUAs based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWUAs(allCreatedWUAs as any[] || []);
      return;
    }

    const filtered = (allCreatedWUAs || []).filter((wua: any) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (wua.wua_name?.toLowerCase().includes(searchLower)) ||
        (wua.wua_id?.toString().includes(searchTerm)) ||
        (wua.project_name?.toLowerCase().includes(searchLower)) ||
        (wua.division?.toLowerCase().includes(searchLower)) ||
        (wua.circle?.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredWUAs(filtered as any[]);
  }, [searchTerm, allCreatedWUAs]);

  const handleViewDetails = (wua: WUAViewData) => {
    setSelectedWUA(wua);
    setShowDetail(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Download functions
  const handleDownloadWUADetails = (wua: WUAViewData, format: 'pdf' | 'excel' | 'csv') => {
    // Create downloadable data
    const wuaData = {
      'WUA Details': {
        'WUA Name': wua.wua_name,
        'WUA ID': wua.wua_id,
        'Project Name': wua.project_name,
        'Project ID': wua.project_id,
        'CE Zone': wua.ce_zone,
        'SE Circle': wua.se_circle,
        'Division': wua.division,
        'Subdivision': wua.subdivision,
        'Section': wua.section,
        'Status': wua.status,
        'Formation Year': wua.formation_year,
        'Tenure Completion Year': wua.tenure_completion_year,
        'Registration Number': wua.registration_no,
      },
      'Bank Details': {
        'Account Holder': wua.account_holder,
        'Bank Name': wua.bank_name,
        'Account Number': wua.account_number,
        'IFSC Code': wua.ifsc_code,
      },
      'Statistics': {
        'WUA CCA (Ha)': wua.wua_cca,
        'Total Outlets': wua.total_outlets,
        'Total Plots': wua.total_plots,
        'Total Beneficiaries': wua.total_beneficiaries,
        'Total Villages': wua.total_villages,
        'Total VLCs Formed': wua.total_vlcs_formed,
        'VLCs Not Formed': wua.vlcs_not_formed,
        'Total Gram Panchayats': wua.total_gps,
        'Total Blocks': wua.total_blocks,
      },
      'Canal Details': {
        'Branch Canal': wua.branch_canal,
        'Canal Category': wua.canal_category,
        'Canal Name': wua.canal_name,
      },
      'Timestamps': {
        'Created At': wua.created_at,
        'Updated At': wua.updated_at
      }
    };

    switch(format) {
      case 'pdf':
        downloadAsPDF(wua, wuaData);
        break;
      case 'excel':
        downloadAsExcel(wua, wuaData);
        break;
      case 'csv':
        downloadAsCSV(wua, wuaData);
        break;
    }
  };

  // PDF Download Function
  const downloadAsPDF = (wua: WUAViewData, data: any) => {
    const content = generatePDFContent(wua, data);
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WUA_${wua.wua_id}_${wua.wua_name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`PDF report for ${wua.wua_name} downloaded!`);
  };

  // Excel Download Function
  const downloadAsExcel = (wua: WUAViewData, data: any) => {
    const csvContent = generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WUA_${wua.wua_id}_${wua.wua_name.replace(/\s+/g, '_')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`Excel report for ${wua.wua_name} downloaded!`);
  };

  // CSV Download Function
  const downloadAsCSV = (wua: WUAViewData, data: any) => {
    const csvContent = generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WUA_${wua.wua_id}_${wua.wua_name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`CSV report for ${wua.wua_name} downloaded!`);
  };

  // Helper function to generate CSV content
  const generateCSVContent = (data: any) => {
    let csvContent = '';
    
    Object.entries(data).forEach(([section, sectionData]) => {
      csvContent += `${section}\n`;
      Object.entries(sectionData as object).forEach(([key, value]) => {
        csvContent += `"${key}","${value}"\n`;
      });
      csvContent += '\n';
    });
    
    return csvContent;
  };

  // Helper function to generate PDF content (simple text version)
  const generatePDFContent = (wua: WUAViewData, data: any) => {
    let content = `WATER USERS ASSOCIATION DETAILS\n`;
    content += `================================\n\n`;
    content += `WUA: ${wua.wua_name}\n`;
    content += `WUA ID: ${wua.wua_id}\n`;
    content += `Project: ${wua.project_name}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    Object.entries(data).forEach(([section, sectionData]) => {
      content += `${section.toUpperCase()}\n`;
      content += `${'='.repeat(section.length)}\n`;
      Object.entries(sectionData as object).forEach(([key, value]) => {
        content += `${key}: ${value}\n`;
      });
      content += '\n';
    });
    
    return content;
  };

  const handleDownloadClick = (event: React.MouseEvent, wua: WUAViewData) => {
    event.stopPropagation();
    setDownloadMenu({
      open: true,
      wua: wua,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  // Download Menu Component
  const DownloadMenu = () => {
    if (!downloadMenu.open || !downloadMenu.wua) return null;

    const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
      handleDownloadWUADetails(downloadMenu.wua!, format);
      setDownloadMenu({ open: false, wua: null, position: { x: 0, y: 0 } });
    };

    const handleClose = () => {
      setDownloadMenu({ open: false, wua: null, position: { x: 0, y: 0 } });
    };

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40"
          onClick={handleClose}
        />
        
        {/* Menu */}
        <div 
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-64"
          style={{
            left: `${Math.min(downloadMenu.position.x, window.innerWidth - 280)}px`,
            top: `${Math.min(downloadMenu.position.y, window.innerHeight - 200)}px`,
          }}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Download Options</p>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-500 truncate mt-1">{downloadMenu.wua.wua_name}</p>
          </div>
          
          <button
            onClick={() => handleDownload('pdf')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Download as PDF</p>
              <p className="text-xs text-gray-500">Best for printing</p>
            </div>
          </button>
          
          <button
            onClick={() => handleDownload('excel')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Download as Excel</p>
              <p className="text-xs text-gray-500">For data analysis</p>
            </div>
          </button>
          
          <button
            onClick={() => handleDownload('csv')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <File className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Download as CSV</p>
              <p className="text-xs text-gray-500">For import/export</p>
            </div>
          </button>
        </div>
      </>
    );
  };

  const WUADetailView = () => {
    if (!selectedWUA) return null;

    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowDetail(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to List
                  </button>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{selectedWUA.wua_name}</h1>
                    <p className="text-blue-100">Complete WUA Information</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80">WUA ID: {selectedWUA.wua_id}</p>
                  <p className="text-white/80">Project: {selectedWUA.project_name}</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">WUA Name</label>
                    <p className="text-gray-900 font-medium">{selectedWUA.wua_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WUA ID</label>
                    <p className="text-gray-900 font-medium">{selectedWUA.wua_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <p className="text-gray-900">{selectedWUA.project_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                    <p className="text-gray-900">{selectedWUA.project_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CE Zone</label>
                    <p className="text-gray-700">{selectedWUA.ce_zone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SE Circle</label>
                    <p className="text-gray-700">{selectedWUA.se_circle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                    <p className="text-gray-700">{selectedWUA.division}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subdivision</label>
                    <p className="text-gray-700">{selectedWUA.subdivision}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <p className="text-gray-700">{selectedWUA.section || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedWUA.status === 'Active' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedWUA.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  Bank Account Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                    <p className="text-gray-900">{selectedWUA.account_holder}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <p className="text-gray-900">{selectedWUA.bank_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <p className="text-gray-900 font-mono">{selectedWUA.account_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <p className="text-gray-900 font-mono">{selectedWUA.ifsc_code}</p>
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Registration & Dates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <p className="text-gray-900">{selectedWUA.registration_no}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formation Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-700">
                        {selectedWUA.formation_year ? 
                          new Date(selectedWUA.formation_year).toLocaleDateString('en-IN') : 
                          'Not set'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tenure Completion Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-700">
                        {selectedWUA.tenure_completion_year ? 
                          new Date(selectedWUA.tenure_completion_year).toLocaleDateString('en-IN') : 
                          'Not set'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created On</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-700">
                        {selectedWUA.created_at ? 
                          new Date(selectedWUA.created_at).toLocaleDateString('en-IN') : 
                          'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats and Actions */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Statistics
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Total Villages</span>
                    <span className="font-bold text-blue-900">{selectedWUA.total_villages}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">VLCs Formed</span>
                    <span className="font-bold text-green-900">{selectedWUA.total_vlcs_formed}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700">Total Beneficiaries</span>
                    <span className="font-bold text-purple-900">{selectedWUA.total_beneficiaries}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-700">CCA (Ha)</span>
                    <span className="font-bold text-yellow-900">{selectedWUA.wua_cca} Ha</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <span className="text-pink-700">Gram Panchayats</span>
                    <span className="font-bold text-pink-900">{selectedWUA.total_gps}</span>
                  </div>
                </div>
              </div>

              {/* Canal Details */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-600" />
                  Canal Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Main Canal Name</p>
                    <p className="font-medium text-gray-900">{selectedWUA.canal_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Main Canal Category</p>
                    <p className="font-medium text-gray-900">{selectedWUA.canal_category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Branch Canal</p>
                    <p className="font-medium text-gray-900">{selectedWUA.branch_canal}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {/* <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
                <div className="space-y-3">
                  <button 
                    onClick={(e) => handleDownloadClick(e, selectedWUA)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    Download Details
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Printer className="w-5 h-5" />
                    Print Report
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Mail className="w-5 h-5" />
                    Send Email
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showDetail && selectedWUA) {
    return <WUADetailView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-6">
      {/* Download Menu */}
      <DownloadMenu />
      
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
                  Back to Form
                </button>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Created WUAs</h1>
                  <p className="text-blue-100">View and manage all Water Users Associations</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <div className="text-right">
                  <p className="text-white font-medium">Total WUAs: {filteredWUAs.length}</p>
                  <p className="text-white/80 text-sm">Active: {filteredWUAs.filter(w => w.status === 'Active').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total WUAs</p>
                <p className="text-2xl font-bold text-gray-800">{filteredWUAs.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active WUAs</p>
                <p className="text-2xl font-bold text-green-600">{filteredWUAs.filter(w => w.status === 'Active').length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Villages</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredWUAs.reduce((sum, wua) => sum + (wua.total_villages || 0), 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Beneficiaries</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredWUAs.reduce((sum, wua) => sum + (wua.total_beneficiaries || 0), 0)}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search WUAs by name, ID, or division..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* WUA List Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">WUA Records</h2>
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-600 hover:text-gray-800">
                  <Printer className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800">
                  <DownloadIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading WUAs...</p>
              </div>
            </div>
          ) : filteredWUAs.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                <Building className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No WUAs Found</h3>
              <p className="text-gray-600 mb-6">No Water Users Associations have been created yet.</p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First WUA
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WUA Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WUA ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Circle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Villages</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWUAs.map((wua, index) => (
                    <tr key={wua.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{wua.wua_name}</p>
                            <p className="text-sm text-gray-500">{wua.subdivision}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{wua.wua_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">{wua.project_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{wua.division}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{wua.se_circle}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          wua.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {wua.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">{wua.total_villages}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(wua)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDownloadClick(e, wua)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {filteredWUAs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredWUAs.length)}</span> of{' '}
                  <span className="font-medium">{filteredWUAs.length}</span> results
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Previous</button>
                  <button className="px-3 py-1 border border-gray-300 bg-gray-100 rounded text-sm font-medium">1</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">3</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WUACreationView;