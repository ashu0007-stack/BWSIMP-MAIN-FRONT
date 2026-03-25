// components/DepartmentProgressOverview.tsx
import { useState } from 'react';
import { useDepartmentProgress, useGenerateReport } from '@/hooks/useSuperAdminDashboard';

interface DepartmentData {
  progress: number;
  milestones: number;
  completed: number;
  pdo: number;
  budget: string;
  spent: string;
  timeline: string;
}

const DepartmentProgressOverview = () => {
  const { data: departments, isLoading, error } = useDepartmentProgress();
  const generateReport = useGenerateReport();
  const [isGenerating, setIsGenerating] = useState(false);

  // Transform API data to component format
  const transformData = (): Record<string, DepartmentData> => {
    if (!departments) return {};

    const transformed: Record<string, DepartmentData> = {};
    
    Object.entries(departments).forEach(([deptCode, data]) => {
      transformed[deptCode.toLowerCase()] = {
        progress: data.progress,
        milestones: data.totalMilestones,
        completed: data.completedMilestones,
        pdo: data.pdo,
        budget: data.budget,
        spent: data.spent,
        timeline: data.timeline
      };
    });

    return transformed;
  };

  const departmentData = transformData();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const report = await generateReport.mutateAsync({
        type: 'department',
        format: 'pdf'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([report]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'department-progress-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Department Progress Overview</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed" disabled>
            Generate Report
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">Failed to load department data. Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (Object.keys(departmentData).length === 0) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Department Progress Overview</h3>
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
          No department data available
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Department Progress Overview</h3>
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">⏳</span>
              Generating...
            </>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(departmentData).map(([dept, data]) => {
          // Determine department display properties
          const deptDisplay = {
            'rdd': { name: 'RDD', fullName: 'Rural Development Department', color: 'purple' },
            'wrd': { name: 'WRD', fullName: 'Water Resources Department', color: 'blue' },
            'doa': { name: 'DOA', fullName: 'Department of Agriculture', color: 'green' }
          }[dept] || { name: dept.toUpperCase(), fullName: dept, color: 'gray' };

          return (
            <div 
              key={dept} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
              onClick={() => window.location.href = `/${dept}/dashboard`}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-lg font-semibold uppercase text-gray-700">
                    {deptDisplay.name}
                  </h4>
                  <p className="text-xs text-gray-500">{deptDisplay.fullName}</p>
                  <p className="text-xs text-gray-500 mt-1">Timeline: {data.timeline}</p>
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
                    {data.milestones > 0 
                      ? Math.round((data.completed / data.milestones) * 100)
                      : 0}%
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
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentProgressOverview;