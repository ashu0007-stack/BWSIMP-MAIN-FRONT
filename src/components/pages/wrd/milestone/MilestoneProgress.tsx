// components/milestone/MilestoneProgress.tsx - UPDATED VERSION
"use client";

import { useState, useEffect } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";

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
    progressDate: "",
    fortnight: "First",
    remark: "",
  });

  const [quantities, setQuantities] = useState<Record<number, number | string>>({});
  const [milestoneTargets, setMilestoneTargets] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 🔹 Get current date and set default
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 🔹 Determine fortnight from date (1-15 or 16-31)
  const getFortnightFromDate = (dateString: string) => {
    if (!dateString) return "First";
    
    const date = new Date(dateString);
    const day = date.getDate();
    
    if (day >= 1 && day <= 15) {
      return "First";
    } else if (day >= 16 && day <= 31) {
      return "Second";
    }
    return "First";
  };

  // 🔹 Get max date (can't select future dates)
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 🔹 Get min date for the month (1st of current month)
  const getMinDate = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  };

  // 🔹 Validate date and fortnight
  const validateDateAndFortnight = (dateString: string, fortnight: string) => {
    const errors: string[] = [];
    
    if (!dateString) {
      errors.push("Please select a date");
      return errors;
    }
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    const day = selectedDate.getDate();
    
    // Check if date is in future
    if (selectedDate > today) {
      errors.push("Cannot select future dates");
    }
    
    // Check if date is within current month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (selectedDate.getMonth() !== currentMonth || selectedDate.getFullYear() !== currentYear) {
      errors.push("Progress can only be added for current month");
    }
    
    // Check if fortnight matches date
    const expectedFortnight = getFortnightFromDate(dateString);
    if (fortnight !== expectedFortnight) {
      errors.push(`Date ${dateString} belongs to ${expectedFortnight === "First" ? "1-15" : "16-31"} fortnight, not ${fortnight === "First" ? "1-15" : "16-31"}`);
    }
    
    return errors;
  };

  // 🔹 Initialize quantities with empty string for all components
  useEffect(() => {
    if (showModal && components && components.length > 0) {
      console.log("🔄 Initializing quantities for components:", components.length);
      
      // Set default date to today
      const today = getCurrentDate();
      const defaultFortnight = getFortnightFromDate(today);
      
      setFormData(prev => ({
        ...prev,
        progressDate: today,
        fortnight: defaultFortnight
      }));
      
      const initialQuantities: Record<number, number | string> = {};
      components.forEach(comp => {
        initialQuantities[comp.id] = "";
      });
      setQuantities(initialQuantities);
      
      console.log("📋 Form initialized with:", { today, defaultFortnight });
    }
  }, [components, showModal]);

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

  // 🔹 Handle date change
  const handleDateChange = (date: string) => {
    const fortnight = getFortnightFromDate(date);
    const errors = validateDateAndFortnight(date, fortnight);
    
    setValidationErrors(errors);
    setFormData({
      ...formData,
      progressDate: date,
      fortnight: fortnight
    });
    
    console.log("📅 Date changed:", { date, fortnight, errors });
  };

  // 🔹 Handle fortnight change
  const handleFortnightChange = (fortnight: string) => {
    if (!formData.progressDate) {
      setValidationErrors(["Please select date first"]);
      return;
    }
    
    const errors = validateDateAndFortnight(formData.progressDate, fortnight);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setFormData({
        ...formData,
        fortnight: fortnight
      });
    }
  };

  if (!showModal) return null;

  // 🔹 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date and fortnight
    const dateErrors = validateDateAndFortnight(formData.progressDate, formData.fortnight);
    if (dateErrors.length > 0) {
      setValidationErrors(dateErrors);
      alert("Date Validation Errors:\n" + dateErrors.join("\n"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("🚀 Form submission started");
      
      // 🔹 VALIDATION: Check if at least one quantity > 0
      let hasValidQuantity = false;
      const quantityErrors: string[] = [];
      const formattedComponents: any[] = [];
      
      components.forEach(comp => {
        const rawQty = quantities[comp.id];
        const qty = typeof rawQty === 'string' 
          ? (rawQty === '' ? 0 : parseFloat(rawQty) || 0)
          : (rawQty || 0);
        
        const targetQty = getMilestoneTargetQty(comp.id);
        
        // हर component को भेजें
        formattedComponents.push({
          componentId: comp.id,
          quantity: qty,
          fieldName: comp.field_name,
          unit: comp.unitname,
        });
        
        if (qty > 0) {
          hasValidQuantity = true;
          
          // Check if quantity exceeds target
          if (qty > targetQty) {
            quantityErrors.push(
              `${comp.name}: ${qty} exceeds target ${targetQty}`
            );
          }
        }
      });
      
      if (!hasValidQuantity) {
        alert("❌ Please enter progress quantity greater than 0 for at least one component!");
        setIsSubmitting(false);
        return;
      }
      
      if (quantityErrors.length > 0) {
        const confirmProceed = confirm(
          "Some quantities exceed target:\n" + 
          quantityErrors.join("\n") + 
          "\n\nDo you want to proceed anyway?"
        );
        if (!confirmProceed) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // 🔹 Prepare data
      const data = {
        ...formData,
        packageNumber: selectedPackage,
        milestoneNumber: selectedMilestone,
        components: formattedComponents,
        // Format fortnight as "1-15" or "16-31" for backend
        fortnight: formData.fortnight === "First" ? "1-15" : "16-31"
      };
      
      console.log("📦 Final payload to be sent:", JSON.stringify(data, null, 2));
      
      await onAddProgress(data);
      
      // Reset form
      const resetQuantities: Record<number, number | string> = {};
      components.forEach(comp => {
        resetQuantities[comp.id] = "";
      });
      setQuantities(resetQuantities);
      setValidationErrors([]);
      
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
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setQuantities(prev => ({
        ...prev,
        [componentId]: value
      }));
    }
  };

  const handleQuantityBlur = (componentId: number, value: string) => {
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

  // 🔹 Get fortnight display text
  const getFortnightDisplay = () => {
    return formData.fortnight === "First" ? "1-15" : "16-31";
  };

  // 🔹 Check if date is valid for submission
  const isDateValid = validationErrors.length === 0 && formData.progressDate;

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
          
          {/* Fortnight Information Banner */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Fortnight Progress Entry</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Progress is recorded in 15-day periods:
                  <span className="font-bold ml-2">
                    {getFortnightDisplay()} of {formData.progressDate ? new Date(formData.progressDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : "current month"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Date and Fortnight Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.progressDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.length > 0 ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select date within current month
              </p>
            </div>

            {/* Fortnight Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fortnight *
              </label>
              <div className="relative">
                <select
                  value={formData.fortnight}
                  onChange={(e) => handleFortnightChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.length > 0 ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting || !formData.progressDate}
                >
                  <option value="First">1-15 (First Half)</option>
                  <option value="Second">16-31 (Second Half)</option>
                </select>
                <div className="absolute right-3 top-2.5">
                  {formData.fortnight === "First" ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      1st Half
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      2nd Half
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Auto-set based on date
              </p>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Date Validation Error</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-600 mt-2">
                    Please select a valid date within current month and matching fortnight.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Selection Summary */}
          {isDateValid && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    ✅ Ready to add progress for:
                  </p>
                  <p className="text-green-700 mt-1">
                    <span className="font-bold">{getFortnightDisplay()}</span> of{' '}
                    <span className="font-bold">
                      {new Date(formData.progressDate).toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600">Selected Date:</p>
                  <p className="font-medium text-green-800">
                    {new Date(formData.progressDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Components Table */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Component Progress
              </h4>
              <button
                type="button"
                onClick={() => {
                  const resetQuantities: Record<number, number | string> = {};
                  components.forEach(comp => {
                    resetQuantities[comp.id] = "";
                  });
                  setQuantities(resetQuantities);
                }}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={isSubmitting}
              >
                Clear All
              </button>
            </div>
            
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
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {component.unitname}
                        </td>
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
                                ⚠️ Exceeds target
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
                    Components with progress: 
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
              disabled={isSubmitting || !isDateValid}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                `Save Progress for ${getFortnightDisplay()}`
              )}
            </button>
          </div>
          
          {/* Fortnight Rules Info */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Fortnight Rules</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>1-15 Fortnight:</strong> Progress for dates 1st to 15th of month</li>
                  <li>• <strong>16-31 Fortnight:</strong> Progress for dates 16th to 31st of month</li>
                  <li>• Only current month's progress can be added</li>
                  <li>• Date automatically determines fortnight</li>
                  <li>• Progress for each fortnight is recorded separately</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}