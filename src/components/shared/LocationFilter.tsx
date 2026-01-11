import React, { useState, FC } from "react";

interface LocationFilterProps {
  levels: string[]; // e.g. ["district", "block", "cluster", "village"]
  data: Record<string, any[]>; // e.g. { district: [...], block: [...], cluster: [...] }
  onChange: (values: Record<string, string | number>) => void;
  loading?: Record<string, boolean>;
}

export const LocationFilter: FC<LocationFilterProps> = ({ levels, data, onChange, loading }) => {
  const [selectedValues, setSelectedValues] = useState<Record<string, string | number>>({});

  const handleChange = (level: string, value: string | number) => {
    const updated = { ...selectedValues, [level]: value };

    // Clear lower-level selections when parent changes
    const index = levels.indexOf(level);
    levels.slice(index + 1).forEach((next) => delete updated[next]);

    setSelectedValues(updated);
    onChange(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {levels.map((level) => (
        <div key={level}>
          <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
            {level}
          </label>
          <select
            value={selectedValues[level] || ""}
            onChange={(e) => handleChange(level, e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200"
            disabled={loading?.[level]}
          >
            <option value="">Select {level}</option>
            {loading?.[level] ? (
              <option disabled>Loading...</option>
            ) : (
              (data[level] || []).map((item: any) => (
                <option
                  key={item.id || item.code || item.name}
                  value={item.id || item.code || item.name}
                >
                  {item.name || item.label || item.district_name || item.block_name || item.cluster_name}
                </option>
              ))
            )}
          </select>
        </div>
      ))}
    </div>
  );
};
