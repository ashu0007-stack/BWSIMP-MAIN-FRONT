import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { Users } from "lucide-react";

interface FarmerParticipantFormProps {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;

}


export type FarmerParticipantFormValues = {
  participantName: string;
  dbtRegNo?: string;
  fatherName: string;
  contact: string;
  gender: "M" | "F";
  category: "Gen" | "OBC" | "SC" | "ST";
  remarks?: string;
};

export const FarmerParticipantForm: FC<FarmerParticipantFormProps> = ({
  setShowForm,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FarmerParticipantFormValues>();

  const onSubmit = (data: FarmerParticipantFormValues) => {
    console.log("Participant Farmer Data:", data);
    alert("Participant details saved successfully!");
    reset();
    setShowForm(false);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8" />
          Target Groups (WUA / Farmers)
        </h1>
        <p className="text-green-100 mt-2">
          Fill all required fields marked with <span className="text-red-300">*</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Participant Name */}
          <div>
            <label className="text-sm font-medium">
              Participant’s Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("participantName", { required: "Name is required" })}
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

          {/* DBT Reg No */}
          <div>
            <label className="text-sm font-medium">DBT Reg. No</label>
            <input
              {...register("dbtRegNo")}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          {/* Father Name */}
          <div>
            <label className="text-sm font-medium">
              Father’s Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("fatherName", { required: "Father name is required" })}
              className={`w-full mt-1 p-2 border rounded ${
                errors.fatherName ? "border-red-500" : ""
              }`}
            />
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

          {/* Category */}
          <div>
            <label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register("category", { required: "Category is required" })}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="">Select</option>
              <option value="Gen">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
        </div>

        {/* REMARKS */}
        <div>
          <label className="text-sm font-medium">Remarks</label>
          <textarea
            {...register("remarks")}
            rows={3}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        {/* BUTTONS */}
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
            className="px-5 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            Save Participant
          </button>
        </div>
      </form>
    </div>
  );
};
