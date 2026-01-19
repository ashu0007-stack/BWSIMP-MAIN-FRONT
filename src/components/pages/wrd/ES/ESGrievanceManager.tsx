"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle, Download, Eye } from "lucide-react";
import { useGrievances, useAddGrievance, useUpdateGrievance } from "@/hooks/wrdHooks/ES/useESReports";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "@/apiInterceptor/axiosInterceptor";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
interface Grievance {
  id: number;
  grievance_id: string;
  received_date: string;
  complainant_name: string;
  contact_number?: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  assigned_to?: string;
  resolution_date?: string;
  resolution_details?: string;
  created_at: string;
}

interface ESGrievanceManagerProps {
  id: number;
}

export default function ESGrievanceManager({ id }: ESGrievanceManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  const queryClient = useQueryClient();
  
  // ✅ SAFETY FIX: Check if hooks exist, otherwise use inline mutations
  const { data: grievancesData = [], isLoading, refetch } = useGrievances(id, filters);
  
  // ✅ Ensure grievances is always an array
  const grievances: Grievance[] = Array.isArray(grievancesData) ? grievancesData : [];
  
  // ✅ Fallback if hooks don't exist
  const addMutation = useAddGrievance ? useAddGrievance() : useMutation({
    mutationFn: async (grievanceData: any) => {
      const response = await axiosInstance.post(`${API_URL}/esRoutes/api/es/grievances`, {
        ...grievanceData,
        project_id: id
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances', id] });
      setShowForm(false);
    }
  });

  const updateMutation = useUpdateGrievance ? useUpdateGrievance() : useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await axiosInstance.put(`${API_URL}/esRoutes/grievances/${id}`,updates );
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances', id] });
    }
  });

  const handleSubmit = (data: any) => {
    const grievanceData = {
      project_id: id,
      ...data
    };

    if (selectedGrievance) {
      updateMutation.mutate(
        { id: selectedGrievance.id, ...grievanceData },
        {
          onSuccess: () => {
            refetch();
            setShowForm(false);
            setSelectedGrievance(null);
          }
        }
      );
    } else {
      addMutation.mutate(grievanceData, {
        onSuccess: () => {
          refetch();
          setShowForm(false);
        }
      });
    }
  };

  const handleResolve = (id: number, status: string) => {
    updateMutation.mutate(
      { id, status, resolution_date: new Date().toISOString().split('T')[0] },
      { onSuccess: () => refetch() }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToExcel = () => {
    // Export logic
    const csvData = grievances.map(g => ({
      'Grievance ID': g.grievance_id,
      'Date': g.received_date,
      'Complainant': g.complainant_name,
      'Category': g.category,
      'Priority': g.priority,
      'Status': g.status,
      'Description': g.description,
      'Resolution': g.resolution_details || 'Not resolved',
      'Resolved Date': g.resolution_date || 'N/A'
    }));

    const csv = convertToCSV(csvData);
    downloadCSV(csv, `grievances_${id}.csv`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading grievances...</div>
      </div>
    );
  }

  // ✅ Show empty state
  if (grievances.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Grievances Found</h3>
          <p className="text-gray-500 mb-6">No grievances have been registered for this project yet.</p>
          <button
            onClick={() => {
              setSelectedGrievance(null);
              setShowForm(true);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Register First Grievance
          </button>
        </div>
      </div>
    );
  }

  // ✅ Calculate statistics safely
  const totalGrievances = grievances.length;
  const resolvedCount = grievances.filter(g => g.status === 'resolved').length;
  const pendingCount = grievances.filter(g => g.status === 'pending').length;
  const highPriorityCount = grievances.filter(g => g.priority === 'high').length;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Grievance Management</h2>
          <p className="text-gray-600">Register, track, and resolve grievances</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            disabled={grievances.length === 0}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              setSelectedGrievance(null);
              setShowForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Grievance
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Categories</option>
              <option value="labour">Labour</option>
              <option value="environment">Environment</option>
              <option value="safety">Safety</option>
              <option value="payment">Payment</option>
              <option value="facility">Facility</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by complainant name, grievance ID, or description..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full border rounded pl-10 pr-3 py-2"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Statistics - ✅ FIXED: Using pre-calculated values */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {totalGrievances}
          </div>
          <div className="text-sm text-gray-600">Total Grievances</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {resolvedCount}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {pendingCount}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {highPriorityCount}
          </div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
      </div>

      {/* Grievance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Grievance ID</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Complainant</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {grievances.map((grievance) => (
                <tr key={grievance.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono">{grievance.grievance_id}</td>
                  <td className="p-3">{new Date(grievance.received_date).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div>{grievance.complainant_name}</div>
                    {grievance.contact_number && (
                      <div className="text-sm text-gray-500">{grievance.contact_number}</div>
                    )}
                  </td>
                  <td className="p-3">{grievance.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(grievance.priority)}`}>
                      {grievance.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(grievance.status)}`}>
                      {grievance.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedGrievance(grievance);
                          setShowForm(true);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View/Edit"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {grievance.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResolve(grievance.id, 'resolved')}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResolve(grievance.id, 'rejected')}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {grievances.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No grievances found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grievance Form Modal */}
      {showForm && (
        <GrievanceForm
          grievance={selectedGrievance}
          onClose={() => {
            setShowForm(false);
            setSelectedGrievance(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

// Helper component for grievance form
function GrievanceForm({ grievance, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    received_date: grievance?.received_date || new Date().toISOString().split('T')[0],
    complainant_name: grievance?.complainant_name || '',
    contact_number: grievance?.contact_number || '',
    category: grievance?.category || 'labour',
    description: grievance?.description || '',
    priority: grievance?.priority || 'medium',
    status: grievance?.status || 'pending',
    resolution_details: grievance?.resolution_details || ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">
            {grievance ? 'Edit Grievance' : 'Register New Grievance'}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="received_date"
                  value={formData.received_date}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="labour">Labour</option>
                  <option value="environment">Environment</option>
                  <option value="safety">Safety</option>
                  <option value="payment">Payment</option>
                  <option value="facility">Facility</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Complainant Name</label>
                <input
                  type="text"
                  name="complainant_name"
                  value={formData.complainant_name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 h-32"
                required
              />
            </div>
            
            {formData.status === 'resolved' && (
              <div>
                <label className="block text-sm font-medium mb-1">Resolution Details</label>
                <textarea
                  name="resolution_details"
                  value={formData.resolution_details}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 h-24"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {grievance ? 'Update' : 'Register'} Grievance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function convertToCSV(data: any[]) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}