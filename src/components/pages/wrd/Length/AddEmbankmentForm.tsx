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
  progressEntries: any[];
}

export default function AddEmbankmentForm({
  showModal,
  onAddProgress,
  selectedRange,
  editingEntry,
  onClose,
  targetKm,
  totalEmbankment,
  progressEntries,
}: AddEmbankmentFormProps) {
  const [startKm, setStartKm] = useState(selectedRange[0]);
  const [endKm, setEndKm] = useState(selectedRange[1]);
  const [embankmentDoneKm, setEmbankmentDoneKm] = useState(0);
  const [progressDate, setProgressDate] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (editingEntry) {
      setStartKm(editingEntry.start_km || 0);
      setEndKm(editingEntry.end_km || 0);
      setEmbankmentDoneKm(editingEntry.embankment_done_km || 0);
      setProgressDate(editingEntry.date || today);
    } else {
      setStartKm(selectedRange[0]);
      setEndKm(selectedRange[1]);
      setEmbankmentDoneKm(0);
      setProgressDate(today);
    }
    setErrors([]);
  }, [editingEntry, selectedRange]);

  const totalRange = endKm - startKm;

  // Check if range overlaps with existing work
  const hasOverlap = () => {
    if (!progressEntries) return false;
    return progressEntries.some(entry => {
      if (editingEntry && entry.id === editingEntry.id) return false;
      const overlaps = (startKm < entry.end_km && endKm > entry.start_km);
      return overlaps && entry.embankment_done_km > 0;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (endKm <= startKm) {
      newErrors.push("End KM must be greater than Start KM");
    }

    if (endKm > targetKm) {
      newErrors.push(`End KM cannot exceed target KM (${targetKm})`);
    }

    if (embankmentDoneKm > totalRange + 0.001) {
      newErrors.push(`Embankment cannot exceed range (${totalRange.toFixed(2)} KM)`);
    }

    if (hasOverlap()) {
      newErrors.push("This range overlaps with existing embankment work");
    }

    const totalAfter = totalEmbankment + embankmentDoneKm;
    if (totalAfter > targetKm + 0.001) {
      newErrors.push(`Total embankment (${totalAfter.toFixed(2)} KM) exceeds target (${targetKm} KM)`);
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const storedProfile = sessionStorage.getItem("userdetail");
    const profile = storedProfile ? JSON.parse(storedProfile) : {};

    onAddProgress({
      startKm,
      endKm,
      embankmentDoneKm,
      progressDate,
      created_by: profile.user_name || "System"
    });

    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-800">Add Embankment Progress</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-purple-50 rounded border border-purple-200">
            <p className="text-xs text-purple-700">Target</p>
            <p className="text-lg font-bold text-purple-700">{targetKm} KM</p>
          </div>
          <div className="p-2 bg-purple-50 rounded border border-purple-200">
            <p className="text-xs text-purple-700">Completed</p>
            <p className="text-lg font-bold text-purple-700">{totalEmbankment.toFixed(2)} KM</p>
          </div>
        </div>

        {/* Range Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm font-medium text-gray-700">Selected Range</p>
          <p className="text-xl font-bold text-gray-800">{startKm} - {endKm} KM</p>
          <p className="text-sm text-gray-600">Total Length: {totalRange.toFixed(2)} KM</p>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-700">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start KM</label>
              <input
                type="number"
                value={startKm}
                onChange={(e) => setStartKm(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-purple-500"
                min={0}
                max={targetKm}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End KM</label>
              <input
                type="number"
                value={endKm}
                onChange={(e) => setEndKm(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-purple-500"
                min={0}
                max={targetKm}
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Embankment Done (KM)</label>
            <input
              type="number"
              value={embankmentDoneKm}
              onChange={(e) => setEmbankmentDoneKm(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-purple-500"
              min={0}
              max={totalRange}
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress Date</label>
            <input
              type="text"
              value={progressDate}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* After Save Summary */}
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <p className="text-sm font-medium text-purple-800 mb-1">After Save:</p>
            <p className="text-2xl font-bold text-purple-800">
              {(totalEmbankment + embankmentDoneKm).toFixed(2)} / {targetKm} KM
            </p>
            <p className="text-sm text-purple-600">
              Remaining: {(targetKm - (totalEmbankment + embankmentDoneKm)).toFixed(2)} KM
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Save Embankment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}