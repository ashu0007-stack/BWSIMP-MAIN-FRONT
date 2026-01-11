import React, { FC } from "react";
import { useForm } from "react-hook-form";

export type FormValues = {
  StudyPlotID: number;
  HostFarmerName: string;
  HostFarmerContact: string;
  StudyPlotSize: string;
  CropPracticeDemonstrated: string;
  InputsDetails: string;
  ControlPlot: boolean;
  ObservationsRecorded: string;

};

interface StudyFormProps {
  setStudyFormRecords: React.Dispatch<React.SetStateAction<FormValues[]>>;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StudyForm: FC<StudyFormProps> = ({
  setStudyFormRecords,
  setShowForm,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const handelFarmerDetailsSubmit = (data: FormValues) => {
    setStudyFormRecords((prev) => [...prev, data]);
    setShowForm(false);
    reset();
    console.log(errors)
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Study Plot ID
      </h2>

      <form
        onSubmit={handleSubmit(handelFarmerDetailsSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left Column */}
        <div>
          <label className="block font-medium mb-1">
            Study Plot ID
          </label>
          <input
            {...register("StudyPlotID", { required: true })}
            className="w-full border p-2 rounded"
            placeholder="Enter  Study Plot ID"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Host Farmer’s Name</label>
          <input
            {...register("HostFarmerName", { required: true })}
            className="w-full border p-2 rounded"
            placeholder="Enter HostFarmerName"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Host Farmer’s  Contact
          </label>
          <input
            {...register("HostFarmerContact")}
            className="w-full border p-2 rounded"
            placeholder="Host Farmer’s  Contact"
          />
        </div>

       

        <div>
          <label className="block font-medium mb-1">Inputs Details</label>
          <input
            {...register("InputsDetails")}
            className="w-full border p-2 rounded"
            placeholder=" Enter Inputs Details"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Control Plot (Y/N)</label>
          <input
            type="tel"
            {...register("ControlPlot")}
            className="w-full border p-2 rounded"
            placeholder="Enter Control Plot (Y/N)"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Observations Recorded</label>
          <input
            {...register("ObservationsRecorded")}
            className="w-full border p-2 rounded"
            placeholder="Enter Observations Recorded"
          />
        </div>
        {/* Buttons - full width row */}
        <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-6">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
        submit
            
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
