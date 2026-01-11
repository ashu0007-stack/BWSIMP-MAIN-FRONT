"use client";

import { useState, useEffect } from "react";

interface AddProgressFormProps {
  showModal: boolean;
  onAddProgress: (data: any) => void;
  selectedRange: [number, number];
  editingEntry: any;
  onClose: () => void;
  targetKm: number;
  totalEarthwork: number;
  totalLining: number;
  progressEntries: any[];
}

export default function AddProgressForm({
  showModal,
  onAddProgress,
  selectedRange,
  editingEntry,
  onClose,
  targetKm,
  totalEarthwork,
  totalLining,
  progressEntries,
}: AddProgressFormProps) {
  const [startKm, setStartKm] = useState(selectedRange[0]);
  const [endKm, setEndKm] = useState(selectedRange[1]);
  const [earthworkDoneKm, setEarthworkDoneKm] = useState(0);
  const [liningDoneKm, setLiningDoneKm] = useState(0);
  const [progressDate, setProgressDate] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (editingEntry) {
      setStartKm(editingEntry.start_km || 0);
      setEndKm(editingEntry.end_km || 0);
      setEarthworkDoneKm(editingEntry.earthwork_done_km || 0);
      setLiningDoneKm(editingEntry.lining_done_km || 0);
      setProgressDate(editingEntry.date || today);
    } else {
      setStartKm(selectedRange[0]);
      setEndKm(selectedRange[1]);
      setEarthworkDoneKm(0);
      setLiningDoneKm(0);
      setProgressDate(today);
    }
    setErrors([]);
  }, [editingEntry, selectedRange]);

  // Calculate TOTAL earthwork and lining in the SELECTED range (including all overlapping entries)
  const getWorkInSelectedRange = (): { totalEarthwork: number; totalLining: number; remainingLining: number } => {
    if (!progressEntries) return { totalEarthwork: 0, totalLining: 0, remainingLining: 0 };

    let totalEarthworkInRange = 0;
    let totalLiningInRange = 0;

    progressEntries.forEach(entry => {
      if (editingEntry && entry.id === editingEntry.id) return;
      
      // Check if entry overlaps with selected range
      const overlaps = (entry.start_km < endKm && entry.end_km > startKm);
      
      if (overlaps) {
        // Calculate overlapping portion
        const overlapStart = Math.max(startKm, entry.start_km);
        const overlapEnd = Math.min(endKm, entry.end_km);
        const overlapLength = overlapEnd - overlapStart;
        
        // Calculate work in overlapping portion (proportional)
        const entryTotalLength = entry.end_km - entry.start_km;
        const earthworkProportion = entry.earthwork_done_km / entryTotalLength;
        const liningProportion = entry.lining_done_km / entryTotalLength;
        
        totalEarthworkInRange += earthworkProportion * overlapLength;
        totalLiningInRange += liningProportion * overlapLength;
      }
    });

    const remainingLining = Math.max(0, totalEarthworkInRange - totalLiningInRange);
    
    return { 
      totalEarthwork: totalEarthworkInRange, 
      totalLining: totalLiningInRange,
      remainingLining: remainingLining
    };
  };

  // Check if this exact range already has earthwork for lining
  const getExistingEarthworkForLining = (): number => {
    if (!progressEntries) return 0;

    const existingEntry = progressEntries.find(entry => 
      (!editingEntry || entry.id !== editingEntry.id) &&
      Math.abs(entry.start_km - startKm) < 0.001 &&
      Math.abs(entry.end_km - endKm) < 0.001 &&
      entry.earthwork_done_km > 0
    );

    return existingEntry ? existingEntry.earthwork_done_km : 0;
  };

  // Check if range overlaps with any existing work
  const hasOverlapWithExistingWork = (): boolean => {
    if (!progressEntries) return false;

    return progressEntries.some(entry => {
      if (editingEntry && entry.id === editingEntry.id) return false;
      
      const hasWork = entry.earthwork_done_km > 0 || entry.lining_done_km > 0;
      const overlaps = (startKm < entry.end_km && endKm > entry.start_km);
      
      return hasWork && overlaps;
    });
  };

  // Get the next available range after last work
  const getNextAvailableRange = (): string => {
    if (!progressEntries || progressEntries.length === 0) {
      return `0-${targetKm} KM`;
    }

    let maxWorkEnd = 0;
    progressEntries.forEach(entry => {
      if ((entry.earthwork_done_km > 0 || entry.lining_done_km > 0) && entry.end_km > maxWorkEnd) {
        maxWorkEnd = entry.end_km;
      }
    });

    if (maxWorkEnd < targetKm) {
      return `${maxWorkEnd}-${targetKm} KM`;
    }

    return "No available ranges";
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Basic validations
    if (endKm <= startKm) {
      newErrors.push("End KM must be greater than Start KM");
      return false;
    }

    if (endKm > targetKm) {
      newErrors.push(`End KM (${endKm}) cannot exceed target KM (${targetKm})`);
    }

    const totalRange = endKm - startKm;
    
    if (earthworkDoneKm > totalRange + 0.001) {
      newErrors.push(`Earthwork Done (${earthworkDoneKm} KM) cannot exceed selected range (${totalRange} KM)`);
    }

    if (liningDoneKm > totalRange + 0.001) {
      newErrors.push(`Lining Done (${liningDoneKm} KM) cannot exceed selected range (${totalRange} KM)`);
    }

    // Check for cumulative work in the selected range
    const rangeWork = getWorkInSelectedRange();
    const existingEarthwork = getExistingEarthworkForLining();

    if (existingEarthwork > 0) {
      // Case 1: Adding lining to existing earthwork in exact same range
      const availableLining = existingEarthwork - rangeWork.totalLining;
      
      if (liningDoneKm > availableLining) {
        newErrors.push(`Lining Done (${liningDoneKm} KM) cannot exceed available lining capacity (${availableLining.toFixed(2)} KM)`);
      }
      if (earthworkDoneKm > 0) {
        newErrors.push("Earthwork already exists in this range. Set Earthwork Done to 0.");
      }
    } else {
      // Case 2: Adding new work (earthwork + lining)
      if (liningDoneKm > earthworkDoneKm) {
        newErrors.push("Lining Done KM cannot exceed Earthwork Done KM");
      }
      
      // Check for overlap with existing work
      if (hasOverlapWithExistingWork() && (earthworkDoneKm > 0 || liningDoneKm > 0)) {
        const availableRange = getNextAvailableRange();
        newErrors.push(`Range overlaps with existing work. Try: ${availableRange}`);
      }
    }

    // Check totals against target
    const totalEarthworkAfter = totalEarthwork + earthworkDoneKm;
    const totalLiningAfter = totalLining + liningDoneKm;

    if (totalEarthworkAfter > targetKm) {
      newErrors.push(`Total earthwork (${totalEarthworkAfter.toFixed(2)} KM) exceeds target (${targetKm} KM)`);
    }

    if (totalLiningAfter > targetKm) {
      newErrors.push(`Total lining (${totalLiningAfter.toFixed(2)} KM) exceeds target (${targetKm} KM)`);
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onAddProgress({
      startKm: startKm || 0,
      endKm: endKm || 0,
      earthworkDoneKm: earthworkDoneKm || 0,
      liningDoneKm: liningDoneKm || 0,
      progressDate: progressDate,
    });

    onClose();
  };

  const rangeWork = getWorkInSelectedRange();
  const existingEarthwork = getExistingEarthworkForLining();
  const hasOverlap = hasOverlapWithExistingWork();
  const availableRange = getNextAvailableRange();
  const availableLining = existingEarthwork > 0 ? existingEarthwork - rangeWork.totalLining : 0;

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {editingEntry ? "Edit Progress" : "Add Progress"}
        </h2>

        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Target KM:</strong> {targetKm} KM
          </p>
          <p className="text-sm text-blue-700">
            <strong>Total Earthwork:</strong> {totalEarthwork.toFixed(2)} KM
          </p>
          <p className="text-sm text-blue-700">
            <strong>Total Lining:</strong> {totalLining.toFixed(2)} KM
          </p>
        </div>

        {/* Work in Selected Range */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="text-sm font-semibold text-gray-800 mb-2">Work in Selected Range:</p>
          <p className="text-sm text-gray-700">Earthwork: {rangeWork.totalEarthwork.toFixed(2)} KM</p>
          <p className="text-sm text-gray-700">Lining: {rangeWork.totalLining.toFixed(2)} KM</p>
          {existingEarthwork > 0 && (
            <p className="text-sm text-green-700 mt-1">
              Available for lining: {availableLining.toFixed(2)} KM
            </p>
          )}
        </div>

        {/* Available Range */}
        {hasOverlap && existingEarthwork === 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              <strong>Available Range:</strong> {availableRange}
            </p>
          </div>
        )}

        {/* Lining Opportunity */}
        {existingEarthwork > 0 && availableLining > 0 && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="text-sm text-purple-700">
              <strong>✓ Add Lining:</strong> You can add up to {availableLining.toFixed(2)} KM lining
            </p>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col">
            Start KM:
            <input
              type="number"
              value={startKm}
              onChange={(e) => setStartKm(parseFloat(e.target.value) || 0)}
              className="border px-2 py-1 rounded w-full"
              min={0}
              max={targetKm}
              step="0.01"
            />
          </label>
          
          <label className="flex flex-col">
            End KM:
            <input
              type="number"
              value={endKm}
              onChange={(e) => setEndKm(parseFloat(e.target.value) || 0)}
              className="border px-2 py-1 rounded w-full"
              min={0}
              max={targetKm}
              step="0.01"
            />
          </label>
          
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            <div>Range: {startKm} - {endKm} KM (Total: {(endKm - startKm).toFixed(2)} KM)</div>
            {existingEarthwork > 0 && availableLining > 0 && (
              <div className="text-green-600 text-xs mt-1">
                ✓ Can add {availableLining.toFixed(2)} KM lining
              </div>
            )}
            {hasOverlap && existingEarthwork === 0 && (
              <div className="text-red-600 text-xs mt-1">⚠️ Overlaps with existing work</div>
            )}
          </div>

          <label className="flex flex-col">
            Earthwork Done (KM):
            <input
              type="number"
              value={earthworkDoneKm}
              onChange={(e) => setEarthworkDoneKm(parseFloat(e.target.value) || 0)}
              className="border px-2 py-1 rounded w-full"
              min={0}
              max={endKm - startKm}
              step="0.01"
              disabled={existingEarthwork > 0}
            />
          </label>
          
          <label className="flex flex-col">
            Lining Done (KM):
            <input
              type="number"
              value={liningDoneKm}
              onChange={(e) => setLiningDoneKm(parseFloat(e.target.value) || 0)}
              className="border px-2 py-1 rounded w-full"
              min={0}
              max={existingEarthwork > 0 ? availableLining : earthworkDoneKm}
              step="0.01"
            />
          </label>
          
          <div className="text-sm text-gray-600 bg-green-50 p-2 rounded">
            <div><strong>After Save:</strong></div>
            <div>Earthwork: {(totalEarthwork + earthworkDoneKm).toFixed(2)} / {targetKm} KM</div>
            <div>Lining: {(totalLining + liningDoneKm).toFixed(2)} / {targetKm} KM</div>
          </div>

          <label className="flex flex-col">
            Progress Date:
            <input
              type="text"
              value={progressDate}
              readOnly
              className="border px-2 py-1 rounded w-full bg-gray-100 cursor-not-allowed"
            />
          </label>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}