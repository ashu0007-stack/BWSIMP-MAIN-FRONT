"use client";

import { useState, useEffect } from "react";

interface Spur {
  spur_id: number;
  status: string;
  id: number;
  spur_name: string;
  spur_length: number;
  location_km: number;
}

interface SpurProgress {
  remarks: string;
  spur_id: number;
  spur_name: string;
  spur_length: number;
  location_km: number;
  completed_km: number;
  completion_percentage: number;
  status: string;
  progress_date: string;
}

interface AddSpurProgressFormProps {
  showModal: boolean;
  onAddProgress: (data: any) => void;
  selectedSpur: Spur | any;
  editingEntry: SpurProgress | null;
  onClose: () => void;
  spurs: Spur[];
  totalSpurs: number;
}

export default function AddSpurProgressForm({
  showModal,
  onAddProgress,
  selectedSpur,
  editingEntry,
  onClose,
  spurs,
  totalSpurs,
}: AddSpurProgressFormProps) {
  const [selectedSpurId, setSelectedSpurId] = useState<number>(0);
  const [completedMtr, setCompletedMtr] = useState<number>(0);
  const [progressDate, setProgressDate] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  // Get unique spurs (remove duplicates based on spur_id)
  const uniqueSpurs = spurs.reduce((acc: Spur[], current: Spur) => {
    const exists = acc.find(item => item.spur_id === current.spur_id);
    if (!exists) {
      return acc.concat([current]);
    }
    return acc;
  }, []);

  // Calculate cumulative completed km for each spur
  const spurCumulativeData = spurs.reduce((acc: {[key: number]: number}, current: Spur) => {
    const spurProgress = current as any;
    const completed = spurProgress.completed_km || 0;
    if (!acc[current.spur_id]) {
      acc[current.spur_id] = completed;
    } else {
      acc[current.spur_id] += completed;
    }
    return acc;
  }, {});

  // Filter spurs for dropdown:
  // 1. Remove duplicates
  // 2. Exclude fully completed spurs (100% or more)
  const availableSpurs = uniqueSpurs.filter(spur => {
    const totalLength = spur.spur_length || 0;
    const completedLength = spurCumulativeData[spur.spur_id] || 0;
    const isFullyCompleted = totalLength > 0 && completedLength >= totalLength;
    
    // If editing, include the spur being edited even if completed
    if (editingEntry && editingEntry.spur_id === spur.spur_id) {
      return true;
    }
    
    // Otherwise, exclude fully completed spurs
    return !isFullyCompleted;
  });

  // Get current selected spur details
  const currentSpur = uniqueSpurs.find(spur => spur.spur_id === selectedSpurId);

  // Get cumulative completed for current spur
  const currentSpurCumulativeCompleted = spurCumulativeData[selectedSpurId] || 0;

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    
    if (selectedSpur?.spur_id) {
      setSelectedSpurId(selectedSpur.spur_id);
    }
    
    if (editingEntry) {
      setSelectedSpurId(editingEntry.spur_id);
      setCompletedMtr(editingEntry.completed_km || 0);
      setProgressDate(editingEntry.progress_date || today);
      setRemarks(editingEntry.remarks || "");
    } else {
      setCompletedMtr(0);
      setProgressDate(today);
      setRemarks("");
    }
    setErrors([]);
  }, [editingEntry, selectedSpur]);

  // Calculate completion percentage including cumulative
  const calculatePercentage = () => {
    if (!currentSpur || currentSpur.spur_length === 0) return 0;
    const totalCompleted = currentSpurCumulativeCompleted + completedMtr;
    return (totalCompleted / currentSpur.spur_length) * 100;
  };

  // Get status based on completion
  const getAutoStatus = (completionPercent: number): string => {
    if (completionPercent >= 100) return "completed";
    if (completionPercent > 0 && completionPercent < 100) return "in-progress";
    return "not-started";
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (selectedSpurId === 0) {
      newErrors.push("Please select a spur");
    }

    if (completedMtr < 0) {
      newErrors.push("Completed cannot be negative");
    }

    if (currentSpur) {
      const totalAfterAdding = currentSpurCumulativeCompleted + completedMtr;
      if (totalAfterAdding > currentSpur.spur_length) {
        newErrors.push(
          `Total completed (${currentSpurCumulativeCompleted}m + ${completedMtr}m = ${totalAfterAdding}m) ` +
          `cannot exceed spur length (${currentSpur.spur_length}m)`
        );
      }
    }

    if (!progressDate) {
      newErrors.push("Please select a progress date");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (!currentSpur) return;

    const completionPercent = calculatePercentage();
    const finalStatus = getAutoStatus(completionPercent);

    // Get user info
    const storedProfile = sessionStorage.getItem("userdetail");
    const profile = storedProfile ? JSON.parse(storedProfile) : {};

    // ✅ Prepare payload with CORRECT field names
    const payload = {
      spur_id: selectedSpurId,
      spur_name: currentSpur.spur_name,
      spur_length_km: currentSpur.spur_length,
      location_km: currentSpur.location_km,
      completed_km: completedMtr,
      completion_percentage: completionPercent,
      status: finalStatus,
      progress_date: progressDate,
      remarks: remarks,
      created_by: profile.user_name || "System",
      created_email: profile.email || "system@example.com"
    };

    console.log("📝 Form payload to send:", JSON.stringify(payload, null, 2));
    
    // Call parent function
    onAddProgress(payload);
    onClose();
  };

  const completionPercentage = calculatePercentage();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
          <h2 className="text-xl font-bold">
            {editingEntry ? "Edit Spur Progress" : "Add Spur Progress"}
          </h2>
          <p className="text-green-100 text-sm">
            {availableSpurs.length} available spurs (excluding fully completed)
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700">• {error}</div>
              ))}
            </div>
          )}

          {/* Spur Selection - Simple Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Spur *
            </label>
            <select
              value={selectedSpurId}
              onChange={(e) => setSelectedSpurId(parseInt(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="0">-- Select a Spur --</option>
              {availableSpurs.map((spur) => {
                const cumulativeCompleted = spurCumulativeData[spur.spur_id] || 0;
                const totalLength = spur.spur_length || 0;
                const existingProgressPercent = totalLength > 0 ? 
                  (cumulativeCompleted / totalLength) * 100 : 0;
                
                return (
                  <option key={spur.spur_id} value={spur.spur_id}>
                    {spur.spur_name} 
                    {` (Loc: ${spur.location_km}km, Length: ${spur.spur_length}m`}
                    {cumulativeCompleted > 0 && 
                      `, Existing: ${cumulativeCompleted}m (${existingProgressPercent.toFixed(1)}%)`}
                    {`)`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Progress Details */}
          {selectedSpurId > 0 && currentSpur && (
            <>
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Spur Name:</div>
                    <div className="font-semibold">{currentSpur.spur_name}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Location:</div>
                    <div className="font-semibold">{currentSpur.location_km} km</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Total Length:</div>
                    <div className="font-semibold">{currentSpur.spur_length} m</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Existing Completed:</div>
                    <div className="font-semibold">
                      {currentSpurCumulativeCompleted} m
                      {currentSpur.spur_length > 0 && 
                        ` (${((currentSpurCumulativeCompleted / currentSpur.spur_length) * 100).toFixed(1)}%)`}
                    </div>
                  </div>
                </div>
                
                {/* Cumulative Progress Bar */}
                {currentSpurCumulativeCompleted > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Existing Progress</span>
                      <span className="font-bold">
                        {((currentSpurCumulativeCompleted / currentSpur.spur_length) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400"
                        style={{ 
                          width: `${Math.min(100, 
                            (currentSpurCumulativeCompleted / currentSpur.spur_length) * 100
                          )}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* New Completed Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Progress (meters) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={completedMtr}
                    onChange={(e) => setCompletedMtr(parseFloat(e.target.value) || 0)}
                    className="border px-3 py-2 rounded w-32 text-center"
                    min="0"
                    max={currentSpur.spur_length - currentSpurCumulativeCompleted}
                    step="0.1"
                  />
                  <span className="text-sm">
                    max {currentSpur.spur_length - currentSpurCumulativeCompleted}m available
                  </span>
                </div>
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max={currentSpur.spur_length - currentSpurCumulativeCompleted}
                    step="0.1"
                    value={completedMtr}
                    onChange={(e) => setCompletedMtr(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Total Progress After Adding */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Progress After Adding</span>
                  <span className="font-bold">{completionPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, completionPercentage)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {currentSpurCumulativeCompleted}m (existing) + {completedMtr}m (new) = {currentSpurCumulativeCompleted + completedMtr}m
                </div>
              </div>

              {/* Auto Status Display */}
              <div className="mb-4 p-3 bg-blue-50 rounded border">
                <div className="text-sm">
                  <span className="text-gray-600">Will be marked as:</span>
                  <span className={`ml-2 font-semibold ${
                    completionPercentage >= 100 ? 'text-green-600' :
                    completionPercentage > 0 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {getAutoStatus(completionPercentage).toUpperCase()}
                  </span>
                  {completionPercentage >= 100 && (
                    <div className="mt-1 text-xs text-green-700">
                      Note: This spur will be removed from dropdown after saving
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Date *
                </label>
                <input
                  type="date"
                  value={progressDate}
                  onChange={(e) => setProgressDate(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Remarks */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  rows={2}
                  placeholder="Add any notes or comments..."
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedSpurId > 0 && currentSpur ? (
                <div>
                  {editingEntry ? 'Editing:' : 'Adding to:'} 
                  <span className="font-semibold"> {currentSpur.spur_name}</span>
                </div>
              ) : (
                "Select a spur to continue"
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedSpurId === 0}
                className={`px-4 py-2 rounded text-white ${
                  selectedSpurId === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {editingEntry ? 'Update Progress' : 'Save Progress'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}