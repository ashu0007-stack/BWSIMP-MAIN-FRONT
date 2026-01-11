import React, { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { Sprout, MapPin } from "lucide-react";
import { useAddFfsDetails } from "@/hooks/doaHooks/useFfsDetails";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { useVillages } from "@/hooks/location/useVillages";
import { toast } from "react-hot-toast";

export type FormValues = {
  ffsTitle: string;
  cropTheme: string;
  nameOfFacilitator: string;
  facilitatorContact: string;
  seasonYear: string;
  startDate: string;
  endDate: string;
  sessionsPlanned: number;
  sessionsConducted: number;
  farmersEnrolled: number;
  district_id: number;
  block_id: number;
  cluster_code: number;
  village_id: number;
};

export const FFSForm: FC<any> = ({ setShowForm }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<number>();
  const [selectedBlock, setSelectedBlock] = useState<number>();
  const [selectedCluster, setSelectedCluster] = useState<number>();

  const { mutate: addFfsDetails, isPending } = useAddFfsDetails();
  const { data: districtData, isPending: loadingDistricts } = useDistricts();
  const { data: blockData, isLoading: loadingBlocks } =
    useBlocks(selectedDistrict);
  const { data: clusterData, isPending: loadingClusters } =
    useClusters(selectedBlock);
  const { data: villageData, isPending: loadingVillages } =
    useVillages(selectedCluster);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const handleSubmitFfs = (data: FormValues) => {
    addFfsDetails(data, {
      onSuccess: (response) => {
        toast.success("Record saved successfully!");
        setShowForm(false);
        console.log("response", response)
        reset();
      },
      onError: () => toast.error("Failed to save record"),
    });
  };

  const renderInput = (
    name: keyof FormValues,
    label: string,
    placeholder?: string,
    type: string = "text",
    required = true
  ) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name, required ? { required: `${label} is required` } : {})}
        className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-600"
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {(errors[name] as any)?.message}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sprout className="w-8 h-8" />
          Farmer Field School (FFS) Form
        </h1>
        <p className="text-green-100 mt-2">
          Fill all the required fields marked with *
        </p>
      </div>

      <form onSubmit={handleSubmit(handleSubmitFfs)} className="space-y-10">
        
        {/* ==================== FFS INFORMATION ==================== */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <Sprout className="w-6 h-6" />
              FFS Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput("ffsTitle", "FFS Title", "Enter FFS Title")}
            {renderInput("cropTheme", "Crop Theme", "Enter Crop Theme")}
            {renderInput("nameOfFacilitator", "Facilitator Name")}
            {renderInput("facilitatorContact", "Facilitator Contact")}
            {renderInput("seasonYear", "Season & Year", "Rabi 2025")}
            {renderInput("farmersEnrolled", "Farmers Enrolled", "", "number")}
            {renderInput("startDate", "Start Date", "", "date")}
            {renderInput("endDate", "End Date", "", "date")}
            {renderInput("sessionsPlanned", "Sessions Planned", "", "number")}
            {renderInput(
              "sessionsConducted",
              "Sessions Conducted",
              "",
              "number"
            )}
          </div>
        </div>

        {/* ==================== LOCATION SECTION ==================== */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              FFS Location
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* District */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                District *
              </label>
              <select
                {...register("district_id", { required: "District is required" })}
                onChange={(e) => setSelectedDistrict(Number(e.target.value))}
                className="w-full p-2 mt-1 border rounded-md"
              >
                <option value="">Select</option>
                {loadingDistricts ? (
                  <option>Loading...</option>
                ) : (
                  districtData?.data?.map((d: any) => (
                    <option key={d.district_id} value={d.district_id}>
                      {d.district_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Block */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Block *
              </label>
              <select
                {...register("block_id", { required: "Block is required" })}
                onChange={(e) => setSelectedBlock(Number(e.target.value))}
                className="w-full p-2 mt-1 border rounded-md"
              >
                <option value="">Select</option>
                {loadingBlocks ? (
                  <option>Loading...</option>
                ) : (
                  blockData?.data?.map((b: any) => (
                    <option key={b.block_id} value={b.block_id}>
                      {b.block_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Cluster */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Cluster *
              </label>
              <select
                {...register("cluster_code", { required: "Cluster is required" })}
                onChange={(e) => setSelectedCluster(Number(e.target.value))}
                className="w-full p-2 mt-1 border rounded-md"
              >
                <option value="">Select</option>
                {loadingClusters ? (
                  <option>Loading...</option>
                ) : (
                  clusterData?.data?.map((c: any) => (
                    <option key={c.cluster_code} value={c.cluster_code}>
                      {c.cluster_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Village */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Village *
              </label>
              <select
                {...register("village_id", { required: "Village is required" })}
                className="w-full p-2 mt-1 border rounded-md"
              >
                <option value="">Select</option>
                {loadingVillages ? (
                  <option>Loading...</option>
                ) : (
                  villageData?.data?.map((v: any) => (
                    <option key={v.village_id} value={v.village_id}>
                      {v.village_name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-5 py-2 bg-gray-300 rounded-md"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            {isPending ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};
