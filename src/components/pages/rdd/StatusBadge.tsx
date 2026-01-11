// components/StatusBadge.tsx
'use client';

import React, { useState } from "react";
import { RefreshCw, ThumbsUp, PlayCircle, CheckCircle, PauseCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  onStatusUpdate?: (id: number, newStatus: 'Approved' | 'Ongoing' | 'complete' | 'Suspended') => void;
  entryId?: number;
  isUpdating?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  onStatusUpdate,
  entryId,
  isUpdating 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getStatusConfig = (status: string) => {
    const config = {
      Approved: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'Approved',
        icon: ThumbsUp,
        nextStatus: 'Ongoing' as const
      },
      Ongoing: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        label: 'Ongoing',
        icon: PlayCircle,
        nextStatus: 'complete' as const
      },
      complete: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Complete',
        icon: CheckCircle,
        nextStatus: 'Approved' as const
      },
      Suspended: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Suspended',
        icon: PauseCircle,
        nextStatus: 'Ongoing' as const
      }
    };
    
    return config[status as keyof typeof config] || config.Approved;
  };

  const { color, label, icon: Icon, nextStatus } = getStatusConfig(status);

  const getNextStatusLabel = (currentStatus: string) => {
    const statusMap: Record<string, string> = {
      Approved: 'Start Work',
      Ongoing: 'Mark as Complete',
      complete: 'Reopen as Approved',
      Suspended: 'Resume Work'
    };

    return statusMap[currentStatus] || 'Update Status';
  };

  const handleStatusUpdate = (newStatus: 'Approved' | 'Ongoing' | 'complete' | 'Suspended') => {
    if (onStatusUpdate && entryId) {
      onStatusUpdate(entryId, newStatus);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      {onStatusUpdate && entryId ? (
        <>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isUpdating}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} hover:opacity-80 transition-all duration-200 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUpdating ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Icon className="w-3 h-3 mr-1" />
            )}
            {isUpdating ? 'Updating...' : label}
          </button>

          {showDropdown && (
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Update Status:</div>
                
                <button
                  onClick={() => handleStatusUpdate(nextStatus)}
                  className="w-full text-left px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 mb-1 flex items-center"
                >
                  <PlayCircle className="w-3 h-3 mr-2" />
                  {getNextStatusLabel(status)}
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                {['Approved', 'Ongoing', 'complete', 'Suspended'].map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => handleStatusUpdate(statusOption as any)}
                    className={`w-full text-left px-3 py-1 text-xs rounded-md hover:bg-gray-50 mb-1 flex items-center ${
                      status === statusOption ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    {(() => {
                      const { icon: StatusIcon } = getStatusConfig(statusOption);
                      return <StatusIcon className="w-3 h-3 mr-2" />;
                    })()}
                    {getStatusConfig(statusOption).label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
          <Icon className="w-3 h-3 mr-1" />
          {label}
        </span>
      )}
    </div>
  );
};