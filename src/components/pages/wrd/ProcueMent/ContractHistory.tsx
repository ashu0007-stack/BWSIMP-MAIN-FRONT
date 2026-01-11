import React from 'react';
import { History, User, Calendar, FileText, RefreshCw, X } from 'lucide-react';
import { useContractHistory } from '@/hooks/wrdHooks/useContractHistory';
import DetailedView from './DetailedView'; 

interface ContractHistoryProps {
  contractId: string | number | null;
  isOpen: boolean;
  onClose: () => void;
}
const DateDisplay = ({ dateString, format = 'DD-MM-YYYY' }: { dateString: string, format?: string }) => {
  if (!dateString) return <span className="text-gray-400">N/A</span>;

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return <span className="text-red-500">Invalid Date</span>;
    }

    if (format === 'YYYY-MM-DD') {
      return <span>{date.toISOString().split('T')[0]}</span>;
    } else {
      // DD-MM-YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return <span>{`${day}-${month}-${year}`}</span>;
    }
  } catch (error) {
    return <span className="text-gray-400">Format Error</span>;
  }
};

const ContractHistory: React.FC<ContractHistoryProps> = ({ contractId, isOpen, onClose }) => {
  const { data: history = [], isLoading, error, refetch } = useContractHistory(contractId);
  
  // State for detailed view
  const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
  const [showDetailedView, setShowDetailedView] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && contractId) {
      refetch();
    }
  }, [isOpen, contractId, refetch]);

  // Calculate summary counts
  const summaryCounts = React.useMemo(() => {
    if (!history || history.length === 0) return { created: 0, updated: 0 };
    
    return {
      created: history.filter(h => h.action_type === 'CREATE').length,
      updated: history.filter(h => h.action_type === 'UPDATE').length
    };
  }, [history]);

  // Handle view details
  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setShowDetailedView(true);
  };

  // Close detailed view
  const handleCloseDetailedView = () => {
    setShowDetailedView(false);
    setSelectedRecord(null);
  };

  if (!isOpen) return null;

  // Format the change summary
  const formatChangeSummary = (changedFields: any[] = []): string => {
    if (!changedFields || changedFields.length === 0) return 'No specific fields recorded';
    
    try {
      const fieldNames = changedFields.map((field: any) => {
        if (!field) return '';
        
        if (typeof field === 'object') {
          const key = Object.keys(field)[0];
          if (key) {
            return key.replace(/_/g, ' ')
                     .replace(/\b\w/g, (l: string) => l.toUpperCase());
          }
          return JSON.stringify(field);
        }
        
        return String(field).replace(/_/g, ' ')
                           .replace(/\b\w/g, (l: string) => l.toUpperCase());
      })
      .filter(Boolean);
      
      return fieldNames.join(', ') || 'Multiple fields';
    } catch (err) {
      console.error('Error formatting changed fields:', err);
      return 'Changed fields';
    }
  };

  // Get icon based on action type
  const getActionIcon = (actionType: string) => {
    switch (actionType?.toUpperCase()) {
      case 'CREATE':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'UPDATE':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      default:
        return <History className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get action color
  const getActionColor = (actionType: string) => {
    switch (actionType?.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-50 border-green-200';
      case 'UPDATE':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Get action badge color
  const getActionBadgeColor = (actionType: string) => {
    switch (actionType?.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <History className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Contract History</h2>
                    <p className="text-sm text-gray-600">
                      Track all changes made to this contract
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading history...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Failed to load history</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : !history || history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No history available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {history.map((record, index) => (
                      <div key={record.id || index} className="relative flex items-start gap-4 mb-8">
                        {/* Timeline dot */}
                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${getActionColor(record.action_type)} 
                          border-2 flex items-center justify-center`}>
                          {getActionIcon(record.action_type)}
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white border rounded-full text-xs 
                            flex items-center justify-center font-bold">
                            {record.revision_number || index + 1}
                          </span>
                        </div>

                        {/* Content */}
                        <div className={`flex-1 p-4 rounded-xl ${getActionColor(record.action_type)} border`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(record.action_type)}`}>
                                {record.action_type || 'MODIFIED'}
                              </span>
                              <span className="text-sm text-gray-600">
                                Revision {record.revision_number || index + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span title={record.change_timestamp}>
                                {record.formatted_date || record.formatted_date || 'No date'}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {record.description || `${record.action_type || 'Modified'} by ${record.changed_by || 'Unknown'}`}
                            </h4>
                            {record.changed_fields && record.changed_fields.length > 0 && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Changed fields:</span>{' '}
                                {formatChangeSummary(record.changed_fields)}
                              </p>
                            )}
                          </div>

                          {/* <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-gray-100 rounded">
                                <User className="w-3 h-3 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-700">{record.changed_by || 'Unknown User'}</p>
                                {record.changed_by_email && (
                                  <p className="text-gray-500 text-xs">
                                    {record.changed_by_email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div> */}

                          {/* View Details Button - UPDATED */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              View detailed changes
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">History Summary</h4>
                        <p className="text-sm text-gray-600">
                          {history.length} change{history.length !== 1 ? 's' : ''} recorded
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">
                            {summaryCounts.created} Created
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">
                            {summaryCounts.updated} Updated
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View Modal */}
      <DetailedView
        record={selectedRecord}
        isOpen={showDetailedView}
        onClose={handleCloseDetailedView}
      />
    </>
  );
};

export default ContractHistory;