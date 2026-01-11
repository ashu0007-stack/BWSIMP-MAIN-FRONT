import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { Users } from "lucide-react";

interface OfficialParticipantFormProps {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export type OfficialParticipantFormValues = {
  participantName: string;
  position: string;
  contact: string;
  gender: "M" | "F";
  remarks?: string;
};

export const OfficialParticipantForm: FC<OfficialParticipantFormProps> = ({
  setShowForm,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfficialParticipantFormValues>();

  const onSubmit = (data: OfficialParticipantFormValues) => {
    console.log("Official Participant Data:", data);
    alert("Official participant saved successfully!");
    reset();
    setShowForm(false);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-8 py-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8" />
          Target Groups (Officials)
        </h1>
        <p className="text-blue-100 mt-2">
          Fill all required fields marked with <span className="text-red-300">*</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ===== FORM GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Participant Name */}
          <div>
            <label className="text-sm font-medium">
              Participant’s Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("participantName", {
                required: "Participant name is required",
              })}
              className={`w-full mt-1 p-2 border rounded ${
                errors.participantName ? "border-red-500" : ""
              }`}
            />
            {errors.participantName && (
              <p className="text-red-500 text-sm">
                {errors.participantName.message}
              </p>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="text-sm font-medium">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              {...register("position", {
                required: "Position is required",
              })}
              placeholder="State / District / Block"
              className={`w-full mt-1 p-2 border rounded ${
                errors.position ? "border-red-500" : ""
              }`}
            />
            {errors.position && (
              <p className="text-red-500 text-sm">
                {errors.position.message}
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="text-sm font-medium">
              Contact <span className="text-red-500">*</span>
            </label>
            <input
              {...register("contact", {
                required: "Contact is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter valid 10 digit number",
                },
              })}
              className={`w-full mt-1 p-2 border rounded ${
                errors.contact ? "border-red-500" : ""
              }`}
            />
            {errors.contact && (
              <p className="text-red-500 text-sm">
                {errors.contact.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-medium">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              {...register("gender", { required: "Gender is required" })}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        {/* ===== REMARKS ===== */}
        <div>
          <label className="text-sm font-medium">Remarks</label>
          <textarea
            {...register("remarks")}
            rows={3}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        {/* ===== BUTTONS ===== */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-5 py-2 bg-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
          >
            Save Official
          </button>
        </div>
      </form>
    </div>
  );
};