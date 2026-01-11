import React, { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BookOpen, MapPin, Users, User } from "lucide-react";
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
  blockId:number;
  clusterId:number;
  gpsLatitude?: string;
  gpsLongitude?: string;
  gpsLocation?: string;
  trainerName: string;
  trainerDesignation: string;
  resourceAffiliation?: string;
  trainerContact?: string;
  targetGroup: string;
  noOfFarmer: number;
  contactInfo?: string;
  dbtRegNo?: string;
  category?: string;
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

  const { data: districtData, } = useDistricts();
  const { data: blockData } = useBlocks(districtId);
  const { data: clusterData } = useClusters(blockId);
  const { data: villageData } = useVillages(clusterId);


  // Auto-calculate Duration (CORE LOGIC)
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

    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    let durationText = "";

    if (weeks > 0) {
      durationText += `${weeks} Week${weeks > 1 ? "s" : ""}`;
    }

    if (days > 0) {
      durationText += `${weeks > 0 ? " " : ""}${days} Day${days > 1 ? "s" : ""}`;
    }

    setValue("duration", durationText);
  }, [startDate, endDate, setValue]);

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
    pattern,
    patternMessage,
  }: {
    name: keyof TrainingFormValues;
    label: string;
    type?: string;
    required?: boolean;
    readOnly?: boolean;
    pattern?: RegExp;
    patternMessage?: string;
  }) => {
    const rules = {
      ...(required && { required: `${label} is required` }),
      ...(pattern && {
        pattern: {
          value: pattern,
          message: patternMessage || `${label} format is invalid`,
        },
      }),
    };

    return (
      <div>
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <input
          type={type}
          readOnly={readOnly}
          {...register(name, rules)}
          className={`w-full mt-1 p-2 border rounded-md ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""
            } ${errors[name] ? "border-red-500" : ""}`}
        />

        {errors[name] && (
          <p className="text-red-500 text-sm mt-1">
            {(errors[name]?.message as string)}
          </p>
        )}
      </div>
    );
  };


  /* ================= REUSABLE SELECT ================= */

  const SelectInput = ({
    name,
    label,
    options,
    required = true,
  }: {
    name: keyof TrainingFormValues;
    label: string;
    options: { value: string; label: string }[];
    required?: boolean;
  }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...register(name, required ? { required: `${label} is required` } : {})}
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
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {(errors[name] as any)?.message}
        </p>
      )}
    </div>
  );

  /* ================= UI ================= */

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          Training Program Form
        </h1>
        <p className="text-green-100 mt-2">
          Fill all required fields marked with <span className="text-red-300">*</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* ===== TRAINING INFO ===== */}
        <Section title="Training Information" icon={<BookOpen className="w-6 h-6" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextInput name="trainingId" label="Training ID / Batch" />
            <SelectInput
              name="typeOfTraining"
              label="Type of Training"
              options={[
                { value: "Project Management", label: "Project Management" },
                { value: "Climate Change", label: "Climate Change" },
                { value: "Agri. Technology", label: "Agri. Technology" },
                { value: "Community based", label: "Community based" },
                { value: "Crop Management", label: "Crop Management" },
                { value: "Soil Health Mgtn.", label: "Soil Health Mgtn." },
                { value: "Mechanisation", label: "Mechanisation" },
                { value: "Others (name)", label: "Others (name)" },
              ]}
            />
            <TextInput name="topicOfTraining" label="Topic of Training" />
            <TextInput name="startDate" label="Start Date" type="date" />
            <TextInput name="endDate" label="End Date" type="date" />
            <TextInput name="duration" label="Duration (Days/Weeks)" readOnly />
          </div>
        </Section>

        {/* ===== VENUE ===== */}
        <Section title="Venue & Location" icon={<MapPin className="w-6 h-6" />}>
          <div className="mb-6">
            <LocationFormSelect
            levels={['district', 'block', 'cluster', 'village']}
            data={{
              district: districtData?.data.map((d:any) => ({ id: d.district_id, name: d.district_name })) || [],
              block: blockData?.data.map((b:any) => ({ id: b.block_id, name: b.block_name, parentId: b.district_id })) || [],
              cluster: clusterData?.data.map((c:any) => ({ id: c.cluster_code, name: c.cluster_name, parentId: c.block_id })) || [],
              village: villageData?.data.map((v:any) => ({ id: v.village_id, name: v.village_name, parentId: v.cluster_code })) || [],
            }}
            register={register}
            watch={watch}
            setValue={setValue}
          />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <TextInput name="gpsLatitude" label="GPS Latitude" required={false} />
            <TextInput name="gpsLongitude" label="GPS Longitude" required={false} />
          </div>
        </Section>

        {/* ===== TRAINER ===== */}
        <Section title="Trainer Information" icon={<User className="w-6 h-6" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextInput name="trainerName" label="Trainer Name" />
            <TextInput name="trainerDesignation" label="Designation / Affiliation" />
            <TextInput name="trainerContact" label="Contact Number" required={false} />
            <TextInput
              name="resourceAffiliation"
              label="Resource Affiliation"
              required={false}
            />
          </div>
        </Section>

        {/* ===== PARTICIPANTS ===== */}
        {/* <Section title="Participants Information" icon={<Users className="w-6 h-6" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectInput
              name="targetGroup"
              label="Target Group"
              options={[
                { value: "Officials", label: "Officials" },
                { value: "Farmers", label: "Farmers" },
              ]}
            />
            <TextInput name="noOfFarmer" label="No. of Participants" type="number" />
            <TextInput name="dbtRegNo" label="DBT Reg. No." required={false} />
            <TextInput name="category" label="Category" required={false} />
          </div>
        </Section> */}

        {/* ===== REMARKS ===== */}
        <Section title="Remarks">
          <textarea
            {...register("remarks")}
            rows={3}
            className="w-full p-2 border rounded-md"
          />
        </Section>

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
            className="px-5 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= SECTION WRAPPER ================= */

const Section: FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1.5 h-8 bg-green-700 rounded-full" />
      <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
        {icon}
        {title}
      </h3>
    </div>
    {children}
  </div>
);
