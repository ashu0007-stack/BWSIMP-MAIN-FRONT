
import { useActivities, useAddPrograme, useProgramComponet, usePrograme, useProgrameTopics } from '@/hooks/programesTraining/usePrograme';
import { error } from 'console';
import React, { FC, useEffect, useState } from 'react'
import { useFieldArray, useForm } from "react-hook-form"
import { ProgrammeTable } from "./traningDetails";
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDepartments } from '@/hooks/userHooks/userDepartment';
import { useLevels, useLevelsByDeptId } from '@/hooks/userHooks/userLevel';


interface Row {
    Component: string;
    topics: string;
}

interface formValue {
    financialYear?: string;
    DeptAgency?: number;
    ActivityCatgaory?: string;
    level?: string;
    rows: Row[];

    trainingDate?: string;
    venue?: string;
    session?: string;

    durationValue?: number;
    durationType?: "Hours" | "Days";


    trainingMode?: string;
    targetGroup?: string;

    resourcePerson?: string;
    contact?: string;

    coordinatorName?: string;
    coordinatorEmail?: string;
    coordinatorDesignation?: string;

    totalParticipants?: number;
    participantsFile?: string;
    participantsFemale?: number;
    participantsMale?: number;
    governmentStakeholder?: number;
    beneficiary?: number;

    remarks?: string;
}

export interface Props {
    onBack: () => void;
}

export const CreateTrainig: FC<any> = ({ setShowForm }) => {

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<formValue>({
        defaultValues: {
            rows: [{ Component: "", topics: "" }],
        },
    });

    const departmentId = watch("DeptAgency")
    const levelId = watch("level")
    const [activityId, setActivityId] = useState<number>();

    const { data: department } = useDepartments();
    const { data: levelData } = useLevelsByDeptId(departmentId);
    const { data: activities } = useActivities();
    const { data: componetes } = useProgramComponet();
    const { mutate: addProgram, isPending } = useAddPrograme();

    const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
    const { data: topics } = useProgrameTopics(selectedComponentId);



    const { fields, append, remove } = useFieldArray({
        control,
        name: "rows", // must match defaultValues
    });

    const currentYear = new Date().getFullYear();
    const endYear = 2030;
    const financialYear: string[] = [];
    for (let year = currentYear; year <= endYear; year++) {
        financialYear.push(`${year}-${(year + 1).toString().slice(-2)}`);
    }

    const handleActivitiesChange = (e: any) => {
        const selectedId = Number(e.target.value);
        setActivityId(selectedId);
    };

    // auto get total male participant 
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
            const beneficiaries = Math.max(totalParticipants - gov, 0);
            setValue("beneficiary", beneficiaries);
        }
    }, [totalParticipants, participantsFemale, governmentStakeholder, setValue]);






    const createTrainingSubmit = (data: formValue) => {
        console.log("data", data)
        const payload = {
            financialYear: data.financialYear,
            levelId: Number(data.level),
            deptAgencyId: Number(data.DeptAgency),
            activityTypeId: Number(data.ActivityCatgaory),
            rows: data.rows.map((row) => ({
                componentId: Number(row.Component), // ✅ Component → subActivityId
                topicId: Number(row.topics),           // ✅ topics → topicId
            })),
            resourcePerson: data.resourcePerson,
            targetGroup: data.targetGroup,

            coordinatorName: data.coordinatorName,
            coordinatorContact: data.contact,
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

            remarks: data.remarks
        };

        console.log("payload", payload);
        console.log("Selected Level 👉", data.level);

        addProgram(payload, {
            onSuccess: () => {
                toast.success("Record saved successfully!");
                setShowForm(false)
            },
            onError: () => {
                toast.error("Failed to save record");
            },
        })
    };


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
            <form onSubmit={handleSubmit(createTrainingSubmit)}>

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
                                onClick={() => setShowForm(false)}
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
                            {errors.financialYear && <p className="text-red-500 text-sm">{errors.financialYear.message}</p>}
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
                            {errors.DeptAgency && <p className="text-red-500 text-sm">{errors.DeptAgency.message}</p>}
                        </div>

                        {/* Activity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Event Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`w-full border ${errors.ActivityCatgaory ? "border-red-500" : "border-slate-300"} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500`}
                                {...register("ActivityCatgaory", { required: "Please select activity" })}
                                onChange={handleActivitiesChange}
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
                            {errors.level && <p className="text-red-500 text-sm">{errors.level.message}</p>}
                        </div>
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
                                        className={`w-full border ${errors?.rows?.[index]?.Component
                                            ? "border-red-500"
                                            : "border-slate-300"
                                            } rounded-lg px-4 py-2.5`}
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
                                        className={`w-full border ${errors?.rows?.[index]?.topics
                                            ? "border-red-500"
                                            : "border-slate-300"
                                            } rounded-lg px-4 py-2.5`}
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
                            <h2 className="text-xl font-semibold text-slate-800">Course Coordinator/Organiser detail</h2>
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
                            {errors.coordinatorName && (
                                <p className="text-red-500 text-xs">{errors.coordinatorName.message}</p>
                            )}
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
                            {errors.coordinatorDesignation && (
                                <p className="text-red-500 text-xs">{errors.coordinatorDesignation.message}</p>
                            )}
                        </div>

                        {/* Contact */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Contact No.
                            </label>

                            <input
                                type="text"
                                maxLength={10}
                                inputMode="numeric"
                                {...register("contact", {
                                    required: "Enter Contact Number",
                                    pattern: {
                                        value: /^[6-9]\d{9}$/,
                                        message: "Enter valid 10 digit mobile number",
                                    },
                                })}
                                className="w-full p-2 border rounded-md"
                                placeholder="10 digit mobile number"
                            />

                            {errors.contact && (
                                <p className="text-red-500 text-xs">
                                    {errors.contact.message as string}
                                </p>
                            )}
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
                            {errors.coordinatorEmail && (
                                <p className="text-red-500 text-xs">{errors.coordinatorEmail.message}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
                    <div className="flex items-center justify-between w-full gap-2 mb-3 pb-2 border-b border-slate-200">
                        <div className='flex items-center gap-3 '>
                            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
                            <FileText className="w-5 h-5 text-blue-900" />
                            <h2 className="text-xl font-semibold text-slate-800"> Training Schedule </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Session</label>
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


                        {/*      <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Duration</label>
                            <input
                                type="text"
                                {...register("Duration", { required: "Enter venue" })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="Duration details"
                            />
                            {errors.venue && (
                                <p className="text-red-500 text-sm">{errors.venue.message as string}</p>
                            )}
                        </div> */}

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
                                {/* {subActivities?.data?.map((sub: any) => (
                                    <option key={sub.subActivityId} value={sub.subActivityId}>{sub.subActivityName}</option>
                                ))} */}
                                <option value="online/Virtual">Online/Virtual</option>
                                <option value="offline/physical">Offline/Physical</option>
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
                                type="file"
                                {...register("participantsFile", { required: "Enter participantsFile" })}
                                className="w-full mt-1 p-2 border rounded-md"
                                placeholder="participantsFile details"
                            />
                            {errors.participantsFile && (
                                <p className="text-red-500 text-sm">{errors.participantsFile.message as string}</p>
                            )}
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
                        disabled={isPending}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50"
                    >
                        Submit
                    </button>
                </div>

            </form>
        </div>
    );
};

