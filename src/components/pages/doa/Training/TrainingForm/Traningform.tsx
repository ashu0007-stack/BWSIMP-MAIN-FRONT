import React, { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  BookOpen,
  MapPin,
  Users,
  User,
  MessageSquare,
} from "lucide-react";

import { LocationFormSelect } from "@/components/shared/Location/locationSelction";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { useVillages } from "@/hooks/location/useVillages";

/* ================= TYPES ================= */

export type TrainingFormValues = {
  trainingId: string;
  typeOfTraining: string;
  topicOfTraining: string;

  startDate: string;
  endDate: string;
  duration: string;

  districtId: number;
  blockId: number;
  clusterId: number;
  villageId: number;

  gpsLatitude?: string;
  gpsLongitude?: string;

  trainerName: string;
  trainerDesignation: string;
  affiliation?: string;
  trainerContact?: string;

  targetGroup: "Farmers" | "Officials" | "WUA Farmers";

  remarks?: string;
};

interface TrainingFormProps {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

/* ================= COMPONENT ================= */

export const TrainingForm: FC<TrainingFormProps> = ({ setShowForm }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TrainingFormValues>();

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const districtId = watch("districtId");
  const blockId = watch("blockId");
  const clusterId = watch("clusterId");

  const { data: districtData } = useDistricts();
  const { data: blockData } = useBlocks(districtId);
  const { data: clusterData } = useClusters(blockId);
  const { data: villageData } = useVillages(clusterId);

  /* ===== AUTO CALCULATE DURATION ===== */
  useEffect(() => {
    if (!startDate || !endDate) {
      setValue("duration", "");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setValue("duration", "");
      return;
    }

    const diffDays =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    let duration = "";
    if (weeks) duration += `${weeks} Week${weeks > 1 ? "s" : ""}`;
    if (days) duration += `${weeks ? " " : ""}${days} Day${days > 1 ? "s" : ""}`;

    setValue("duration", duration);
  }, [startDate, endDate, setValue]);

  /* ===== SUBMIT ===== */
  const onSubmit = (data: TrainingFormValues) => {
    console.log("Training Data:", data);
    alert("Training record saved successfully!");
    reset();
    setShowForm(false);
  };

  /* ================= REUSABLE INPUT ================= */

  const TextInput = ({
    name,
    label,
    type = "text",
    required = true,
    readOnly = false,
  }: {
    name: keyof TrainingFormValues;
    label: string;
    type?: string;
    required?: boolean;
    readOnly?: boolean;
  }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        readOnly={readOnly}
        {...register(name, required ? { required: `${label} is required` } : {})}
        className={`w-full mt-1 p-2 border rounded-md ${readOnly ? "bg-gray-100" : ""
          } ${errors[name] ? "border-red-500" : ""}`}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {(errors[name]?.message as string)}
        </p>
      )}
    </div>
  );

  const SelectInput = ({
    name,
    label,
    options,
  }: {
    name: keyof TrainingFormValues;
    label: string;
    options: { value: string; label: string }[];
  }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        {...register(name, { required: `${label} is required` })}
        className={`w-full mt-1 p-2 border rounded-md ${errors[name] ? "border-red-500" : ""
          }`}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  /* ================= UI ================= */

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border">
      <div className="bg-green-700 px-6 py-4 rounded-xl mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen /> Training Program Form
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* TRAINING INFO */}
        <Section title="Training Information" icon={<BookOpen />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TextInput name="trainingId" label="Training ID / Batch" />
            <SelectInput
              name="typeOfTraining"
              label="Type of Training"
              options={[
                { value: "Project Management", label: "Project Management" },
                { value: "Climate Change", label: "Climate Change" },
                { value: "Agri Technology", label: "Agri Technology" },
                { value: "Crop Management", label: "Crop Management" },
              ]}
            />
            <TextInput name="topicOfTraining" label="Topic of Training" />
            <TextInput name="startDate" label="Start Date" type="date" />
            <TextInput name="endDate" label="End Date" type="date" />
            <TextInput name="duration" label="Duration" readOnly />
          </div>
        </Section>

        {/* LOCATION */}
        <Section title="Venue & Location" icon={<MapPin />}>
          <LocationFormSelect
            levels={["district", "block", "cluster", "village"]}
            data={{
              district:
                districtData?.data.map((d: any) => ({
                  id: d.district_id,
                  name: d.district_name,
                })) || [],
              block:
                blockData?.data.map((b: any) => ({
                  id: b.block_id,
                  name: b.block_name,
                  parentId: b.district_id,
                })) || [],
              cluster:
                clusterData?.data.map((c: any) => ({
                  id: c.cluster_code,
                  name: c.cluster_name,
                  parentId: c.block_id,
                })) || [],
              village:
                villageData?.data.map((v: any) => ({
                  id: v.village_id,
                  name: v.village_name,
                  parentId: v.cluster_code,
                })) || [],
            }}
            register={register}
            watch={watch}
            setValue={setValue}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <TextInput
              name="gpsLatitude"
              label="GPS Latitude"
              required={false}
            />
            <TextInput
              name="gpsLongitude"
              label="GPS Longitude"
              required={false}
            />
          </div>
        </Section>

        {/* TRAINER */}
        <Section title="Trainer Information" icon={<User />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <TextInput name="trainerName" label="Trainer Name" />
            <TextInput name="trainerDesignation" label="Designation" />
            <TextInput name="affiliation" label="Affiliation / Department" />
            <TextInput
              name="trainerContact"
              label="Contact Number"
              required={false}
            />
          </div>
        </Section>

        {/* TARGET GROUP */}
        <Section title="Target Group" icon={<Users />}>
          <div className="w-100">
            <SelectInput
            name="targetGroup"
            label="Training Target Group"
            options={[
              { value: "Farmers", label: "Farmers" },
              { value: "Officials", label: "Officials" },
              { value: "WUA Farmers", label: "WUA Farmers" },
            ]}
          />
          </div>
        </Section>

        {/* REMARKS */}
        <Section title="Remarks" icon={<MessageSquare />}>
          <textarea
            {...register("remarks")}
            rows={3}
            className="w-full p-2 border rounded-md"
          />
        </Section>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 text-white rounded"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= SECTION ================= */

const Section: FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="border rounded-xl p-6 bg-white shadow-sm">
    <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2 mb-4">
      {icon} {title}
    </h3>
    {children}
  </div>
);
