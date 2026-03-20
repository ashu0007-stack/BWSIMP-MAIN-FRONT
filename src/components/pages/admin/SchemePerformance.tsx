import { useState } from 'react';

const SchemePerformance = () => {
  const [schemes] = useState([
    {
      id: 1,
      name: 'Rural Housing Scheme',
      department: 'RDD',
      progress: 82,
      pdo: 85,
      budget: '1.2M',
      spent: '0.9M',
      status: 'on-track',
      startDate: '2024-01-15',
      endDate: '2024-12-20'
    },
    {
      id: 2,
      name: 'Irrigation Project',
      department: 'WRD',
      progress: 58,
      pdo: 62,
      budget: '1.8M',
      spent: '0.7M',
      status: 'at-risk',
      startDate: '2024-02-01',
      endDate: '2024-11-30'
    },
    {
      id: 3,
      name: 'Crop Insurance',
      department: 'DoA',
      progress: 69,
      pdo: 71,
      budget: '0.8M',
      spent: '0.6M',
      status: 'on-track',
      startDate: '2024-01-10',
      endDate: '2024-10-15'
    }
  ]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Scheme Performance</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed view of individual scheme metrics</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text"
            placeholder="Search schemes..."
            className="px-4 py-2 border rounded-lg text-sm"
          />
          <select className="px-4 py-2 border rounded-lg text-sm bg-white">
            <option>All Departments</option>
            <option>RDD</option>
            <option>WRD</option>
            <option>DoA</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDO</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schemes.map((scheme) => (
              <tr key={scheme.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{scheme.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(scheme.startDate).toLocaleDateString()} - {new Date(scheme.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{scheme.department}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{scheme.progress}%</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${scheme.progress}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    scheme.pdo >= 80 ? 'bg-green-100 text-green-800' :
                    scheme.pdo >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {scheme.pdo}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">${scheme.budget}</div>
                  <div className="text-xs text-gray-500">Spent: ${scheme.spent}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    scheme.status === 'on-track' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {scheme.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                  <button className="text-gray-600 hover:text-gray-800">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchemePerformance;