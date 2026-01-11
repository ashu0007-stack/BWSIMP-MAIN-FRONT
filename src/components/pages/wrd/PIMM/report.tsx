import React, { useState, useEffect } from 'react';
import {
  useSummaryData,
  useWUADetailedData,
  useVLCDetailedData,
  useSLCDetailedData,
  useWaterTaxData,
  usePIMImpactData,
  useComparativeStudyData,
  useMeetingsData,
  useGenerateStatistics,
  useUpdateStatus,
} from '@/hooks/wrdHooks/pim/reportsHooks';
import WUACreation from './wua';
import VLCFormation from './vlc';
import SLCFormation from './slc';
import MeetingTraining from './meeting';

// Interface definitions for the component
interface WUAData {
  id: number;
  wua_name: string;
  wua_id: string;
  project_name: string;
  vlc_count: number;
  farmers_count: number;
  slc_count: number;
  status: string;
  created_at: string;
}

interface VLCData {
  id: number;
  vlc_name: string;
  village_name: string;
  wua_name: string;
  parent_wua_id: string;
  gb_members: number;
  exec_members: number;
  status: string;
  created_at: string;
}

interface SLCData {
  id: number;
  slc_name: string;
  wua_name: string;
  parent_wua_id: string;
  gb_members: number;
  exec_members: number;
  total_water_tax: number;
  formation_date: string;
  status: string;
}

interface WaterTaxData {
  id: number;
  year: number;
  slc_name: string;
  wua_name: string;
  kharif_tax: number;
  rabi_tax: number;
  total_tax: number;
  deposited_govt: number;
  retained_wua: number;
  expenditure: number;
  balance: number;
}

interface PIMImpactData {
  id: number;
  year: number;
  pim_coverage_area: number;
  wuas_formed: number;
  wuas_functional_percent: number;
  wuas_collecting_tax: number;
  water_tax_collected: number;
  farmers_participation_meetings: number;
  women_members: number;
  women_ec_members: number;
  training_conducted: number;
  irrigation_intensity: number;
  cropping_intensity: number;
  average_crop_yield: number;
  average_farm_income: number;
}

interface ComparativeData {
  id: number;
  impact_area: string;
  unit: string;
  pim_value: number;
  non_pim_value: number;
  difference_percent: number;
  remarks: string;
}

interface MeetingsData {
  id: number;
  wua_name: string;
  meeting_date: string;
  agenda_topic: string;
  attendance_male: number;
  attendance_female: number;
  total_attendance: number;
  status: string;
}

interface StatusItem {
  status: string;
  count: number;
}

interface LandSizeItem {
  land_size: string;
  count: number;
}

interface GenderItem {
  gender: string;
  count: number;
}

interface WaterTaxSummary {
  total_collected: number;
  total_deposited: number;
  total_retained: number;
  total_expenditure: number;
  total_balance: number;
}

interface SummaryResponse {
  summary: {
    total_wuas: number;
    total_vlcs: number;
    total_slcs: number;
    total_farmers: number;
  };
  water_tax?: WaterTaxSummary;
  wua_status?: StatusItem[];
  vlc_status?: StatusItem[];
  farmers_land_size?: LandSizeItem[];
  executive_gender?: GenderItem[];
}

// Props interfaces for child components
interface WUACreationProps {
  editId?: number;
  onSuccess?: () => void;
}

interface VLCFormationProps {
  editId?: number;
  onSuccess?: () => void;
}

interface SLCFormationProps {
  editId?: number;
  onSuccess?: () => void;
}

interface MeetingTrainingProps {
  editId?: number;
  onSuccess?: () => void;
}

// Column definition interface
interface ColumnDefinition {
  key: string;
  label: string;
  format?: (value: any) => string;
  render?: (value: any, row: any) => React.ReactNode;
}

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string>('summary');
  const [backendStatus, setBackendStatus] = useState<string>('checking');
  const [editWUAId, setEditWUAId] = useState<number | null>(null);
  const [editVLCId, setEditVLCId] = useState<number | null>(null);
  const [editSLCId, setEditSLCId] = useState<number | null>(null);
  const [editMEETINGId, setEditMEETINGId] = useState<number | null>(null);

  // React Query Hooks
  const { data: summaryData, isLoading: summaryLoading } = useSummaryData();
  const { data: wuaData, isLoading: wuaLoading, refetch: refetchWUA } = useWUADetailedData();
  const { data: vlcData, isLoading: vlcLoading, refetch: refetchVLC } = useVLCDetailedData();
  const { data: slcData, isLoading: slcLoading, refetch: refetchSLC } = useSLCDetailedData();
  const { data: waterTaxData, isLoading: waterTaxLoading } = useWaterTaxData();
  const { data: pimImpactData, refetch: refetchPIMImpact } = usePIMImpactData();
  const { data: comparativeData } = useComparativeStudyData();
  const { data: meetingsData, isLoading: meetingsLoading, refetch: refetchMeetings } = useMeetingsData();
  
  const generateStatsMutation = useGenerateStatistics();
  const updateStatusMutation = useUpdateStatus();

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async (): Promise<void> => {
    try {
      // You might want to create a health check endpoint
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  // Status Update Handler
  const handleStatusUpdate = async (type: string, id: number, status: string): Promise<void> => {
    const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
    updateStatusMutation.mutate({ type, id, status: statusCapitalized });
  };

  // Edit Success Handler
  const handleEditSuccess = (): void => {
    setEditWUAId(null);
    setEditVLCId(null);
    setEditSLCId(null);
    setEditMEETINGId(null);
    refetchWUA();
    refetchVLC();
    refetchSLC();
    refetchMeetings();
  };

  const handleReportChange = (reportType: string): void => {
    setActiveReport(reportType);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat('en-IN').format(number || 0);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (backendStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Backend Server Not Connected</h3>
            <p className="text-gray-600 mb-6">Please make sure the backend server is running on port 5000.</p>
            <button
              onClick={checkBackend}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
      

        {/* Show edit components when in edit mode */}
        {activeReport === 'wua' && editWUAId && (
          <WUACreation />
        )}
        

        {activeReport === 'vlc' && editVLCId && (
          <VLCFormation editId={editVLCId} onSuccess={handleEditSuccess} />
        )}

        {activeReport === 'slc' && editSLCId && (
          <SLCFormation/>
        )}

        {activeReport === 'meetings' && editMEETINGId && (
          <MeetingTraining editId={editMEETINGId} onSuccess={handleEditSuccess} />
        )}

        {!editWUAId && !editVLCId && !editSLCId && !editMEETINGId && (
          <>
            {/* Report Navigation Tabs */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {[
                { key: 'summary', label: '📊 Dashboard', icon: '📊' },
                { key: 'wua', label: '🏢 WUAs', icon: '🏢' },
                { key: 'vlc', label: '🏘️ VLCs', icon: '🏘️' },
                { key: 'slc', label: '👥 SLCs', icon: '👥' },
                { key: 'meetings', label: '📋 Meetings', icon: '📋' },
                { key: 'water-tax', label: '💰 Water Tax', icon: '💰' },
                { key: 'pim-impact', label: '📈 Impact', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleReportChange(tab.key)}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center gap-2 ${
                    activeReport === tab.key
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Loading State */}
            {(summaryLoading || wuaLoading || vlcLoading || slcLoading || meetingsLoading) && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600 text-lg">Loading report data...</span>
              </div>
            )}

            {/* Summary Report */}
            {activeReport === 'summary' && summaryData && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-6 text-center shadow-xl">
                    <div className="text-3xl mb-3">🏢</div>
                    <h4 className="text-white font-medium mb-2 text-lg">Total WUAs</h4>
                    <p className="text-4xl font-bold">
                      {formatNumber(summaryData.summary.total_wuas)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 text-center shadow-xl">
                    <div className="text-3xl mb-3">🏘️</div>
                    <h4 className="text-white font-medium mb-2 text-lg">Total VLCs</h4>
                    <p className="text-4xl font-bold">
                      {formatNumber(summaryData.summary.total_vlcs)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 text-center shadow-xl">
                    <div className="text-3xl mb-3">👥</div>
                    <h4 className="text-white font-medium mb-2 text-lg">Total SLCs</h4>
                    <p className="text-4xl font-bold">
                      {formatNumber(summaryData.summary.total_slcs)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 text-center shadow-xl">
                    <div className="text-3xl mb-3">👨‍🌾</div>
                    <h4 className="text-white font-medium mb-2 text-lg">Total Farmers</h4>
                    <p className="text-4xl font-bold">
                      {formatNumber(summaryData.summary.total_farmers)}
                    </p>
                  </div>
                </div>

                {/* Water Tax Summary */}
                {summaryData.water_tax && (
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <span>💰</span>
                      Water Tax Collection Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-blue-600 font-bold text-xl">{formatCurrency(summaryData.water_tax.total_collected)}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Collected</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-green-600 font-bold text-xl">{formatCurrency(summaryData.water_tax.total_deposited)}</div>
                        <div className="text-sm text-gray-600 mt-1">Deposited to Govt</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-xl">
                        <div className="text-yellow-600 font-bold text-xl">{formatCurrency(summaryData.water_tax.total_retained)}</div>
                        <div className="text-sm text-gray-600 mt-1">Retained with WUA</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-xl">
                        <div className="text-orange-600 font-bold text-xl">{formatCurrency(summaryData.water_tax.total_expenditure)}</div>
                        <div className="text-sm text-gray-600 mt-1">Expenditure</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-purple-600 font-bold text-xl">{formatCurrency(summaryData.water_tax.total_balance)}</div>
                        <div className="text-sm text-gray-600 mt-1">Balance</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* WUA Status */}
                  {summaryData.wua_status && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🏢</span>
                        WUA Status Distribution
                      </h4>
                      <div className="space-y-3">
                        {summaryData.wua_status.map((item: StatusItem, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 font-medium">{item.status}</span>
                            <span className="font-bold text-blue-600 text-lg">{formatNumber(item.count)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VLC Status */}
                  {summaryData.vlc_status && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🏘️</span>
                        VLC Status Distribution
                      </h4>
                      <div className="space-y-3">
                        {summaryData.vlc_status.map((item: StatusItem, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 font-medium">{item.status}</span>
                            <span className="font-bold text-green-600 text-lg">{formatNumber(item.count)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Farmers Land Size */}
                  {summaryData.farmers_land_size && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>👨‍🌾</span>
                        Farmers by Land Size
                      </h4>
                      <div className="space-y-3">
                        {summaryData.farmers_land_size.map((item: LandSizeItem, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 font-medium">{item.land_size}</span>
                            <span className="font-bold text-orange-600 text-lg">{formatNumber(item.count)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Executive Gender */}
                  {summaryData.executive_gender && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>👥</span>
                        Executive Committee Gender
                      </h4>
                      <div className="space-y-3">
                        {summaryData.executive_gender.map((item: GenderItem, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 font-medium">{item.gender}</span>
                            <span className="font-bold text-purple-600 text-lg">{formatNumber(item.count)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WUA Detailed Report */}
            {activeReport === 'wua' && (
              <ReportTable
                title="🏢 Water Users Associations (WUAs)"
                data={wuaData || []}
                columns={[
                  { key: 'wua_name', label: 'WUA Name' },
                  { key: 'wua_id', label: 'WUA ID' },
                  { key: 'project_name', label: 'Project' },
                  { key: 'vlc_count', label: 'VLCs', format: formatNumber },
                  { key: 'farmers_count', label: 'Farmers', format: formatNumber },
                  { key: 'slc_count', label: 'SLCs', format: formatNumber },
                  { 
                    key: 'status', 
                    label: 'Status',
                    render: (value: string, row: WUAData) => (
                      <StatusBadge 
                        status={value} 
                        onUpdate={(newStatus: string) => handleStatusUpdate('wua', row.id, newStatus)}
                        loading={updateStatusMutation.isPending}
                      />
                    )
                  },
                  { key: 'created_at', label: 'Created', format: formatDate },
                ]}
                loading={wuaLoading}
                emptyMessage="No WUA data found"
                emptyIcon="🏢"
              />
            )}

            {/* VLC Detailed Report */}
            {activeReport === 'vlc' && (
              <ReportTable
                title="🏘️ Village Level Committees (VLCs)"
                data={vlcData || []}
                columns={[
                  { key: 'vlc_name', label: 'VLC Name' },
                  { key: 'village_name', label: 'Village' },
                  { key: 'wua_name', label: 'WUA' },
                  { key: 'gb_members', label: 'GB Members', format: formatNumber },
                  { key: 'exec_members', label: 'Exec Members', format: formatNumber },
                  { 
                    key: 'status', 
                    label: 'Status',
                    render: (value: string, row: VLCData) => (
                      <StatusBadge 
                        status={value} 
                        onUpdate={(newStatus: string) => handleStatusUpdate('vlc', row.id, newStatus)}
                        loading={updateStatusMutation.isPending}
                      />
                    )
                  },
                  { key: 'created_at', label: 'Created', format: formatDate },
                ]}
                loading={vlcLoading}
                emptyMessage="No VLC data found"
                emptyIcon="🏘️"
              />
            )}

            {/* SLC Detailed Report */}
            {activeReport === 'slc' && (
              <ReportTable
                title="👥 Sub-Committees (SLCs)"
                data={slcData || []}
                columns={[
                  { key: 'slc_name', label: 'SLC Name' },
                  { key: 'wua_name', label: 'WUA' },
                  { key: 'gb_members', label: 'GB Members', format: formatNumber },
                  { key: 'exec_members', label: 'Exec Members', format: formatNumber },
                  { key: 'total_water_tax', label: 'Total Water Tax', format: formatCurrency },
                  { key: 'formation_date', label: 'Formation Date', format: formatDate },
                  { 
                    key: 'status', 
                    label: 'Status',
                    render: (value: string, row: SLCData) => (
                      <StatusBadge 
                        status={value} 
                        onUpdate={(newStatus: string) => handleStatusUpdate('slc', row.id, newStatus)}
                        loading={updateStatusMutation.isPending}
                      />
                    )
                  },
                ]}
                loading={slcLoading}
                emptyMessage="No SLC data found"
                emptyIcon="👥"
              />
            )}

            {/* Meetings Report */}
            {activeReport === 'meetings' && (
              <ReportTable
                title="📋 Meetings & Trainings"
                data={meetingsData || []}
                columns={[
                  { key: 'wua_name', label: 'WUA Name' },
                  { key: 'meeting_date', label: 'Meeting Date', format: formatDate },
                  { 
                    key: 'agenda_topic', 
                    label: 'Agenda/Topic',
                    render: (value: string) => (
                      <div className="max-w-xs truncate" title={value}>
                        {value && value.length > 50 ? value.substring(0, 50) + '...' : value}
                      </div>
                    )
                  },
                  { key: 'attendance_male', label: 'Male', format: formatNumber },
                  { key: 'attendance_female', label: 'Female', format: formatNumber },
                  { key: 'total_attendance', label: 'Total', format: formatNumber },
                  { 
                    key: 'status', 
                    label: 'Status',
                    render: (value: string, row: MeetingsData) => (
                      <StatusBadge 
                        status={value} 
                        onUpdate={(newStatus: string) => handleStatusUpdate('meetings', row.id, newStatus.toLowerCase())}
                        loading={updateStatusMutation.isPending}
                      />
                    )
                  },
                ]}
                loading={meetingsLoading}
                emptyMessage="No meetings data found"
                emptyIcon="📋"
              />
            )}

            {/* Water Tax Report */}
            {activeReport === 'water-tax' && (
              <ReportTable
                title="💰 Water Tax Collection"
                data={waterTaxData || []}
                columns={[
                  { key: 'year', label: 'Year' },
                  { key: 'slc_name', label: 'SLC Name' },
                  { key: 'wua_name', label: 'WUA' },
                  { key: 'kharif_tax', label: 'Kharif Tax', format: formatCurrency },
                  { key: 'rabi_tax', label: 'Rabi Tax', format: formatCurrency },
                  { key: 'total_tax', label: 'Total Tax', format: formatCurrency },
                  { key: 'deposited_govt', label: 'Deposited to Govt', format: formatCurrency },
                  { key: 'retained_wua', label: 'Retained with WUA', format: formatCurrency },
                  { key: 'expenditure', label: 'Expenditure', format: formatCurrency },
                  { key: 'balance', label: 'Balance', format: formatCurrency },
                ]}
                loading={waterTaxLoading}
                emptyMessage="No water tax data found"
                emptyIcon="💰"
              />
            )}

            {/* PIM Impact Assessment Report */}
            {activeReport === 'pim-impact' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <span>📈</span>
                      PIM Socio-economic Impact Assessment
                    </h3>
                    <button
                      onClick={() => generateStatsMutation.mutate()}
                      disabled={generateStatsMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      <span>🔄</span>
                      <span>Generate Current Stats</span>
                    </button>
                  </div>

                  {pimImpactData && pimImpactData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Year</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PIM Coverage (Ha)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">WUAs Formed</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">WUAs Functional (%)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">WUAs Collecting Tax</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Water Tax Collected</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Farmers Participation</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Women Members</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Women EC Members</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Training Conducted</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Irrigation Intensity (%)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cropping Intensity (%)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Yield (q/ha)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Income (₹/ha)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pimImpactData.map((impact: PIMImpactData) => (
                            <tr key={impact.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{impact.year}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatNumber(impact.pim_coverage_area)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatNumber(impact.wuas_formed)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{impact.wuas_functional_percent}%</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatNumber(impact.wuas_collecting_tax)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(impact.water_tax_collected)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatNumber(impact.farmers_participation_meetings)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatNumber(impact.women_members)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatNumber(impact.women_ec_members)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatNumber(impact.training_conducted)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{impact.irrigation_intensity}%</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{impact.cropping_intensity}%</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatNumber(impact.average_crop_yield)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(impact.average_farm_income)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-4">📈</div>
                      <p className="text-gray-500 text-lg mb-4">No PIM impact data available yet</p>
                      <button
                        onClick={() => generateStatsMutation.mutate()}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                      >
                        Generate Statistics from Current Data
                      </button>
                    </div>
                  )}
                </div>

                {/* Comparative Study Table */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span>
                    Comparative Study: PIM vs. Non-PIM Areas
                  </h4>
                  {comparativeData && comparativeData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Impact Area / Indicator</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PIM Area</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Non-PIM Area</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">% Difference</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {comparativeData.map((study: ComparativeData) => (
                            <tr key={study.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{study.impact_area}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{study.unit}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(study.pim_value)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(study.non_pim_value)}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold  ${
                                study.difference_percent > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {study.difference_percent > 0 ? '+' : ''}{study.difference_percent}%
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{study.remarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">📊</div>
                      <p className="text-gray-500">No comparative study data available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Reusable Status Badge Component
interface StatusBadgeProps {
  status: string;
  onUpdate: (newStatus: string) => void;
  loading: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onUpdate, loading }) => {
  const getNextStatus = (currentStatus: string): string => {
    const statusFlow: Record<string, string> = {
      'Draft': 'Submitted',
      'Submitted': 'Approved',
      'Approved': 'Draft',
      'Rejected': 'Draft'
    };
    return statusFlow[currentStatus] || 'Draft';
  };

  const getStatusButtonText = (currentStatus: string): string => {
    const buttonText: Record<string, string> = {
      'Draft': 'Submit',
      'Submitted': 'Approve',
      'Approved': 'Set Draft',
      'Rejected': 'Set Draft'
    };
    return buttonText[currentStatus] || 'Submit';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Submitted': 'bg-blue-100 text-blue-800 border-blue-200',
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="flex flex-col gap-2">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
        {status}
      </span>
      <button
        onClick={() => onUpdate(getNextStatus(status))}
        disabled={loading}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          status === 'Approved' ? 'bg-yellow-500 hover:bg-yellow-600' :
          status === 'Submitted' ? 'bg-green-500 hover:bg-green-600' : 
          'bg-blue-500 hover:bg-blue-600'
        } text-white disabled:opacity-50`}
      >
        {loading ? '...' : getStatusButtonText(status)}
      </button>
    </div>
  );
};

// Reusable Report Table Component
interface ReportTableProps {
  title: string;
  data: any[];
  columns: ColumnDefinition[];
  loading: boolean;
  emptyMessage: string;
  emptyIcon: string;
}

const ReportTable: React.FC<ReportTableProps> = ({ title, data, columns, loading, emptyMessage, emptyIcon }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render
                        ? column.render(row[column.key], row)
                        : column.format
                        ? column.format(row[column.key])
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">{emptyIcon}</div>
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Reports;