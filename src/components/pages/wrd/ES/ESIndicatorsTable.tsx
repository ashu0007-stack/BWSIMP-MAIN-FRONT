import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, Eye, Edit, Download } from "lucide-react";
import { 
  useSocialIndicators, 
  useSocialData, 
  useSubmitSocialData,
  useEnvironmentalIndicators,
  useEnvironmentalData, 
  useSubmitEnvironmentalData 
} from "@/hooks/wrdHooks/ES/useESReports";

interface Indicator {
  id: number;
  indicator_code: string;
  indicator_name: string;
  category: string;
  frequency: string;
  unit: string;
  standard_value?: string;
  sampling_points: number;
  indicator_type?: 'environmental' | 'social';
  latest_value?: string;
  latest_date?: string;
  status?: string;
  monitoring_data?: Array<{
    date: string;
    value: string;
    status: string;
  }>;
}

interface ESIndicatorsTableProps {
  type: 'environmental' | 'social';
  id: number; 
}

export default function ESIndicatorsTable({ type, id }: ESIndicatorsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  
  // ✅ Type के अनुसार अलग hooks use करें
  const { 
    data: socialIndicatorsResponse, 
    isLoading: socialLoading, 
    error: socialError, 
    refetch: socialRefetch 
  } = useSocialIndicators();
  
  const { 
    data: environmentalIndicatorsResponse, 
    isLoading: environmentalLoading, 
    error: environmentalError, 
    refetch: environmentalRefetch 
  } = useEnvironmentalIndicators();
  
  // ✅ Type के अनुसार सही response select करें
  const indicatorsResponse = type === 'social' ? socialIndicatorsResponse : environmentalIndicatorsResponse;
  const isLoading = type === 'social' ? socialLoading : environmentalLoading;
  const error = type === 'social' ? socialError : environmentalError;
  const refetch = type === 'social' ? socialRefetch : environmentalRefetch;
  
  // ✅ Handle different response structures
  let indicatorsData: any[] = [];
  
  if (indicatorsResponse) {
    if (Array.isArray(indicatorsResponse)) {
      indicatorsData = indicatorsResponse;
    } else if (indicatorsResponse.data && Array.isArray(indicatorsResponse.data)) {
      indicatorsData = indicatorsResponse.data;
    } else if (indicatorsResponse.indicators && Array.isArray(indicatorsResponse.indicators)) {
      indicatorsData = indicatorsResponse.indicators;
    } else if (indicatorsResponse.results && Array.isArray(indicatorsResponse.results)) {
      indicatorsData = indicatorsResponse.results;
    }
  }

  // ✅ Type के अनुसार monitoring data hooks - id pass करें
  const { data: socialMonitoringResponse } = useSocialData(id);
  const { data: environmentalMonitoringResponse } = useEnvironmentalData(id);
  
  const monitoringResponse = type === 'social' ? socialMonitoringResponse : environmentalMonitoringResponse;
  
  // ✅ Type के अनुसार submit hooks
  const socialSubmitMutation = useSubmitSocialData();
  const environmentalSubmitMutation = useSubmitEnvironmentalData();
  const submitMutation = type === 'social' ? socialSubmitMutation : environmentalSubmitMutation;
  
  // ✅ Process monitoring data
  let monitoringData: any[] = [];
  if (monitoringResponse) {
    if (Array.isArray(monitoringResponse)) {
      monitoringData = monitoringResponse;
    } else if (monitoringResponse.data && Array.isArray(monitoringResponse.data)) {
      monitoringData = monitoringResponse.data;
    }
  }

  // ✅ Simple map without filtering by indicator_type
  const indicators: Indicator[] = indicatorsData.map((item: any): Indicator => ({
    id: item.id || 0,
    indicator_code: item.indicator_code || item.code || '',
    indicator_name: item.indicator_name || item.name || '',
    category: item.category || 'other',
    frequency: item.frequency || 'monthly',
    unit: item.unit || '',
    standard_value: item.standard_value || item.standard || '',
    sampling_points: item.sampling_points || item.samples || 1,
    // Type के अनुसार set करें
    indicator_type: type,
    latest_value: item.latest_value || item.value || '',
    latest_date: item.latest_date || item.last_monitored || '',
    status: item.status || item.current_status || 'Active',
    monitoring_data: item.monitoring_data || []
  }));
  
  const categories = Array.from(new Set(indicators.map(i => i.category))).filter(Boolean);
  
  const filteredIndicators = indicators.filter(indicator =>
    (selectedCategory === '' || indicator.category === selectedCategory) &&
    (searchTerm === '' || 
      indicator.indicator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.indicator_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      water: 'bg-blue-100 text-blue-800',
      soil: 'bg-yellow-100 text-yellow-800',
      air: 'bg-green-100 text-green-800',
      noise: 'bg-purple-100 text-purple-800',
      waste: 'bg-red-100 text-red-800',
      labour: 'bg-orange-100 text-orange-800',
      training: 'bg-indigo-100 text-indigo-800',
      grievance: 'bg-pink-100 text-pink-800',
      facility: 'bg-teal-100 text-teal-800',
      safety: 'bg-red-100 text-red-800',
      document: 'bg-gray-100 text-gray-800',
      health: 'bg-pink-100 text-pink-800',
      'labour camp': 'bg-orange-100 text-orange-800',
      sanitation: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-purple-100 text-purple-800',
      quarterly: 'bg-orange-100 text-orange-800',
      half_yearly: 'bg-red-100 text-red-800',
      yearly: 'bg-pink-100 text-pink-800',
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  const getLatestValue = (indicator: Indicator) => {
    // First check if indicator has latest_value property
    if (indicator.latest_value && indicator.latest_date) {
      return {
        value: indicator.latest_value,
        date: indicator.latest_date,
        status: indicator.status || 'not_monitored'
      };
    }
    
    // If not, find from monitoring data for this indicator
    const indicatorMonitoring = monitoringData.filter(
      (item: any) => item.indicator_id === indicator.id
    );
    
    if (indicatorMonitoring.length > 0) {
      const sorted = [...indicatorMonitoring].sort(
        (a, b) => new Date(b.date || b.monitoring_date).getTime() - 
                  new Date(a.date || a.monitoring_date).getTime()
      );
      return {
        value: sorted[0].value || sorted[0].monitored_value,
        date: sorted[0].date || sorted[0].monitoring_date,
        status: sorted[0].status || 'not_monitored'
      };
    }
    
    return null;
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return <Minus className="w-4 h-4 text-gray-400" />;
    
    switch(status.toLowerCase()) {
      case 'within_limit':
      case 'complied':
      case 'normal':
      case 'good':
      case 'satisfactory':
      case 'completed':
      case 'active':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'exceeded':
      case 'not_complied':
      case 'critical':
      case 'poor':
      case 'unsatisfactory':
      case 'pending':
      case 'inactive':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleAddData = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setShowAddDataModal(true);
  };

  const handleSubmitData = (data: any) => {
    if (!selectedIndicator) return;
    
    // ✅ FIX: Correct submission data structure
    const submissionData = {
      project_id: id, // यहाँ id (project_id) use करें
      indicator_id: selectedIndicator.id,
      indicator_code: selectedIndicator.indicator_code,
      indicator_name: selectedIndicator.indicator_name,
      ...data
    };
    
    submitMutation.mutate(submissionData, {
      onSuccess: () => {
        setShowAddDataModal(false);
        setSelectedIndicator(null);
        refetch();
      },
      onError: (error: any) => {
        console.error('Error submitting data:', error);
        alert('Failed to submit data. Please try again.');
      }
    });
  };

  const handleExport = () => {
    const csvData = filteredIndicators.map(indicator => {
      const latest = getLatestValue(indicator);
      return {
        'Indicator Code': indicator.indicator_code,
        'Indicator Name': indicator.indicator_name,
        'Category': indicator.category,
        'Frequency': indicator.frequency,
        'Unit': indicator.unit,
        'Standard Value': indicator.standard_value || 'N/A',
        'Latest Value': latest?.value || 'No data',
        'Status': latest?.status || 'not_monitored',
        'Last Monitored': latest?.date || 'N/A',
        'Sampling Points': indicator.sampling_points
      };
    });

    const csv = convertToCSV(csvData);
    downloadCSV(csv, `${type}_indicators_${id}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600">Loading {type} indicators...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingDown className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Loading Data</h3>
        <p className="text-gray-500 mb-6">Failed to load {type} indicators. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {type === 'environmental' ? 'Environmental' : 'Social'} Monitoring Indicators
          </h2>
          <p className="text-gray-600">Track and monitor {type} compliance parameters</p>
          <div className="text-sm text-gray-500 mt-1">
            Showing {filteredIndicators.length} of {indicators.length} indicators
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={filteredIndicators.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${type} indicators...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded pl-10 pr-3 py-2"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          {categories.length > 0 && (
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Category Quick Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Indicators Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Indicator Code</th>
                <th className="p-3 text-left">Indicator Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Frequency</th>
                <th className="p-3 text-left">Latest Value</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredIndicators.map((indicator) => {
                const latest = getLatestValue(indicator);
                
                return (
                  <tr key={indicator.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-semibold">
                      {indicator.indicator_code || 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{indicator.indicator_name}</div>
                      {indicator.standard_value && (
                        <div className="text-sm text-gray-500">
                          Std: {indicator.standard_value}
                        </div>
                      )}
                      {indicator.unit && indicator.unit !== 'N/A' && (
                        <div className="text-xs text-gray-500">
                          Unit: {indicator.unit}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(indicator.category)}`}>
                        {indicator.category || 'other'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getFrequencyColor(indicator.frequency)}`}>
                        {indicator.frequency}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {indicator.sampling_points || 1} sample(s)
                      </div>
                    </td>
                    <td className="p-3">
                      {latest ? (
                        <div>
                          <div className="font-medium">{latest.value}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(latest.date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No monitoring data</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(latest?.status || indicator.status)}
                        <span className={`text-sm ${
                          latest?.status === 'within_limit' || 
                          latest?.status === 'complied' || 
                          latest?.status === 'normal' || 
                          latest?.status === 'good' ||
                          latest?.status === 'satisfactory' ||
                          indicator.status === 'within_limit' ||
                          indicator.status === 'complied'
                            ? 'text-green-600' 
                            : latest?.status === 'exceeded' || 
                              latest?.status === 'not_complied' || 
                              latest?.status === 'critical' || 
                              latest?.status === 'poor' ||
                              latest?.status === 'unsatisfactory' ||
                              indicator.status === 'exceeded' ||
                              indicator.status === 'not_complied'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}>
                          {latest?.status 
                            ? latest.status.replace('_', ' ').replace('-', ' ')
                            : indicator.status
                              ? indicator.status.replace('_', ' ').replace('-', ' ')
                              : 'Not monitored'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedIndicator(indicator)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddData(indicator)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                          title="Add Monitoring Data"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredIndicators.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Indicators Found</h3>
                    <p className="text-gray-500">
                      {indicators.length === 0 
                        ? `No ${type} indicators configured yet.` 
                        : 'No indicators match your search criteria.'
                      }
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {filteredIndicators.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold">{filteredIndicators.length}</div>
            <div className="text-sm text-gray-600">Total Indicators</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {filteredIndicators.filter(indicator => {
                const latest = getLatestValue(indicator);
                return latest?.status === 'within_limit' || 
                       latest?.status === 'complied' || 
                       latest?.status === 'normal' || 
                       latest?.status === 'good' ||
                       latest?.status === 'satisfactory' ||
                       indicator.status === 'within_limit' ||
                       indicator.status === 'complied';
              }).length}
            </div>
            <div className="text-sm text-gray-600">Within Limits</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold">
              {new Set(filteredIndicators.map(i => i.category)).size}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold">
              {filteredIndicators.filter(i => 
                i.frequency === 'monthly' || 
                i.frequency === 'quarterly' || 
                i.frequency === 'half_yearly' ||
                i.frequency === 'yearly'
              ).length}
            </div>
            <div className="text-sm text-gray-600">Periodic Monitoring</div>
          </div>
        </div>
      )}

      {/* Indicator Detail Modal */}
      {selectedIndicator && !showAddDataModal && (
        <IndicatorDetailModal
          indicator={selectedIndicator}
          monitoringData={monitoringData}
          onClose={() => setSelectedIndicator(null)}
          onAddData={() => setShowAddDataModal(true)}
        />
      )}

      {/* Add Data Modal */}
      {showAddDataModal && selectedIndicator && (
        <AddDataModal
          indicator={selectedIndicator}
          onClose={() => {
            setShowAddDataModal(false);
            setSelectedIndicator(null);
          }}
          onSubmit={handleSubmitData}
          isLoading={submitMutation.isPending}
        />
      )}
    </div>
  );
}

// Indicator Detail Modal Component
function IndicatorDetailModal({ 
  indicator, 
  monitoringData = [], 
  onClose, 
  onAddData 
}: { 
  indicator: Indicator; 
  monitoringData?: any[];
  onClose: () => void;
  onAddData: () => void;
}) {
  const monitoringHistory = monitoringData || indicator.monitoring_data || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold">{indicator.indicator_name}</h3>
              <div className="text-gray-600">{indicator.indicator_code}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-700">Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{indicator.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Monitoring Frequency:</span>
                    <span className="font-medium">{indicator.frequency}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Unit of Measurement:</span>
                    <span className="font-medium">{indicator.unit}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Sampling Points:</span>
                    <span className="font-medium">{indicator.sampling_points || 1}</span>
                  </div>
                  {indicator.standard_value && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Standard/Reference:</span>
                      <span className="font-medium text-blue-600">{indicator.standard_value}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monitoring History */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Monitoring History</h4>
                <span className="text-sm text-gray-500">
                  {monitoringHistory.length} records
                </span>
              </div>
              
              {monitoringHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="mb-2">📊</div>
                  <p>No monitoring data available</p>
                  <p className="text-sm mt-1">Start monitoring to see data here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto p-1">
                  {monitoringHistory.map((record, index) => (
                    <div key={index} className="border rounded p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{record.value || record.monitored_value}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.status === 'within_limit' || 
                          record.status === 'complied' || 
                          record.status === 'normal' || 
                          record.status === 'good' ||
                          record.status === 'satisfactory'
                            ? 'bg-green-100 text-green-800' 
                            : record.status === 'exceeded' || 
                              record.status === 'not_complied' || 
                              record.status === 'critical' || 
                              record.status === 'poor' ||
                              record.status === 'unsatisfactory'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.date || record.monitoring_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      {record.remarks && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          {record.remarks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={onAddData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Monitoring Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Data Modal Component
function AddDataModal({ 
  indicator, 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  indicator: Indicator; 
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    monitoring_date: new Date().toISOString().split('T')[0],
    value: '',
    status: 'within_limit',
    remarks: ''
  });

  const handleSubmit = () => {
    if (!formData.value.trim()) {
      alert('Please enter a value');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold">Add Monitoring Data</h3>
              <div className="text-gray-600">{indicator.indicator_name}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monitoring Date</label>
              <input
                type="date"
                value={formData.monitoring_date}
                onChange={(e) => setFormData({...formData, monitoring_date: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Value ({indicator.unit})
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder={`Enter value in ${indicator.unit}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="within_limit">Within Limit</option>
                <option value="exceeded">Exceeded</option>
                <option value="complied">Complied</option>
                <option value="not_complied">Not Complied</option>
                <option value="normal">Normal</option>
                <option value="critical">Critical</option>
                <option value="good">Good</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Data'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function convertToCSV(data: any[]) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}