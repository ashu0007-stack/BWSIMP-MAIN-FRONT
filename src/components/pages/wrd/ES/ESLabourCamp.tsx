"use client";

import { useState, useEffect } from "react";
import { Home, Droplets, Shield, CheckCircle, XCircle, Plus, Utensils } from "lucide-react";
import { FaFirstAid } from "react-icons/fa";
import { 
  useLabourCamp, 
  useUpdateLabourCamp,
  useAddLabourCampFacility, 
  useUpdateLabourCampFacility 
} from "@/hooks/wrdHooks/ES/useESReports";

interface Facility {
  id: number;
  project_id: number;
  facility_type: 'accommodation' | 'washroom' | 'water' | 'kitchen' | 'medical' | 'safety' | 'other';
  facility_name: string;
  specification?: string;
  quantity: number;
  condition: 'good' | 'average' | 'poor' | 'not_available';
  last_inspection_date?: string;
  next_inspection_date?: string;
  remarks?: string;
  photo_url?: string;
  created_at: string;
}

interface ESLabourCampProps {
  id: number;
}

export default function ESLabourCamp({ id }: ESLabourCampProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch labour camp data
  const { data: labourCampData, isLoading, refetch } = useLabourCamp(id);
  
  // Mutations
  const addFacilityMutation = useAddLabourCampFacility();
  const updateFacilityMutation = useUpdateLabourCampFacility();
  const updateLabourCampMutation = useUpdateLabourCamp();

  // ✅ FIX: Properly handle data structure
  // labourCampData could be an object with facilities array or just the array
  const facilities: Facility[] = (() => {
    if (!labourCampData) return [];
    
    // If data is an object with 'facilities' property
    if (typeof labourCampData === 'object' && labourCampData.facilities) {
      return Array.isArray(labourCampData.facilities) ? labourCampData.facilities : [];
    }
    
    // If data is directly an array
    if (Array.isArray(labourCampData)) {
      return labourCampData;
    }
    
    // If data is an object that can be converted to array
    if (typeof labourCampData === 'object' && labourCampData.id) {
      return [labourCampData];
    }
    
    return [];
  })();

  const handleInspection = () => {
    if (facilities.length === 0) {
      alert("No facilities available to inspect");
      return;
    }

    // Update each facility individually with new inspection date
    facilities.forEach((facility) => {
      const nextInspectionDate = new Date(new Date(inspectionDate).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      updateFacilityMutation.mutate({
        id: facility.id,
        last_inspection_date: inspectionDate,
        next_inspection_date: nextInspectionDate
      });
    });

    alert(`Inspection recorded for ${facilities.length} facilities on ${inspectionDate}`);
    refetch();
  };

  const handleUpdateCondition = (facilityId: number, condition: Facility['condition']) => {
    updateFacilityMutation.mutate(
      { 
        id: facilityId, 
        condition: condition,
        last_inspection_date: new Date().toISOString().split('T')[0]
      },
      { 
        onSuccess: () => {
          refetch();
          alert('Condition updated successfully');
        },
        onError: (error) => {
          console.error('Update condition error:', error);
          alert('Failed to update condition');
        }
      }
    );
  };

  const handleAddFacility = (facilityData: any) => {
    addFacilityMutation.mutate(
      {
        work_id: id,
        ...facilityData
      },
      {
        onSuccess: () => {
          refetch();
          setShowForm(false);
          alert('Facility added successfully!');
        },
        onError: (error) => {
          console.error('Add facility error:', error);
          alert(`Failed to add facility: ${error.response?.data?.error || error.message}`);
        }
      }
    );
  };

  const handleUpdateFacility = (facilityData: any) => {
    if (!selectedFacility) return;
    
    updateFacilityMutation.mutate(
      {
        id: selectedFacility.id,
        ...facilityData
      },
      {
        onSuccess: () => {
          refetch();
          setShowForm(false);
          setSelectedFacility(null);
          alert('Facility updated successfully!');
        },
        onError: (error) => {
          console.error('Update facility error:', error);
        }
      }
    );
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return <Home className="w-5 h-5" />;
      case 'washroom': return <Droplets className="w-5 h-5" />;
      case 'water': return <Droplets className="w-5 h-5" />;
      case 'kitchen': return <Utensils className="w-5 h-5" />;
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

  // ✅ FIX: Calculate facility categories
  const facilityCategories = [
    {
      name: 'Accommodation',
      type: 'accommodation',
      facilities: facilities.filter((f: Facility) => f.facility_type === 'accommodation'),
      color: 'bg-blue-50 border-blue-200',
      icon: '🏠'
    },
    {
      name: 'Sanitation',
      type: 'washroom',
      facilities: facilities.filter((f: Facility) => f.facility_type === 'washroom'),
      color: 'bg-green-50 border-green-200',
      icon: '🚽'
    },
    {
      name: 'Water & Food',
      type: 'water',
      facilities: facilities.filter((f: Facility) => 
        f.facility_type === 'water' || f.facility_type === 'kitchen'
      ),
      color: 'bg-purple-50 border-purple-200',
      icon: '💧'
    },
    {
      name: 'Health & Safety',
      type: 'medical',
      facilities: facilities.filter((f: Facility) => 
        f.facility_type === 'medical' || f.facility_type === 'safety'
      ),
      color: 'bg-red-50 border-red-200',
      icon: '🏥'
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
  const hasFacilities = facilities.length > 0;
  
  if (!hasFacilities && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Facilities Found</h3>
          <p className="text-gray-500 mb-6">Add labour camp facilities to start monitoring</p>
          <button
            onClick={() => {
              setSelectedFacility(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add First Facility
          </button>
        </div>

        {/* ✅ Facility Form Modal को यहाँ भी रेंडर करें */}
        {showForm && (
          <FacilityForm
            facility={selectedFacility}
            onClose={() => {
              setShowForm(false);
              setSelectedFacility(null);
            }}
            onSubmit={handleAddFacility}
          />
        )}
      </div>
    );
  }

  // Calculate statistics
  const totalFacilities = facilities.length;
  const goodConditionCount = facilities.filter(f => f.condition === 'good').length;
  const needsAttentionCount = facilities.filter(f => 
    f.condition === 'poor' || f.condition === 'not_available'
  ).length;
  const accommodationCount = facilities.filter(f => f.facility_type === 'accommodation').length;
  const sanitationCount = facilities.filter(f => f.facility_type === 'washroom').length;

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
            onClick={() => {
              setSelectedFacility(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Facility
          </button>
          
          <button
            onClick={handleInspection}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            disabled={!hasFacilities}
          >
            <CheckCircle className="w-4 h-4" />
            Record Inspection
          </button>
        </div>
      </div>

      {/* Inspection Date */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1">Inspection Record</h3>
            <p className="text-sm text-gray-600">Record today's inspection of all facilities</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="border rounded px-3 py-2 w-full sm:w-auto"
            />
            <button
              onClick={handleInspection}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasFacilities}
            >
              Save Inspection for All Facilities
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
              <div className="text-2xl font-bold">{accommodationCount}</div>
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
              <div className="text-2xl font-bold">{sanitationCount}</div>
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
              <div className="text-2xl font-bold">{goodConditionCount}</div>
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
              <div className="text-2xl font-bold">{needsAttentionCount}</div>
              <div className="text-sm text-gray-600">Needs Attention</div>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Categories */}
      {facilityCategories.map((category) => (
        <div key={category.type} className={`mb-6 p-6 rounded-lg border ${category.color}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{category.icon}</span>
            <h3 className="font-bold text-lg">{category.name}</h3>
            <span className="ml-auto text-sm text-gray-500">
              {category.facilities.length} facilities
            </span>
          </div>
          
          {category.facilities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
              No facilities in this category
              <button
                onClick={() => {
                  setSelectedFacility(null);
                  setShowForm(true);
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mx-auto"
              >
                <Plus className="w-3 h-3" />
                Add {category.name} Facility
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.facilities.map((facility: Facility) => (
                <div key={facility.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
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
                    <p className="text-sm">
                      <span className="font-medium">Quantity:</span> {facility.quantity}
                    </p>
                    {facility.last_inspection_date && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Last inspected:</span> {new Date(facility.last_inspection_date).toLocaleDateString()}
                      </p>
                    )}
                    {facility.remarks && (
                      <p className="text-sm text-gray-500 italic">"{facility.remarks}"</p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => handleUpdateCondition(facility.id, 'good')}
                      className={`px-2 py-1 rounded text-xs ${
                        facility.condition === 'good' 
                          ? 'bg-green-100 text-green-800 border border-green-300 font-medium' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Mark as Good"
                    >
                      Good
                    </button>
                    <button
                      onClick={() => handleUpdateCondition(facility.id, 'average')}
                      className={`px-2 py-1 rounded text-xs ${
                        facility.condition === 'average' 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-medium' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Mark as Average"
                    >
                      Average
                    </button>
                    <button
                      onClick={() => handleUpdateCondition(facility.id, 'poor')}
                      className={`px-2 py-1 rounded text-xs ${
                        facility.condition === 'poor' 
                          ? 'bg-orange-100 text-orange-800 border border-orange-300 font-medium' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Mark as Poor"
                    >
                      Poor
                    </button>
                    <button
                      onClick={() => handleUpdateCondition(facility.id, 'not_available')}
                      className={`px-2 py-1 rounded text-xs ${
                        facility.condition === 'not_available' 
                          ? 'bg-red-100 text-red-800 border border-red-300 font-medium' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Mark as Not Available"
                    >
                      N/A
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedFacility(facility);
                      setShowForm(true);
                    }}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    Edit Details
                  </button>
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
            const hasFacility = facilities.some((f: Facility) => {
              const keywords = item.toLowerCase().split(' ');
              return keywords.some(keyword => 
                f.facility_name.toLowerCase().includes(keyword) ||
                (f.specification && f.specification.toLowerCase().includes(keyword))
              );
            });
            
            return (
              <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                {hasFacility ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <span className={`${hasFacility ? 'text-gray-800' : 'text-gray-500'}`}>
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
          onSubmit={selectedFacility ? handleUpdateFacility : handleAddFacility}
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
    { value: 'accommodation', label: 'Accommodation', icon: '🏠', description: 'Worker living quarters' },
    { value: 'washroom', label: 'Washroom/Toilet', icon: '🚽', description: 'Bathrooms and toilets' },
    { value: 'water', label: 'Water Facility', icon: '💧', description: 'Drinking water supply' },
    { value: 'kitchen', label: 'Kitchen/Mess', icon: '🍳', description: 'Cooking and dining area' },
    { value: 'medical', label: 'Medical Facility', icon: '🏥', description: 'First aid and medical care' },
    { value: 'safety', label: 'Safety Equipment', icon: '🛡️', description: 'Fire safety and protective gear' },
    { value: 'other', label: 'Other', icon: '📦', description: 'Other facilities' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' ? parseInt(value) || 1 : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.facility_name.trim()) {
      alert('Please enter facility name');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">
              {facility ? 'Edit Facility' : 'Add New Facility'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Facility Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {facilityTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, facility_type: type.value }))}
                    className={`p-3 border rounded flex flex-col items-center justify-center transition-colors ${
                      formData.facility_type === type.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{type.icon}</span>
                    <span className="text-xs font-medium">{type.label}</span>
                    <span className="text-xs text-gray-500 mt-1 text-center">{type.description}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Facility Name *
              </label>
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
              <label className="block text-sm font-medium mb-1">
                Specification
              </label>
              <textarea
                name="specification"
                value={formData.specification}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="e.g., Capacity: 50 persons, 10,000 LPH RO Plant, Dimensions, etc."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Remarks/Notes
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 h-24"
                placeholder="Any additional notes, maintenance requirements, or issues..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {facility ? 'Update' : 'Add'} Facility
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}