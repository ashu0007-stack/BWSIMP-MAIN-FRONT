import React, { useState, useEffect } from 'react';
import { 
  useComparativeData, 
  useCreateComparativeRecord, 
  useUpdateComparativeRecord, 
  useDeleteComparativeRecord 
} from '@/hooks/wrdHooks/pim/comparativeStudyHooks'

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit3,
  Trash2,
  Save,
  Plus,
  AlertCircle,
  DownloadIcon,
  RefreshCw,
  Calendar,
  Hash,
  Percent,
  DollarSign,
  Users,
  Droplets,
  Sprout,
  Building,
  Shield,
  ArrowLeft,
  Eye,
  Filter,
  Search
} from 'lucide-react';

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
  icon: React.ReactNode;
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  // Available impact areas with units and icons
  const impactAreas: ImpactArea[] = [
    { value: 'irrigation_intensity', label: 'Irrigation Intensity', unit: '%', icon: <Droplets className="w-4 h-4" /> },
    { value: 'cropping_intensity', label: 'Cropping Intensity', unit: '%', icon: <Sprout className="w-4 h-4" /> },
    { value: 'water_use_efficiency', label: 'Water Use Efficiency', unit: '%', icon: <Droplets className="w-4 h-4" /> },
    { value: 'crop_yield', label: 'Crop Yield', unit: 'q/ha', icon: <Sprout className="w-4 h-4" /> },
    { value: 'farm_income', label: 'Farm Income', unit: '₹/ha', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'water_tax_collection', label: 'Water Tax Collection', unit: '₹', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'farmer_participation', label: 'Farmer Participation', unit: '%', icon: <Users className="w-4 h-4" /> },
    { value: 'women_participation', label: 'Women Participation', unit: '%', icon: <Users className="w-4 h-4" /> },
    { value: 'maintenance_fund', label: 'Maintenance Fund', unit: '₹', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'crop_diversification', label: 'Crop Diversification', unit: 'index', icon: <Sprout className="w-4 h-4" /> }
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

  // Get impact area icon
  const getImpactAreaIcon = (value: string): React.ReactNode => {
    const area = impactAreas.find(area => area.value === value);
    return area ? area.icon : <BarChart3 className="w-4 h-4" />;
  };

  // Filtered data based on search and year
  const filteredData = comparativeData.filter((record: ComparativeData) => {
    const matchesSearch = searchTerm === '' || 
      getImpactAreaLabel(record.impact_area).toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = yearFilter === '' || record.year.toString() === yearFilter;
    
    return matchesSearch && matchesYear;
  });

  // Calculate overall statistics
  const getStatistics = () => {
    const positiveImpact = filteredData.filter((record: { difference_percent: string; }) => 
      parseFloat(record.difference_percent) > 0
    ).length;
    
    const negativeImpact = filteredData.filter((record: { difference_percent: string; }) => 
      parseFloat(record.difference_percent) < 0
    ).length;
    
    const neutralImpact = filteredData.filter((record: { difference_percent: string; }) => 
      parseFloat(record.difference_percent) === 0
    ).length;
    
    const totalRecords = filteredData.length;
    const positivePercentage = totalRecords > 0 ? (positiveImpact / totalRecords) * 100 : 0;

    return {
      totalRecords,
      positiveImpact,
      negativeImpact,
      neutralImpact,
      positivePercentage: positivePercentage.toFixed(1)
    };
  };

  const stats = getStatistics();

  const inputClass = "w-full px-4 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]";
  const sectionClass = "bg-gray-50 border border-gray-300 rounded p-6";
  const sectionHeaderClass = "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Government Header */}
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">PIM Comparative Impact Analysis</h1>
                <p className="text-blue-200 text-sm">Compare PIM and Non-PIM areas across key agricultural and water management indicators</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#003087]" />
                Impact Overview
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                  <div className="text-2xl font-bold text-[#003087]">{stats.totalRecords}</div>
                  <div className="text-sm text-blue-800">Total Records</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                  <div className="text-2xl font-bold text-green-600">{stats.positiveImpact}</div>
                  <div className="text-sm text-green-800 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Positive Impact
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-300">
                  <div className="text-2xl font-bold text-red-600">{stats.negativeImpact}</div>
                  <div className="text-sm text-red-800 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Negative Impact
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                  <div className="text-2xl font-bold text-yellow-600">{stats.neutralImpact}</div>
                  <div className="text-sm text-yellow-800 flex items-center gap-1">
                    <Minus className="w-3 h-3" />
                    Neutral Impact
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 border-t border-gray-300 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={resetForm}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Record
                  </button>
                  <button
                    onClick={() => refetch()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Data Entry Form */}
            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-300 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h2 className={sectionHeaderClass}>
                    {editingId ? <Edit3 className="w-5 h-5 text-[#003087]" /> : ''}
                    {editingId ? 'Edit Comparative Record' : ''}
                  </h2>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                ?
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Year */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          required
                          className={`${inputClass} pl-10`}
                        >
                          {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Impact Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Impact Area *
                      </label>
                      <select
                        name="impact_area"
                        value={formData.impact_area}
                        onChange={handleInputChange}
                        required
                        className={inputClass}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        readOnly
                        className={`${inputClass} bg-gray-100 text-gray-600`}
                      />
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* PIM Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIM Area Value *
                      </label>
                      <input
                        type="number"
                        name="pim_value"
                        value={formData.pim_value}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                        className={inputClass}
                        placeholder="Enter PIM value"
                      />
                    </div>

                    {/* Non-PIM Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Non-PIM Area Value *
                      </label>
                      <input
                        type="number"
                        name="non_pim_value"
                        value={formData.non_pim_value}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                        className={inputClass}
                        placeholder="Enter non-PIM value"
                      />
                    </div>

                    {/* Difference Percentage (Auto-calculated) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difference %
                      </label>
                      <input
                        type="number"
                        name="difference_percent"
                        value={formData.difference_percent}
                        readOnly
                        className={`w-full px-4 py-2 border rounded focus:outline-none font-medium ${
                          parseFloat(formData.difference_percent) > 0 
                            ? 'bg-green-50 border-green-300 text-green-700' 
                            : parseFloat(formData.difference_percent) < 0 
                            ? 'bg-red-50 border-red-300 text-red-700' 
                            : 'bg-gray-100 border-gray-400 text-gray-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks & Observations
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={3}
                      className={inputClass}
                      placeholder="Enter additional comments, observations, or contextual information..."
                    />
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-300">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={createRecordMutation.isPending || updateRecordMutation.isPending}
                      className="px-6 py-3 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createRecordMutation.isPending || updateRecordMutation.isPending}
                      className="flex items-center gap-2 px-8 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] disabled:opacity-50 transition-colors font-medium"
                    >
                      {createRecordMutation.isPending || updateRecordMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{editingId ? 'Updating...' : 'Adding...'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{editingId ? 'Update Record' : 'Add Record'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-300 bg-gray-50">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#003087]" />
                      Comparative Impact Data
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredData.length} records showing PIM vs Non-PIM performance comparison
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] appearance-none"
                      >
                        <option value="">All Years</option>
                        {Array.from(new Set(comparativeData.map((r: ComparativeData) => r.year)))
                          .sort((a, b) => b - a)
                          .map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003087]"></div>
                  <span className="ml-4 text-gray-600">Loading comparative data...</span>
                </div>
              ) : filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Year
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Impact Area
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          PIM Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Non-PIM
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Difference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Remarks
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                      {filteredData.map((record: ComparativeData, index: number) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.year}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getImpactAreaIcon(record.impact_area)}
                              <div className="text-sm font-medium text-gray-900">
                                {getImpactAreaLabel(record.impact_area)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{record.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-blue-600">
                              {record.pim_value}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {record.non_pim_value}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
                              parseFloat(record.difference_percent) > 0 
                                ? 'bg-green-50 text-green-700 border-green-300' 
                                : parseFloat(record.difference_percent) < 0 
                                ? 'bg-red-50 text-red-700 border-red-300' 
                                : 'bg-gray-50 text-gray-600 border-gray-300'
                            }`}>
                              {parseFloat(record.difference_percent) > 0 
                                ? <TrendingUp className="w-3 h-3" /> 
                                : parseFloat(record.difference_percent) < 0 
                                ? <TrendingDown className="w-3 h-3" /> 
                                : <Minus className="w-3 h-3" />
                              }
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
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-300 transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-300 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
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
                    <BarChart3 className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No comparative data available</h3>
                  <p className="text-gray-400 mb-6">Start by adding your first PIM vs Non-PIM comparison record</p>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors font-medium"
                  >
                    Add First Record
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PimComparativeStudy;