import { useState } from 'react';

const DepartmentProgressOverview = () => {
  const [departmentData, setDepartmentData] = useState({
    rdd: { 
      progress: 78, 
      milestones: 12, 
      completed: 9, 
      pdo: 85,
      budget: "2.5M",
      spent: "1.8M",
      timeline: "Q2 2024"
    },
    wrd: { 
      progress: 45, 
      milestones: 15, 
      completed: 7, 
      pdo: 62,
      budget: "3.2M",
      spent: "1.2M",
      timeline: "Q3 2024"
    },
    doa: { 
      progress: 92, 
      milestones: 10, 
      completed: 9, 
      pdo: 94,
      budget: "1.8M",
      spent: "1.6M",
      timeline: "Q1 2024"
    }
  });

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Department Progress Overview</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Generate Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(departmentData).map(([dept, data]) => (
          <div key={dept} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold uppercase text-gray-700">{dept}</h4>
                <p className="text-xs text-gray-500">Timeline: {data.timeline}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.pdo >= 80 ? 'bg-green-100 text-green-800' :
                data.pdo >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                PDO: {data.pdo}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-bold">{data.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    data.progress >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    data.progress >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${data.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Milestone Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-600">Milestones</span>
                <p className="font-bold text-lg">{data.completed}/{data.milestones}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-600">Completion</span>
                <p className="font-bold text-lg">
                  {Math.round((data.completed/data.milestones)*100)}%
                </p>
                <p className="text-xs text-gray-500">Rate</p>
              </div>
            </div>

            {/* Budget Info */}
            <div className="flex justify-between text-sm border-t pt-3">
              <div>
                <span className="text-gray-600">Budget</span>
                <p className="font-semibold">{data.budget}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-600">Spent</span>
                <p className="font-semibold">{data.spent}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentProgressOverview;