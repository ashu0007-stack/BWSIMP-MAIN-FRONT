// components/milestone/MilestoneProgress.tsx - UPDATED VERSION
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface MilestoneData {
  id: number;
  milestone_number: number;
  milestone_name: string;
  milestone_qty: number;
}

interface Component {
  id: number;
  name: string;
  field_name: string;
  unitname: string;
  total_qty: number;
  milestones?: MilestoneData[];
  milestone_1_percentage?: number;
  milestone_2_percentage?: number;
  milestone_3_percentage?: number;
  milestone_4_percentage?: number;
}

interface AddProgressFormProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onAddProgress: (data: any) => void;
  components: Component[];
  selectedPackage: string | null;
  selectedMilestone: number;
  packageMilestones?: any[];
}

export default function AddProgressForm({
  showModal,
  setShowModal,
  onAddProgress,
  components,
  selectedPackage,
  selectedMilestone,
  packageMilestones = [],
}: AddProgressFormProps) {
  const [formData, setFormData] = useState({
    progressDate: new Date().toISOString().split('T')[0],
    fortnight: "First",
    remark: "",
  });

  const [quantities, setQuantities] = useState<Record<number, number | string>>({});
  const [milestoneTargets, setMilestoneTargets] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Initialize quantities with empty string for all components
  useEffect(() => {
    if (components && components.length > 0) {
      console.log("🔄 Initializing quantities for components:", components.length);
      const initialQuantities: Record<number, number | string> = {};
      components.forEach(comp => {
        initialQuantities[comp.id] = ""; // Empty string से शुरू करें
      });
      setQuantities(initialQuantities);
      
      // Debug log
      console.log("📋 Initial quantities set:", initialQuantities);
    }
  }, [components]);

  // 🔹 Set milestone targets from API
  useEffect(() => {
    if (packageMilestones.length > 0 && selectedMilestone) {
      console.log("🎯 Setting milestone targets from packageMilestones");
      const targets: Record<number, number> = {};
      
      packageMilestones.forEach((component: any) => {
        const milestoneData = component.milestones?.find(
          (m: MilestoneData) => m.milestone_number === selectedMilestone
        );
        
        if (milestoneData && component.component_id) {
          targets[component.component_id] = Number(milestoneData.milestone_qty) || 0;
        }
      });
      
      console.log("🎯 Milestone targets:", targets);
      setMilestoneTargets(targets);
    }
  }, [packageMilestones, selectedMilestone]);

  if (!showModal) return null;

 // AddProgressForm.tsx में handleSubmit function को ये update करें:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    console.log("🚀 Form submission started");
    console.log("🔍 Current quantities state:", quantities);
    
    // 🔹 VALIDATION
    let hasValidQuantity = false;
    const validationErrors: string[] = [];
    const formattedComponents: any[] = [];
    
    components.forEach(comp => {
      const rawQty = quantities[comp.id];
      const qty = typeof rawQty === 'string' 
        ? (rawQty === '' ? 0 : parseFloat(rawQty) || 0)
        : (rawQty || 0);
      
      const targetQty = getMilestoneTargetQty(comp.id);
      
      console.log(`📊 Component ${comp.id} (${comp.name}):`, {
        rawQty,
        parsedQty: qty,
        targetQty,
        type: typeof rawQty
      });
      
      // हर component को भेजें, चाहे quantity 0 हो या न हो
      formattedComponents.push({
        componentId: comp.id,
        quantity: qty,  // 0 भी भेजें
        fieldName: comp.field_name,
        unit: comp.unitname,
      });
      
      if (qty > 0) {
        hasValidQuantity = true;
        
        // Check if quantity exceeds target
        if (qty > targetQty) {
          validationErrors.push(
            `Quantity for ${comp.name} (${qty}) exceeds target (${targetQty})`
          );
        }
      }
    });
    
    if (!hasValidQuantity) {
      alert("❌ Please enter progress quantity greater than 0 for at least one component!");
      setIsSubmitting(false);
      return;
    }
    
    if (validationErrors.length > 0) {
      alert("Validation Errors:\n" + validationErrors.join("\n"));
      setIsSubmitting(false);
      return;
    }
    
    // 🔹 Validate progress date
    if (!formData.progressDate) {
      alert("Please select a progress date!");
      setIsSubmitting(false);
      return;
    }
    
    const data = {
      ...formData,
      packageNumber: selectedPackage,
      milestoneNumber: selectedMilestone,
      components: formattedComponents, // ✅ सभी components भेजें
    };
    
    console.log("📦 Final payload to be sent:", JSON.stringify(data, null, 2));
    console.log("📤 Sending to onAddProgress...");
    
    await onAddProgress(data);
    
    // Reset form
    setFormData({
      progressDate: new Date().toISOString().split('T')[0],
      fortnight: "First",
      remark: "",
    });
    
    // Reset quantities to empty
    const resetQuantities: Record<number, number | string> = {};
    components.forEach(comp => {
      resetQuantities[comp.id] = "";
    });
    setQuantities(resetQuantities);
    
    // Modal बंद न करें, success message दिखाएँ
    console.log("✅ Form submitted successfully");
    
  } catch (error) {
    console.error("❌ Error in form submission:", error);
    alert("Failed to submit form. Please check console for details.");
  } finally {
    setIsSubmitting(false);
  }
};

  const getMilestonePercentage = (component: Component) => {
    switch (selectedMilestone) {
      case 1: return component.milestone_1_percentage || 0;
      case 2: return component.milestone_2_percentage || 0;
      case 3: return component.milestone_3_percentage || 0;
      case 4: return component.milestone_4_percentage || 0;
      default: return 0;
    }
  };

  const getMilestoneTargetQty = (componentId: number) => {
    return milestoneTargets[componentId] || 0;
  };

  const handleQuantityChange = (componentId: number, value: string) => {
    console.log(`✏️ Quantity change for component ${componentId}:`, value);
    
    // Allow empty string or valid number
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setQuantities(prev => ({
        ...prev,
        [componentId]: value
      }));
    }
  };

  const handleQuantityBlur = (componentId: number, value: string) => {
    // Convert empty string to 0 on blur
    if (value === "") {
      setQuantities(prev => ({
        ...prev,
        [componentId]: 0
      }));
    } else {
      const numValue = parseFloat(value) || 0;
      setQuantities(prev => ({
        ...prev,
        [componentId]: numValue
      }));
    }
  };

  const getDisplayValue = (value: number | string): string => {
    if (typeof value === 'number') {
      return value === 0 ? '' : value.toString();
    }
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                Add Progress - Milestone {selectedMilestone}
              </h3>
              <p className="text-blue-100 text-sm">
                Package: {selectedPackage}
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-white hover:text-blue-200 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Date *
              </label>
              <input
                type="date"
                required
                value={formData.progressDate}
                onChange={(e) =>
                  setFormData({ ...formData, progressDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fortnight
              </label>
              <select
                value={formData.fortnight}
                onChange={(e) =>
                  setFormData({ ...formData, fortnight: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="First">First Fortnight</option>
                <option value="Second">Second Fortnight</option>
              </select>
            </div>
          </div>

          {/* Components Table */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Component Progress
              </h4>
              <button
                type="button"
                onClick={() => {
                  // Reset all quantities to empty
                  const resetQuantities: Record<number, number | string> = {};
                  components.forEach(comp => {
                    resetQuantities[comp.id] = "";
                  });
                  setQuantities(resetQuantities);
                  console.log("🧹 Cleared all quantities");
                }}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={isSubmitting}
              >
                Clear All
              </button>
            </div>
            
            {/* Debug Section */}
            {/* <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                🔍 Debug: Enter quantity in any field and check console logs
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Selected Milestone: {selectedMilestone} | Components: {components.length}
              </p>
            </div> */}
            
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Component
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit
                    </th>
                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Milestone %
                    </th> */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Target Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Progress Qty *
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {components.map((component) => {
                    const milestonePercent = getMilestonePercentage(component);
                    const targetQty = getMilestoneTargetQty(component.id);
                    const currentValue = quantities[component.id] || "";
                    const displayValue = getDisplayValue(currentValue);
                    const parsedQty = typeof currentValue === 'string' 
                      ? (currentValue === '' ? 0 : parseFloat(currentValue) || 0)
                      : currentValue;

                    return (
                      <tr key={component.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {component.name}
                          </div>
                          <div className="text-xs text-gray-500">ID: {component.id}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {component.unitname}
                        </td>
                        {/* <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {(milestonePercent * 100).toFixed(1)}%
                          </span>
                        </td> */}
                        <td className="px-4 py-3 text-gray-700">
                          {targetQty.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={displayValue}
                              onChange={(e) => {
                                handleQuantityChange(component.id, e.target.value);
                              }}
                              onBlur={(e) => {
                                handleQuantityBlur(component.id, e.target.value);
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                parsedQty > 0 ? 'border-green-400 bg-green-50' : 'border-gray-300'
                              }`}
                              placeholder="0.00"
                              disabled={isSubmitting}
                            />
                            <div className="text-xs text-gray-500 mt-1 flex justify-between">
                              <span className={parsedQty > 0 ? "text-green-600 font-semibold" : "text-gray-500"}>
                                {parsedQty > 0 ? `✓ Entered: ${parsedQty}` : 'Enter progress'}
                              </span>
                              <span>Max: {targetQty.toLocaleString()}</span>
                            </div>
                            {parsedQty > targetQty && (
                              <div className="text-xs text-red-600 mt-1">
                                ⚠️ Exceeds target by {(parsedQty - targetQty).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Summary Section */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Components with quantity &gt; 0: 
                  </span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {Object.values(quantities).filter(val => {
                      const numVal = typeof val === 'string' 
                        ? (val === '' ? 0 : parseFloat(val) || 0)
                        : val;
                      return numVal > 0;
                    }).length}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Total Components: {components.length}
                </div>
              </div>
            </div>
          </div>

          {/* Remark */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remark}
              onChange={(e) =>
                setFormData({ ...formData, remark: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any remarks or notes..."
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Progress'
              )}
            </button>
          </div>
          
          {/* Debug Info */}
          {/* <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h4 className="font-bold mb-2 text-sm text-gray-700">Debug Information:</h4>
            <div className="text-xs space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Package:</span> {selectedPackage}
                </div>
                <div>
                  <span className="font-medium">Milestone:</span> {selectedMilestone}
                </div>
                <div>
                  <span className="font-medium">Progress Date:</span> {formData.progressDate}
                </div>
                <div>
                  <span className="font-medium">Fortnight:</span> {formData.fortnight}
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium">Current Quantities State:</span>
                <pre className="mt-1 p-2 bg-gray-800 text-gray-100 rounded text-xs overflow-auto max-h-20">
                  {JSON.stringify(quantities, null, 2)}
                </pre>
              </div>
            </div>
          </div> */}
        </form>
      </div>
    </div>
  );
}