"use client";

import React, { useMemo, useState } from "react";
import { 
    MapPin, 
    CheckCircle, 
    AlertCircle, 
    Clock,
    Eye,
    X 
} from "lucide-react";

interface SpurData {
    id: number;
    spur_id: number;
    spur_name: string;
    location_km: number;
    spur_length: number;
    is_new: string;
    status: string;
    progress_date: string | null;
    last_updated_by: string | null;
    last_updated_at: string | null;
    remarks: string | null;
}

interface SpurHistory {
    id: number;
    spur_name: string;
    location_km: number;
    spur_length_km: number;
    progress_date: string;
    formatted_date: string;
    status: string;
    created_by: string;
}

interface SpurProgressProps {
    spurs: SpurData[];
    history?: SpurHistory[];
    packageNumber: string;
    workName: string;
    work_start_range?: number;
    work_end_range?: number;
    targetKm?: number;
}

const SpurProgressComponent: React.FC<SpurProgressProps> = ({ 
    spurs, 
    history = [],
    packageNumber, 
    workName,
    work_start_range = 0,
    work_end_range   = 0,
    targetKm = 0
}) => {
    
    const [selectedSpur, setSelectedSpur] = useState<SpurData | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    // ========== HELPER FUNCTIONS FOR SAFE NUMBER FORMATTING ==========
    const safeToFixed = (value: any, decimals: number = 2): string => {
        // Agar value null ya undefined hai to dash return karo
        if (value === null || value === undefined) return '-';
        
        // Number me convert karo
        const num = Number(value);
        
        // Agar valid number nahi hai to dash return karo
        if (isNaN(num)) return '-';
        
        // Ab safely toFixed laga sakte ho
        return num.toFixed(decimals);
    };

    const formatLength = (length: any): string => {
        return safeToFixed(length, 2);
    };

    const formatLocation = (location: any): string => {
        return safeToFixed(location, 2);
    };
    // ================================================================

    // Calculate statistics
    const stats = useMemo(() => {
        const completed = spurs.filter(s => s.status === 'completed').length;
        const inProgress = spurs.filter(s => s.status === 'in-progress').length;
        const notStarted = spurs.filter(s => s.status === 'not-started').length;
        
        const totalLength = spurs.reduce((sum, spur) => sum + (Number(spur.spur_length) || 0), 0);
        const completedLength = spurs
            .filter(s => s.status === 'completed')
            .reduce((sum, spur) => sum + (Number(spur.spur_length) || 0), 0);
        const inProgressLength = spurs
            .filter(s => s.status === 'in-progress')
            .reduce((sum, spur) => sum + (Number(spur.spur_length) || 0), 0);
        const notStartedLength = spurs
            .filter(s => s.status === 'not-started')
            .reduce((sum, spur) => sum + (Number(spur.spur_length) || 0), 0);
        
        return { 
            completed, 
            inProgress, 
            notStarted, 
            total: spurs.length,
            totalLength,
            completedLength,
            inProgressLength,
            notStartedLength
        };
    }, [spurs]);

    // Filter history for selected spur
    const spurHistory = useMemo(() => {
        if (!selectedSpur) return [];
        return history.filter(h => h.spur_name === selectedSpur.spur_name);
    }, [selectedSpur, history]);

    const getStatusBadge = (status: string = 'not-started') => {
        switch(status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                    </span>
                );
            case 'in-progress':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not Started
                    </span>
                );
        }
    };

    const getStatusColor = (status: string = 'not-started') => {
        switch(status) {
            case 'completed': return 'bg-green-500';
            case 'in-progress': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    if (!spurs.length) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold">Spur Work Status</h2>
                    <p className="text-green-100 text-sm">{workName} - {packageNumber}</p>
                </div>
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No spur data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold">Spur Work Status</h2>
                <p className="text-green-100 text-sm">{workName} - {packageNumber}</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-xs text-gray-500">Total Spurs</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500">
                    <p className="text-xs text-gray-500">Not Started</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
               <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
            </div>

            {/* Timeline */}
<div className="bg-white p-4 rounded-lg shadow">
    <h3 className="font-semibold mb-4">Spur Location Timeline</h3>
    <div className="relative py-6 px-2">
        <div className="absolute top-6 left-2 right-2 h-0.5 bg-gray-200"></div>
        
        {spurs.map((spur, index) => {
            const position = work_end_range > work_start_range 
                ? ((Number(spur.location_km) - work_start_range) / (work_end_range - work_start_range)) * 100
                : (index / (spurs.length - 1 || 1)) * 100;
            
            return (
                <div 
                    key={spur.id}
                    className="absolute top-6 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ left: `${Math.max(0, Math.min(100, position))}%` }}
                    onClick={() => {
                        setSelectedSpur(spur);
                        setShowHistory(true);
                    }}
                >
                    <div className={`w-4 h-4 ${getStatusColor(spur.status)} rounded-full border-2 border-white shadow hover:scale-150 transition-transform`}>
                        {history.filter(h => h.spur_name === spur.spur_name).length > 1 && (
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {history.filter(h => h.spur_name === spur.spur_name).length}
                            </span>
                        )}
                    </div>
                    
                    {/* Always visible label below the point */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                        <div className="text-xs font-medium bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                            <div>{spur.spur_name}</div>
                            <div className="text-gray-500 text-[10px]">{safeToFixed(spur.location_km)} Km</div>
                        </div>
                    </div>
                    
                    {/* Tooltip on hover (optional - can keep or remove) */}
                    <div className="absolute bottom-full left-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                        <div className="font-bold">{spur.spur_name}</div>
                        <div>Location: {safeToFixed(spur.location_km)} Km</div>
                        <div>Length: {safeToFixed(spur.spur_length)} m</div>
                        <div>Status: {spur.status}</div>
                        {spur.progress_date && (
                            <div>Last: {new Date(spur.progress_date).toLocaleDateString()}</div>
                        )}
                    </div>
                </div>
            );
        })}
        
        <div className="mt-16 flex justify-between text-xs text-gray-500">
            <span>{work_start_range} Km</span>
            <span>{((work_start_range + work_end_range) / 2).toFixed(1)} Km</span>
            <span>{work_end_range} Km</span>
        </div>
    </div>
</div>

            {/* Main Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-green-600 text-white p-3">
                    <h3 className="font-semibold">Spur Details</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Spur Name</th>
                                <th className="p-3 text-left">Location (Km)</th>
                                <th className="p-3 text-left">Length (m)</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Last Updated</th>
                                <th className="p-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spurs.map((spur, index) => (
                                <tr key={spur.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 font-medium">{spur.spur_name}</td>
                                    {/* FIXED: formatLocation use kiya */}
                                    <td className="p-3">{formatLocation(spur.location_km)}</td>
                                    {/* FIXED: formatLength use kiya */}
                                    <td className="p-3 font-medium text-purple-700">{formatLength(spur.spur_length)} m</td>
                                    <td className="p-3">{getStatusBadge(spur.status)}</td>
                                    <td className="p-3">
                                        {spur.progress_date ? 
                                            new Date(spur.progress_date).toLocaleDateString() : '-'
                                        }
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => {
                                                setSelectedSpur(spur);
                                                setShowHistory(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* History Modal */}
            {showHistory && selectedSpur && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
                            <div>
                                <h3 className="font-bold">{selectedSpur.spur_name} - History</h3>
                                <p className="text-xs text-blue-100">
                                    Location: {formatLocation(selectedSpur.location_km)} Km | 
                                    Length: {formatLength(selectedSpur.spur_length)} m
                                </p>
                            </div>
                            <button onClick={() => setShowHistory(false)} className="hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {spurHistory.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left">Date</th>
                                            <th className="p-2 text-left">Status</th>
                                            <th className="p-2 text-left">Updated By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {spurHistory.map((entry) => (
                                            <tr key={entry.id} className="border-t">
                                                <td className="p-2">{entry.formatted_date}</td>
                                                <td className="p-2">{getStatusBadge(entry.status)}</td>
                                                <td className="p-2">{entry.created_by || 'System'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500 py-8">No history available</p>
                            )}
                        </div>
                        
                        <div className="border-t p-3 flex justify-end">
                            <button
                                onClick={() => setShowHistory(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpurProgressComponent;