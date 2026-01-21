// components/SpurProgressComponent.tsx
import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from "recharts";

interface SpurData {
  id: number | null;
  spur_id: number;
  spur_name: string;
  location_km: number;
  progress_date: string | null;
  status: string | null;
  spur_length?: number;
  completed_km?: number;
  completion_percentage?: number;
}

interface SpurProgressProps {
  spurs: SpurData[];
  targetKm: number;
  work_start_range:number;
  work_end_range:number;
  packageNumber: string;
  workName: string;

}

const SpurProgressComponent: React.FC<SpurProgressProps> = ({ 
  spurs, 
  targetKm, 
  work_start_range,
  work_end_range,
  packageNumber, 
  workName 
}) => {
  
  // Calculate cumulative completed_km for each spur_id
  const cumulativeSpurData = useMemo(() => {
    const spurMap = new Map<number, {
      id: number;
      spur_id: number;
      spur_name: string;
      location_km: number;
      spur_length: number;
      total_completed_km: number;
      max_completion_percentage: number;
      latest_date: string | null;
      status: string | null;
      entries: SpurData[]; // Store all entries for this spur
    }>();
    
    spurs.forEach(spur => {
      const existing = spurMap.get(spur.spur_id);
      const completed_km = spur.completed_km || 0;
      const spur_length = spur.spur_length || 0;
      
      if (!existing) {
        spurMap.set(spur.spur_id, {
          id: spur.id || 0,
          spur_id: spur.spur_id,
          spur_name: spur.spur_name,
          location_km: spur.location_km,
          spur_length: spur_length,
          total_completed_km: completed_km,
          max_completion_percentage: spur.completion_percentage || 0,
          latest_date: spur.progress_date,
          status: spur.status,
          entries: [spur]
        });
      } else {
        // Add to cumulative completed km
        existing.total_completed_km += completed_km;
        
        // Keep the latest date
        if (spur.progress_date && (!existing.latest_date || 
            new Date(spur.progress_date) > new Date(existing.latest_date))) {
          existing.latest_date = spur.progress_date;
        }
        
        // Keep the highest completion percentage
        if (spur.completion_percentage && 
            spur.completion_percentage > existing.max_completion_percentage) {
          existing.max_completion_percentage = spur.completion_percentage;
        }
        
        // Add this entry to the list
        existing.entries.push(spur);
      }
    });
    
    return Array.from(spurMap.values());
  }, [spurs]);

  // Filter spurs that have progress (completed_km > 0)
  const spursWithProgress = useMemo(() => {
    return spurs.filter(spur => (spur.completed_km || 0) > 0);
  }, [spurs]);

  // Calculate spur statistics using cumulative data
  const spurStats = useMemo(() => {
    if (!cumulativeSpurData.length) return null;
    
    const completed = cumulativeSpurData.filter(s => {
      const status = s.status?.toLowerCase();
      return status === 'completed' || 
             status === 'done' || 
             (s.max_completion_percentage >= 100);
    }).length;
    
    const inProgress = cumulativeSpurData.filter(s => {
      const status = s.status?.toLowerCase();
      return status === 'in_progress' || 
             status === 'in progress' || 
             status === 'in-progress' ||
             (s.max_completion_percentage > 0 && s.max_completion_percentage < 100);
    }).length;
    
    const notStarted = cumulativeSpurData.filter(s => {
      const status = s.status?.toLowerCase();
      return !status || 
             status === 'not started' ||
             status === 'pending' ||
             status === 'not-started' ||
             (s.max_completion_percentage === 0);
    }).length;
    
    const total = cumulativeSpurData.length;
    
    // Calculate total and completed lengths from cumulative data
    const totalSpurLength = cumulativeSpurData.reduce((sum, spur) => 
      sum + (spur.spur_length || 0), 0
    );
    const completedSpurLength = cumulativeSpurData.reduce((sum, spur) => 
      sum + spur.total_completed_km, 0
    );
    
    return { 
      completed, 
      inProgress, 
      notStarted, 
      total, 
      totalSpurLength: parseFloat(totalSpurLength.toFixed(2)),
      completedSpurLength: parseFloat(completedSpurLength.toFixed(2)),
      completionByLength: totalSpurLength > 0 ? 
        (completedSpurLength / totalSpurLength) * 100 : 0
    };
  }, [cumulativeSpurData]);

  // Location chart data - using cumulative data
  const spurLengthChartData = useMemo(() => {
    if (!cumulativeSpurData.length) return [];
    
    return [...cumulativeSpurData]
      .sort((a, b) => a.location_km - b.location_km)
      .map(spur => {
        const totalLength = spur.spur_length || 0;
        const completed = spur.total_completed_km;
        const remaining = totalLength - completed;
        
        // Determine status based on cumulative data
        let status = 'Not Started';
        if (completed >= totalLength) {
          status = 'Completed';
        } else if (completed > 0) {
          status = 'In Progress';
        }
        
        return {
          name: spur.spur_name,
          location: spur.location_km,
          totalLength,
          completedLength: completed,
          remainingLength: remaining > 0 ? remaining : 0,
          completionPercentage: totalLength > 0 ? (completed / totalLength) * 100 : 0,
          status: status,
          date: spur.latest_date,
          entries: spur.entries.length // Number of entries for this spur
        };
      });
  }, [cumulativeSpurData]);

  // Calculate max length for Y-axis domain
  const maxLength = useMemo(() => {
    if (!spurLengthChartData.length) return 100;
    const maxTotal = Math.max(...spurLengthChartData.map(d => d.totalLength));
    return Math.ceil(maxTotal / 50) * 50; // Round up to nearest 50
  }, [spurLengthChartData]);

  if (!cumulativeSpurData.length || !spurStats) {
    return (
      <div className="space-y-8 mt-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Spur Work Progress</h2>
          <p className="text-green-100">
            {workName} - Package: {packageNumber}
          </p>
        </div>
        <div className="text-center p-8 text-gray-500">
          <p className="text-lg">No spur data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold">Spur Work Progress</h2>
        <p className="text-green-100">
          {workName} - Package: {packageNumber}
        </p>
        <p className="text-green-100 text-sm mt-1">
          Showing cumulative progress for {cumulativeSpurData.length} unique spurs
        </p>
      </div>


       {/* Improved Progress Timeline */}
     <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border border-blue-200">
  <h3 className="font-bold text-xl mb-6 text-gray-800 text-center">
    Spur Progress Timeline Along Embankment
  </h3>
  
  {/* Timeline Container with Relative Positioning */}
  <div className="relative py-10 px-4">
    {/* Scale Bar Background */}
    <div className="absolute top-10 left-4 right-4 h-1 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full"></div>
    
    {/* Dots positioned based on actual location */}
    {spurLengthChartData.map((spur, index) => {
      let dotColor = 'bg-red-500';
      let statusText = 'Not Started';
      
      if (spur.completionPercentage >= 100) {
        dotColor = 'bg-green-500';
        statusText = 'Completed';
      } else if (spur.completionPercentage > 0) {
        dotColor = 'bg-yellow-500';
        statusText = `${spur.completionPercentage.toFixed(0)}%`;
      }
      
      // Calculate position percentage based on location
      const positionPercentage = ((spur.location - work_start_range) / (work_end_range - work_start_range)) * 100;
      
      // Clamp between 0 and 100
      const clampedPosition = Math.max(0, Math.min(100, positionPercentage));
      
      return (
        <div 
          key={index}
          className="absolute top-10 transform -translate-x-1/2 -translate-y-1/2 group"
          style={{ left: `${clampedPosition}%` }}
        >
          {/* Spur Dot */}
          <div className="relative">
            <div 
              className={`w-5 h-5 ${dotColor} rounded-full border-3 border-white shadow-md cursor-pointer relative`}
            >
              {/* {spur.entries > 1 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {spur.entries}
                </span>
              )} */}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white whitespace-nowrap text-xs rounded transform -translate-x-1/2 px-3 py-2 z-10">
              <div className="font-bold">{spur.name}</div>
              <div>Location: {spur.location.toFixed(2)} Km</div>
              <div>Completed: {spur.completedLength.toLocaleString()}m / {spur.totalLength.toLocaleString()}m</div>
              <div className="text-green-300">Status: {statusText}</div>
            </div>
          </div>
          
          {/* Location Label above dot */}
          <div className="absolute bottom-full left-1/2 mb-6 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
            {spur.location.toFixed(1)}km
          </div>
          
          {/* Spur Name below dot */}
          <div className="absolute top-full left-1/2 mt-2 transform -translate-x-1/2 text-center">
            <div className="text-xs font-bold whitespace-nowrap">{spur.name}</div>
            <div className="text-[10px] text-gray-500">{statusText}</div>
          </div>
        </div>
      );
    })}
    
    {/* Scale Labels */}
    <div className="mt-12 flex justify-between text-xs text-gray-600">
      <span>{work_start_range.toFixed(1)} Km</span>
      <span>{((work_start_range + work_end_range) / 2).toFixed(1)} Km</span>
      <span>{work_end_range.toFixed(1)} Km</span>
    </div>
  </div>
  
  {/* Compact Legend */}
  <div className="mt-6 flex flex-wrap justify-center gap-3">
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span className="text-xs">Completed</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      <span className="text-xs">In Progress</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      <span className="text-xs">Not Started</span>
    </div>
  </div>
</div>

      {/* Single Chart - Spur Length vs Cumulative Completed Length */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-4 text-center text-gray-700">
          Spur Length vs Cumulative Completed Length (in Meters)
        </h3>
        {spurLengthChartData.length > 0 ? (
          <>
            <div className="mb-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                <span className="font-bold">Note: </span>
                Graph shows cumulative completed length for each spur. 
                If a spur has multiple entries, their completed meters are added together.
              </p>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={spurLengthChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  label={{ 
                    value: 'Length (Meters)', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -10,
                    style: { textAnchor: 'middle' }
                  }}
                  domain={[0, maxLength]}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'totalLength') return [`${value.toLocaleString()} m`, 'Total Length'];
                    if (name === 'completedLength') return [`${value.toLocaleString()} m`, 'Cumulative Completed Length'];
                    if (name === 'remainingLength') return [`${value.toLocaleString()} m`, 'Remaining Length'];
                    return [value, name];
                  }}
                  labelFormatter={(label, data) => {
                    const entry = data[0]?.payload;
                    return `Spur: ${label} (${entry.entries} entries)`;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="totalLength" 
                  name="Total Length (m)" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                >
                  {spurLengthChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="#8884d8"
                      opacity={0.8}
                    />
                  ))}
                </Bar>
                <Bar 
                  dataKey="completedLength" 
                  name="Cumulative Completed (m)" 
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                >
                  {spurLengthChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}-completed`} 
                      fill="#82ca9d"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  <span className="font-bold">Total Spur Length: </span>
                  {spurStats.totalSpurLength.toLocaleString()} m
                </p>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-lg">
                <p className="text-sm text-teal-700">
                  <span className="font-bold">Cumulative Completed Length: </span>
                  {spurStats.completedSpurLength.toLocaleString()} m ({spurStats.completionByLength.toFixed(1)}%)
                </p>
              </div>
            </div> */}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No chart data available</p>
          </div>
        )}
      </div>

      


      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-green-600 text-white p-4">
          <h3 className="text-lg font-bold">Cumulative Progress Summary (Per Spur)</h3>
          <p className="text-green-100 text-sm">
            Showing cumulative totals for {cumulativeSpurData.length} unique spurs
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left border-b">Spur ID</th>
                <th className="p-3 text-left border-b">Spur Name</th>
                <th className="p-3 text-left border-b">Spur Location (Km)</th>
                <th className="p-3 text-left border-b">Spur Length (m)</th>
                <th className="p-3 text-left border-b">Cumulative Completed (m)</th>
                <th className="p-3 text-left border-b">Last Date of Entry</th>
                <th className="p-3 text-left border-b">Cumulative %</th>
              </tr>
            </thead>
            <tbody>
              {cumulativeSpurData.map((spur, index) => {
                const completionPercent = spur.spur_length > 0 ? 
                  (spur.total_completed_km / spur.spur_length) * 100 : 0;
                
                let statusColor = 'text-gray-600';
                let progressBarColor = '#9CA3AF';
                
                if (completionPercent >= 100) {
                  statusColor = 'text-green-600';
                  progressBarColor = '#10B981';
                } else if (completionPercent > 0) {
                  statusColor = 'text-yellow-600';
                  progressBarColor = '#F59E0B';
                }
                
                return (
                  <tr key={`cumulative-${spur.spur_id}`} className="hover:bg-gray-50 border-b">
                    <td className="p-3 font-bold">{spur.spur_id}</td>
                    <td className="p-3 font-medium">{spur.spur_name}</td>
                    <td className="p-3">{spur.location_km.toFixed(2)} Km</td>
                    <td className="p-3 font-semibold text-purple-700">
                      {spur.spur_length.toLocaleString()} m
                    </td>
                    <td className="p-3 font-semibold text-green-700">
                      {spur.total_completed_km.toLocaleString()} m
                    </td>
                    <td className="p-3">
                      {spur.latest_date ? 
                        new Date(spur.latest_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 
                        '-'
                      }
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(completionPercent, 100)}%`,
                              backgroundColor: progressBarColor
                            }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${statusColor} min-w-[60px]`}>
                          {completionPercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Table - Show only spurs with progress (completed_km > 0) */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h3 className="text-lg font-bold">Spur Progress Details (Only Spurs with Progress)</h3>
          <p className="text-blue-100 text-sm">
            Showing {spursWithProgress.length} entries with progress 
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left border-b">S.No.</th>
                <th className="p-3 text-left border-b">Spur Name</th>
                <th className="p-3 text-left border-b">Spur Location (Km)</th>
                <th className="p-3 text-left border-b">Spur Length (m)</th>
                <th className="p-3 text-left border-b">Completed (m)</th>
                <th className="p-3 text-left border-b">Data Entry Date</th>
              </tr>
            </thead>
            <tbody>
              {spursWithProgress.map((spur, index) => {
                const totalLength = spur.spur_length || 0;
                const completedLength = spur.completed_km || 0;
                
                return (
                  <tr key={`${spur.id}-${index}`} className="hover:bg-gray-50 border-b">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{spur.spur_name}</td>
                    <td className="p-3 font-bold">{spur.location_km.toFixed(2)} Km</td>
                    <td className="p-3 font-semibold text-purple-700">
                      {totalLength.toLocaleString()} m
                    </td>
                    <td className="p-3 font-semibold text-green-700">
                      {completedLength.toLocaleString()} m
                    </td>
                    <td className="p-3">
                      {spur.progress_date ? 
                        new Date(spur.progress_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 
                        '-'
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {spursWithProgress.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No spur progress data available</p>
              <p className="text-sm mt-2">Start adding progress to spurs to see them here</p>
            </div>
          )}
        </div>
      </div>

      {/* Cumulative Summary Table */}
      

     
    </div>
  );
};

export default SpurProgressComponent;