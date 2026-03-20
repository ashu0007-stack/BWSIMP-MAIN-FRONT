import { useState } from 'react';

const EnhancedPIMDashboard = () => {
  const [pimMetrics, setPimMetrics] = useState({
    totalSchemes: 45,
    activeSchemes: 38,
    completedSchemes: 7,
    averagePDO: 72,
    totalBudget: "7.5M",
    utilizedBudget: "4.6M",
    departmentalBreakdown: {
      RDD: { schemes: 18, pdo: 78, progress: 82, budget: "2.5M", spent: "1.8M" },
      WRD: { schemes: 15, pdo: 65, progress: 58, budget: "3.2M", spent: "1.2M" },
      DoA: { schemes: 12, pdo: 71, progress: 69, budget: "1.8M", spent: "1.6M" }
    }
  });

  const [selectedDepartment, setSelectedDepartment] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">PIM Performance Dashboard</h3>
          <p className="text-sm text-gray-600 mt-1">Comprehensive view of Project Implementation Metrics</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="px-4 py-2 border rounded-lg bg-white"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="RDD">RDD</option>
            <option value="WRD">WRD</option>
            <option value="DoA">DoA</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Schemes</p>
              <p className="text-3xl font-bold mt-2">{pimMetrics.totalSchemes}</p>
            </div>
            <span className="text-4xl">📋</span>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span>Active: {pimMetrics.activeSchemes}</span>
            <span>Completed: {pimMetrics.completedSchemes}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Average PDO</p>
              <p className="text-3xl font-bold mt-2">{pimMetrics.averagePDO}%</p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full"
                style={{ width: `${pimMetrics.averagePDO}%` }}
              ></div>
            </div>
            <p className="text-xs mt-2">↑ 5% from last quarter</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Budget</p>
              <p className="text-3xl font-bold mt-2">${pimMetrics.totalBudget}</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Utilized: ${pimMetrics.utilizedBudget}</span>
              <span>{Math.round((parseFloat(pimMetrics.utilizedBudget) / parseFloat(pimMetrics.totalBudget)) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">At Risk Schemes</p>
              <p className="text-3xl font-bold mt-2">8</p>
            </div>
            <span className="text-4xl">⚠️</span>
          </div>
          <div className="mt-4">
            <p className="text-sm">Need immediate attention</p>
            <button className="mt-2 text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30">
              View Details →
            </button>
          </div>
        </div>
      </div>

      {/* Department-wise PIM Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold mb-4">Department-wise PIM Performance</h4>
        <div className="space-y-6">
          {Object.entries(pimMetrics.departmentalBreakdown)
            .filter(([dept]) => selectedDepartment === 'all' || dept === selectedDepartment)
            .map(([dept, data]) => (
            <div key={dept} className="border-b pb-5 last:border-0 last:pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                <div>
                  <h5 className="font-semibold text-lg">{dept}</h5>
                  <p className="text-sm text-gray-600">{data.schemes} Active Schemes</p>
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <span className="text-sm">Budget: ${data.budget}</span>
                  <span className="text-sm">Spent: ${data.spent}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data.pdo >= 80 ? 'bg-green-100 text-green-800' :
                    data.pdo >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    PDO: {data.pdo}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{data.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${data.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Budget Utilization</span>
                    <span className="font-medium">
                      {Math.round((parseFloat(data.spent) / parseFloat(data.budget)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${(parseFloat(data.spent) / parseFloat(data.budget)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent PIM Updates */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold">Recent PIM Updates</h4>
          <button className="text-blue-600 text-sm hover:underline">View All</button>
        </div>
        
        <div className="space-y-3">
          {[
            { id: 1, scheme: "Rural Development Project #123", dept: "RDD", update: "PDO updated from 65% to 72%", time: "2 hours ago", user: "John Doe" },
            { id: 2, scheme: "Irrigation Scheme #456", dept: "WRD", update: "Milestone 3 completed ahead of schedule", time: "5 hours ago", user: "Jane Smith" },
            { id: 3, scheme: "Crop Insurance Program #789", dept: "DoA", update: "Budget reallocation approved", time: "1 day ago", user: "Mike Johnson" },
            { id: 4, scheme: "Watershed Project #234", dept: "WRD", update: "Risk identified - mitigation plan created", time: "1 day ago", user: "Sarah Williams" }
          ].map((update) => (
            <div key={update.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                update.dept === 'RDD' ? 'bg-purple-500' :
                update.dept === 'WRD' ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{update.scheme}</p>
                  <span className="text-xs text-gray-500">{update.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{update.update}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Department: {update.dept}</span>
                  <span>Updated by: {update.user}</span>
                </div>
              </div>
              <button className="text-blue-600 text-sm hover:underline">View</button>
            </div>
          ))}
        </div>
      </div>

      {/* PDO Trend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold mb-4">PDO Trend Analysis</h4>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">↑ 12%</p>
              <p className="text-xs text-gray-600">Last 30 days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">72%</p>
              <p className="text-xs text-gray-600">Current Avg</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">85%</p>
              <p className="text-xs text-gray-600">Target</p>
            </div>
          </div>
        </div>
        
        {/* Simple bar chart */}
        <div className="relative h-40 flex items-end justify-around mt-6">
          {['Jan', 'Feb', 'Mar', 'Apr'].map((month, idx) => {
            const heights = [65, 68, 70, 72];
            return (
              <div key={idx} className="w-1/4 px-2">
                <div className="flex justify-center gap-1">
                  <div 
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: `${heights[idx] * 1.5}px` }}
                  ></div>
                </div>
                <p className="text-xs text-center mt-2">{month}</p>
                <p className="text-xs text-center font-bold">{heights[idx]}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPIMDashboard;