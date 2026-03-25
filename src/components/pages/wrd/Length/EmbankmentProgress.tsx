"use client";

import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

interface EmbankmentProgressEntry {
    id?: number;
    start_km: number;
    end_km: number;
    embankment_done_km: number;
    pitching_done_km?: number;
    date: string | null;
}

interface EmbankmentProgressProps {
    progressEntries: EmbankmentProgressEntry[];
    packageNumber: string;
    workName: string;
    targetKm: number;
    work_start_range?: number;
    work_end_range?: number;
}

const EmbankmentProgressComponent: React.FC<EmbankmentProgressProps> = ({
    progressEntries = [],
    packageNumber,
    workName,
    targetKm = 0,
    work_start_range = 0,
    work_end_range = 0
}) => {

    // Create cumulative data for the graph
    const chartData = useMemo(() => {
        if (!progressEntries.length) return [];
        
        const sorted = [...progressEntries].sort((a, b) => a.start_km - b.start_km);
        const data = [];
        let embankmentCumulative = 0;
        let pitchingCumulative = 0;
        
        // Starting point at 0
        data.push({
            chainage: 0,
            embankment: 0,
            pitching: 0,
            target: targetKm
        });
        
        // Add points at the end of each range
        sorted.forEach(entry => {
            embankmentCumulative += entry.embankment_done_km;
            pitchingCumulative += entry.pitching_done_km || 0;
            
            data.push({
                chainage: entry.end_km,
                embankment: embankmentCumulative,
                pitching: pitchingCumulative,
                target: targetKm
            });
        });
        
        // Final point at target
        if (data[data.length - 1].chainage < targetKm) {
            data.push({
                chainage: targetKm,
                embankment: embankmentCumulative,
                pitching: pitchingCumulative,
                target: targetKm
            });
        }
        
        return data;
    }, [progressEntries, targetKm]);

    const totalEmbankment = progressEntries.reduce((sum, e) => sum + e.embankment_done_km, 0);
    const totalPitching = progressEntries.reduce((sum, e) => sum + (e.pitching_done_km || 0), 0);

    if (!progressEntries.length) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg">
                <h2 className="text-xl font-bold">Embankment & Pitching Progress</h2>
                <p className="text-purple-100 text-sm">{workName} - {packageNumber}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 p-3 rounded border">
                    <p className="text-xs text-purple-600">Total Embankment</p>
                    <p className="text-2xl font-bold text-purple-700">{totalEmbankment.toFixed(2)}<span className="text-sm">/{targetKm} KM</span></p>
                    <div className="w-full bg-gray-200 h-1.5 rounded mt-1">
                        <div className="bg-purple-600 h-1.5 rounded" style={{ width: `${(totalEmbankment / targetKm) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-blue-50 p-3 rounded border">
                    <p className="text-xs text-blue-600">Total Pitching</p>
                    <p className="text-2xl font-bold text-blue-700">{totalPitching.toFixed(2)}<span className="text-sm">/{targetKm} KM</span></p>
                    <div className="w-full bg-gray-200 h-1.5 rounded mt-1">
                        <div className="bg-blue-600 h-1.5 rounded" style={{ width: `${(totalPitching / targetKm) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-indigo-50 p-3 rounded border">
                    <p className="text-xs text-indigo-600">Target</p>
                    <p className="text-2xl font-bold text-indigo-700">{targetKm}<span className="text-sm"> KM</span></p>
                </div>
                <div className="bg-green-50 p-3 rounded border">
                    <p className="text-xs text-green-600">Remaining Pitching</p>
                    <p className="text-2xl font-bold text-green-700">{(targetKm - totalPitching).toFixed(2)}<span className="text-sm"> KM</span></p>
                </div>
            </div>

            {/* THE MAIN GRAPH - 3 LINES */}
            <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold text-center text-purple-700 mb-4">
                    Cumulative Progress Chart
                </h3>
                
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="chainage" 
                            label={{ value: 'Chainage (KM)', position: 'bottom' }}
                            domain={[0, targetKm]}
                        />
                        <YAxis 
                            label={{ value: 'Cumulative Work Done (KM)', angle: -90, position: 'insideLeft' }}
                            domain={[0, targetKm]}
                        />
                        <Tooltip />
                        <Legend />
                        
                        {/* Target Line */}
                        <Line 
                            type="monotone" 
                            dataKey="target" 
                            name="Target" 
                            stroke="#EF4444" 
                            strokeWidth={2} 
                            strokeDasharray="5 5"
                            dot={false}
                        />
                        
                        {/* Embankment Line */}
                        <Line 
                            type="monotone" 
                            dataKey="embankment" 
                            name="Embankment" 
                            stroke="#8B5CF6" 
                            strokeWidth={3}
                            dot={{ r: 5, fill: "#8B5CF6" }}
                        />
                        
                        {/* Pitching Line */}
                        <Line 
                            type="monotone" 
                            dataKey="pitching" 
                            name="Pitching" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ r: 5, fill: "#3B82F6" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
                
                <div className="text-center text-sm mt-3">
                    <span className="inline-block w-4 h-0.5 bg-red-500 mx-1" style={{ borderTop: '2px dashed red' }}></span> Target
                    <span className="inline-block w-4 h-4 bg-purple-500 rounded mx-2"></span> Embankment
                    <span className="inline-block w-4 h-4 bg-blue-500 rounded mx-2"></span> Pitching
                </div>
            </div>

            {/* Progress Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-purple-600 text-white p-3">
                    <h3 className="font-bold">Progress Entries</h3>
                </div>
                <div className="overflow-x-auto p-3">
                    <table className="w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Range</th>
                                <th className="border p-2">Length</th>
                                <th className="border p-2">Embankment</th>
                                <th className="border p-2">Pitching</th>
                                <th className="border p-2">Cumulative Emb</th>
                                <th className="border p-2">Cumulative Pitch</th>
                                <th className="border p-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let cumEmb = 0;
                                let cumPitch = 0;
                                return progressEntries.map((entry, i) => {
                                    cumEmb += entry.embankment_done_km;
                                    cumPitch += entry.pitching_done_km || 0;
                                    return (
                                        <tr key={entry.id || i}>
                                            <td className="border p-2">{entry.start_km.toFixed(2)} - {entry.end_km.toFixed(2)}</td>
                                            <td className="border p-2">{(entry.end_km - entry.start_km).toFixed(2)}</td>
                                            <td className="border p-2 text-purple-600">{entry.embankment_done_km.toFixed(2)}</td>
                                            <td className="border p-2 text-blue-600">{entry.pitching_done_km?.toFixed(2) || '0.00'}</td>
                                            <td className="border p-2 font-bold">{cumEmb.toFixed(2)}</td>
                                            <td className="border p-2 font-bold">{cumPitch.toFixed(2)}</td>
                                            <td className="border p-2">{entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmbankmentProgressComponent;