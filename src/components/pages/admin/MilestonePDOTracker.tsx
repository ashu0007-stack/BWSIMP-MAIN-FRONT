import { useState } from 'react';

const MilestonePDOTracker = () => {
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      name: "Phase 1: Infrastructure Setup",
      department: "RDD",
      dueDate: "2024-04-15",
      progress: 100,
      pdo: 95,
      status: "completed",
      issues: 0,
      assignedTo: "John Doe",
      priority: "high"
    },
    {
      id: 2,
      name: "Phase 2: Data Migration",
      department: "WRD",
      dueDate: "2024-05-20",
      progress: 60,
      pdo: 45,
      status: "at-risk",
      issues: 3,
      assignedTo: "Jane Smith",
      priority: "critical"
    },
    {
      id: 3,
      name: "Phase 3: User Training",
      department: "DoA",
      dueDate: "2024-06-10",
      progress: 30,
      pdo: 28,
      status: "delayed",
      issues: 5,
      assignedTo: "Mike Johnson",
      priority: "critical"
    },
    {
      id: 4,
      name: "Quality Assurance",
      department: "RDD",
      dueDate: "2024-04-30",
      progress: 85,
      pdo: 82,
      status: "in-progress",
      issues: 1,
      assignedTo: "Sarah Williams",
      priority: "medium"
    },
    {
      id: 5,
      name: "Resource Allocation",
      department: "WRD",
      dueDate: "2024-05-05",
      progress: 40,
      pdo: 38,
      status: "at-risk",
      issues: 4,
      assignedTo: "Tom Brown",
      priority: "high"
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPDOColor = (pdo: number) => {
    if (pdo >= 80) return 'text-green-600';
    if (pdo >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMilestones = milestones.filter(milestone => {
    if (filter !== 'all' && milestone.status !== filter) return false;
    if (departmentFilter !== 'all' && milestone.department !== departmentFilter) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Milestone-wise PDO Indicators</h3>
          <p className="text-sm text-gray-600 mt-1">Track milestone progress and PDO scores across departments</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 mt-4 md:mt-0">
          <select 
            className="px-3 py-2 border rounded-lg text-sm bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="at-risk">At Risk</option>
            <option value="delayed">Delayed</option>
          </select>
          
          <select 
            className="px-3 py-2 border rounded-lg text-sm bg-white"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="RDD">RDD</option>
            <option value="WRD">WRD</option>
            <option value="DoA">DoA</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        <span className="flex items-center text-sm">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> On Track
        </span>
        <span className="flex items-center text-sm">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span> In Progress
        </span>
        <span className="flex items-center text-sm">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span> At Risk
        </span>
        <span className="flex items-center text-sm">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span> Delayed
        </span>
        <span className="flex items-center text-sm ml-4">
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded mr-1">Critical</span> Priority
        </span>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {filteredMilestones.map((milestone) => (
          <div key={milestone.id} className="border rounded-lg p-5 hover:shadow-lg transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-lg">{milestone.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(milestone.priority)}`}>
                    {milestone.priority}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-gray-600">Department: <span className="font-medium">{milestone.department}</span></span>
                  <span className="text-gray-600">Assigned to: <span className="font-medium">{milestone.assignedTo}</span></span>
                  <span className="text-gray-600">Due: <span className="font-medium">{new Date(milestone.dueDate).toLocaleDateString()}</span></span>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                  {milestone.status.replace('-', ' ').toUpperCase()}
                </span>
                <div className="text-right">
                  <span className="text-sm text-gray-600">PDO Score</span>
                  <p className={`text-2xl font-bold ${getPDOColor(milestone.pdo)}`}>
                    {milestone.pdo}%
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{milestone.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${milestone.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">PDO Achievement</span>
                  <span className="font-medium">{milestone.pdo}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      milestone.pdo >= 80 ? 'bg-green-500' : 
                      milestone.pdo >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${milestone.pdo}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Issues Alert */}
            {milestone.issues > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                <span className="text-lg">⚠️</span>
                <span>{milestone.issues} open {milestone.issues === 1 ? 'issue' : 'issues'} requiring attention</span>
                <button className="ml-auto text-red-700 hover:text-red-800 font-medium">
                  View Issues →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">
            {milestones.filter(m => m.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">
            {milestones.filter(m => m.status === 'in-progress').length}
          </p>
          <p className="text-xs text-gray-600">In Progress</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {milestones.filter(m => m.status === 'at-risk').length}
          </p>
          <p className="text-xs text-gray-600">At Risk</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {milestones.filter(m => m.status === 'delayed').length}
          </p>
          <p className="text-xs text-gray-600">Delayed</p>
        </div>
      </div>
    </div>
  );
};

export default MilestonePDOTracker;