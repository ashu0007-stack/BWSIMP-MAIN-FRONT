import React, { FC, useEffect, useMemo } from "react";
import { useForm, useWatch, Path } from "react-hook-form";
import { Users, Shield, Building, MapPin, AlertCircle, Loader2, User } from "lucide-react";
import { Spinner } from "@/components/shared/Icons/customIcon";
import { useDepartments } from "@/hooks/userHooks/userDepartment";
import { useGetDesignationsByDeptAndLevel } from "@/hooks/userHooks/userDesignation";
import { useRoleByDesigId } from "@/hooks/userHooks/useRole";
import { useLevelsByDeptId } from "@/hooks/userHooks/userLevel";
import { useCreateUser } from "@/hooks/userHooks/useUserDetails";

import { useDistricts } from "@/hooks/location/useDistricts";
import { useZones } from "@/hooks/location/useZone";
import { useCirclesByZoneId } from "@/hooks/location/useCircle";
import { useDivisionByCircleId } from "@/hooks/location/useDivision";
import { useSubDivisionByDivisionId } from "@/hooks/location/useSubDivision";
import { useSectionBySubDivisionId } from "@/hooks/location/useSection";
import { useBlocks } from "@/hooks/location/useBlocks";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type FormValues = {
  employeeId: string;
  full_name: string;
  mobno: string;
  email: string;
  password: string;
  department_id: string;
  user_level_id: string;
  designation_id: string;
  role_id: string;
  hrms?: string;

  state_id?: number;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
  sub_division_id?: number;
  section_id?: number;
  district_id?: number;
  block_id?: number;
};

type LevelConfig = {
  showFor: number[];
  levelId: number;
  field: Path<FormValues>;
  options: { id: number; name: string }[];
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|in|gov|edu)$/i;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

/* ================= COMPONENT ================= */

export const UserCreate: FC = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: false,
  });

  /* ================= WATCH VALUES ================= */

  const departmentId = Number(useWatch({ control, name: "department_id" }));
  const levelId = Number(useWatch({ control, name: "user_level_id" }));
  const designationId = useWatch({ control, name: "designation_id" });
  const zoneId = useWatch({ control, name: "zone_id" });
  const circleId = useWatch({ control, name: "circle_id" });
  const divisionId = useWatch({ control, name: "division_id" });
  const subDivisionId = useWatch({ control, name: "sub_division_id" });
  const districtId = useWatch({ control, name: "district_id" });

  /* ================= DATA FETCH ================= */

  const { data: departments, isLoading: deptLoading } = useDepartments();
  const { data: levels, isLoading: levelLoading } = useLevelsByDeptId(departmentId);
  const { data: designations, isLoading: desgLoading } = useGetDesignationsByDeptAndLevel({ departmentId, levelId });
  const { data: roles, isLoading: roleLoading } = useRoleByDesigId(Number(designationId));

  const { data: zones } = useZones({ enabled: [2, 3, 4, 5, 6].includes(levelId) });
  const { data: circles } = useCirclesByZoneId(zoneId);
  const { data: divisions } = useDivisionByCircleId(circleId);
  const { data: subDivisions } = useSubDivisionByDivisionId(divisionId);
  const { data: sections } = useSectionBySubDivisionId(subDivisionId);
  const { data: districts } = useDistricts({ enabled: [7, 8].includes(levelId) });
  const { data: blocks } = useBlocks(districtId);

  const { mutate: createUser, isPending } = useCreateUser();

  /* ================= DEPENDENT RESETS ================= */
  useEffect(() => {
    if (!departmentId) return;

    // professional
    resetField("user_level_id");
    resetField("designation_id");
    resetField("role_id");

    // location
    resetField("state_id");
    resetField("zone_id");
    resetField("circle_id");
    resetField("division_id");
    resetField("sub_division_id");
    resetField("section_id");
    resetField("district_id");
    resetField("block_id");
  }, [departmentId, resetField]);

  useEffect(() => {
    if (!levelId) return;

    resetField("designation_id");
    resetField("role_id");
    // reset location when level changes
    resetField("state_id");
    resetField("zone_id");
    resetField("circle_id");
    resetField("division_id");
    resetField("sub_division_id");
    resetField("section_id");
    resetField("district_id");
    resetField("block_id");
  }, [levelId, resetField]);

  useEffect(() => {
    setValue("role_id", "");
  }, [designationId, setValue]);

  /* ================= LEVEL CONFIG ================= */
  const levelConfig = useMemo<LevelConfig[]>(
    () => [
      {
        showFor: [1, 7, 8],
        levelId: 1,
        field: "state_id",
        options: [{ id: 1, name: "Bihar" }],
      },
      {
        showFor: [2, 3, 4, 5, 6],
        levelId: 2,
        field: "zone_id",
        options:
          zones?.data?.map((z: any) => ({
            id: z.zone_id,
            name: z.zone_name,
          })) || [],
      },
      {
        showFor: [3, 4, 5, 6],
        levelId: 3,
        field: "circle_id",
        options:
          circles?.data?.map((c: any) => ({
            id: c.circle_id,
            name: c.circle_name,
          })) || [],
      },
      {
        showFor: [4, 5, 6],
        levelId: 4,
        field: "division_id",
        options:
          divisions?.data?.map((d: any) => ({
            id: d.division_id,
            name: d.division_name,
          })) || [],
      },
      {
        showFor: [5, 6],
        levelId: 5,
        field: "sub_division_id",
        options:
          subDivisions?.data?.map((sd: any) => ({
            id: sd.sub_division_id,
            name: sd.sub_division_name,
          })) || [],
      },
      {
        showFor: [6],
        levelId: 6,
        field: "section_id",
        options:
          sections?.data?.map((s: any) => ({
            id: s.section_id,
            name: s.section_name,
          })) || [],
      },
      {
        showFor: [7, 8],
        levelId: 7,
        field: "district_id",
        options:
          districts?.data?.map((d: any) => ({
            id: d.district_id,
            name: d.district_name,
          })) || [],
      },
      {
        showFor: [8],
        levelId: 8,
        field: "block_id",
        options:
          blocks?.data?.map((b: any) => ({
            id: b.block_id,
            name: b.block_name,
          })) || [],
      },
    ],
    [zones, circles, divisions, subDivisions, sections, districts, blocks]
  );

  /* ================= SUBMIT ================= */

  const onSubmit = (data: FormValues) => {
    console.log("paylod data", data)
    createUser(data, {
      onSuccess: (res) => {
        toast.success("User created successfully!");
        console.log("Success response:", res);
        resetField
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message || "Something went wrong";

        toast.error(message);
        console.error("Error response:", err.response?.data || err);
      },
    });
  };

  /* ================= INPUT RENDER ================= */
  const renderInput = (
    label: string,
    field: Path<FormValues>,
    type = "text",
    requiredMsg?: string,
    pattern?: RegExp,
    patternMsg?: string,
    maxLength?: number,
    prefix?: string // e.g. "+91"
  ) => (
    <div className="flex flex-col mb-4">
      <label className="label ms-2">
        {label}
        <span className="text-red-700">*</span>
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 select-none">
            {prefix}
          </span>
        )}

        <input
          type={type}
          className={`input w-full pl-${prefix ? "12" : "3"} ${errors[field] ? "border-red-500" : ""
            }`}
          maxLength={maxLength}
          inputMode={field === "mobno" ? "numeric" : undefined}
          {...register(field, {
            required: requiredMsg,
            pattern:
              pattern && patternMsg
                ? {
                  value: pattern,
                  message: patternMsg,
                }
                : undefined,
            onChange: (e) => {
              if (field === "mobno") {
                // Remove non-digits
                e.target.value = e.target.value.replace(/\D/g, "");
              }
            },
          })}
        />
      </div>

      {errors[field] && (
        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle size={14} />
          {errors[field]?.message}
        </p>
      )}
    </div>
  );

  /* ================= JSX ================= */
  return (
    <div className="p-3 px-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r rounded-2xl from-blue-900 to-blue-800 px-8 py-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8" />
          Create Users
        </h1>
        <p className="text-blue-100 mt-2">Please fill all required fields marked with *</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className=" space-y-5">
        <div className="border shadow-md border-gray-200 rounded-2xl mt-2 px-8 py-6">
          <div className="border-b mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
              <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                <span>Personal Information</span>
              </h3>
            </div>
          </div>
          {/* PERSONAL */}
          <div className="grid sm:grid-cols-2 gap-6">
            {renderInput("Employee ID", "employeeId", "text", "Employee ID is required")}
            {renderInput("Full Name", "full_name", "text", "Full name is required")}
            {renderInput("Mobile", "mobno", "tel", "Mobile number is required", MOBILE_REGEX, "Enter valid 10-digit mobile number", 10, "+91")}
            {renderInput("Email", "email", "email", "Email is required", EMAIL_REGEX, "Enter a valid email address")}
            {renderInput("Password", "password", "password", "Required")}
          </div>
        </div>

        {/* PROFESSIONAL */}
        <div className="border shadow-md border-gray-200 rounded-2xl mt-2 px-8 py-6">
          <div className="border-b mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
              <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                <span>Professional Information</span>
              </h3>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Department<span className="text-red-700">*</span></label>
              <select
                {...register("department_id", {
                  required: "Department is required",
                })}
                className={`input ${errors.department_id ? "border-red-500" : ""}`}
              >
                <option value="">Select Department</option>
                {departments?.map((d: any) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {errors.department_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Level<span className="text-red-700">*</span></label>
              <select
                {...register("user_level_id", {
                  required: "Level is required",
                })}
                className={`input ${errors.user_level_id ? "border-red-500" : ""}`}
              >
                <option value="">Select Level</option>
                {levels?.map((l: any) => (
                  <option key={l.userLevelId} value={l.userLevelId}>
                    {l.userLevelName}
                  </option>
                ))}
              </select>
              {errors.user_level_id && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {errors.user_level_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Designation<span className="text-red-700">*</span></label>

              <select
                {...register("designation_id", {
                  required: "Designation is required",
                })}
                className={`input ${errors.designation_id ? "border-red-500" : ""}`}
                disabled={!levelId || desgLoading}
              >
                <option value="">Select Designation</option>
                {designations?.map((d: any) => (
                  <option key={d.designationId} value={d.designationId}>
                    {d.designationName}
                  </option>
                ))}
              </select>
              {errors.designation_id && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {errors.designation_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Roles<span className="text-red-700">*</span></label>
              <select
                {...register("role_id", {
                  required: "Role is required",
                })}
                disabled={!designationId || roleLoading}
                className={`input ${errors.role_id ? "border-red-500" : ""}`}
              >
                <option value="">Select Role</option>
                {roles?.map((r: any) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {errors.role_id.message}
                </p>
              )}
            </div>

            {renderInput("HRMS", "hrms")}
          </div>
        </div>
        <div className="border shadow-md border-gray-200 rounded-2xl mt-2 px-8 py-6">
          <div className="border-b mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
              <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                <span>Location Information</span>
              </h3>
            </div>
          </div>
          {/* LOCATION */}
          <div className="grid sm:grid-cols-2 gap-6">
            {levelConfig.map((c) => {
              if (!c.showFor.includes(levelId)) return null;

              // store the level name in a variable
              const levelName = levels?.find((l: any) => l.userLevelId === c.levelId)?.userLevelName;

              return (
                <div key={c.levelId}>
                  <label className="label ms-2">
                    {levelName}
                    <span className="text-red-700">*</span>
                  </label>

                  <select
                    {...register(c.field, { required: `${levelName} is required` })}
                    className={`input ${errors[c.field] ? "border-red-500" : ""}`}
                  >
                    <option value="">Select</option>
                    {c.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>

                  {errors[c.field] && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {errors[c.field]?.message}
                    </p>
                  )}
                </div>
              );
            })}

          </div>
        </div>
        {/* Submit */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition flex items-center justify-center gap-2 min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
