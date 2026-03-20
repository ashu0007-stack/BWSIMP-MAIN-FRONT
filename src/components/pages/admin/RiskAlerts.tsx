import { useState } from 'react';

const RiskAlerts = () => {
  const [alerts] = useState([
    {
      id: 1,
      department: 'WRD',
      scheme: 'Irrigation Project #456',
      risk: 'Budget Overrun',
      severity: 'critical',
      description: 'Projected budget overrun of 25% due to material cost increase',
      deadline: '2024-05-20',
      assignedTo: 'Jane Smith',
      daysRemaining: 5
    },
    {
      id: 2,
      department: 'RDD',
      scheme: 'Rural Housing Scheme #123',
      risk: 'Timeline Delay',
      severity: 'high',
      description: 'Land acquisition delayed by 3 weeks',
      deadline: '2024-04-30',
      assignedTo: 'John Doe',
      daysRemaining: 8
    },
    {
      id: 3,
      department: 'DoA',
      scheme: 'Crop Insurance #789',
      risk: 'Resource Shortage',
      severity: 'medium',
      description: 'Insufficient field staff for survey work',
      deadline: '2024-05-15',
      assignedTo: 'Mike Johnson',
      daysRemaining: 12
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Risk Alerts & Issues</h3>
          <p className="text-sm text-gray-600 mt-1">Projects requiring immediate attention</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Acknowledge All
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-red-600 font-medium">Critical Issues</p>
              <p className="text-3xl font-bold text-red-700">3</p>
            </div>
            <span className="text-3xl">🔴</span>
          </div>
          <p className="text-xs text-red-600 mt-2">Immediate action required</p>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-orange-600 font-medium">High Priority</p>
              <p className="text-3xl font-bold text-orange-700">5</p>
            </div>
            <span className="text-3xl">🟠</span>
          </div>
          <p className="text-xs text-orange-600 mt-2">Address within 48 hours</p>
        </div>
        
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Medium Priority</p>
              <p className="text-3xl font-bold text-yellow-700">8</p>
            </div>
            <span className="text-3xl">🟡</span>
          </div>
          <p className="text-xs text-yellow-600 mt-2">Monitor closely</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold mb-4">Active Risk Alerts</h4>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="border rounded-lg p-5 hover:shadow-md transition">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-semibold">{alert.scheme}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {alert.department}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Risk Type: <span className="font-medium">{alert.risk}</span></span>
                    <span>Assigned to: <span className="font-medium">{alert.assignedTo}</span></span>
                    <span>Deadline: <span className="font-medium">{new Date(alert.deadline).toLocaleDateString()}</span></span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Days Left</span>
                    <p className={`text-xl font-bold ${
                      alert.daysRemaining <= 3 ? 'text-red-600' : 
                      alert.daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {alert.daysRemaining}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskAlerts;