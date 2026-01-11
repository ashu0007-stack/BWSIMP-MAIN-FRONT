import React, { FC, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";

import { FileText, X } from "lucide-react";

import { useLevels, useLevelsByDeptId } from '@/hooks/userHooks/userLevel';
import {
  useActivities,
  useProgramComponet,
  useProgrameTopics,
  useUpdatePrograme,
} from "@/hooks/programesTraining/usePrograme";

import { useDepartments } from '@/hooks/userHooks/userDepartment';

interface Props {
  editData: any;
  onBack: () => void;
}

export const EditTraining: FC<Props> = ({ editData, onBack }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      rows: [{ Component: "", topics: "" }],
    },
  });

  /* ===================== APIs ===================== */
    const departmentId = watch("DeptAgency");
    const levelId = watch("level");
   const { data: department } = useDepartments();
     const { data: levelData } = useLevelsByDeptId(departmentId);
  const { data: activities } = useActivities();
  const { data: componetes } = useProgramComponet();
 

  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(
    null
  );
  const { data: topics } = useProgrameTopics(selectedComponentId);

  const { mutate: updateProgram } = useUpdatePrograme();

  /* ===================== FIELD ARRAY ===================== */
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  /* ===================== FINANCIAL YEAR ===================== */
  const currentYear = new Date().getFullYear();
  const financialYear = Array.from({ length: 2030 - currentYear + 1 }, (_, i) => {
    const year = currentYear + i;
    return `${year}-${(year + 1).toString().slice(-2)}`;
  });

  /* ===================== BASIC RESET ===================== */
  useEffect(() => {
    if (!editData) return;

    reset({
      financialYear: editData.financialYear,
      resourcePerson: editData.resourcePerson,
      targetGroup: editData.targetGroup,

      coordinatorName: editData.coordinator?.name,
      coordinatorContact: editData.coordinator?.contact,
      coordinatorEmail: editData.coordinator?.email,
      coordinatorDesignation: editData.coordinator?.designation,

      trainingDate: editData.schedule?.date,
      venue: editData.schedule?.venue,
      session: editData.schedule?.session,
      trainingMode: editData.schedule?.trainingMode,
      durationValue: editData.schedule?.duration?.split(" ")[0],
      durationType: editData.schedule?.duration?.includes("Days")
        ? "Days"
        : "Hours",

      totalParticipants: editData.participants?.total,
      participantsMale: editData.participants?.male,
      participantsFemale: editData.participants?.female,
      governmentStakeholder: editData.participants?.governmentStakeholder,
      beneficiary: editData.participants?.beneficiary,

      remarks: editData.remarks,

      rows: [{ Component: "", topics: "" }],
    });
  }, [editData, reset]);

  /* ===================== DROPDOWN PREFILL ===================== */

  // Department
  useEffect(() => {
    if (!editData?.departmentName || !department?.length) return;

    const dept = department.find(
      (d: any) => d.departmentName === editData.departmentName
    );
    if (dept) setValue("DeptAgency", String(dept.departmentId));
  }, [editData, department, setValue]);

  // Activity
  useEffect(() => {
    if (!editData?.activityName || !activities?.data?.length) return;

    const act = activities.data.find(
      (a: any) => a.activityName === editData.activityName
    );
    if (act) setValue("ActivityCatgaory", String(act.activityId));
  }, [editData, activities, setValue]);

// Level prefill
useEffect(() => {
  if (!editData?.levelName) return;
  if (!levelData || levelData.length === 0) return;

  const lvl = levelData.find(
    (l: any) => l.userLevelName === editData.levelName
  );

  if (lvl) {
    setValue("level", String(lvl.userLevelId), {
      shouldDirty: true,
      shouldTouch: true,
    });
  }
}, [editData?.levelName, levelData, setValue]);


  /* ===================== COMPONENT → TOPIC PREFILL ===================== */

  // Step 1: match component
  useEffect(() => {
    if (!editData?.componentName || !componetes?.data) return;

    const comp = componetes.data.find(
      (c: any) => c.componentName === editData.componentName
    );

    if (comp) setSelectedComponentId(comp.componentId);
  }, [editData, componetes]);

  // Step 2: match topic and set rows
  useEffect(() => {
    if (!topics?.data || !selectedComponentId) return;

    const topic = topics.data.find(
      (t: any) => t.topicName === editData.topicName
    );

    if (!topic) return;

    reset((prev: any) => ({
      ...prev,
      rows: [
        {
          Component: String(selectedComponentId),
          topics: String(topic.id),
        },
      ],
    }));
  }, [topics, selectedComponentId, editData, reset]);

  /* ===================== PARTICIPANT AUTO CALC ===================== */
  const totalParticipants = watch("totalParticipants");
  const participantsFemale = watch("participantsFemale");
  const governmentStakeholder = watch("governmentStakeholder");

  useEffect(() => {
    if (
      typeof totalParticipants === "number" &&
      typeof participantsFemale === "number"
    ) {
      const female = Math.min(participantsFemale, totalParticipants);
      const male = totalParticipants - female;

      setValue("participantsFemale", female);
      setValue("participantsMale", male);

      const gov = Number(governmentStakeholder) || 0;
      setValue("beneficiary", Math.max(totalParticipants - gov, 0));
    }
  }, [
    totalParticipants,
    participantsFemale,
    governmentStakeholder,
    setValue,
  ]);

  /* ===================== SUBMIT ===================== */
  const onSubmit = (data: any) => {
    const payload = {
      programId: editData.programId,

      financialYear: data.financialYear,
      levelId: Number(data.level),
     deptAgencyId: Number(data.DeptAgency),
      activityTypeId: Number(data.ActivityCatgaory),

      rows: data.rows.map((row: any) => ({
        componentId: Number(row.Component),
        topicId: Number(row.topics),
      })),

      resourcePerson: data.resourcePerson,
      targetGroup: data.targetGroup,

      coordinatorName: data.coordinatorName,
      coordinatorContact: data.coordinatorContact,
      coordinatorEmail: data.coordinatorEmail,
      coordinatorDesignation: data.coordinatorDesignation,

      session: data.session,
      trainingDate: data.trainingDate,
      venue: data.venue,
      duration:
        data.durationValue && data.durationType
          ? `${data.durationValue} ${data.durationType}`
          : null,
      trainingMode: data.trainingMode,

      totalParticipants: data.totalParticipants,
      participantsFemale: data.participantsFemale,
      participantsMale: data.participantsMale,
      governmentStakeholder: data.governmentStakeholder,
      beneficiary: data.beneficiary,

      participantsFile: data.participantsFile,
      remarks: data.remarks,
    };

    console.log("UPDATE PAYLOAD 👉", payload);

    updateProgram(payload, {
      onSuccess: () => {
        toast.success("Training updated successfully");
        onBack();
      },
      onError: () => toast.error("Update failed"),
    });
  };

    /* -------------------- JSX -------------------- */
    return (
        
        <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">

            {/* HEADER */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-8 h-8" />
                        Create Programme / Activity
                    </h1>
                    <p className="text-blue-100 mt-2">Please fill all required fields marked with *</p>
                </div>
            </div>

            {/* CARD FORM */}
            <form onSubmit={handleSubmit(onSubmit)}>

                {/* ========== FORM CARD ========== */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">

                    {/* Section Header */}
                    <div className="flex items-center justify-between w-full gap-2 mb-3 pb-2 border-b border-slate-200">
                        <div className='flex items-center gap-3 '>
                            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
                            <FileText className="w-5 h-5 text-blue-900" />
                            <h2 className="text-xl font-semibold text-slate-800">Training Details</h2>
                        </div>
                        {/* BACK BUTTON */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow"
                            >
                                Back
                            </button>
                        </div>
                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Financial Year */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Financial Year <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`w-full border ${errors.financialYear ? "border-red-500" : "border-slate-300"} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500`}
                                {...register("financialYear", { required: "Please select a financial year" })}
                            >
                                <option value="">Select Year</option>
                                {financialYear.map((fy) => (
                                    <option key={fy} value={fy}>{fy}</option>
                                ))}
                            </select>
                            {/* {errors.financialYear && <p className="text-red-500 text-sm">{errors.financialYear.message}</p>} */}
                        </div>

                        {/* Department / Agency */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Department / Agency <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`w-full border ${errors.DeptAgency ? "border-red-500" : "border-slate-300"} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500`}
                                {...register("DeptAgency", { required: "Please select department" })}
                            >
                                <option value="">Select Department</option>
                                {department?.map((dep: any) => (
                                    <option key={dep.departmentId} value={dep.departmentId}>{dep.departmentName}</option>
                                ))}
                            </select>
                            {/* {errors.DeptAgency && <p className="text-red-500 text-sm">{errors.DeptAgency.message}</p>} */}
                        </div>

                        {/* Activity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                               Event Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`w-full border ${errors.ActivityCatgaory ? "border-red-500" : "border-slate-300"} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500`}
                                {...register("ActivityCatgaory", { required: "Please select activity" })}
                            // onChange={handleActivitiesChange}
                            >
                                <option value="">Select Activity</option>
                                {activities?.data?.map((act: any) => (
                                    <option key={act.activityId} value={act.activityId}>{act.activityName}</option>
                                ))}
                            </select>
                            {errors.ActivityCatgaory && <p className="text-red-500 text-sm">{errors.ActivityCatgaory.message as string}</p>}
                        </div>

                        {/* Level */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`w-full border ${errors.level ? "border-red-500" : "border-slate-300"} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500`}
                                {...register("level", { required: "Please select level" })}
                            >
                                <option value="">Select Level</option>
                                {levelData?.map((lvl: any) => (
                                    <option key={lvl.userLevelId} value={lvl.userLevelId}>{lvl.userLevelName}</option>
                                ))}
                            </select>
                            {/* {errors.level && <p className="text-red-500 text-sm">{errors.level.message}</p>} */}
                        </div>
                        <div className="mt-6 space-y-4">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end"
                                >
                                    {/* ✅ Component */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Component</label>
                                        <select
                                            className={`w-full border  rounded-lg px-4 py-2.5`}
                                            // ${errors?.rows?.[index]?.Component
                                            // ? "border-red-500"
                                            // : "border-slate-300"} 

                                            {...register(`rows.${index}.Component`, {
                                                required: "Please select Component",
                                            })}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                setSelectedComponentId(value);
                                            }}
                                        >
                                            <option value="">Select Component</option>
                                            {componetes?.data?.map((sub: any) => (
                                                <option key={sub.componentId} value={sub.componentId}>
                                                    {sub.componentName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ✅ Topic */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Topic</label>
                                        <select
                                            className={`w-full border  rounded-lg px-4 py-2.5`}
                                            // ${errors?.rows?.[index]?.topics
                                            // ? "border-red-500"
                                            // : "border-slate-300"
                                            // }
                                            {...register(`rows.${index}.topics`, {
                                                required: "Please select topic",
                                            })}
                                        >
                                            <option value="">Select Topic</option>
                                            {topics?.data?.map((topic: any) => (
                                                <option key={topic.id} value={topic.id}>
                                                    {topic.topicName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ✅ Add Button (Always visible) */}
                                    <button
                                        type="button"
                                        onClick={() => append({ Component: "", topics: "" })}
                                        className="h-[42px] px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        +
                                    </button>

                                    {/* ✅ Remove Button (Only if more than 1 row) */}
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="h-[42px] px-4 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                                        >
                                            −
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Resource Person</label>
                            <input
                                type="text"
                                {...register("resourcePerson", { required: "Enter resource person name" })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="Enter Resource Person Name"
                            />
                            {errors.resourcePerson && (
                                <p className="text-red-500 text-sm">{errors.resourcePerson.message as string}</p>
                            )}
                        </div>


                        {/*       <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700"> resource person </label>
                                <input
                                    type="text"
                                    {...register("venue", { required: "Enter venue" })}
                                    className="w-full mt-1 p-2 border rounded-md"
                                    placeholder="Venue details"
                                />
                                {errors.venue && (
                                    <p className="text-red-500 text-sm">{errors.venue.message as string}</p>
                                )}
                            </div> */}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Target Group
                            </label>

                            <select
                                {...register("targetGroup", {
                                    required: "Select target group",
                                })}
                                className="w-full mt-1 p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select resource person
                                </option>
                                <option value="farmer_wua">
                                    Farmer / WUA Member
                                </option>
                                <option value="gov_officer"  >
                                    Government Officer
                                </option>

                                <option value="Both">
                                    Both
                                </option>
                            </select>

                            {errors.targetGroup && (
                                <p className="text-red-500 text-sm">
                                    {errors.targetGroup.message as string}
                                </p>
                            )}

                        </div>

                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
                    {/* Section Header */}
                    <div className="flex items-center justify-between w-full gap-2 mb-3 pb-2 border-b border-slate-200">
                        <div className='flex items-center gap-3 '>
                            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
                            <FileText className="w-5 h-5 text-blue-900" />
                            <h2 className="text-xl font-semibold text-slate-800">Course Coordinator Details</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
                        {/* Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                {...register("coordinatorName", { required: "Enter Name" })}
                                className="w-full p-2 border rounded-md"
                                placeholder="Coordinator Name"
                            />
                            {/* {errors.coordinatorName && (
                                    <p className="text-red-500 text-xs">{errors.coordinatorName.message}</p>
                                )} */}
                        </div>

                        {/* Designation */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Designation</label>
                            <input
                                type="text"
                                {...register("coordinatorDesignation", { required: "Enter Designation" })}
                                className="w-full p-2 border rounded-md"
                                placeholder="Designation"
                            />
                            {/* {errors.coordinatorDesignation && (
                                    <p className="text-red-500 text-xs">{errors.coordinatorDesignation.message}</p>
                                )} */}
                        </div>

                        {/* Contact */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Contact No.</label>
<input
  type="number"
  {...register("coordinatorContact", {
    required: "Enter Contact",
    maxLength: {
      value: 10,
      message: "Contact number cannot exceed 10 digits",
    },
    minLength: {
      value: 10,
      message: "Contact number must be 10 digits",
    },
    pattern: {
      value: /^[0-9]{10}$/,
      message: "Contact number must be numeric and 10 digits",
    },
  })}
  className="w-full p-2 border rounded-md"
  placeholder="Contact Number"
/>

                            {/* {errors.contact && (
                                    <p className="text-red-500 text-xs">{errors.contact.message}</p>
                                )} */}
                        </div>
                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                {...register("coordinatorEmail", { required: "Enter Email" })}
                                className="w-full p-2 border rounded-md"
                                placeholder="Email"
                            />
                            {/* {errors.coordinatorEmail && (
                                    <p className="text-red-500 text-xs">{errors.coordinatorEmail.message}</p>
                                )} */}
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
                    <div className="flex items-center justify-between w-full gap-2 mb-3 pb-2 border-b border-slate-200">
                        <div className='flex items-center gap-3 '>
                            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
                            <FileText className="w-5 h-5 text-blue-900" />
                            <h2 className="text-xl font-semibold text-slate-800"> Training Schedule</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">session</label>
                            <input
                                type="text"
                                {...register("session", { required: "Enter session" })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="session details"
                            />
                            {errors.session && (
                                <p className="text-red-500 text-sm">{errors.session.message as any}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                {...register("trainingDate", { required: "Select date" })}
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                            {errors.trainingDate && (
                                <p className="text-red-500 text-sm">{errors.trainingDate.message as string}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Venue</label>
                            <input
                                type="text"
                                {...register("venue", { required: "Enter venue" })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="Venue details"
                            />
                            {errors.venue && (
                                <p className="text-red-500 text-sm">{errors.venue.message as string}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Duration</label>
                            <div className="flex gap-2">
                                {/* Value */}
                                <input
                                    type="number"
                                    {...register("durationValue", { required: "Enter duration" })}
                                    className="w-1/2 p-2 border rounded-md"
                                    placeholder="Enter value"
                                />
                                {/* Type */}
                                <select
                                    {...register("durationType", { required: true })}
                                    className="w-1/2 p-2 border rounded-md"
                                >
                                    <option value="Hours">Hours</option>
                                    <option value="Days">Days</option>
                                </select>
                            </div>
                            {(errors.durationValue || errors.durationType) && (
                                <p className="text-red-500 text-sm">
                                    Duration is required
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Training Mode</label>
                            <select
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                                {...register("trainingMode")}
                            >
                                <option value="">Select Topic mode</option>
                                <option value="online/Virtual">online/Virtual</option>
                                <option value="offline/physical">offline/physical</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
                    <div className="flex items-center justify-between w-full gap-2 mb-3 pb-2 border-b border-slate-200">
                        <div className='flex items-center gap-3 '>
                            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
                            <FileText className="w-5 h-5 text-blue-900" />
                            <h2 className="text-xl font-semibold text-slate-800"> Participants Details</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Total Participants</label>
                            <input
                                type="number"
                                {...register("totalParticipants", { required: "Enter Total Participants", valueAsNumber: true, })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="TotalParticipants details"
                            />
                            {errors.totalParticipants && (
                                <p className="text-red-500 text-sm">{errors.totalParticipants.message as string}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700"> Participant List</label>
                            <input
                                type="text"
                                {...register("participantsFile")}  //{ required: "Enter participantsFile" }
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="participantsFile details"
                            />
                            {/* {errors.participantsFile && (
                                <p className="text-red-500 text-sm">{errors.participantsFile.message as string}</p>
                            )} */}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700"> Female</label>
                            <input
                                type="number"
                                {...register("participantsFemale", { required: "Enter participantsFemale", valueAsNumber: true, })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="participantsFemale details"
                            />
                            {errors.participantsFemale && (
                                <p className="text-red-500 text-sm">{errors.participantsFemale.message as string}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Male</label>
                            <input
                                type="number"
                                readOnly
                                {...register("participantsMale")}
                                className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Government Stakeholder</label>
                            <input
                                type="number"
                                {...register("governmentStakeholder", { required: "Enter government stakeholder" })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="governmentStakeholder details"
                            />
                            {errors.governmentStakeholder && (
                                <p className="text-red-500 text-sm">{errors.governmentStakeholder.message as string}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Beneficiary</label>
                            <input
                                type="number"
                                {...register("beneficiary", { required: "Enter beneficiary" })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="beneficiary details"
                            />
                            {errors.beneficiary && (
                                <p className="text-red-500 text-sm">{errors.beneficiary.message as string}</p>
                            )}
                        </div>

                    </div>


                    {/* Remarks */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Remarks</label>
                        <textarea
                            rows={4}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter remarks..."
                            {...register("remarks")}
                        />
                    </div>



                </div>

                {/* SUBMIT BUTTON */}
                <div className="my-6 flex justify-end gap-5">
                    <button
                        type="reset"
                        className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        // disabled={isPending}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50"
                    >
                        Submit
                    </button>

 

                </div>

            </form>
        </div>

    );
};
