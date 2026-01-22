// components/milestone/MilestoneProgress.tsx - UPDATED VERSION
"use client";

import { useState, useEffect } from "react";
import { X, Calendar, AlertCircle, CheckCircle, Lock } from "lucide-react";

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
  completedMilestones?: number[];
}

export default function AddProgressForm({
  showModal,
  setShowModal,
  onAddProgress,
  components,
  selectedPackage,
  selectedMilestone,
  packageMilestones = [],
  completedMilestones = [],
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
  const [milestoneStatus, setMilestoneStatus] = useState<{
    isLocked: boolean;
    previousMilestone: number | null;
    previousMilestonePercentage: number;
    message: string;
  }>({
    isLocked: false,
    previousMilestone: null,
    previousMilestonePercentage: 0,
    message: "",
  });

  // 🔹 Get milestone percentage for specific milestone
  const getMilestonePercentage = (component: Component, milestoneNum: number) => {
    switch (milestoneNum) {
      case 1: return component.milestone_1_percentage || 0;
      case 2: return component.milestone_2_percentage || 0;
      case 3: return component.milestone_3_percentage || 0;
      case 4: return component.milestone_4_percentage || 0;
      default: return 0;
    }
  };

  // 🔹 Get current milestone percentage
  const getCurrentMilestonePercentage = (component: Component) => {
    return getMilestonePercentage(component, selectedMilestone);
  };

  // 🔹 Check if current milestone is 100% completed for ALL components
  const isMilestoneFullyCompleted = () => {
    if (components.length === 0) return false;
    
    const allComponentsCompleted = components.every(component => {
      const percentage = getCurrentMilestonePercentage(component);
      return percentage >= 100;
    });
    
    return allComponentsCompleted;
  };

  // 🔹 Check if previous milestone is completed (100% for all components)
  const isPreviousMilestoneCompleted = () => {
    if (selectedMilestone === 1) return true; // Milestone 1 के लिए कोई previous नहीं है
    
    const previousMilestone = selectedMilestone - 1;
    
    // Check if previous milestone is in completedMilestones array
    if (completedMilestones.includes(previousMilestone)) {
      return true;
    }
    
    // Additional check: verify if all components are 100% for previous milestone
    let allComponentsCompleted = true;
    
    components.forEach(component => {
      const percentage = getMilestonePercentage(component, previousMilestone);
      if (percentage < 100) {
        allComponentsCompleted = false;
      }
    });
    
    return allComponentsCompleted;
  };

  // 🔹 Get current date and set default
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  };

  const validateDateAndFortnight = (dateString: string, fortnight: string) => {
    const errors: string[] = [];
    
    if (!dateString) {
      errors.push("Please select a date");
      return errors;
    }
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    const day = selectedDate.getDate();
    
    if (selectedDate > today) {
      errors.push("Cannot select future dates");
    }
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (selectedDate.getMonth() !== currentMonth || selectedDate.getFullYear() !== currentYear) {
      errors.push("Progress can only be added for current month");
    }
    
    const expectedFortnight = getFortnightFromDate(dateString);
    if (fortnight !== expectedFortnight) {
      errors.push(`Date ${dateString} belongs to ${expectedFortnight === "First" ? "1-15" : "16-31"} fortnight, not ${fortnight === "First" ? "1-15" : "16-31"}`);
    }
    
    return errors;
  };

  // AddProgressForm.tsx में checkMilestoneAccessibility function को यूँ update करें:

const checkMilestoneAccessibility = () => {
  console.log("🔍 DEBUG: Checking accessibility for milestone:", selectedMilestone);
  console.log("🔍 DEBUG: Completed milestones array:", completedMilestones);
  console.log("🔍 DEBUG: Is milestone", selectedMilestone, "in completedMilestones?", completedMilestones.includes(selectedMilestone));

  // ✅ FIRST AND MOST IMPORTANT CHECK: If milestone is in completedMilestones array
  if (completedMilestones && completedMilestones.includes(selectedMilestone)) {
    console.log("🔒 DEBUG: Milestone found in completedMilestones array, locking it");
    return {
      isLocked: true,
      previousMilestone: selectedMilestone,
      previousMilestonePercentage: 100,
      message: `Milestone ${selectedMilestone} is already completed. You cannot add more progress to a completed milestone.`
    };
  }

  console.log("🔍 DEBUG: Milestone not in completedMilestones, checking if fully completed...");

  // ✅ Check if current milestone is 100% completed for ALL components
  if (isMilestoneFullyCompleted()) {
    console.log("🔒 DEBUG: Milestone is 100% completed for all components");
    return {
      isLocked: true,
      previousMilestone: selectedMilestone,
      previousMilestonePercentage: 100,
      message: `Milestone ${selectedMilestone} is already 100% completed for all components. You cannot add more progress to a completed milestone.`
    };
  }

  console.log("🔍 DEBUG: Milestone is not fully completed, checking previous milestones...");

  // ✅ If it's milestone 1 and not completed, allow access
  if (selectedMilestone === 1) {
    console.log("🔓 DEBUG: Milestone 1 is accessible (not completed)");
    return {
      isLocked: false,
      previousMilestone: null,
      previousMilestonePercentage: 100,
      message: "Milestone 1 is accessible"
    };
  }

  // ✅ For other milestones, check if previous milestone is completed
  const previousMilestone = selectedMilestone - 1;
  
  console.log("🔍 DEBUG: Checking previous milestone:", previousMilestone);
  console.log("🔍 DEBUG: Is previous milestone in completedMilestones?", completedMilestones.includes(previousMilestone));

  // Check if previous milestone is in completedMilestones array
  const isPreviousCompleted = completedMilestones.includes(previousMilestone);
  
  // Calculate average percentage of previous milestone
  let previousMilestonePercentage = 0;
  
  if (components.length > 0) {
    let totalPercentage = 0;
    let count = 0;
    
    components.forEach(comp => {
      const percentage = getMilestonePercentage(comp, previousMilestone);
      if (percentage !== undefined) {
        totalPercentage += percentage;
        count++;
      }
    });
    
    if (count > 0) {
      previousMilestonePercentage = Math.round(totalPercentage / count);
    }
  }
  
  console.log("🔍 DEBUG: Previous milestone percentage:", previousMilestonePercentage);

  if (!isPreviousCompleted && previousMilestonePercentage < 100) {
    console.log("🔒 DEBUG: Previous milestone not completed, locking current milestone");
    return {
      isLocked: true,
      previousMilestone,
      previousMilestonePercentage,
      message: `Milestone ${previousMilestone} is ${previousMilestonePercentage}% complete. Complete it fully (100%) to unlock Milestone ${selectedMilestone}.`
    };
  }

  console.log("🔓 DEBUG: Milestone is accessible");
  return {
    isLocked: false,
    previousMilestone,
    previousMilestonePercentage: 100,
    message: `Milestone ${previousMilestone} is completed. You can add progress for Milestone ${selectedMilestone}.`
  };
};

  // 🔹 Initialize quantities with empty string for all components
  useEffect(() => {
    if (showModal && components && components.length > 0) {
      console.log("🔄 Initializing quantities for components:", components.length);
      
      // ✅ माइलस्टोन एक्सेसिबिलिटी चेक करें
      const status = checkMilestoneAccessibility();
      setMilestoneStatus(status);
      
      if (status.isLocked) {
        console.log("🔒 Milestone is locked:", status.message);
        return;
      }
      
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
        const currentPercentage = getCurrentMilestonePercentage(comp);
        // ✅ यदि component पहले से 100% complete है तो disable करें
        if (currentPercentage >= 100) {
          initialQuantities[comp.id] = 0; // 0 सेट करें और disabled रखें
        } else {
          initialQuantities[comp.id] = "";
        }
      });
      setQuantities(initialQuantities);
      
      console.log("📋 Form initialized with:", { today, defaultFortnight });
    }
  }, [components, showModal, selectedMilestone, completedMilestones]);

  // 🔹 Set milestone targets from API
  useEffect(() => {
    if (milestoneStatus.isLocked) return;
    
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
  }, [packageMilestones, selectedMilestone, milestoneStatus.isLocked]);

  // 🔹 Handle date change
  const handleDateChange = (date: string) => {
    if (milestoneStatus.isLocked) return;
    
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
    if (milestoneStatus.isLocked) return;
    
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

  const getMilestoneTargetQty = (componentId: number) => {
    return milestoneTargets[componentId] || 0;
  };

  const handleQuantityChange = (componentId: number, value: string) => {
    if (milestoneStatus.isLocked) return;
    
    // ✅ Check if component is already 100% completed
    const component = components.find(c => c.id === componentId);
    if (component && getCurrentMilestonePercentage(component) >= 100) {
      return; // Don't allow changes for completed components
    }
    
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setQuantities(prev => ({
        ...prev,
        [componentId]: value
      }));
    }
  };

  const handleQuantityBlur = (componentId: number, value: string) => {
    if (milestoneStatus.isLocked) return;
    
    // ✅ Check if component is already 100% completed
    const component = components.find(c => c.id === componentId);
    if (component && getCurrentMilestonePercentage(component) >= 100) {
      return; // Don't allow changes for completed components
    }
    
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

  // 🔹 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ यदि माइलस्टोन लॉक है तो सबमिट न होने दें
    if (milestoneStatus.isLocked) {
      alert("This milestone is locked. Please complete the previous milestone first.");
      return;
    }
    
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
      
      // 🔹 VALIDATION: Check if at least one quantity > 0 for components that are not 100% completed
      let hasValidQuantity = false;
      const quantityErrors: string[] = [];
      const formattedComponents: any[] = [];
      
      components.forEach(comp => {
        const currentPercentage = getCurrentMilestonePercentage(comp);
        
        // ✅ Skip components that are already 100% completed
        if (currentPercentage >= 100) {
          formattedComponents.push({
            componentId: comp.id,
            quantity: 0,
            fieldName: comp.field_name,
            unit: comp.unitname,
            currentPercentage: currentPercentage,
            remainingTarget: 0,
            isCompleted: true
          });
          return;
        }
        
        const rawQty = quantities[comp.id];
        const qty = typeof rawQty === 'string' 
          ? (rawQty === '' ? 0 : parseFloat(rawQty) || 0)
          : (rawQty || 0);
        
        const targetQty = getMilestoneTargetQty(comp.id);
        const remainingQty = targetQty * (100 - currentPercentage) / 100;
        
        formattedComponents.push({
          componentId: comp.id,
          quantity: qty,
          fieldName: comp.field_name,
          unit: comp.unitname,
          currentPercentage: currentPercentage,
          remainingTarget: remainingQty,
          isCompleted: false
        });
        
        if (qty > 0) {
          hasValidQuantity = true;
          
          // Check if quantity exceeds remaining target
          if (qty > remainingQty) {
            quantityErrors.push(
              `${comp.name}: ${qty} exceeds remaining target ${remainingQty.toFixed(2)} (${currentPercentage}% already completed)`
            );
          }
        }
      });
      
      if (!hasValidQuantity) {
        alert("❌ Please enter progress quantity greater than 0 for at least one component that is not already 100% complete!");
        setIsSubmitting(false);
        return;
      }
      
      if (quantityErrors.length > 0) {
        const confirmProceed = confirm(
          "Some quantities exceed remaining target:\n" + 
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
        fortnight: formData.fortnight === "First" ? "1-15" : "16-31",
        milestoneStatus: {
          previousMilestone: milestoneStatus.previousMilestone,
          previousMilestonePercentage: milestoneStatus.previousMilestonePercentage
        }
      };
      
      console.log("📦 Final payload to be sent:", JSON.stringify(data, null, 2));
      
      await onAddProgress(data);
      
      // Reset form
      const resetQuantities: Record<number, number | string> = {};
      components.forEach(comp => {
        const currentPercentage = getCurrentMilestonePercentage(comp);
        if (currentPercentage >= 100) {
          resetQuantities[comp.id] = 0;
        } else {
          resetQuantities[comp.id] = "";
        }
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

  // 🔹 Render locked state
  if (milestoneStatus.isLocked) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">
                  ⚠️ Milestone {selectedMilestone} Locked
                </h3>
                <p className="text-red-100 text-sm">
                  Package: {selectedPackage}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-red-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Locked Content */}
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <Lock className="w-16 h-16 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Milestone {selectedMilestone} is Locked
            </h3>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <p className="text-lg text-red-700 mb-3">
                {milestoneStatus.message}
              </p>
              
              {milestoneStatus.previousMilestone ? (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-medium text-gray-700">
                        Milestone {milestoneStatus.previousMilestone} Status
                      </h4>
                      <p className="text-sm text-gray-600">
                        Current completion percentage
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        milestoneStatus.previousMilestonePercentage >= 100 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {milestoneStatus.previousMilestonePercentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Required: 100%
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{milestoneStatus.previousMilestonePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          milestoneStatus.previousMilestonePercentage >= 100 
                            ? 'bg-green-600' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(milestoneStatus.previousMilestonePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-medium text-gray-700">
                        Milestone {selectedMilestone} Status
                      </h4>
                      <p className="text-sm text-gray-600">
                        Current completion status
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        100%
                      </div>
                      <div className="text-xs text-gray-500">
                        Fully Completed
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full bg-green-600"
                        style={{ width: `100%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-left">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {milestoneStatus.previousMilestone ? "How to Unlock" : "What does this mean?"}
              </h4>
              <ul className="text-blue-700 space-y-2">
                {milestoneStatus.previousMilestone ? (
                  <>
                    <li>1. Go to Milestone {milestoneStatus.previousMilestone} progress</li>
                    <li>2. Add progress until it reaches 100% completion</li>
                    <li>3. Once previous milestone is fully completed, this milestone will unlock automatically</li>
                    <li>4. You can then add progress for Milestone {selectedMilestone}</li>
                  </>
                ) : (
                  <>
                    <li>• <strong>Milestone {selectedMilestone}</strong> is already 100% completed for all components</li>
                    <li>• You cannot add more progress to a fully completed milestone</li>
                    <li>• If you need to make changes, please contact the administrator</li>
                    <li>• To proceed, move to the next available milestone</li>
                  </>
                )}
              </ul>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {milestoneStatus.previousMilestone ? `Go to Milestone ${milestoneStatus.previousMilestone}` : "Close"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Normal form render
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
          
          {/* Milestone Access Status */}
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">✅ Milestone {selectedMilestone} is Accessible</h4>
                <p className="text-sm text-green-700 mt-1">
                  {milestoneStatus.previousMilestone ? 
                    `Milestone ${milestoneStatus.previousMilestone} is fully completed.` : 
                    "You can add progress to Milestone 1."}
                </p>
              </div>
            </div>
          </div>

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
                    const currentPercentage = getCurrentMilestonePercentage(comp);
                    if (currentPercentage >= 100) {
                      resetQuantities[comp.id] = 0;
                    } else {
                      resetQuantities[comp.id] = "";
                    }
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
                      Completed %
                    </th>
                    <th className="px4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Progress Qty *
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {components.map((component) => {
                    const targetQty = getMilestoneTargetQty(component.id);
                    const currentPercentage = getCurrentMilestonePercentage(component);
                    const remainingQty = targetQty * (100 - currentPercentage) / 100;
                    const currentValue = quantities[component.id] || "";
                    const displayValue = getDisplayValue(currentValue);
                    const parsedQty = typeof currentValue === 'string' 
                      ? (currentValue === '' ? 0 : parseFloat(currentValue) || 0)
                      : currentValue;
                    const isComponentCompleted = currentPercentage >= 100;

                    return (
                      <tr 
                        key={component.id} 
                        className={`hover:bg-gray-50 ${isComponentCompleted ? 'bg-green-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {component.name}
                            {isComponentCompleted && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                ✓ 100% Complete
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {component.unitname}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {targetQty.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  isComponentCompleted ? 'bg-green-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${currentPercentage}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${
                              isComponentCompleted ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {currentPercentage}%
                            </span>
                          </div>
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
                                isComponentCompleted
                                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                  : parsedQty > 0 
                                    ? 'border-green-400 bg-green-50' 
                                    : 'border-gray-300'
                              }`}
                              placeholder={isComponentCompleted ? "Completed" : "0.00"}
                              disabled={isSubmitting || isComponentCompleted}
                              readOnly={isComponentCompleted}
                            />
                            <div className="text-xs text-gray-500 mt-1 flex justify-between">
                              {isComponentCompleted ? (
                                <span className="text-green-600 font-semibold">
                                  ✅ This component is already 100% complete
                                </span>
                              ) : (
                                <>
                                  <span className={parsedQty > 0 ? "text-green-600 font-semibold" : "text-gray-500"}>
                                    {parsedQty > 0 ? `✓ Entered: ${parsedQty}` : 'Enter progress'}
                                  </span>
                                  <span className={parsedQty > remainingQty ? "text-red-600" : "text-gray-500"}>
                                    Remaining: {remainingQty.toFixed(2)}
                                  </span>
                                </>
                              )}
                            </div>
                            {!isComponentCompleted && parsedQty > 0 && parsedQty > remainingQty && (
                              <div className="text-xs text-red-600 mt-1">
                                ⚠️ Exceeds remaining target by {(parsedQty - remainingQty).toFixed(2)}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{components.length}</div>
                  <div className="text-xs text-gray-600">Total Components</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {components.filter(c => getCurrentMilestonePercentage(c) >= 100).length}
                  </div>
                  <div className="text-xs text-gray-600">100% Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(quantities).filter(val => {
                      const numVal = typeof val === 'string' 
                        ? (val === '' ? 0 : parseFloat(val) || 0)
                        : val;
                      return numVal > 0;
                    }).length}
                  </div>
                  <div className="text-xs text-gray-600">With Progress Entered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {components.filter(c => getCurrentMilestonePercentage(c) < 100).length}
                  </div>
                  <div className="text-xs text-gray-600">Pending Completion</div>
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
          
          {/* Milestone Rules Info */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Milestone Rules</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>Sequential Completion:</strong> You must complete each milestone before moving to the next</li>
                  <li>• <strong>All Milestones:</strong> Once a milestone reaches 100%, it will be locked</li>
                  <li>• <strong>Milestone 1:</strong> Accessible initially, but locks when 100% complete</li>
                  <li>• <strong>Milestone 2:</strong> Accessible only when Milestone 1 is 100% complete</li>
                  <li>• <strong>Milestone 3:</strong> Accessible only when Milestone 2 is 100% complete</li>
                  <li>• <strong>Milestone 4:</strong> Accessible only when Milestone 3 is 100% complete</li>
                  <li>• <strong>Once a milestone reaches 100%:</strong> No more progress can be added to it</li>
                  <li>• Individual components at 100% will be disabled for further progress entry</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}