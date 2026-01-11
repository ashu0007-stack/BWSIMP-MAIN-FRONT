import React, { FC, useEffect, useState } from "react";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";

/* ================= TYPES ================= */

type LocationItem = {
  id: number;
  name: string;
  parentId?: number | string;
};

interface LocationFormSelectProps {
  levels: string[];
  data: Record<string, LocationItem[]>;

  /* Form mode */
  register?: UseFormRegister<any>;
  watch?: UseFormWatch<any>;
  setValue?: UseFormSetValue<any>;

  /* Filter mode */
  value?: Record<string, number | string | undefined>;
  onChange?: (level: string, value: number | string | undefined) => void;

  required?: boolean;
  fetchChild?: (level: string, parentId: number | string) => Promise<any[]>;
}

/* ================= COMPONENT ================= */

export const LocationFormSelect: FC<LocationFormSelectProps> = ({
  levels,
  data,
  register,
  watch,
  setValue,
  value,
  onChange,
  required = true,
  fetchChild,
}) => {
  const isFormMode = !!register && !!watch && !!setValue;

  const formValues = watch?.();
  const values = isFormMode ? formValues : value;

  const [options, setOptions] = useState<Record<string, LocationItem[]>>({});

  /* Initialize options */
  useEffect(() => {
    setOptions(data);
  }, [data]);

  /* ================= HANDLER ================= */

  const handleParentChange = async (
    index: number,
    level: string,
    rawValue: string
  ) => {
    const selectedValue = rawValue ? Number(rawValue) : undefined;

    const childLevels = levels.slice(index + 1);

    /* Clear child values */
    childLevels.forEach((lvl) => {
      isFormMode
        ? setValue?.(`${lvl}Id`, undefined)
        : onChange?.(lvl, undefined);
    });

    if (!selectedValue) return;

    /* Fetch child options (API mode) */
    if (fetchChild) {
      const childLevel = levels[index + 1];
      if (!childLevel) return;

      const childData = await fetchChild(childLevel, selectedValue);

      const mapped: LocationItem[] = childData.map((item: any) => ({
        id:
          item.id ??
          item[`${childLevel}_id`] ??
          item[`${childLevel}Id`],
        name:
          item.name ??
          item[`${childLevel}_name`] ??
          item[`${childLevel}Name`],
        parentId: selectedValue,
      }));

      setOptions((prev) => ({
        ...prev,
        [childLevel]: mapped,
      }));
    }
  };

  /* ================= HELPERS ================= */

  const getOptions = (level: string, index: number): LocationItem[] => {
    const parentLevel = levels[index - 1];
    const parentValue = parentLevel ? values?.[`${parentLevel}Id`] : undefined;

    const levelData = options[level] || [];

    if (!parentLevel) return levelData;

    return levelData.filter((item) => item.parentId === parentValue);
  };

  /* ================= RENDER ================= */

  return (
    <div
      className={`grid gap-4 ${
        levels.length <= 4
          ? `md:grid-cols-${levels.length}`
          : "md:grid-cols-3"
      }`}
    >
      {levels.map((level, index) => {
        const parentLevel = levels[index - 1];
        const parentValue = parentLevel
          ? values?.[`${parentLevel}Id`]
          : true;

        const levelOptions = getOptions(level, index);

        return (
          <div key={level}>
            <label className="text-sm font-medium text-gray-700 capitalize">
              {level}
              {/* {required && <span className="text-red-500"> *</span>} */}
            </label>

            <select
              {...(isFormMode
                ? register?.(`${level}Id`, {
                    required: required
                      ? `${level} is required`
                      : false,
                    valueAsNumber: true,
                    onChange: (e) =>
                      handleParentChange(index, level, e.target.value),
                  })
                : {
                    value: values?.[`${level}Id`] ?? "",
                    onChange: (e) => {
                      onChange?.(level, e.target.value);
                      handleParentChange(index, level, e.target.value);
                    },
                  })}
              disabled={index !== 0 && !parentValue}
              className={`w-full mt-1 p-2 border rounded-md ${
                index !== 0 && !parentValue
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">Select {level}</option>

              {levelOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
};
