import React from 'react';
import { X, FileDiff, ArrowRight, User, Calendar, History } from 'lucide-react';

interface DetailedViewProps {
  record: any;
  isOpen: boolean;
  onClose: () => void;
}

const DetailedView: React.FC<DetailedViewProps> = ({ record, isOpen, onClose }) => {
  if (!isOpen || !record) return null;

  // Parse changed_fields if it's a string
  const parseChangedFields = () => {
    if (!record.changed_fields) return {};
    
    try {
      if (typeof record.changed_fields === 'string') {
        return JSON.parse(record.changed_fields);
      }
      return record.changed_fields;
    } catch (e) {
      return {};
    }
  };

  const changedFields = parseChangedFields();
  const fieldKeys = Object.keys(changedFields);

  // Parse old_data and new_data
  const parseData = (data: any) => {
    if (!data) return {};
    
    try {
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return data;
    } catch (e) {
      return {};
    }
  };

  const oldData = parseData(record.old_data);
  const newData = parseData(record.new_data);

  // Format field name for display
  const formatFieldName = (fieldName: string) => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  // Format value for display
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileDiff className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Detailed Changes</h2>
                  <p className="text-sm text-gray-600">
                    Revision {record.revision_number} - {record.action_type}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left: Record Info */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Record Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Record ID</p>
                      <p className="font-medium">{record.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contract ID</p>
                      <p className="font-medium">{record.contract_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Action Type</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.action_type === 'CREATE' ? 'bg-green-100 text-green-800' :
                        record.action_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.action_type}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revision Number</p>
                      <p className="font-medium">{record.revision_number}</p>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Changed By
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">User</p>
                      <p className="font-medium">{record.changed_by || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-sm">{record.changed_by_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{record.changed_by_role || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timestamp
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{record.display_date || record.formatted_date || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Raw Timestamp</p>
                      <p className="font-mono text-xs text-gray-600">{record.change_timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Changes Comparison */}
              <div className="lg:col-span-2">
                <div className="bg-white border rounded-xl overflow-hidden">
                  {/* Header */}
                  {/* <div className="bg-gray-50 border-b px-6 py-3">
                    <h3 className="font-semibold text-gray-800">Field Changes Comparison</h3>
                    <p className="text-sm text-gray-600">
                      {fieldKeys.length} field{fieldKeys.length !== 1 ? 's' : ''} changed
                    </p>
                  </div> */}

                  {/* Changes List */}
                  <div className="divide-y">
                    {fieldKeys.length > 0 ? (
                      fieldKeys.map((fieldName, index) => {
                        const fieldChange = changedFields[fieldName];
                        const oldValue = fieldChange?.old;
                        const newValue = fieldChange?.new;
                        
                        return (
                          <div key={fieldName} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">
                                {formatFieldName(fieldName)}
                              </h4>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                Changed
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Old Value */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-red-50">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-red-700">Previous Value</span>
                                </div>
                                <div className="min-h-[60px] p-2 bg-white rounded border">
                                  <p className="text-sm font-mono break-words">
                                    {formatValue(oldValue)}
                                  </p>
                                </div>
                              </div>

                              {/* Arrow */}
                              <div className="flex items-center justify-center">
                                <ArrowRight className="w-5 h-5 text-blue-500" />
                              </div>

                              {/* New Value */}
                              <div className="border border-gray-200 rounded-lg p-3 bg-green-50">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-green-700">New Value</span>
                                </div>
                                <div className="min-h-[60px] p-2 bg-white rounded border">
                                  <p className="text-sm font-mono break-words">
                                    {formatValue(newValue)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div>Modified Details Below
                        {/* <FileDiff className="w-12 h-12 text-gray-300 mx-auto mb-4" /> */}
                        {/* <p className="text-gray-500">No detailed change information available</p> */}
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw Data Tabs */}
                <div className="mt-6">
                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-gray-50 border-b">
                      <div className="flex border-b">
                        <button
                          className={`px-4 py-3 text-sm font-medium ${
                            oldData && Object.keys(oldData).length > 0
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500'
                          }`}
                        >
                          Old Data (Raw)
                        </button>
                        <button
                          className={`px-4 py-3 text-sm font-medium ${
                            newData && Object.keys(newData).length > 0
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500'
                          }`}
                        >
                          New Data (Raw)
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Old Data */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Old Data</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm font-mono whitespace-pre-wrap">
                              {JSON.stringify(oldData, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {/* New Data */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">New Data</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm font-mono whitespace-pre-wrap">
                              {JSON.stringify(newData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Record ID: {record.id} • Contract ID: {record.contract_id}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('Export record:', record);
                    // You can add export functionality here
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition text-sm"
                >
                  Export JSON
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedView;