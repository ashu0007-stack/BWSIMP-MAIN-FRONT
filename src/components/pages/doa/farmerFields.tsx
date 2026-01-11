import React from "react";

export const FarmerFields = ({
  register,
  errors,
  readOnly = false,
  selectWuaMember,
  onWuaChange
}: any) => {

  const renderInput = (
    name: string,
    label: string,
    placeholder?: string,
    type = "text",
    required = false
  ) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        {...register(name, required ? { required: `${label} is required` } : {})}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full mt-1 px-3 py-2 border rounded-md 
          ${errors[name] ? "border-red-500" : ""}
          ${readOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""}`}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    // <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <>

      {renderInput("farmer_reg_no", "DBT Reg. No.", "Enter DBT Reg No", "text", true)}
      {renderInput("farmer_name", "Farmer Name", "Enter name", "text", true)}
      {renderInput("father_or_husband_name", "Father's / Husband's Name", "Enter name")}

      {/* Gender */}
      <div>
        <label className="text-sm font-medium text-gray-700">Gender</label>
        <select
          {...register("gender", { required: "Gender is required" })}
          disabled={readOnly}
          className={`w-full mt-1 px-3 py-2 border rounded-md
            ${readOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""}`}
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-sm">{errors.gender.message}</p>
        )}
      </div>

      {renderInput("age", "Age", "Enter age", "number")}
      {renderInput("category", "Category", "Enter category", "text")}
      {renderInput("contact_number", "Contact Number", "Enter number")}
      {renderInput("address", "Address", "Enter address")}
      {renderInput("land_holding_size", "Land Holding Size (ha)", "number")}
      {renderInput("irrigated_area", "Irrigated Area (ha)", "number")}
      {renderInput("major_crops_grown", "Major Crops Grown", "Enter crops")}

      {/* Member of WUA */}
      <div>
        <label className="text-sm font-medium text-gray-700">Member of WUA</label>
        <select
          {...register("member_of_wua", {
            setValueAs: (v:any) => (v === "true")   // convert string → boolean
          })}
          disabled={readOnly}
          onChange={(e) => onWuaChange?.(e.target.value === "true")}
          className={`w-full mt-1 px-3 py-2 border rounded-md 
            ${readOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""}`}
        >
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      {selectWuaMember && renderInput("wuaName", "Name of WUA", "Enter WUA name")}
</>
    // </div>
  );
};
