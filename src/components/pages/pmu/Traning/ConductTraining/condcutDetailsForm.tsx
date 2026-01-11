import { toIndianDate } from '@/components/utils/date';
import { useAddConduct } from '@/hooks/programesTraining/useCondcut';
import React, { FC, useEffect, useState } from 'react'


import toast from 'react-hot-toast'; import {
  Calendar,
  MapPin,
  Table,
  Layers,
  BookOpen,
  Activity,
  Users,
  User,
  MessageSquare,
  Clock,
  Building,
  Target,
  GraduationCap,
  BadgeCheck
} from "lucide-react";
import { useForm } from 'react-hook-form';


type Coordinator = {
  name: string;
  email: string;
  contact: string;
  designation: string;
};

type ConductFormValues = {
  conductedBy: string;
  designation: string;
  email: string;
  contact?: string;
  conductDate: string;

  totalParticipants?: number;
  participantsFile?: File;
  participantsFemale?: number;
  participantsMale?: number;
  governmentStakeholder?: number;
  beneficiary?: number;

  trainingPhoto?: File;
  fieldVisit: "YES" | "NO";
  fieldVisitFile?: File;
  remarks?: string;

};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const mobileRegex = /^[6-9]\d{9}$/;

export const CondcutForm: FC<any> = ({ programData, selectProgrameId, onCloseForm }) => {

  const selectPrograme = programData?.data?.find(
    (pro: any) => pro.programId === selectProgrameId
  );

  const [assignedCoordinator, setAssignedCoordinator] = useState<Coordinator | null>(null);
  const [coordinatorChanged, setCoordinatorChanged] = useState(false);
  const { mutate: addConduct, isPending } = useAddConduct();





  const {
    register,
    setValue,
    handleSubmit,
     watch,
    formState: { errors },
  } = useForm<ConductFormValues>({
    mode: "onBlur",
  });

  

  /* ====== API RESPONSE SET ====== */
  useEffect(() => {
    if (programData?.coordinator) {
      setAssignedCoordinator(programData.coordinator);
    }
  }, [programData]);


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
    }, [totalParticipants, participantsFemale, governmentStakeholder,  setValue]);



  /* ====== AUTO FILL FROM API ====== */
  useEffect(() => {
    if (!coordinatorChanged && assignedCoordinator) {
      setValue("conductedBy", assignedCoordinator.name);
      setValue("designation", assignedCoordinator.designation);
      setValue("contact", assignedCoordinator.contact);
      setValue("email", assignedCoordinator.email);
    }
  }, [assignedCoordinator, coordinatorChanged, setValue]);

  /* ====== SUBMIT ====== */
  const onSubmit = (data: ConductFormValues) => {
    const payload = {
      ...data,
      programId: programData?.data?.[0]?.programId,
    };
    addConduct(payload, {
      
      onSuccess: () => {
        toast.success("Record saved successfully!");
        onCloseForm()
      },
      onError: () => {
        toast.error("Failed to save record");
      },
    })



  };
 // const [remarks, setRemarks] = useState("")

  const [fieldVisit, setFieldVisit] = useState("NO");

  useEffect(() => {
    if (programData?.coordinator) {
      setAssignedCoordinator(programData.coordinator);
    }
  }, [programData]);

if (!programData) return null

  console.log("selectPrograme", selectPrograme?.coordinator?.designation)



  return (
    <div className=" p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200 max-h-[90vh]  overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-900 rounded-lg px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">Programme Condcut</h2>
      </div>


      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
        {/* Section Header */}
        <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
          <div className='flex items-center gap-3 '>
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <Table className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-semibold text-blue-900">Program Details</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* General Info */}
          <div className="space-y-3 p-4 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                  Financial Year
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectPrograme.financialYear}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <Building className="w-4 h-4 text-blue-500" />
                  Department
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectPrograme.departmentName}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <Layers className="w-4 h-4 text-blue-500" />
                  Level
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectPrograme.levelName}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <Activity className="w-4 h-4 text-blue-500" />
                 Event Catgaory
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectPrograme.activityName}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                <Layers className="w-4 h-4 text-blue-500" />
                Component
              </p>
              <p className="text-gray-800 font-semibold">
                {selectPrograme.componentName}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Topic
              </p>
              <p className="text-gray-800 font-semibold">
                {selectPrograme.topicName}
              </p>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="space-y-3 p-4 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Planned Date
                </p>
                <p className="text-gray-800 font-semibold">
                  {toIndianDate(selectPrograme?.schedule?.date)}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Venue
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectPrograme?.schedule?.venue}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Session
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectPrograme?.schedule?.session}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Duration
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectPrograme?.schedule?.duration}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  Training Mode
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectPrograme?.schedule?.trainingMode}
                </p>
              </div>
            </div>
          </div>

          {/* Coordinator & Participants */}
          <div className="space-y-3 p-4 bg-white rounded-lg shadow-sm">
            <div>
              <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-500" />
                Target Group
              </p>
              <p className="text-gray-800 font-semibold">
                {selectPrograme.targetGroup}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                <User className="w-4 h-4 text-blue-500" />
                Resource Person
              </p>
              <p className="text-gray-800 font-semibold">
                {selectPrograme.resourcePerson}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Remarks
              </p>
              <p className="text-gray-800 font-semibold break-words">
                {selectPrograme.remarks || "N/A"}
              </p>
            </div>
          </div>
        </div>


      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Conduct Program Details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
              <Table className="w-5 h-5 text-blue-900" />
              <h2 className="text-xl font-semibold text-blue-900">
               Course Coordinator/Organiser detail
              </h2>
            </div>
          </div>
{/* 
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("conductedBy", {
                  required: "Conducted By is required",
                })}
                onChange={() => setCoordinatorChanged(true)}   
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                defaultValue={selectPrograme?.coordinator?.name}
              />
              {errors.conductedBy && (
                <p className="text-red-500 text-sm">{errors.conductedBy.message}</p>
              )}
            </div>
            

          
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("designation", {
                  required: "Designation is required",
                })}
                className="w-full p-2 border rounded-md"
                defaultValue={selectPrograme?.coordinator?.designation}
              />
              {errors.designation && (
                <p className="text-red-500 text-sm">{errors.designation.message}</p>
              )}
            </div>


 
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Contact No. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("contact", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter valid 10 digit mobile number",
                  },
                })}
                className="w-full p-2 border rounded-md"
                defaultValue={selectPrograme?.coordinator?.contact}
              />
              {errors.contact && (
                <p className="text-red-500 text-sm">{errors.contact.message}</p>
              )}
            </div>

    
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter valid email address",
                  },
                })}
                className="w-full p-2 border rounded-md"
                defaultValue={selectPrograme?.coordinator?.email}
               
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conduct Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("conductDate", {
                  required: "Conduct date is required",
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {errors.conductDate && (
                <p className="text-red-500 text-sm">{errors.conductDate.message}</p>
              )}
            </div>
          </div> */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Conducted By */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("conductedBy", {
                  required: "Conducted By is required",
                })}
                onChange={() => setCoordinatorChanged(true)}   
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                defaultValue={selectPrograme?.coordinator?.name}
              />
              {errors.conductedBy && (
                <p className="text-red-500 text-sm">{errors.conductedBy.message}</p>
              )}
            </div>
            

            {/* Designation */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("designation", {
                  required: "Designation is required",
                })}
                className="w-full p-2 border rounded-md"
                defaultValue={selectPrograme?.coordinator?.designation}
                readOnly
              />
              {errors.designation && (
                <p className="text-red-500 text-sm">{errors.designation.message}</p>
                
              )}
            </div>


            {/* Contact */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Contact No. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("contact", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter valid 10 digit mobile number",
                  },
                })}
                className="w-full p-2 border rounded-md"
                defaultValue={selectPrograme?.coordinator?.contact}
                readOnly
              />
              
              {errors.contact && (
                <p className="text-red-500 text-sm">{errors.contact.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter valid email address",
                  },
                })}
                className="w-full p-2 border rounded-md"
                defaultValue={selectPrograme?.coordinator?.email}
               readOnly
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Conduct Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conduct Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("conductDate", {
                  required: "Conduct date is required",
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {errors.conductDate && (
                <p className="text-red-500 text-sm">{errors.conductDate.message}</p>
              )}
            </div>
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
                            <label className="text-sm font-medium text-gray-700"> Participants List</label>
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
        <div className='mt-6'>
          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Traning Photo Upload
            </label>
            <input
              type="file"
              // onChange={(e) => setParticipantFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          {/* FIELD VISIT REPORT SECTION */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Was Field Visit Conducted?
            </label>

            <div className="flex gap-6 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="YES"
                  checked={fieldVisit === "YES"}
                  onChange={(e) => setFieldVisit(e.target.value)}
                />
                Yes
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="NO"
                  checked={fieldVisit === "NO"}
                  onChange={(e) => setFieldVisit(e.target.value)}
                />
                No
              </label>
            </div>

            {/* SHOW FILE UPLOAD ONLY IF YES */}
            {fieldVisit === "YES" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Field Visit Report
                </label>
                <input
                  type="file"
                  // onChange={(e) => setFieldVisitFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            )}
          </div>
          <div className="md:col-span-3">
          {/*   <label className="block text-sm font-medium text-gray-700 mb-1">FeedBack</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
            /> */}
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => onCloseForm()}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Save Conduct Info
          </button>
        </div>
      </form>

    </div>
  )
}