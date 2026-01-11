'use client';
import React from "react";
import { FileText, Edit, History, Box } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { DataEntry } from "../rdd/types/index";

interface DataTableProps {
  data: DataEntry[];
  onStatusUpdate: (entryId: number, newStatus: 'Approved' | 'Ongoing' | 'complete' | 'Suspended') => void;
  onEditRecord: (entryId: number) => void;
  onViewLogs: (entryId: number) => void;
  updatingEntryId: number | null;
  hasActiveFilters: boolean;
  formatDate: (dateStr?: string | null) => string;
  formatCurrency: (amount: number | null) => string;
  formatArea: (area?: number | null) => string;
  userLevel?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  onStatusUpdate,
  onEditRecord,
  onViewLogs,
  updatingEntryId,
  hasActiveFilters,
  formatDate,
  formatCurrency,
  formatArea,
  userLevel = "", // Default to empty string
}) => {
  // Calculate volume function
  const calculateVolume = (entry: DataEntry) => {
    const length = Number(entry.prop_length) || 0;
    const width = Number(entry.prop_width) || 0;
    const height = Number(entry.prop_height) || 0;
    
    if (length > 0 && width > 0 && height > 0) {
      return length * width * height;
    }
    return 0;
  };

  const formatNumber = (num: number | null) => {
    if (!num) return "—";
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatVolume = (volume: number) => {
    if (!volume) return "—";
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(volume);
  };

  // Determine if logs should be hidden based on user level
  const shouldHideLogs = userLevel === "District";
  
  // ✅ Generate a unique key for each row
  const generateUniqueKey = (entry: DataEntry, index: number) => {
    // Use combination of ID and index to ensure uniqueness
    return `${entry.id}-${index}-${Date.now()}`;
  };
  
  // ✅ Deduplicate data within the component as a safety measure
  const uniqueData = React.useMemo(() => {
    const seen = new Set<number>();
    return data.filter(entry => {
      if (seen.has(entry.id)) {
        console.warn(`Filtering duplicate entry with ID: ${entry.id}`);
        return false;
      }
      seen.add(entry.id);
      return true;
    });
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">District</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Block</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Panchayat</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Work Code</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Work Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Agency</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Area (ha)</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Status</th>
              <th 
                className="px-4 py-3 text-center font-semibold text-gray-700 border-b bg-gray-100" 
                colSpan={3}
              >
                Sanction Amount
              </th>
              <th 
                className="px-4 py-3 text-center font-semibold text-gray-700 border-b bg-gray-100" 
                colSpan={4}
              >
                Proposed Dimensions
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Start Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">End Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Actions</th>
            </tr>
            <tr>
              <th colSpan={11} className="border-b"></th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 border-b bg-gray-50">Wages</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 border-b bg-gray-50">Material</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 border-b bg-gray-50">Total</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 border-b bg-gray-50">Length (m)</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 border-b bg-gray-50">Width (m)</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 border-b bg-gray-50">Height (m)</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 border-b bg-gray-50">Volume (m³)</th>
              <th colSpan={3} className="border-b"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {uniqueData.map((entry, index) => {
              const wages = Number(entry.sanction_amt_wages) || 0;
              const material = Number(entry.sanction_amt_material) || 0;
              const total = wages + material;
              const isComplete = entry.status === 'complete';
              const isSuspended = entry.status === 'Suspended';
              const volume = calculateVolume(entry);
              const hasValidDimensions = entry.prop_length && entry.prop_width && entry.prop_height;
              
              return (
                <tr key={generateUniqueKey(entry, index)} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{formatDate(entry.dated_at || entry.created_at)}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{entry.district_name || entry.district || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.block_name || entry.block || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.panchayat_name || entry.panchayat || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 font-mono">{entry.work_code || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 max-w-xs">
                    <div className="line-clamp-2" title={entry.work_name || ''}>
                      {entry.work_name || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{entry.work_category_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.work_type_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.agency || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-right">{formatArea(entry.command_area)}</td>
                  <td className="px-4 py-3">
                    {/* Status Badge - Hide when status is complete */}
                    {!isComplete && (
                      <StatusBadge 
                        status={entry.status || 'Approved'} 
                        onStatusUpdate={onStatusUpdate}
                        entryId={entry.id}
                        isUpdating={updatingEntryId === entry.id}
                      />
                    )}
                    {/* Show static status text when complete */}
                    {isComplete && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Complete
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right bg-blue-50">{formatCurrency(wages)}</td>
                  <td className="px-4 py-3 text-gray-600 text-right bg-blue-50">{formatCurrency(material)}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold text-right bg-blue-100">{formatCurrency(total)}</td>
                  
                  {/* Proposed Dimensions Columns */}
                  <td className="px-4 py-3 text-gray-600 text-right bg-purple-50">
                    {formatNumber(Number(entry.prop_length))}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right bg-purple-50">
                    {formatNumber(Number(entry.prop_width))}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-right bg-purple-50">
                    {formatNumber(Number(entry.prop_height))}
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-semibold text-right bg-purple-100">
                    <div className="flex items-center justify-end gap-1">
                      {hasValidDimensions ? (
                        <>
                          <Box size={14} className="text-purple-600" />
                          <span>{formatVolume(volume)}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-gray-600">{formatDate(entry.work_start_date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(entry.work_completion_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {/* View Logs Button - Conditionally show based on user level */}
                      {!shouldHideLogs && (
                        <button
                          onClick={() => onViewLogs(entry.id)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="View Work Logs History"
                        >
                          <History size={14} />
                        </button>
                      )}

                      {/* Show disabled logs icon for District level users */}
                      {shouldHideLogs && (
                        <button
                          disabled
                          className="p-1 text-gray-400 cursor-not-allowed rounded"
                          title="Work logs not accessible at District level"
                        >
                          <History size={14} />
                        </button>
                      )}

                      {/* Edit Button - Hidden when status is complete OR suspended */}
                      {!isComplete && !isSuspended && (
                        <button
                          onClick={() => onEditRecord(entry.id)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Record"
                        >
                          <Edit size={14} />
                        </button>
                      )}

                      {/* Show disabled edit icon for complete/suspended entries */}
                      {(isComplete || isSuspended) && (
                        <button
                          disabled
                          className="p-1 text-gray-400 cursor-not-allowed rounded"
                          title={isComplete ? "Editing disabled for completed entries" : "Editing disabled for suspended entries"}
                        >
                          <Edit size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {uniqueData.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasActiveFilters ? "No matching records found" : "No data entries available"}
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters 
                ? "Try adjusting your filters or clear them to see all data" 
                : "Data entries will appear here once created"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};