// components/AddEmbankmentForm.tsx
"use client";

import { useState, useEffect } from "react";

interface AddEmbankmentFormProps {
  showModal: boolean;
  onAddProgress: (data: any) => void;
  selectedRange: [number, number];
  editingEntry: any;
  onClose: () => void;
  targetKm: number;
  totalEmbankment: number;
  totalPitching: number;
  progressEntries: any[];
}

export default function AddEmbankmentForm({
  showModal,
  onAddProgress,
  selectedRange,
  editingEntry,
  onClose,
  targetKm = 0,
  totalEmbankment = 0,
  totalPitching = 0,
  progressEntries = [],
}: AddEmbankmentFormProps) {
  const [startKm, setStartKm] = useState(selectedRange?.[0] || 0);
  const [endKm, setEndKm] = useState(selectedRange?.[1] || 0);
  const [embankmentDoneKm, setEmbankmentDoneKm] = useState(0);
  const [pitchingDoneKm, setPitchingDoneKm] = useState(0);
  const [progressDate, setProgressDate] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (editingEntry) {
      setStartKm(editingEntry.start_km || 0);
      setEndKm(editingEntry.end_km || 0);
      setEmbankmentDoneKm(editingEntry.embankment_done_km || 0);
      setPitchingDoneKm(editingEntry.pitching_done_km || 0);
      setProgressDate(editingEntry.date || today);
    } else {
      setStartKm(selectedRange?.[0] || 0);
      setEndKm(selectedRange?.[1] || 0);
      setEmbankmentDoneKm(0);
      setPitchingDoneKm(0);
      setProgressDate(today);
    }
    setErrors([]);
  }, [editingEntry, selectedRange]);

  // Calculate TOTAL embankment and pitching in the SELECTED range (including all overlapping entries)
  const getWorkInSelectedRange = (): { totalEmbankment: number; totalPitching: number; availablePitching: number } => {
    if (!progressEntries || progressEntries.length === 0) {
      return { totalEmbankment: 0, totalPitching: 0, availablePitching: 0 };
    }

    let totalEmbankmentInRange = 0;
    let totalPitchingInRange = 0;

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
        const embankmentProportion = (entry.embankment_done_km || 0) / entryTotalLength;
        const pitchingProportion = (entry.pitching_done_km || 0) / entryTotalLength;
        
        totalEmbankmentInRange += embankmentProportion * overlapLength;
        totalPitchingInRange += pitchingProportion * overlapLength;
      }
    });

    const availablePitching = Math.max(0, totalEmbankmentInRange - totalPitchingInRange);
    
    return { 
      totalEmbankment: totalEmbankmentInRange, 
      totalPitching: totalPitchingInRange,
      availablePitching: availablePitching
    };
  };

  // Check if this exact range already has embankment for pitching
  const getExistingEmbankmentForPitching = (): number => {
    if (!progressEntries || progressEntries.length === 0) return 0;

    const existingEntry = progressEntries.find(entry => 
      (!editingEntry || entry.id !== editingEntry.id) &&
      Math.abs(entry.start_km - startKm) < 0.001 &&
      Math.abs(entry.end_km - endKm) < 0.001 &&
      (entry.embankment_done_km || 0) > 0
    );

    return existingEntry ? existingEntry.embankment_done_km : 0;
  };

  // Check if range overlaps with any existing work
  const hasOverlapWithExistingWork = (): boolean => {
    if (!progressEntries || progressEntries.length === 0) return false;

    return progressEntries.some(entry => {
      if (editingEntry && entry.id === editingEntry.id) return false;
      
      const hasWork = (entry.embankment_done_km || 0) > 0 || (entry.pitching_done_km || 0) > 0;
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
      if (((entry.embankment_done_km || 0) > 0 || (entry.pitching_done_km || 0) > 0) && entry.end_km > maxWorkEnd) {
        maxWorkEnd = entry.end_km;
      }
    });

    if (maxWorkEnd < targetKm) {
      return `${maxWorkEnd.toFixed(2)}-${targetKm.toFixed(2)} KM`;
    }

    return "No available ranges";
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Basic validations
    if (endKm <= startKm) {
      newErrors.push("End KM must be greater than Start KM");
      setErrors(newErrors);
      return false;
    }

    if (endKm > targetKm) {
      newErrors.push(`End KM (${endKm.toFixed(2)}) cannot exceed target KM (${targetKm.toFixed(2)})`);
    }

    const totalRange = endKm - startKm;
    
    if (embankmentDoneKm > totalRange + 0.001) {
      newErrors.push(`Embankment Done (${embankmentDoneKm.toFixed(2)} KM) cannot exceed selected range (${totalRange.toFixed(2)} KM)`);
    }

    if (pitchingDoneKm > totalRange + 0.001) {
      newErrors.push(`Pitching Done (${pitchingDoneKm.toFixed(2)} KM) cannot exceed selected range (${totalRange.toFixed(2)} KM)`);
    }

    // Check for cumulative work in the selected range
    const rangeWork = getWorkInSelectedRange();
    const existingEmbankment = getExistingEmbankmentForPitching();

    if (existingEmbankment > 0) {
      // Case 1: Adding pitching to existing embankment in exact same range
      const availablePitching = existingEmbankment - rangeWork.totalPitching;
      
      if (pitchingDoneKm > availablePitching + 0.001) {
        newErrors.push(`Pitching Done (${pitchingDoneKm.toFixed(2)} KM) cannot exceed available pitching capacity (${availablePitching.toFixed(2)} KM)`);
      }
      if (embankmentDoneKm > 0) {
        newErrors.push("Embankment already exists in this range. Set Embankment Done to 0.");
      }
    } else {
      // Case 2: Adding new work (embankment + pitching)
      if (pitchingDoneKm > embankmentDoneKm + 0.001) {
        newErrors.push("Pitching Done KM cannot exceed Embankment Done KM");
      }
      
      // Check for overlap with existing work
      if (hasOverlapWithExistingWork() && (embankmentDoneKm > 0 || pitchingDoneKm > 0)) {
        const availableRange = getNextAvailableRange();
        newErrors.push(`Range overlaps with existing work. Try: ${availableRange}`);
      }
    }

    // Check totals against target
    const totalEmbankmentAfter = totalEmbankment + embankmentDoneKm;
    const totalPitchingAfter = totalPitching + pitchingDoneKm;

    if (totalEmbankmentAfter > targetKm + 0.001) {
      newErrors.push(`Total embankment (${totalEmbankmentAfter.toFixed(2)} KM) exceeds target (${targetKm.toFixed(2)} KM)`);
    }

    if (totalPitchingAfter > targetKm + 0.001) {
      newErrors.push(`Total pitching (${totalPitchingAfter.toFixed(2)} KM) exceeds target (${targetKm.toFixed(2)} KM)`);
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
      embankmentDoneKm: embankmentDoneKm || 0,
      pitchingDoneKm: pitchingDoneKm || 0,
      progressDate: progressDate,
    });

    onClose();
  };

  const rangeWork = getWorkInSelectedRange();
  const existingEmbankment = getExistingEmbankmentForPitching();
  const hasOverlap = hasOverlapWithExistingWork();
  const availableRange = getNextAvailableRange();
  const availablePitching = existingEmbankment > 0 ? existingEmbankment - rangeWork.totalPitching : 0;

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {editingEntry ? "Edit Progress" : "Add Embankment/Pitching Progress"}
        </h2>

        <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
          <p className="text-sm text-purple-700">
            <strong>Target KM:</strong> {targetKm.toFixed(2)} KM
          </p>
          <p className="text-sm text-purple-700">
            <strong>Total Embankment:</strong> {totalEmbankment.toFixed(2)} KM
          </p>
          <p className="text-sm text-purple-700">
            <strong>Total Pitching:</strong> {totalPitching.toFixed(2)} KM
          </p>
        </div>

        {/* Work in Selected Range */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="text-sm font-semibold text-gray-800 mb-2">Work in Selected Range:</p>
          <p className="text-sm text-gray-700">Embankment: {rangeWork.totalEmbankment.toFixed(2)} KM</p>
          <p className="text-sm text-gray-700">Pitching: {rangeWork.totalPitching.toFixed(2)} KM</p>
          {existingEmbankment > 0 && (
            <p className="text-sm text-green-700 mt-1">
              Available for pitching: {availablePitching.toFixed(2)} KM
            </p>
          )}
        </div>

        {/* Available Range */}
        {hasOverlap && existingEmbankment === 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              <strong>Available Range:</strong> {availableRange}
            </p>
          </div>
        )}

        {/* Pitching Opportunity */}
        {existingEmbankment > 0 && availablePitching > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              <strong>✓ Add Pitching:</strong> You can add up to {availablePitching.toFixed(2)} KM pitching
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
            <div>Range: {startKm.toFixed(2)} - {endKm.toFixed(2)} KM (Total: {(endKm - startKm).toFixed(2)} KM)</div>
            {existingEmbankment > 0 && availablePitching > 0 && (
              <div className="text-green-600 text-xs mt-1">
                ✓ Can add {availablePitching.toFixed(2)} KM pitching
              </div>
            )}
            {hasOverlap && existingEmbankment === 0 && (
              <div className="text-red-600 text-xs mt-1">⚠️ Overlaps with existing work</div>
            )}
          </div>

          <label className="flex flex-col">
            Embankment Done (KM):
            <input
              type="number"
              value={embankmentDoneKm}
              onChange={(e) => setEmbankmentDoneKm(parseFloat(e.target.value) || 0)}
              className="border px-2 py-1 rounded w-full"
              min={0}
              max={endKm - startKm}
              step="0.01"
              disabled={existingEmbankment > 0}
            />
          </label>
          
          <label className="flex flex-col">
            Pitching Done (KM):
            <input
              type="number"
              value={pitchingDoneKm}
              onChange={(e) => setPitchingDoneKm(parseFloat(e.target.value) || 0)}
              className="border px-2 py-1 rounded w-full"
              min={0}
              max={existingEmbankment > 0 ? availablePitching : embankmentDoneKm}
              step="0.01"
            />
          </label>
          
          <div className="text-sm text-gray-600 bg-purple-50 p-2 rounded">
            <div><strong>After Save:</strong></div>
            <div>Embankment: {(totalEmbankment + embankmentDoneKm).toFixed(2)} / {targetKm.toFixed(2)} KM</div>
            <div>Pitching: {(totalPitching + pitchingDoneKm).toFixed(2)} / {targetKm.toFixed(2)} KM</div>
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
              className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}