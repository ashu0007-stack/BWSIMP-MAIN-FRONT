"use client";

import { useState, useEffect } from "react";
import { Home, Droplets, Shield, CheckCircle, XCircle, Plus } from "lucide-react";
import { FaFirstAid } from "react-icons/fa";
import { useLabourCamp, useUpdateLabourCamp } from "@/hooks/wrdHooks/ES/useESReports";

interface Facility {
  id: number;
  facility_type: string;
  facility_name: string;
  specification?: string;
  quantity: number;
  condition: 'good' | 'average' | 'poor' | 'not_available';
  last_inspection_date?: string;
  remarks?: string;
  photo_url?: string;
}

interface ESLabourCampProps {
  id: number;
}

export default function ESLabourCamp({ id }: ESLabourCampProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: facilitiesData = [], isLoading, refetch } = useLabourCamp(id);
  const updateMutation = useUpdateLabourCamp();

  // ✅ FIX: Ensure facilities is always an array
  const facilities: Facility[] = Array.isArray(facilitiesData) ? facilitiesData : [];

  const handleInspection = () => {
    if (facilities.length === 0) {
      alert("No facilities available to inspect");
      return;
    }

    const updates = facilities.map((facility: Facility) => ({
      id: facility.id,
      last_inspection_date: inspectionDate,
      next_inspection_date: new Date(new Date(inspectionDate).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
    }));

    // Update all facilities with new inspection date
    updateMutation.mutate(updates, {
      onSuccess: () => refetch()
    });
  };

  const handleUpdateCondition = (id: number, condition: string) => {
    updateMutation.mutate(
      [{ id, condition, last_inspection_date: new Date().toISOString().split('T')[0] }],
      { onSuccess: () => refetch() }
    );
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return <Home className="w-5 h-5" />;
      case 'washroom': return <Droplets className="w-5 h-5" />;
      case 'water': return <Droplets className="w-5 h-5" />;
      case 'medical': return <FaFirstAid className="w-5 h-5" />;
      case 'safety': return <Shield className="w-5 h-5" />;
      default: return <Home className="w-5 h-5" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'not_available': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ FIX: Use safe array methods
  const facilityCategories = [
    {
      name: 'Accommodation',
      type: 'accommodation',
      facilities: facilities.filter((f: Facility) => f.facility_type === 'accommodation'),
      color: 'bg-blue-50 border-blue-200'
    },
    {
      name: 'Sanitation',
      type: 'washroom',
      facilities: facilities.filter((f: Facility) => f.facility_type === 'washroom'),
      color: 'bg-green-50 border-green-200'
    },
    {
      name: 'Water & Food',
      type: 'water',
      facilities: facilities.filter((f: Facility) => f.facility_type === 'water' || f.facility_type === 'kitchen'),
      color: 'bg-purple-50 border-purple-200'
    },
    {
      name: 'Health & Safety',
      type: 'medical',
      facilities: facilities.filter((f: Facility) => 
        f.facility_type === 'medical' || f.facility_type === 'safety'
      ),
      color: 'bg-red-50 border-red-200'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading labour camp facilities...</div>
      </div>
    );
  }

  // ✅ Show message if no facilities
  if (facilities.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Facilities Found</h3>
          <p className="text-gray-500 mb-6">Add labour camp facilities to start monitoring</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add First Facility
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Labour Camp Facilities</h2>
          <p className="text-gray-600">Monitor and maintain worker accommodation facilities</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Facility
          </button>
          
          <button
            onClick={handleInspection}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Record Inspection
          </button>
        </div>
      </div>

      {/* Inspection Date */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Inspection Record</h3>
            <p className="text-sm text-gray-600">Record today's inspection of all facilities</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button
              onClick={handleInspection}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={facilities.length === 0}
            >
              Save Inspection
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {facilities.filter((f: Facility) => f.facility_type === 'accommodation').length}
              </div>
              <div className="text-sm text-gray-600">Accommodation Units</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded">
              <Droplets className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {facilities.filter((f: Facility) => f.facility_type === 'washroom').length}
              </div>
              <div className="text-sm text-gray-600">Sanitation Units</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded">
              <FaFirstAid className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {facilities.filter((f: Facility) => f.condition === 'good').length}
              </div>
              <div className="text-sm text-gray-600">Good Condition</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {facilities.filter((f: Facility) => f.condition === 'poor' || f.condition === 'not_available').length}
              </div>
              <div className="text-sm text-gray-600">Needs Attention</div>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Categories */}
      {facilityCategories.map((category) => (
        <div key={category.type} className={`mb-6 p-6 rounded-lg border ${category.color}`}>
          <h3 className="font-bold text-lg mb-4">{category.name}</h3>
          
          {category.facilities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No facilities in this category
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.facilities.map((facility: Facility) => (
                <div key={facility.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getFacilityIcon(facility.facility_type)}
                      <h4 className="font-semibold">{facility.facility_name}</h4>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(facility.condition)}`}>
                      {facility.condition.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {facility.specification && (
                      <p className="text-sm text-gray-600">{facility.specification}</p>
                    )}
                    <p className="text-sm">Quantity: <span className="font-semibold">{facility.quantity}</span></p>
                    {facility.last_inspection_date && (
                      <p className="text-sm text-gray-500">
                        Last inspected: {new Date(facility.last_inspection_date).toLocaleDateString()}
                      </p>
                    )}
                    {facility.remarks && (
                      <p className="text-sm text-gray-500 italic">"{facility.remarks}"</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateCondition(facility.id, 'good')}
                      className={`px-2 py-1 rounded text-xs ${
                        facility.condition === 'good' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Good
                    </button>
                    <button
                      onClick={() => handleUpdateCondition(facility.id, 'average')}
                      className={`px-2 py-1 rounded text-xs ${
                        facility.condition === 'average' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Average
                    </button>
                    <button
                      onClick={() => handleUpdateCondition(facility.id, 'poor')}
                      className={`px-2 py-1 rounded text-xs ${
                        facility.condition === 'poor' ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Poor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Checklist Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="font-bold text-lg mb-4">Facility Checklist</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Separate accommodation for male and female workers',
            'Adequate ventilation and lighting',
            'Safe drinking water availability',
            'Functional toilets and bathrooms',
            'Proper drainage system',
            'First aid facilities',
            'Fire safety equipment',
            'Proper waste disposal system',
            'Kitchen hygiene maintained',
            'Emergency contact numbers displayed'
          ].map((item, index) => {
            const hasFacility = facilities.some((f: Facility) => 
              f.facility_name.toLowerCase().includes(item.toLowerCase().split(' ')[0])
            );
            
            return (
              <div key={index} className="flex items-center gap-3">
                {hasFacility ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={hasFacility ? 'text-gray-800' : 'text-gray-500'}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facility Form Modal */}
      {showForm && (
        <FacilityForm
          facility={selectedFacility}
          onClose={() => {
            setShowForm(false);
            setSelectedFacility(null);
          }}
          onSubmit={(data: any) => {
            // Submit logic
            console.log(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

// Facility Form Component
function FacilityForm({ facility, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    facility_type: facility?.facility_type || 'accommodation',
    facility_name: facility?.facility_name || '',
    specification: facility?.specification || '',
    quantity: facility?.quantity || 1,
    condition: facility?.condition || 'good',
    remarks: facility?.remarks || ''
  });

  const facilityTypes = [
    { value: 'accommodation', label: 'Accommodation', icon: '🏠' },
    { value: 'washroom', label: 'Washroom/Toilet', icon: '🚽' },
    { value: 'water', label: 'Water Facility', icon: '💧' },
    { value: 'kitchen', label: 'Kitchen/Mess', icon: '🍳' },
    { value: 'medical', label: 'Medical Facility', icon: '🏥' },
    { value: 'safety', label: 'Safety Equipment', icon: '🛡️' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

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
            {facility ? 'Edit Facility' : 'Add New Facility'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facility Type</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {facilityTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, facility_type: type.value }))}
                    className={`p-3 border rounded flex flex-col items-center ${
                      formData.facility_type === type.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl mb-1">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Facility Name</label>
              <input
                type="text"
                name="facility_name"
                value={formData.facility_name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                placeholder="e.g., Male Accommodation Hall, Drinking Water RO Plant"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Specification</label>
              <textarea
                name="specification"
                value={formData.specification}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="e.g., Capacity: 50 persons, 10,000 LPH RO Plant"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Remarks/Notes</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 h-24"
                placeholder="Any additional notes or maintenance requirements..."
              />
            </div>
            
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
                {facility ? 'Update' : 'Add'} Facility
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}