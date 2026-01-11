import React, { FC } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Users, Plus, Trash2 } from "lucide-react";

interface OfficialParticipantFormProps {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export type OfficialParticipantFormValues = {
  participants: {
    participantName: string;
    position: string;
    contact: string;
    gender: "M" | "F" | "";
  }[];
};

export const OfficialParticipantForm: FC<OfficialParticipantFormProps> = ({
  setShowForm,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<OfficialParticipantFormValues>({
    defaultValues: {
      participants: [
        {
          participantName: "",
          position: "",
          contact: "",
          gender: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
  });

  const onSubmit = (data: OfficialParticipantFormValues) => {
    console.log("ALL OFFICIAL PARTICIPANTS:", data.participants);
    alert(`${data.participants.length} participant(s) saved successfully`);
    reset();
    setShowForm(true);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8" />
          Official Participant Entry Form
        </h1>
        <p className="text-green-100 mt-2">
          Add one or more official participants. All fields are required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* ================= PARTICIPANT LIST ================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Official Details
            </h3>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="mb-8 border border-dashed border-green-300 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-green-800">
                  Participant #{index + 1}
                </h4>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 flex items-center gap-1 text-sm"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                  <label className="text-sm font-medium text-gray-700">
                   Level
                  </label>
                  <select
                    {...register(`participants.${index}.participantName`, {
                      required: "Participant name is required",
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.participants?.[index]?.participantName
                        ? "border-red-500"
                        : ""
                      }`}
                  >
                    <option value="">Select level</option>
                    <option value="state">State</option>
                    <option value="district">District</option>
                    <option value="block">Block</option>
                  </select>
                  {errors.participants?.[index]?.participantName && (
                    <p className="text-red-500 text-sm">
                      {errors.participants[index]?.participantName?.message}
                    </p>
                  )}
                </div>
                {/* Participant Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {"Participant's Name "}
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <input
                    {...register(`participants.${index}.participantName`, {
                      required: "Participant name is required",
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.participants?.[index]?.participantName
                        ? "border-red-500"
                        : ""
                      }`}
                  />
                  {errors.participants?.[index]?.participantName && (
                    <p className="text-red-500 text-sm">
                      {errors.participants[index]?.participantName?.message}
                    </p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Designation 
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <input
                    {...register(`participants.${index}.position`, {
                      required: "Position is required",
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.participants?.[index]?.position
                        ? "border-red-500"
                        : ""
                      }`}
                  />
                  {errors.participants?.[index]?.position && (
                    <p className="text-red-500 text-sm">
                      {errors.participants[index]?.position?.message}
                    </p>
                  )}
                </div>

                {/* Contact */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Contact 
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <input
                    {...register(`participants.${index}.contact`, {
                      required: "Contact is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter valid 10 digit number",
                      },
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.participants?.[index]?.contact
                        ? "border-red-500"
                        : ""
                      }`}
                  />
                  {errors.participants?.[index]?.contact && (
                    <p className="text-red-500 text-sm">
                      {errors.participants[index]?.contact?.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Gender 
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <select
                    {...register(`participants.${index}.gender`, {
                      required: "Gender is required",
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.participants?.[index]?.gender
                        ? "border-red-500"
                        : ""
                      }`}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                  {errors.participants?.[index]?.gender && (
                    <p className="text-red-500 text-sm">
                      {errors.participants[index]?.gender?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* ADD PARTICIPANT BUTTON */}
          <button
            type="button"
            onClick={() =>
              append({
                participantName: "",
                position: "",
                contact: "",
                gender: "",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-md"
          >
            <Plus size={18} />
            Add Another Participant
          </button>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-5 py-2 bg-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            {fields.length > 1 ? (
              <span>Submit All Participants</span>
            ) : (
              <span>Submit Participant</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
