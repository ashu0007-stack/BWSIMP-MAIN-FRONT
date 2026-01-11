import React, { FC } from "react";
import { useForm } from "react-hook-form";

export type TrainingFormValues = {
  trainingId: string;
  topicOfTraining: string;
  startDate: string;
  endDate: string;
  duration: string;
  venueLocation: string;
  gpsLocation: string;
  trainerName: string;
  trainerDesignation: string;
  resourceAffiliation: string;
  trainerContact: string;
  targetGroup: string;
  noOfFarmer: number;
  contactInfo: string;
  dbtRegNo: string;
  category: string;
  remarks: string;
};

interface TrainingFormProps {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TrainingForm: FC<TrainingFormProps> = ({ setShowForm }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrainingFormValues>();

  const handleTrainingSubmit = (data: TrainingFormValues) => {
    console.log("Training form data:", data);
    alert("Training record saved!");
    reset();
    setShowForm(false);
  };

  // ✅ Helper to render inputs consistently
  const renderInput = (
    name: keyof TrainingFormValues,
    label: string,
    placeholder?: string,
    type: string = "text",
    required = true
  ) => (
    <div className="flex flex-col">
      <label className="font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        {...register(name, required ? { required: `${label} is required` } : {})}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all ${
          errors[name] ? "border-red-500" : ""
        }`}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{(errors[name] as any)?.message}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-6xl mx-auto mt-6">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
        Training Program Form
      </h2>

      <form onSubmit={handleSubmit(handleTrainingSubmit)} className="space-y-8">
        {/* === Training Information === */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
            Training Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput("trainingId", "Training ID / Batch", "Enter Training ID / Batch")}
            {renderInput("topicOfTraining", "Topic of Training", "Enter Topic")}
            {renderInput("duration", "Duration", "e.g. 2 Days / 1 Week")}
            {renderInput("startDate", "Start Date", "", "date")}
            {renderInput("endDate", "End Date", "", "date")}
          </div>
        </div>

        {/* === Location Details === */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
            Venue & Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput("venueLocation", "Venue / Location", "Enter Venue")}
            {renderInput("gpsLocation", "GPS Location", "Enter GPS Coordinates", "text", false)}
          </div>
        </div>

        {/* === Trainer Details === */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
            Trainer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput("trainerName", "Trainer’s Name", "Enter Trainer’s Name")}
            {renderInput(
              "trainerDesignation",
              "Designation / Affiliation",
              "e.g. KVK / NGO / Expert"
            )}
            {renderInput("trainerContact", "Trainer Contact", "Enter Contact Number", "text", false)}
            {renderInput(
              "resourceAffiliation",
              "Resource Affiliation",
              "e.g. KVK, NGO, Project Team",
              "text",
              false
            )}
          </div>
        </div>

        {/* === Participants Details === */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
            Participants Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-1">Target Group</label>
              <select
                {...register("targetGroup", { required: "Target Group is required" })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all ${
                  errors.targetGroup ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Target Group</option>
                <option value="Officials">Officials (State/District/Block)</option>
                <option value="Farmers">Farmers</option>
              </select>
              {errors.targetGroup && (
                <p className="text-red-500 text-sm mt-1">
                  {(errors.targetGroup as any)?.message}
                </p>
              )}
            </div>

            {renderInput("noOfFarmer", "No. of Farmers", "Enter total participants", "number")}
            {renderInput("contactInfo", "Contact Information", "Enter Contact No.", "text", false)}
            {renderInput("dbtRegNo", "DBT Reg. No. (If Farmer)", "Enter DBT No.", "text", false)}
            {renderInput("category", "Category", "Gen / OBC / SC / ST / Youth", "text", false)}
          </div>
        </div>

        {/* === Remarks Section === */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Remarks</h3>
          <textarea
            {...register("remarks")}
            placeholder="Add any remarks"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
          ></textarea>
        </div>

        {/* === Buttons === */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t mt-6">
          <button
            type="submit"
            className="p-3 w-full sm:w-40 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="p-3 w-full sm:w-40 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
