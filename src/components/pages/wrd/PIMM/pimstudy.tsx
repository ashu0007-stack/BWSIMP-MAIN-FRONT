

import React, { useState, useEffect } from 'react';
import { 
  useComparativeData, 
  useCreateComparativeRecord, 
  useUpdateComparativeRecord, 
  useDeleteComparativeRecord 
} from '@/hooks/wrdHooks/pim/comparativeStudyHooks'

interface ComparativeData {
  id: number;
  year: number;
  impact_area: string;
  unit: string;
  pim_value: string;
  non_pim_value: string;
  difference_percent: string;
  remarks: string;
  created_at?: string;
  updated_at?: string;
}

interface FormData {
  year: number;
  impact_area: string;
  unit: string;
  pim_value: string;
  non_pim_value: string;
  difference_percent: string;
  remarks: string;
}

interface ImpactArea {
  value: string;
  label: string;
  unit: string;
}

const PimComparativeStudy: React.FC = () => {
  const { data: comparativeData = [], isLoading, refetch } = useComparativeData();
  const createRecordMutation = useCreateComparativeRecord();
  const updateRecordMutation = useUpdateComparativeRecord();
  const deleteRecordMutation = useDeleteComparativeRecord();

  const [formData, setFormData] = useState<FormData>({
    year: new Date().getFullYear(),
    impact_area: '',
    unit: '',
    pim_value: '',
    non_pim_value: '',
    difference_percent: '',
    remarks: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Available impact areas with units
  const impactAreas: ImpactArea[] = [
    { value: 'irrigation_intensity', label: 'Irrigation Intensity', unit: '%' },
    { value: 'cropping_intensity', label: 'Cropping Intensity', unit: '%' },
    { value: 'water_use_efficiency', label: 'Water Use Efficiency', unit: '%' },
    { value: 'crop_yield', label: 'Crop Yield', unit: 'q/ha' },
    { value: 'farm_income', label: 'Farm Income', unit: '₹/ha' },
    { value: 'water_tax_collection', label: 'Water Tax Collection', unit: '₹' },
    { value: 'farmer_participation', label: 'Farmer Participation', unit: '%' },
    { value: 'women_participation', label: 'Women Participation', unit: '%' },
    { value: 'maintenance_fund', label: 'Maintenance Fund', unit: '₹' },
    { value: 'crop_diversification', label: 'Crop Diversification', unit: 'index' }
  ];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    
    if (name === 'impact_area') {
      const selectedArea = impactAreas.find(area => area.value === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        unit: selectedArea ? selectedArea.unit : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Calculate difference percentage automatically
  useEffect(() => {
    if (formData.pim_value && formData.non_pim_value) {
      const pimVal = parseFloat(formData.pim_value);
      const nonPimVal = parseFloat(formData.non_pim_value);
      
      if (!isNaN(pimVal) && !isNaN(nonPimVal) && nonPimVal !== 0) {
        const difference = ((pimVal - nonPimVal) / nonPimVal) * 100;
        setFormData(prev => ({
          ...prev,
          difference_percent: difference.toFixed(2)
        }));
      }
    }
  }, [formData.pim_value, formData.non_pim_value]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.impact_area || !formData.pim_value || !formData.non_pim_value) {
      alert('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateRecordMutation.mutate({ id: editingId, data: formData }, {
        onSuccess: () => resetForm()
      });
    } else {
      createRecordMutation.mutate(formData, {
        onSuccess: () => resetForm()
      });
    }
  };

  // Edit record
  const handleEdit = (record: ComparativeData): void => {
    setFormData({
      year: record.year,
      impact_area: record.impact_area,
      unit: record.unit,
      pim_value: record.pim_value,
      non_pim_value: record.non_pim_value,
      difference_percent: record.difference_percent,
      remarks: record.remarks || ''
    });
    setEditingId(record.id);
  };

  // Delete record
  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteRecordMutation.mutate(id);
    }
  };

  // Reset form
  const resetForm = (): void => {
    setFormData({
      year: new Date().getFullYear(),
      impact_area: '',
      unit: '',
      pim_value: '',
      non_pim_value: '',
      difference_percent: '',
      remarks: ''
    });
    setEditingId(null);
  };

  // Get impact area label
  const getImpactAreaLabel = (value: string): string => {
    const area = impactAreas.find(area => area.value === value);
    return area ? area.label : value;
  };

  // Calculate overall statistics
  const getStatistics = () => {
    const positiveImpact = comparativeData.filter((record: { difference_percent: string; }) => 
      parseFloat(record.difference_percent) > 0
    ).length;
    
    const totalRecords = comparativeData.length;
    const positivePercentage = totalRecords > 0 ? (positiveImpact / totalRecords) * 100 : 0;

    return {
      totalRecords,
      positiveImpact,
      positivePercentage: positivePercentage.toFixed(1)
    };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-[1800px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              PIM Comparative Impact Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare PIM and Non-PIM areas across key agricultural and water management indicators
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Impact Overview</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{stats.totalRecords}</div>
                  <div className="text-sm opacity-90">Total Records</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{stats.positiveImpact}</div>
                  <div className="text-sm opacity-90">Positive Impact</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{stats.positivePercentage}%</div>
                  <div className="text-sm opacity-90">Success Rate</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">
                    {comparativeData.filter((r: { difference_percent: string; }) => parseFloat(r.difference_percent) > 10).length}
                  </div>
                  <div className="text-sm opacity-90">High Impact (+10%)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Data Entry Form */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {editingId ? 'Edit Comparative Record' : 'Add New Comparative Record'}
                    </h2>
                    <p className="text-blue-100">
                      {editingId ? 'Update the comparative study record' : 'Enter new PIM vs Non-PIM comparison data'}
                    </p>
                  </div>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Year */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year *
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Impact Area */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Impact Area *
                      </label>
                      <select
                        name="impact_area"
                        value={formData.impact_area}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Impact Area</option>
                        {impactAreas.map(area => (
                          <option key={area.value} value={area.value}>
                            {area.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit (Auto-filled) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Unit
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* PIM Value */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PIM Area Value *
                      </label>
                      <input
                        type="number"
                        name="pim_value"
                        value={formData.pim_value}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter PIM value"
                      />
                    </div>

                    {/* Non-PIM Value */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Non-PIM Area Value *
                      </label>
                      <input
                        type="number"
                        name="non_pim_value"
                        value={formData.non_pim_value}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter non-PIM value"
                      />
                    </div>

                    {/* Difference Percentage (Auto-calculated) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Difference %
                      </label>
                      <input
                        type="number"
                        name="difference_percent"
                        value={formData.difference_percent}
                        readOnly
                        className={`w-full px-4 py-3 border rounded-xl font-semibold text-lg transition-all duration-200 ${
                          parseFloat(formData.difference_percent) > 0 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : parseFloat(formData.difference_percent) < 0 
                            ? 'bg-red-50 border-red-200 text-red-700' 
                            : 'bg-gray-50 border-gray-300 text-gray-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Remarks & Observations
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter additional comments, observations, or contextual information..."
                    />
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={createRecordMutation.isPending || updateRecordMutation.isPending}
                      className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createRecordMutation.isPending || updateRecordMutation.isPending}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      {createRecordMutation.isPending || updateRecordMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>{editingId ? 'Updating...' : 'Adding...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{editingId ? 'Update Record' : 'Add Record'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 text-white">
                <h3 className="text-xl font-semibold">
                  Comparative Impact Data
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                  {comparativeData.length} records showing PIM vs Non-PIM performance comparison
                </p>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-4 text-gray-600 text-lg">Loading comparative data...</span>
                </div>
              ) : comparativeData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Impact Area
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          PIM Value
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Non-PIM
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Difference
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Remarks
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {comparativeData.map((record: ComparativeData, index: number) => (
                        <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors duration-150'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{record.year}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getImpactAreaLabel(record.impact_area)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{record.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-semibold text-blue-600">
                              {record.pim_value}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm text-gray-600">
                              {record.non_pim_value}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              parseFloat(record.difference_percent) > 0 
                                ? 'bg-green-100 text-green-800' 
                                : parseFloat(record.difference_percent) < 0 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {parseFloat(record.difference_percent) > 0 ? '↗' : parseFloat(record.difference_percent) < 0 ? '↘' : '→'}
                              {parseFloat(record.difference_percent) > 0 ? '+' : ''}{record.difference_percent}%
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate" title={record.remarks}>
                              {record.remarks || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center space-x-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="text-xs font-medium">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center space-x-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-xs font-medium">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No comparative data available</h3>
                  <p className="text-gray-400 mb-6">Start by adding your first PIM vs Non-PIM comparison record</p>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Add First Record
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PimComparativeStudy;