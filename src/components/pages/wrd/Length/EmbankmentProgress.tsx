"use client";

import React, { useMemo } from "react";
import { 
    Ruler,
    TrendingUp,
    Calendar,
    MapPin
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

interface EmbankmentProgressEntry {
    id?: number;
    start_km: number;
    end_km: number;
    embankment_done_km: number;
    date: string | null;
    created_by?: string;
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
    
    // Calculate totals
    const totalEmbankment = useMemo(
        () => progressEntries.reduce((sum, e) => sum + (e.embankment_done_km || 0), 0),
        [progressEntries]
    );

    // Overall progress percentage
    const overallProgress = useMemo(() => {
        if (!targetKm || targetKm <= 0) return 0;
        return Math.min((totalEmbankment / targetKm) * 100, 100);
    }, [totalEmbankment, targetKm]);

    // Gauge data for pie chart
    const gaugeData = [
        { name: "Completed", value: overallProgress },
        { name: "Remaining", value: 100 - overallProgress },
    ];
    const COLORS = ["#8B5CF6", "#E5E7EB"]; // Purple color for embankment

    // Kilometer-wise data for area chart
    const kilometerData = useMemo(() => {
        const data = [];
        const validTargetKm = typeof targetKm === 'number' ? targetKm : 0;
        const step = validTargetKm > 20 ? 1 : 0.5;

        for (let km = 0; km <= validTargetKm; km += step) {
            let embankmentDone = 0;

            const entriesInThisKm = progressEntries.filter((e) => {
                const start = typeof e.start_km === 'number' ? e.start_km : parseFloat(e.start_km as any);
                const end = typeof e.end_km === 'number' ? e.end_km : parseFloat(e.end_km as any);
                return km >= start && km < end;
            });

            entriesInThisKm.forEach(entry => {
                embankmentDone += entry.embankment_done_km || 0;
            });

            data.push({
                kilometer: parseFloat(km.toFixed(2)),
                embankmentDone: parseFloat(embankmentDone.toFixed(2)),
            });
        }

        return data;
    }, [progressEntries, targetKm]);

    if (!progressEntries.length) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold">Embankment Progress</h2>
                    <p className="text-purple-100 text-sm">{workName} - {packageNumber}</p>
                </div>
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No embankment progress data available</p>
                    <p className="text-xs text-gray-400 mt-2">Target: {targetKm} KM</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold">Embankment Progress</h2>
                <p className="text-purple-100 text-sm">{workName} - {packageNumber}</p>
            </div>

            {/* Stats Cards - Exactly like Length Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium">Total Embankment Done</p>
                    <p className="text-3xl font-bold text-purple-800">{totalEmbankment.toFixed(2)} <span className="text-sm font-normal text-purple-600">Km</span></p>
                    <p className="text-xs text-purple-600 mt-1">{((totalEmbankment / targetKm) * 100).toFixed(1)}% of target</p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-700 font-medium">Target Length</p>
                    <p className="text-3xl font-bold text-indigo-800">{targetKm.toFixed(2)} <span className="text-sm font-normal text-indigo-600">Km</span></p>
                    <p className="text-xs text-indigo-600 mt-1">Work range: {work_start_range} - {work_end_range} Km</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium">Remaining</p>
                    <p className="text-3xl font-bold text-green-800">{(targetKm - totalEmbankment).toFixed(2)} <span className="text-sm font-normal text-green-600">Km</span></p>
                    <p className="text-xs text-green-600 mt-1">{((targetKm - totalEmbankment) / targetKm * 100).toFixed(1)}% left</p>
                </div>
            </div>

            {/* Progress Entries Table - Exactly like Length Progress */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Ruler className="w-5 h-5" />
                        Embankment Progress Entries
                    </h3>
                    <span className="bg-purple-700 px-3 py-1 rounded-full text-sm">
                        Total: {totalEmbankment.toFixed(2)} / {targetKm} Km
                    </span>
                </div>
                
                <div className="overflow-x-auto p-4">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-3 text-left">S.No.</th>
                                <th className="border border-gray-300 p-3 text-left">Start KM</th>
                                <th className="border border-gray-300 p-3 text-left">End KM</th>
                                <th className="border border-gray-300 p-3 text-left">Length (KM)</th>
                                <th className="border border-gray-300 p-3 text-left">Embankment Done (KM)</th>
                                <th className="border border-gray-300 p-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {progressEntries.map((entry, idx) => {
                                const length = entry.end_km - entry.start_km;
                                return (
                                    <tr key={entry.id || idx} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3">{idx + 1}</td>
                                        <td className="border border-gray-300 p-3 font-mono">{entry.start_km.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-3 font-mono">{entry.end_km.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-3 font-mono">{length.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-3 font-medium text-purple-600">{entry.embankment_done_km.toFixed(2)}</td>
                                        <td className="border border-gray-300 p-3">{entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</td>
                                    </tr>
                                );
                            })}
                            {progressEntries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="border border-gray-300 p-4 text-center text-gray-500">
                                        No embankment progress entries found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Area Chart - Like Length Progress but for embankment only */}
            <div className="bg-white border border-gray-300 p-4 rounded shadow-sm">
                <h3 className="font-semibold mb-4 text-center text-purple-700 flex items-center justify-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Embankment Progress Chart
                </h3>
                
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={kilometerData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                        <defs>
                            <linearGradient id="embankmentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        
                        <XAxis 
                            dataKey="kilometer" 
                            label={{ value: 'Chainage (KM)', position: 'insideBottom', offset: -10 }}
                            tick={{ fill: '#4b5563' }}
                        />
                        
                        <YAxis 
                            label={{ value: 'Embankment Done (KM)', angle: -90, position: 'insideLeft' }}
                            tick={{ fill: '#4b5563' }}
                        />
                        
                        <Tooltip 
                            formatter={(value: any) => [`${value} KM`, 'Embankment Done']}
                            labelFormatter={(label) => `At Chainage ${label} KM`}
                        />
                        
                        <Legend />
                        
                        <Area
                            type="monotone"
                            dataKey="embankmentDone"
                            name="Embankment Progress"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            fill="url(#embankmentGradient)"
                            dot={{ r: 4, fill: '#8B5CF6', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Gauge Chart - Like Length Progress */}
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6 flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                    Overall Embankment Progress
                </h2>
                <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                        <Pie
                            data={gaugeData}
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                        >
                            {gaugeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="text-4xl font-bold text-purple-700">{overallProgress.toFixed(1)}%</div>
                <p className="text-gray-600 mt-2">{totalEmbankment.toFixed(2)} Km completed out of {targetKm} Km</p>
            </div>
        </div>
    );
};

export default EmbankmentProgressComponent;