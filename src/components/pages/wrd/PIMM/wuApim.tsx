// components/dashboard/DynamicDashboard.tsx

import { useState, useMemo } from 'react';
import { 
  useDashboardData, 
  useDashboardKPIs,
  useRefreshDashboard
} from '@/hooks/wrdHooks/useDashboard';
import VLCFormation from '@/components/pages/wrd/PIMM/vlc/vlc';
import SLCForm from '@/components/pages/wrd/PIMM/slc/slcForm';
import AllFarmersPage from './farmer';
import MeetingTraining from './meeting';
import {
  BarChart3,
  Users,
  CheckCircle,
  Calendar,
  Search,
  RefreshCw,
  ChevronRight,
  Home,
  Building,
  UserPlus,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Eye,
  X,
  FileText,
  MapPin,
  Download
} from 'lucide-react';
import WUACreationForm from './wua/WUACreationContainer';

interface WUAFormProps {
  preselectedWUA: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const VLCFormationTyped = VLCFormation as React.ComponentType<WUAFormProps>;
const SLCFormTyped = SLCForm as unknown as React.ComponentType<WUAFormProps>;
const AllFarmersPageTyped = AllFarmersPage as React.ComponentType<WUAFormProps>;
const MeetingTrainingTyped = MeetingTraining as React.ComponentType<WUAFormProps>;
const WuaCreationTyped = WUACreationForm as React.ComponentType<WUAFormProps>;

export default function DynamicDashboard() {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [selectedWUA, setSelectedWUA] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showWUADetails, setShowWUADetails] = useState(false);
  const [selectedWUADetails, setSelectedWUADetails] = useState<any>(null);
  
  // Use the custom hooks
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useDashboardData();
  
  const { 
    data: kpisData 
  } = useDashboardKPIs();
  
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
  const quickActions = [
    {
      id: 'vlc',
      title: 'Create VLC',
      description: 'Form Village Level Committee',
      icon: <Home className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'slc',
      title: 'Form SLC',
      description: 'Create Section Level Committee',
      icon: <Building className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'wua',
      title: 'Create WUA',
      description: 'Water Users Association',
      icon: <Home className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'farmers',
      title: 'Add Farmers',
      description: 'Registered farmers & land details',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'meetings',
      title: 'Record Meeting',
      description: 'Log training sessions & meetings',
      icon: <CalendarIcon className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    }
  ];

  // KPI Cards Data
  const kpiCards = [
    {
      title: 'Overall Progress',
      value: `${kpisData?.avg_progress || 0}%`,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Farmers',
      value: kpisData?.total_farmers?.toLocaleString() || '0',
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active WUAs',
      value: `${kpisData?.active_wuas || 0}/${kpisData?.total_wuas || 0}`,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Meetings Held',
      value: kpisData?.total_meetings || 0,
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    }
  ];

  const getWUACompletionStatus = (wua: any) => {
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
    };
  };

  const getCompletionStatus = (completion: any) => {
    if (completion.percentage === 100) {
      return {
        text: 'Completed',
        color: 'bg-green-100 text-green-800',
        progressColor: 'bg-green-500',
      };
    } else if (completion.percentage >= 75) {
      return {
        text: 'Meetings Pending',
        color: 'bg-blue-100 text-blue-800',
        progressColor: 'bg-blue-500',
      };
    } else if (completion.percentage >= 50) {
      return {
        text: 'Farmers Pending',
        color: 'bg-yellow-100 text-yellow-800',
        progressColor: 'bg-yellow-500',
      };
    } else if (completion.percentage >= 25) {
      return {
        text: 'SLC Pending',
        color: 'bg-orange-100 text-orange-800',
        progressColor: 'bg-orange-500',
      };
    } else {
      return {
        text: 'VLC Pending',
        color: 'bg-red-100 text-red-800',
        progressColor: 'bg-red-500',
      };
    }
  };

  const filteredWUAs = useMemo(() => {
    return dashboardData?.wuas?.filter((wua: { wua_name: string; division_name: string; district_name: string; }) => {
      const matchesSearch = searchTerm === '' || 
        wua.wua_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wua.division_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wua.district_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    }) || [];
  }, [dashboardData, searchTerm]);

  // Loading state
  if (dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If form is active, show only the form
  if (activeForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={handleCloseForm}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-white mb-4"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  {activeForm === 'vlc' && <Home className="w-5 h-5 text-white" />}
                  {activeForm === 'slc' && <Building className="w-5 h-5 text-white" />}
                  {activeForm === 'wua' && <Building className="w-5 h-5 text-white" />}
                  {activeForm === 'farmers' && <UsersIcon className="w-5 h-5 text-white" />}
                  {activeForm === 'meetings' && <CalendarIcon className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedAction}</h2>
                  {selectedWUA && (
                    <p className="text-gray-600 text-sm">
                      For <span className="font-semibold">{selectedWUA.wua_name}</span> in {selectedWUA.division_name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                {activeForm === 'vlc' && (
                  <VLCFormationTyped 
                    preselectedWUA={selectedWUA}
                    onSuccess={handleCloseForm}
                    onCancel={handleCloseForm}
                  />
                )}
                
                {activeForm === 'slc' && (
                  <SLCFormTyped 
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">WUA Management Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage Water Users Associations</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <div className={kpi.color}>
                      {kpi.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{kpi.value}</h3>
                    <p className="text-sm text-gray-600">{kpi.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - WUA List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">WUA List</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {filteredWUAs.length} associations
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search WUAs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm w-full sm:w-64"
                  />
                </div>
              </div>

              {/* WUA Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WUA Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWUAs.map((wua: any) => {
                      const completion = getWUACompletionStatus(wua);
                      const status = getCompletionStatus(completion);
                      
                      return (
                        <tr key={wua.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{wua.wua_name}</div>
                            <div className="text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                                {status.text}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{wua.division_name}</div>
                            <div className="text-sm text-gray-500">{wua.district_name}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${status.progressColor}`}
                                  style={{ width: `${Math.min(completion.percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{completion.percentage}%</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {completion.totalFarmers} farmers • {completion.totalMeetings} meetings
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(wua)}
                                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              {!completion.hasVLC && (
                                <button
                                  onClick={() => handleCreateVLC(wua)}
                                  className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  VLC
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredWUAs.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No WUAs Found</h3>
                    <p className="text-gray-600">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className={`w-full flex items-center p-4 rounded-lg border border-gray-200 ${action.bgColor} hover:shadow-sm transition-all duration-200`}
                  >
                    <div className={`p-2 rounded ${action.color} bg-white`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 text-left ml-4">
                      <h3 className="font-semibold text-gray-800">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Completion Rate</span>
                    <span className="text-sm font-bold text-green-600">{kpisData?.avg_progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${kpisData?.avg_progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{kpisData?.total_wuas || 0}</div>
                    <div className="text-sm text-gray-600">Total WUAs</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{kpisData?.active_wuas || 0}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                </div>
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{wua.wua_name}</h2>
              <p className="text-gray-600 text-sm">
                {wua.division_name} • {wua.district_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Progress Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Activation Progress</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.text}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">{completion.percentage}% complete</span>
              <span className="text-sm font-semibold text-gray-800">{completion.completedSteps}/4 steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${status.progressColor}`}
                style={{ width: `${Math.min(completion.percentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 gap-4">
            <StepCard
              title="VLC Formation"
              completed={completion.hasVLC}
              description="Village Level Committee"
              onAction={onCreateVLC}
              actionLabel={completion.hasVLC ? "Update" : "Create"}
            />
            
            <StepCard
              title="SLC Formation"
              completed={completion.hasSLC}
              description="Section Level Committee"
              onAction={onCreateSLC}
              actionLabel={completion.hasSLC ? "Update" : "Create"}
            />
            
            <StepCard
              title="Farmers Data"
              completed={completion.hasFarmers}
              description="Land holding details"
              onAction={onAddFarmers}
              actionLabel={completion.hasFarmers ? "Manage" : "Add"}
            />
            
            <StepCard
              title="Meetings & Training"
              completed={completion.hasMeetings}
              description="Training sessions"
              onAction={onAddMeetings}
              actionLabel={completion.hasMeetings ? "View" : "Add"}
            />
          </div>

          {/* Statistics */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-bold text-gray-800">{completion.totalFarmers}</div>
                  <div className="text-sm text-gray-600">Farmers</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-bold text-gray-800">{completion.totalMeetings}</div>
                  <div className="text-sm text-gray-600">Meetings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Details</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">WUA Code:</span>
                <span className="text-sm font-medium">{wua.wua_code || 'Not assigned'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm font-medium">{wua.division_name}, {wua.district_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
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
  onAction, 
  actionLabel 
}: { 
  title: string;
  completed: boolean;
  description: string;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div className={`border rounded-lg p-4 ${completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        {completed ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            ✓ Complete
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
            Pending
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <button
        onClick={onAction}
        className={`w-full py-2 text-sm font-medium rounded transition-colors ${
          completed 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}