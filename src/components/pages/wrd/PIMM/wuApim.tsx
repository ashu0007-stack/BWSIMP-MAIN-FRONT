// components/dashboard/DynamicDashboard.tsx


import { useState, useMemo, useCallback } from 'react';
import { 
  useDashboardData, 
  useDashboardKPIs,
  useCompletionDistribution,
  useRecentActivities,
  usePerformanceMetrics,
  useRefreshDashboard
} from '@/hooks/wrdHooks/useDashboard';
import VLCFormation from '@/components/pages/wrd/PIMM/vlc';
import SLCFormation from '@/components/pages/wrd/PIMM/slc';
import AllFarmersPage from './farmer';
import MeetingTraining from './meeting';
import {
  BarChart3,
  Users,
  CheckCircle,
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  Search,
  Download,
  RefreshCw,
  ChevronRight,
  Home,
  Building,
  UserPlus,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  ArrowUpRight,
  AlertCircle,
  Target,
  Zap,
  X,
  FileText,
  MapPin,
  Droplets,
  TrendingDown,
  Eye,
  Timer
} from 'lucide-react';
import WUACreation from './wua';

interface WUAFormProps {
  preselectedWUA: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const VLCFormationTyped = VLCFormation as React.ComponentType<WUAFormProps>;
const SLCFormationTyped = SLCFormation as React.ComponentType<WUAFormProps>;
const AllFarmersPageTyped = AllFarmersPage as React.ComponentType<WUAFormProps>;
const MeetingTrainingTyped = MeetingTraining as React.ComponentType<WUAFormProps>;
const WuaCreationTyped = WUACreation as React.ComponentType<WUAFormProps>;

interface KPI {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hoverColor: string;
  action: () => void;
}

export default function DynamicDashboard() {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [selectedWUA, setSelectedWUA] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [expandedWUA, setExpandedWUA] = useState<string | null>(null);
  const [selectedWUADetails, setSelectedWUADetails] = useState<any>(null);
  const [showWUADetails, setShowWUADetails] = useState(false);
  
  // Use the custom hooks
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useDashboardData();
  
  const { 
    data: kpisData, 
    isLoading: kpisLoading 
  } = useDashboardKPIs();
  
  const { 
    data: distributionData, 
    isLoading: distributionLoading 
  } = useCompletionDistribution();
  
  const { 
    data: activitiesData, 
    isLoading: activitiesLoading 
  } = useRecentActivities();
  
  const { 
    data: performanceData, 
    isLoading: performanceLoading 
  } = usePerformanceMetrics();
  
  const { mutate: refreshDashboard } = useRefreshDashboard();

  // Handle refresh
  const handleRefresh = () => {
    refreshDashboard();
    refetchDashboard();
  };

  // Handle form actions
  const handleCreateVLC = (wua: any) => {
    setSelectedWUA(wua);
    setActiveForm('vlc');
    setSelectedAction(`Create VLC for ${wua.wua_name}`);
  };

  const handleCreateSLC = (wua: any) => {
    setSelectedWUA(wua);
    setActiveForm('slc');
    setSelectedAction(`Create SLC for ${wua.wua_name}`);
  };
  

  const handleAddFarmers = (wua: any) => {
    setSelectedWUA(wua);
    setActiveForm('farmers');
    setSelectedAction(`Add Farmers for ${wua.wua_name}`);
  };

  const handleAddMeetings = (wua: any) => {
    setSelectedWUA(wua);
    setActiveForm('meetings');
    setSelectedAction(`Add Meetings for ${wua.wua_name}`);
  };

  const handleQuickAction = (action: string) => {
    setActiveForm(action);
    setSelectedAction(
      action === 'vlc' ? 'Create VLC' : 
      action === 'slc' ? 'Create SLC' : 
      action === 'wua' ? 'Create WUA' :
      action === 'farmers' ? 'Add Farmers' : 
      'Add Meetings'
    );
  };

  const handleCloseForm = () => {
    setActiveForm(null);
    setSelectedWUA(null);
    setSelectedAction('');
    handleRefresh();
  };

  // Handle view details
  const handleViewDetails = (wua: any) => {
    const completion = getWUACompletionStatus(wua);
    const status = getCompletionStatus(completion);
    
    setSelectedWUADetails({
      ...wua,
      completion,
      status
    });
    setShowWUADetails(true);
  };

  // Quick Actions
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'vlc',
      title: 'Create VLC',
      description: 'Form Village Level Committee',
      icon: <Home className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      action: () => handleQuickAction('vlc')
    },
    {
      id: 'slc',
      title: 'Form SLC',
      description: 'Create Section Level Committee',
      icon: <Building className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      action: () => handleQuickAction('slc')
    },
    {
      id: 'wua',
      title: 'Create WUA',
      description: 'Water Users Association',
      icon: <Home className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      action: () => handleQuickAction('wua')
    },
    {
      id: 'farmers',
      title: 'Add Farmers',
      description: 'Registered farmers & land details',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100',
      action: () => handleQuickAction('farmers')
    },
    {
      id: 'meetings',
      title: 'Record Meeting',
      description: 'Log training sessions & meetings',
      icon: <CalendarIcon className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      action: () => handleQuickAction('meetings')
    }
  ], []);

  // KPI Cards Data
  const kpiCards: KPI[] = useMemo(() => [
    {
      title: 'Overall Progress',
      value: `${kpisData?.avg_progress || 0}%`,
      change: kpisData?.progress_change || 0,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      description: 'Average completion rate'
    },
    {
      title: 'Total Farmers',
      value: kpisData?.total_farmers?.toLocaleString() || '0',
      change: kpisData?.farmers_change || 0,
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      description: 'Registered farmers'
    },
    {
      title: 'Active WUAs',
      value: `${kpisData?.active_wuas || 0}/${kpisData?.total_wuas || 0}`,
      icon: <Activity className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      description: 'Fully activated associations'
    },
    {
      title: 'Meetings Held',
      value: kpisData?.total_meetings || 0,
      change: kpisData?.meetings_change || 0,
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      description: 'Training sessions conducted'
    }
  ], [kpisData]);

const getLatestDate = useCallback((dates: (string | null)[]) => {
    const validDates = dates.filter(date => date !== null).map(date => new Date(date).getTime());
    if (validDates.length === 0) return null;
    return new Date(Math.max(...validDates));
  }, []);

  // ✅ getWUACompletionStatus को useCallback के साथ
  const getWUACompletionStatus = useCallback((wua: any) => {
    const hasVLC = wua.vlc_count > 0;
    const hasSLC = wua.slc_count > 0;
    const hasFarmers = wua.farmers_count > 0;
    const hasMeetings = wua.meetings_count > 0;
    
    const completedSteps = [hasVLC, hasSLC, hasFarmers, hasMeetings].filter(Boolean).length;
    const percentage = (completedSteps / 4) * 100;
    
    return {
      hasVLC,
      hasSLC,
      hasFarmers,
      hasMeetings,
      completedSteps,
      percentage: Math.round(percentage),
      totalFarmers: wua.farmers_count || 0,
      totalMeetings: wua.meetings_count || 0,
      lastUpdated: getLatestDate([
        wua.last_vlc_update,
        wua.last_slc_update,
        wua.last_farmer_update,
        wua.last_meeting_update
      ])
    };
  }, [getLatestDate]); // ✅ getLatestDate dependency

  // ✅ getCompletionStatus को भी useCallback के साथ
  const getCompletionStatus = useCallback((completion: any) => {
    if (completion.percentage === 100) {
      return {
        text: 'Completed',
        color: 'bg-green-100 text-green-800 border-green-200',
        level: 'complete',
        icon: <CheckCircle className="w-4 h-4" />,
        progressColor: 'bg-green-500',
        iconColor: 'text-green-600'
      };
    } else if (completion.percentage >= 75) {
      return {
        text: 'Meetings Pending',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        level: 'meetings',
        icon: <Calendar className="w-4 h-4" />,
        progressColor: 'bg-blue-500',
        iconColor: 'text-blue-600'
      };
    } else if (completion.percentage >= 50) {
      return {
        text: 'Farmers Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        level: 'farmers',
        icon: <UsersIcon className="w-4 h-4" />,
        progressColor: 'bg-yellow-500',
        iconColor: 'text-yellow-600'
      };
    } else if (completion.percentage >= 25) {
      return {
        text: 'SLC Pending',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        level: 'slc',
        icon: <Building className="w-4 h-4" />,
        progressColor: 'bg-orange-500',
        iconColor: 'text-orange-600'
      };
    } else {
      return {
        text: 'VLC Pending',
        color: 'bg-red-100 text-red-800 border-red-200',
        level: 'vlc',
        icon: <Home className="w-4 h-4" />,
        progressColor: 'bg-red-500',
        iconColor: 'text-red-600'
      };
    }
  }, []);

  // ✅ अब filteredWUAs में सभी dependencies डालें
  const filteredWUAs = useMemo(() => {
    return dashboardData?.wuas?.filter((wua: { wua_name: string; division_name: string; district_name: string; }) => {
      const matchesSearch = searchTerm === '' || 
        wua.wua_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wua.division_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wua.district_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      
      const completion = getWUACompletionStatus(wua);
      const status = getCompletionStatus(completion);
      
      return matchesSearch && status.level === filterStatus;
    }) || [];
  }, [
    dashboardData, 
    searchTerm, 
    filterStatus, 
    getWUACompletionStatus, 
    getCompletionStatus
  ]);
  // Loading state
  if (dashboardLoading || kpisLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{dashboardError.message || 'Unable to load dashboard data'}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If form is active, show only the form
  if (activeForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <button
              onClick={handleCloseForm}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-white hover:shadow-sm mb-6"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  {activeForm === 'vlc' && <Home className="w-6 h-6 text-white" />}
                  {activeForm === 'slc' && <Building className="w-6 h-6 text-white" />}
                  {activeForm === 'wua' && <Building className="w-6 h-6 text-white" />}
                  {activeForm === 'farmers' && <UsersIcon className="w-6 h-6 text-white" />}
                  {activeForm === 'meetings' && <CalendarIcon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedAction}</h2>
                  {selectedWUA && (
                    <p className="text-gray-600">
                      For <span className="font-semibold">{selectedWUA.wua_name}</span> in {selectedWUA.division_name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                {activeForm === 'vlc' && (
                  <VLCFormationTyped 
                    preselectedWUA={selectedWUA}
                    onSuccess={handleCloseForm}
                    onCancel={handleCloseForm}
                  />
                )}
                
                {activeForm === 'slc' && (
                  <SLCFormationTyped 
                    preselectedWUA={selectedWUA}
                    onSuccess={handleCloseForm}
                    onCancel={handleCloseForm}
                  />
                )}

                {activeForm === 'wua' && (
                  <WuaCreationTyped 
                    preselectedWUA={selectedWUA}
                    onSuccess={handleCloseForm}
                    onCancel={handleCloseForm}
                  />
                )}

                {activeForm === 'farmers' && (
                  <AllFarmersPageTyped
                    preselectedWUA={selectedWUA}
                    onSuccess={handleCloseForm}
                    onCancel={handleCloseForm}
                  />
                )}

                {activeForm === 'meetings' && (
                  <MeetingTrainingTyped
                    preselectedWUA={selectedWUA}
                    onSuccess={handleCloseForm}
                    onCancel={handleCloseForm}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">WUA Management Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor and manage Water Users Associations in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${kpi.color} bg-opacity-10`}>
                    {kpi.icon}
                  </div>
                  {kpi.change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(kpi.change)}%
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{kpi.value}</h3>
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - WUA Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Filters and Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">WUA Activation Progress</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {filteredWUAs.length} of {dashboardData?.wuas?.length || 0} associations shown
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search WUAs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-48"
                    />
                  </div>
                  
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="complete">Completed</option>
                    <option value="meetings">Meetings Pending</option>
                    <option value="farmers">Farmers Pending</option>
                    <option value="slc">SLC Pending</option>
                    <option value="vlc">VLC Pending</option>
                  </select>

                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                      title="List view"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                      title="Grid view"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* WUA List/Grid */}
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {filteredWUAs.slice(0, 8).map((wua: any) => {
                    const completion = getWUACompletionStatus(wua);
                    const status = getCompletionStatus(completion);
                    const isExpanded = expandedWUA === wua.id;
                    
                    return (
                      <div key={wua.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-bold text-gray-800 text-lg">{wua.wua_name}</h3>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.icon}
                                  {status.text}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {wua.division_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <UsersIcon className="w-4 h-4" />
                                  {completion.totalFarmers} farmers
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {completion.totalMeetings} meetings
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(wua);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                                Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedWUA(isExpanded ? null : wua.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-700">Activation Progress</span>
                              <span className="font-semibold text-gray-800">{completion.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${status.progressColor}`}
                                style={{ width: `${Math.min(completion.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                            {!completion.hasVLC && (
                              <button
                                onClick={() => handleCreateVLC(wua)}
                                className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Add VLC
                              </button>
                            )}
                            {completion.hasVLC && !completion.hasSLC && (
                              <button
                                onClick={() => handleCreateSLC(wua)}
                                className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                              >
                                Add SLC
                              </button>
                            )}
                            {completion.hasSLC && !completion.hasFarmers && (
                              <button
                                onClick={() => handleAddFarmers(wua)}
                                className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                              >
                                Add Farmers
                              </button>
                            )}
                            {completion.hasFarmers && !completion.hasMeetings && (
                              <button
                                onClick={() => handleAddMeetings(wua)}
                                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                Add Meeting
                              </button>
                            )}
                          </div>
                          
                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className="text-sm text-gray-600 mb-1">VLC Status</div>
                                  <div className={`font-semibold ${completion.hasVLC ? 'text-green-600' : 'text-red-600'}`}>
                                    {completion.hasVLC ? '✓ Formed' : '✗ Pending'}
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className="text-sm text-gray-600 mb-1">SLC Status</div>
                                  <div className={`font-semibold ${completion.hasSLC ? 'text-green-600' : 'text-red-600'}`}>
                                    {completion.hasSLC ? '✓ Formed' : '✗ Pending'}
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className="text-sm text-gray-600 mb-1">Farmers</div>
                                  <div className="font-semibold text-gray-800">{completion.totalFarmers}</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className="text-sm text-gray-600 mb-1">Meetings</div>
                                  <div className="font-semibold text-gray-800">{completion.totalMeetings}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWUAs.slice(0, 6).map((wua: any) => {
                    const completion = getWUACompletionStatus(wua);
                    const status = getCompletionStatus(completion);
                    
                    return (
                      <div key={wua.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-800 mb-1">{wua.wua_name}</h3>
                            <p className="text-sm text-gray-600">{wua.division_name}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.icon}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-700">Progress</span>
                              <span className="font-semibold text-gray-800">{completion.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${status.progressColor}`}
                                style={{ width: `${Math.min(completion.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <UsersIcon className="w-4 h-4 text-gray-400" />
                              <span>{completion.totalFarmers} farmers</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400" />
                              <span>{completion.totalMeetings} meetings</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(wua)}
                              className="flex-1 text-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            {!completion.hasVLC && (
                              <button
                                onClick={() => handleCreateVLC(wua)}
                                className="flex-1 text-center px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Add VLC
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {filteredWUAs.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No WUAs Found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
              
              {filteredWUAs.length > 8 && (
                <div className="text-center mt-6 pt-6 border-t border-gray-200">
                  <button className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Load More WUAs
                  </button>
                </div>
              )}
            </div>

            {/* Progress Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Progress Distribution</h2>
                  <p className="text-gray-600 text-sm mt-1">Breakdown of WUAs by completion status</p>
                </div>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
              
              {distributionLoading ? (
                <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {distributionData?.map((item: any) => (
                    <CompletionLevelCard
                      key={item.completion_level}
                      level={item.completion_level}
                      count={item.count}
                      percentage={item.percentage}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`w-full flex items-center p-4 rounded-xl border border-gray-200 ${action.bgColor} ${action.hoverColor} transition-all duration-200 group hover:shadow-sm`}
                  >
                    <div className={`p-3 rounded-lg ${action.color} bg-white bg-opacity-50 group-hover:bg-opacity-100 transition-colors`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 text-left ml-4">
                      <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {activitiesLoading ? (
                  <ActivitySkeleton />
                ) : activitiesData?.length > 0 ? (
                  <>
                    {activitiesData.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} bg-opacity-10 flex-shrink-0`}>
                          <div className={getActivityColor(activity.type)}>
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500 truncate">{activity.wua_name}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2 mt-2 hover:bg-blue-50 rounded-lg transition-colors">
                      View All Activities
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent activities</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Performance Insights</h2>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="space-y-5">
                {performanceLoading ? (
                  <PerformanceSkeleton />
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Activation Rate</span>
                        <span className="text-sm font-bold text-green-600">{performanceData?.activation_rate || '0%'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: performanceData?.activation_rate || '0%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Avg Completion Time</span>
                        <span className="text-sm font-bold text-blue-600">{performanceData?.avg_time_to_complete || '0'} days</span>
                      </div>
                      <div className="text-xs text-gray-500">Lower is better</div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Farmers Engagement</span>
                        <span className="text-sm font-bold text-purple-600">{performanceData?.farmers_engagement || '0%'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: performanceData?.farmers_engagement || '0%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Meeting Frequency</span>
                        <span className="text-sm font-bold text-orange-600">{performanceData?.meeting_frequency || '0'}/week</span>
                      </div>
                      <div className="text-xs text-gray-500">Per active WUA</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WUA Details Modal */}
      {showWUADetails && selectedWUADetails && (
        <WUADetailsModal
          wua={selectedWUADetails}
          onClose={() => {
            setShowWUADetails(false);
            setSelectedWUADetails(null);
          }}
          onCreateVLC={() => {
            setShowWUADetails(false);
            handleCreateVLC(selectedWUADetails);
          }}
          onCreateSLC={() => {
            setShowWUADetails(false);
            handleCreateSLC(selectedWUADetails);
          }}
          onAddFarmers={() => {
            setShowWUADetails(false);
            handleAddFarmers(selectedWUADetails);
          }}
          onAddMeetings={() => {
            setShowWUADetails(false);
            handleAddMeetings(selectedWUADetails);
          }}
        />
      )}
    </div>
  );
}

// Helper Components
function CompletionLevelCard({ level, count, percentage }: { level: string; count: number; percentage?: number }) {
  const getConfig = (level: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; description: string }> = {
      'Complete': { 
        color: 'green', 
        icon: <CheckCircle className="w-5 h-5" />, 
        description: 'All steps completed' 
      },
      'Meetings Pending': { 
        color: 'blue', 
        icon: <Calendar className="w-5 h-5" />, 
        description: '75% complete' 
      },
      'Farmers Pending': { 
        color: 'yellow', 
        icon: <UsersIcon className="w-5 h-5" />, 
        description: '50% complete' 
      },
      'SLC Pending': { 
        color: 'orange', 
        icon: <Building className="w-5 h-5" />, 
        description: '25% complete' 
      },
      'VLC Pending': { 
        color: 'red', 
        icon: <Home className="w-5 h-5" />, 
        description: 'Just started' 
      }
    };
    
    return configs[level] || { 
      color: 'gray', 
      icon: <BarChart3 className="w-5 h-5" />, 
      description: 'In progress' 
    };
  };

  const config = getConfig(level);

  return (
    <div className={`bg-${config.color}-50 border border-${config.color}-200 rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-${config.color}-500 bg-opacity-10`}>
          <div className={`text-${config.color}-600`}>
            {config.icon}
          </div>
        </div>
        <div className={`text-2xl font-bold text-${config.color}-700`}>{count}</div>
      </div>
      <h4 className="font-semibold text-gray-800 mb-1">{level}</h4>
      {percentage !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{config.description}</span>
          <span className={`text-sm font-semibold text-${config.color}-600`}>{percentage}%</span>
        </div>
      )}
    </div>
  );
}

function WUADetailsModal({ 
  wua, 
  onClose,
  onCreateVLC,
  onCreateSLC,
  onAddFarmers,
  onAddMeetings
}: { 
  wua: any;
  onClose: () => void;
  onCreateVLC: () => void;
  onCreateSLC: () => void;
  onAddFarmers: () => void;
  onAddMeetings: () => void;
}) {
  const completion = wua.completion;
  const status = wua.status;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{wua.wua_name}</h2>
              <p className="text-gray-600">
                {wua.division_name} • {wua.district_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Activation Progress</h3>
                <p className="text-gray-600">Complete all 4 steps to activate this WUA</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">{completion.percentage}%</div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.icon}
                  {status.text}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${status.progressColor}`}
                style={{ width: `${Math.min(completion.percentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard
              title="VLC Formation"
              completed={completion.hasVLC}
              description="Village Level Committee"
              icon={<Home className="w-6 h-6" />}
              color="red"
              onAction={onCreateVLC}
              actionLabel={completion.hasVLC ? "Update" : "Create"}
            />
            
            <StepCard
              title="SLC Formation"
              completed={completion.hasSLC}
              description="Section Level Committee"
              icon={<Building className="w-6 h-6" />}
              color="orange"
              onAction={onCreateSLC}
              actionLabel={completion.hasSLC ? "Update" : "Create"}
            />
            
            <StepCard
              title="Farmers Data"
              completed={completion.hasFarmers}
              description="Land holding details"
              icon={<UsersIcon className="w-6 h-6" />}
              color="yellow"
              onAction={onAddFarmers}
              actionLabel={completion.hasFarmers ? "Manage" : "Add"}
            />
            
            <StepCard
              title="Meetings & Training"
              completed={completion.hasMeetings}
              description="Training sessions"
              icon={<CalendarIcon className="w-6 h-6" />}
              color="blue"
              onAction={onAddMeetings}
              actionLabel={completion.hasMeetings ? "View" : "Add"}
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              value={completion.totalFarmers}
              label="Total Farmers"
              description="Registered with land details"
              color="blue"
            />
            
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              value={completion.totalMeetings}
              label="Meetings Held"
              description="Training sessions conducted"
              color="green"
            />
            
            <StatCard
              icon={<Target className="w-5 h-5" />}
              value={`${completion.completedSteps}/4`}
              label="Steps Completed"
              description="Activation progress"
              color="purple"
            />
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-gray-800 mb-3">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={<FileText className="w-4 h-4" />}
                label="WUA Code"
                value={wua.wua_code || 'Not assigned'}
              />
              <InfoItem
                icon={<MapPin className="w-4 h-4" />}
                label="Villages Covered"
                value={wua.villages_covered || 'Not specified'}
              />
              <InfoItem
                icon={<Droplets className="w-4 h-4" />}
                label="Irrigation Area"
                value={wua.irrigation_area ? `${wua.irrigation_area} hectares` : 'Not specified'}
              />
              <InfoItem
                icon={<Timer className="w-4 h-4" />}
                label="Last Updated"
                value={completion.lastUpdated ? completion.lastUpdated.toLocaleDateString() : 'Never'}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-200 bg-gray-50 gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
            <button className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ 
  title, 
  completed, 
  description, 
  icon, 
  color, 
  onAction, 
  actionLabel 
}: { 
  title: string;
  completed: boolean;
  description: string;
  icon: React.ReactNode;
  color: string;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div className={`border rounded-xl p-5 ${completed ? 'border-green-200 bg-green-50' : `border-${color}-200 bg-${color}-50`}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${completed ? 'bg-green-500' : `bg-${color}-500`} bg-opacity-10`}>
          <div className={completed ? 'text-green-600' : `text-${color}-600`}>
            {icon}
          </div>
        </div>
        {completed ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            ✓ Complete
          </span>
        ) : (
          <span className={`px-2 py-1 bg-${color}-100 text-${color}-800 text-xs font-medium rounded-full`}>
            Pending
          </span>
        )}
      </div>
      <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button
        onClick={onAction}
        className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
          completed 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function StatCard({ 
  icon, 
  value, 
  label, 
  description, 
  color 
}: { 
  icon: React.ReactNode;
  value: string | number;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <div className={`text-${color}-600`}>
            {icon}
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className="text-gray-500">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-medium text-gray-800">{value}</div>
      </div>
    </div>
  );
}

// Utility Functions
function formatTimeAgo(timestamp: string) {
  if (!timestamp) return 'Just now';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

function getActivityIcon(type: string) {
  switch(type) {
    case 'vlc': return <Home className="w-4 h-4" />;
    case 'slc': return <Building className="w-4 h-4" />;
    case 'farmer': return <UserPlus className="w-4 h-4" />;
    case 'meeting': return <Calendar className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
}

function getActivityColor(type: string) {
  switch(type) {
    case 'vlc': return 'text-red-600';
    case 'slc': return 'text-orange-600';
    case 'farmer': return 'text-yellow-600';
    case 'meeting': return 'text-blue-600';
    default: return 'text-gray-600';
  }
}

// Loading Skeletons
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          
          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* WUA List Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-200 rounded-xl p-5">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Quick Actions Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
}

function PerformanceSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </>
  );
}