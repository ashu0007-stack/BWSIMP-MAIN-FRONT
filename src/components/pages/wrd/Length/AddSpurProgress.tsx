"use client";

import { useState, useEffect } from "react";

interface Spur {
  status: string;
  spur_id: number;
  spur_name: string;
  location_km: number;
  spur_length?: number;
  current_status?: string;
}

interface AddSpurProgressFormProps {
  showModal: boolean;
  onAddProgress: (data: any) => void;
  selectedSpur: Spur | null;
  editingEntry: any;
  onClose: () => void;
  spurs: Spur[];
  totalSpurs?: number;
  packageNumber: string;
}

export default function AddSpurProgressForm({
  showModal,
  onAddProgress,
  selectedSpur,
  editingEntry,
  onClose,
  spurs,
  packageNumber,
}: AddSpurProgressFormProps) {
  const [selectedSpurId, setSelectedSpurId] = useState<number>(0);
  const [selectedSpurName, setSelectedSpurName] = useState<string>("");
  const [locationKm, setLocationKm] = useState<number>(0);
  const [spurLength, setSpurLength] = useState<number>(0);
  const [status, setStatus] = useState<string>("not-started");
  const [progressDate, setProgressDate] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  
  // Store the current status of selected spur
  const [currentSpurStatus, setCurrentSpurStatus] = useState<string>("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    
    if (selectedSpur?.spur_id) {
      setSelectedSpurId(selectedSpur.spur_id);
      setSelectedSpurName(selectedSpur.spur_name);
      setLocationKm(selectedSpur.location_km || 0);
      setSpurLength(selectedSpur.spur_length || 0);
      
      // Get current status from selected spur
      const spurCurrentStatus = selectedSpur.status || "not-started";
      setCurrentSpurStatus(spurCurrentStatus);
      setStatus(spurCurrentStatus); // Set initial status to current status
    } else {
      setSelectedSpurId(0);
      setSelectedSpurName("");
      setLocationKm(0);
      setSpurLength(0);
      setCurrentSpurStatus("");
      setStatus("not-started");
    }
    
    setProgressDate(today);
    setRemarks("");
    setErrors([]);
  }, [selectedSpur, editingEntry]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (selectedSpurId === 0) {
      newErrors.push("Please select a spur");
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

    // Get user info
    const storedProfile = sessionStorage.getItem("userdetail");
    const profile = storedProfile ? JSON.parse(storedProfile) : {};

    const payload = {
      packageNumber: packageNumber,
      spur_id: selectedSpurId,
      spur_name: selectedSpurName,
      spur_length: spurLength,
      location_km: locationKm,
      status: status,
      progress_date: progressDate,
      remarks: remarks,
      created_by: profile.user_name || "System",
      created_email: profile.email || "system@example.com"
    };
    
    console.log("Submitting payload:", payload);
    onAddProgress(payload);
    onClose();
  };

  // Filter spurs to show only those that are NOT completed
  const availableSpurs = spurs.filter(spur => spur.status !== 'completed');

  // Get available status options based on current spur status
  const getAvailableStatusOptions = () => {
    // Agar spur completed hai to koi option nahi dikhana (spur select hi nahi hoga)
    if (currentSpurStatus === 'completed') {
      return [];
    }
    
    // Agar spur in-progress hai to sirf in-progress aur completed dikhana hai
    if (currentSpurStatus === 'in-progress') {
      return ['in-progress', 'completed'];
    }
    
    // Agar spur not-started hai to teeno options dikhana hai
    return ['not-started', 'in-progress', 'completed'];
  };

  const availableStatuses = getAvailableStatusOptions();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Completed</span>;
      case 'in-progress':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">In Progress</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">Not Started</span>;
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl"> {/* Increased width to max-w-4xl for horizontal layout */}
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-bold">
            {editingEntry ? "Edit Spur Status" : "Update Spur Status"}
          </h2>
          <p className="text-green-100 text-sm">
            Package: {packageNumber}
          </p>
        </div>

        <div className="p-6">
          {/* Info Message - Show why some spurs are not visible */}
          {spurs.length > availableSpurs.length && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              ℹ️ Completed spurs are hidden as they cannot be updated further.
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700">• {error}</div>
              ))}
            </div>
          )}

          {/* HORIZONTAL LAYOUT - TWO COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN - Spur Selection and Info */}
            <div className="space-y-4">
              {/* Spur Selection - Only show non-completed spurs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Spur *
                </label>
                {availableSpurs.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                    ⚠️ All spurs are completed. No spurs available for update.
                  </div>
                ) : (
                  <select
                    value={selectedSpurId}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      setSelectedSpurId(id);
                      const spur = spurs.find(s => s.spur_id === id);
                      if (spur) {
                        setSelectedSpurName(spur.spur_name);
                        setLocationKm(spur.location_km || 0);
                        setSpurLength(spur.spur_length || 0);
                        const spurStatus = spur.status || "not-started";
                        setCurrentSpurStatus(spurStatus);
                        setStatus(spurStatus);
                      }
                      setErrors([]);
                    }}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
                  >
                    <option value="0">-- Select a Spur --</option>
                    {availableSpurs.map((spur) => (
                      <option key={spur.spur_id} value={spur.spur_id}>
                        {spur.spur_name} {spur.location_km ? `(${spur.location_km} Km)` : ''} - {spur.spur_length || 0}m
                        {spur.status && ` (${spur.status})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Spur Info Card */}
              {selectedSpurId > 0 && (
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Spur Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-500 text-xs">Spur Name</span>
                      <p className="font-semibold">{selectedSpurName}</p>
                    </div>
                    {locationKm > 0 && (
                      <div className="bg-white p-2 rounded border">
                        <span className="text-gray-500 text-xs">Location</span>
                        <p className="font-semibold">{locationKm} Km</p>
                      </div>
                    )}
                    {spurLength > 0 && (
                      <div className="bg-white p-2 rounded border col-span-2">
                        <span className="text-gray-500 text-xs">Length</span>
                        <p className="font-semibold text-purple-700">{spurLength} m</p>
                      </div>
                    )}
                    <div className="col-span-2 bg-white p-2 rounded border">
                      <span className="text-gray-500 text-xs">Current Status</span>
                      <div className="mt-1">{getStatusBadge(currentSpurStatus)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - Status, Date and Remarks */}
            <div className="space-y-4">
              {/* Status Selection - Dynamic based on current status */}
              {selectedSpurId > 0 && availableStatuses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Work Status *
                  </label>
                  
                  {/* Show rule info */}
                  <div className="mb-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    {currentSpurStatus === 'not-started' && '→ Can change to In Progress or Completed'}
                    {currentSpurStatus === 'in-progress' && '→ Can only change to Completed (cannot go back to Not Started)'}
                  </div>
                  
                  <div className="space-y-2">
                    {/* Not Started Option - Only show if available */}
                    {availableStatuses.includes('not-started') && (
                      <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="status"
                          value="not-started"
                          checked={status === "not-started"}
                          onChange={(e) => setStatus(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-medium text-gray-600">Not Started</span>
                          <p className="text-xs text-gray-500">Work has not begun on this spur</p>
                        </div>
                      </label>
                    )}
                    
                    {/* In Progress Option - Only show if available */}
                    {availableStatuses.includes('in-progress') && (
                      <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="status"
                          value="in-progress"
                          checked={status === "in-progress"}
                          onChange={(e) => setStatus(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-medium text-yellow-600">In Progress</span>
                          <p className="text-xs text-gray-500">Work is currently ongoing</p>
                        </div>
                      </label>
                    )}
                    
                    {/* Completed Option - Only show if available */}
                    {availableStatuses.includes('completed') && (
                      <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="status"
                          value="completed"
                          checked={status === "completed"}
                          onChange={(e) => setStatus(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-medium text-green-600">Completed</span>
                          <p className="text-xs text-gray-500">Work has been finished</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Date */}
              {selectedSpurId > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Date *
                  </label>
                  <input
                    type="date"
                    value={progressDate}
                    onChange={(e) => setProgressDate(e.target.value)}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {/* Remarks */}
              {selectedSpurId > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Add any notes or comments..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedSpurId === 0 || availableSpurs.length === 0}
              className={`px-6 py-2 rounded text-white transition-colors ${
                selectedSpurId === 0 || availableSpurs.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {editingEntry ? 'Update Status' : 'Save Status'}
            </button>   
          </div>
        </div>
      </div>
    </div>
  );
}