import React, { FC } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  Leaf,
  Droplets,
  Bug,
  Sprout,
  SprayCan,
  FlaskConical,
  CalendarDays,
  Package,
  CheckCircle2,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { LocationFormSelect } from "@/components/shared/Location/locationSelction";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { useVillages } from "@/hooks/location/useVillages";

/* ================= TYPES ================= */

type DemonstrationFormValues = {
  farmer_reg_no: string;
  farmer_photo: string;
  farmer_name: string;
  father_or_husband_name?: string;
  gender?: string;
  contact_number?: string;
  commandArea: string;
  season?: string;
  cropVariety: string;
  seedRate: string;
  sowingDate: Date;
  cropPractice: string;
  harvestingDate: Date;
  cropYield: string;

  fertilizers: {
    name: string;   // "Urea" | "DAP" | custom name
    qty?: string;
    isOther?: boolean;
  }[];

  weedicides?: {
    name: string;
    qty: string;
  }[];

  pesticides?: {
    name: string;
    qty: string;
    bioName?: string;
    bioQty?: string;
  }[];

  irrigationSource?: string;
  memberWUA?: string;
  wuaName?: string;
  districtId?: number;
  blockId?: number;
  clusterId?: number;
  villageId?: number;
  gpsLocation?: string;
  comments?: string;
};


const fertilizerOptions = [
  "Urea",
  "DAP",
  "MoP",
  "NPK",
  "Zinc",
  "Sulphur",
  "Other",
];

/* ================= COMPONENT ================= */

export const DemonstrationForm: FC<any> = ({ setShowForm }) => {

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<DemonstrationFormValues>({
    defaultValues: {
      weedicides: [{ name: "", qty: "" }],
      pesticides: [{ name: "", qty: "", bioName: "", bioQty: "" }],
    },
  });


  const selectedDistrict = watch("districtId");
  const selectedBlock = watch("blockId");
  const selectedCluster = watch("clusterId");

  console.log("cluster Id", selectedCluster)

  const { data: districtData = [], isPending: loadingDistricts } = useDistricts();
  const { data: blockData, isLoading: loadingBlocks } = useBlocks(selectedDistrict);
  const { data: clusterData, isPending: loadingClusters } = useClusters(selectedBlock);
  const { data: villageData = [], isPending: loadingVillages } = useVillages(selectedCluster);

  console.log("bolck data", villageData)

  const locationData = {
    district: (districtData?.data ?? []).map((d: any) => ({
      id: d.district_id,
      name: d.district_name,
    })),
    block: blockData?.map((b: any) => ({
      id: b.block_id,
      name: b.block_name,
      parentId: b.districtId,
    })),
    cluster: (clusterData?.data ?? []).map((c: any) => ({
      id: c.cluster_code,
      name: c.cluster_name,
      parentId: c.block_id,
    })),
    village: (villageData?.data ?? []).map((v: any) => ({
      id: v.village_id,
      name: v.village_name,
      parentId: v.cluster_code,
    })),
  };

  const onSubmit = (data: DemonstrationFormValues) => {
    console.log("Demonstration Data:", data);
    setShowForm(true)
    alert("Demonstration saved successfully");
  };

  /* ================= INPUT ================= */

  const TextInput = ({
    name,
    label,
    required = false,
    numeric = false,
    type = "text"
  }: {
    name: keyof DemonstrationFormValues;
    label: string;
    required?: boolean;
    numeric?: boolean;
    type?: "text" | "date";
  }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {/* {required && <span className="text-red-500">*</span>} */}
      </label>

      <input
        type={type}
        inputMode={numeric ? "numeric" : "text"}
        {...register(name, {
          ...(required && { required: `${label} is required` }),
          ...(numeric && {
            pattern: {
              value: /^[0-9]+(\.[0-9]+)?$/,
              message: "Only numeric values allowed",
            },
          }),
        })}
        onKeyDown={(e) => {
          if (
            numeric &&
            !/[0-9.]/.test(e.key) &&
            e.key !== "Backspace" &&
            e.key !== "Tab"
          ) {
            e.preventDefault();
          }
        }}
        className={`w-full mt-1 p-2 border rounded-md ${errors[name] ? "border-red-500" : ""
          }`}
      />

      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );


  //fertilizers
  const { fields, append, remove } = useFieldArray({
    control,
    name: "fertilizers",
  });

  // Weedicide
  const { fields: weedicideFields, append: addWeedicide, remove: removeWeedicide } = useFieldArray({
    control,
    name: "weedicides",
  });

  // Pesticide
  const { fields: pesticideFields, append: addPesticide, remove: removePesticide } = useFieldArray({
    control,
    name: "pesticides",
  });

  /* ================= UI ================= */

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sprout className="w-8 h-8" />
          Crop Practice Demonstration
        </h1>
        <p className="text-green-100 mt-2">
          Fill demonstration details carefully
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

         <Section title="Location Details" icon={<MapPin />}>
          <LocationFormSelect
            levels={["district", "block", "cluster", "village"]}
            data={locationData}
            register={register}
            watch={watch}
            setValue={setValue}
            // loading={{
            //   district: loadingDistricts,
            //   block: loadingBlocks,
            //   cluster: loadingClusters,
            //   village: loadingVillages,
            // }}
          />
        </Section>

        {/* BASIC DETAILS */}
        <Section title="Farmer's Information" icon={<Leaf />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <TextInput name="farmer_reg_no" label="Farmer Reg. No" required />
            <TextInput name="farmer_name" label="Farmer's Name" required />
            <TextInput name="father_or_husband_name" label="Father's/Husband's Name" required />
            <TextInput name="contact_number" label="Contact Number" required />
            <div>
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">--Select--</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            {/* <TextInput name="farmer_photo" label="Farmer's Photo" required /> */}
            <TextInput
              name="commandArea"
              label="Command / Treatable Area (acre)"
              numeric
              required
            />

          </div>
        </Section>

        {/* Season & Crop */}
        <Section title="Season & Crop" icon={<Sprout />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Season of crops
              </label>
              <select
                {...register("season")}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">--Select--</option>
                <option className="text-sm italic" value="Kharif">Kharif</option>
                <option className="text-sm italic" value="Rabi">Rabi</option>
                <option className="text-sm italic" value="Zaid">Zaid</option>
              </select>
            </div>
            <TextInput name="cropVariety" label="Crop / Variety" required />
            {/* <TextInput
              name="cropYield"
              label="Crop Yield (q/acre)"
              numeric
            /> */}
          </div>
        </Section>

        {/* SEED & SOWING */}
        <Section title="Seed & Sowing" icon={<CalendarDays />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <TextInput
              name="seedRate"
              label="Seed Rate (kg/acre)"
              numeric
            />
            <TextInput name="sowingDate" label="Sowing Date" type="date" />
            <div>
              <label className="text-sm font-medium text-gray-700">
                Crop Practice Demonstration
              </label>
              <select
                {...register("cropPractice")}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">--Select--</option>
                <option value="Seed and Sowing">Seed and sowing</option>
                <option value="Practices in standing crop">
                  Practices in standing crop
                </option>
                <option value="Yield estimation and harvesting">
                  Yield estimation and harvesting
                </option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Demonstration Photo
              </label>
              <input
                type="file"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
          </div>
        </Section>

        {/* CROP INPUTS */}
        <Section title="Crop Inputs / Application" icon={<Package />}>
          {/* Fertilizer */}
          <div className="mb-8">
            <FieldBox title="Fertilizer" icon={<FlaskConical className="w-4 h-4" />}>

              {/* MODERN CHECKBOXES */}
              <div className="flex flex-wrap gap-3 mt-3">
                {fertilizerOptions.map((item) => {
                  const index = fields.findIndex(f => f.name === item);
                  const checked = index !== -1;

                  return (
                    <label
                      key={item}
                      className={`
                      relative cursor-pointer select-none
                      px-5 py-2 rounded-lg border text-sm font-medium
                      transition-all duration-200
                      ${checked
                          ? "bg-green-50 border-green-600 text-green-800 shadow-sm"
                          : "border-gray-300 text-gray-700 hover:border-green-400"}
                    `}
                    >
                      {/* Hidden checkbox */}
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            append({
                              name: item === "Other" ? "" : item,
                              qty: "",
                              isOther: item === "Other",
                            });
                          } else {
                            remove(index);
                          }
                        }}
                      />

                      {item}

                      {/* CHECK ICON */}
                      {checked && (
                        <CheckCircle2
                          size={20}
                          className="absolute -top-2 -right-2 text-green-700 bg-white rounded-full"
                        />
                      )}
                    </label>
                  );
                })}
              </div>

              {/* INPUTS */}
              <div className="mt-6 space-y-5">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4
                  border border-green-200 rounded-lg bg-green-50/40"
                  >
                    {/* Fertilizer Name */}
                    <div className="md:col-span-5">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Fertilizer
                      </label>

                      {field.isOther ? (
                        <input
                          {...register(`fertilizers.${index}.name`, { required: true })}
                          placeholder="Enter fertilizer name"
                          className="w-full border border-green-300 p-2 rounded-md focus:ring-1 focus:ring-green-600"
                        />
                      ) : (
                        <input
                          value={field.name}
                          disabled
                          className="w-full border border-green-200 p-2 rounded-md
                       bg-green-100 text-green-800"
                        />
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-4">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Quantity (kg / ltr / acre)
                      </label>
                      <input
                        {...register(`fertilizers.${index}.qty`)}
                        placeholder="Enter quantity"
                        className="w-full border p-2 rounded-md
                     focus:ring-1 focus:ring-green-600"
                      />
                    </div>

                    {/* Remove (TEXT ONLY) */}
                    <div className="md:col-span-3 flex items-end">
                      <button
                        type="button"               // 🔴 IMPORTANT: form submit prevent
                        onClick={() => remove(index)}
                        className="
                        text-sm text-red-600
                        border border-red-300
                        px-3 py-1.5 rounded-md
                        cursor-pointer select-none
                        transition
                        hover:bg-red-50 hover:underline
                        focus:outline-none focus:ring-1 focus:ring-red-500
                      "
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </FieldBox>
          </div>

          {/* Weedicide */}
          <div className="mb-8">
            <FieldBox title="Weedicide" icon={<Bug className="w-4 h-4" />}>
              <div className="space-y-4">
                {/* Rows */}
                {weedicideFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4
                   border border-green-200 rounded-lg bg-green-50/40 items-end"
                  >
                    {/* Weedicide Name */}
                    <div className="md:col-span-5">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Weedicide
                      </label>
                      <input
                        {...register(`weedicides.${index}.name`, { required: true })}
                        placeholder="Enter weedicide name"
                        className="w-full border border-green-300 p-2 rounded-md focus:ring-1 focus:ring-green-600"
                      />
                    </div>

                    {/* Quantity */}
                    <div className={`${weedicideFields.length > 1 ? "md:col-span-5" : "md:col-span-6"}`}>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Quantity (kg/ltr/acre)
                      </label>
                      <input
                        {...register(`weedicides.${index}.qty`, { required: true })}
                        placeholder="Enter quantity"
                        className="w-full border border-green-300 p-2 rounded-md focus:ring-1 focus:ring-green-600"
                      />
                    </div>

                    {/* Remove button */}
                    <div className="md:col-span-2 flex justify-center items-center">
                      {weedicideFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWeedicide(index)}
                          className="text-sm text-red-600 border border-red-300 px-3 py-2 rounded-md hover:bg-red-50 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add More Button */}
                <button
                  type="button"
                  onClick={() => addWeedicide({ name: "", qty: "" })}
                  className="mt-2 text-sm text-green-700 font-medium hover:underline"
                >
                  + Add More
                </button>
              </div>
            </FieldBox>
          </div>

          {/* Pesticide */}
          <FieldBox title="Pesticide" icon={<SprayCan className="w-4 h-4" />}>
            <div className="space-y-4">
              {/* Pesticide Rows */}
              {pesticideFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4
                   border border-green-200 rounded-lg bg-green-50/40 items-end"
                >
                  {/* Pesticide Name */}
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Chemical Pesticide
                    </label>
                    <input
                      {...register(`pesticides.${index}.name`, { required: true })}
                      placeholder="Enter pesticide name"
                      className="w-full border border-green-300 p-2 rounded-md focus:ring-1 focus:ring-green-600"
                    />
                  </div>

                  {/* Pesticide Quantity */}
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Quantity (kg/ltr/acre)
                    </label>
                    <input
                      {...register(`pesticides.${index}.qty`, { required: true })}
                      placeholder="Enter quantity"
                      className="w-full border border-green-300 p-2 rounded-md focus:ring-1 focus:ring-green-600"
                    />
                  </div>

                  {/* Bio-Pesticide Name */}
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Bio-Pesticide
                    </label>
                    <input
                      {...register(`pesticides.${index}.bioName`)}
                      placeholder="Enter bio-pesticide name"
                      className="w-full border border-green-300 p-2 rounded-md focus:ring-1 focus:ring-green-600"
                    />
                  </div>

                  {/* Bio Quantity */}
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Bio Quantity (kg/ltr/acre)
                    </label>
                    <input
                      {...register(`pesticides.${index}.bioQty`)}
                      placeholder="Enter bio quantity"
                      className="w-full border border-green-300 p-2 rounded-md focus:ring-1 focus:ring-green-600"
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-12 flex justify-end">
                    {pesticideFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePesticide(index)}
                        className="text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded-md hover:bg-red-50 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add More Button */}
              <button
                type="button"
                onClick={() =>
                  addPesticide({ name: "", qty: "", bioName: "", bioQty: "" })
                }
                className="mt-2 text-sm text-green-700 font-medium hover:underline"
              >
                + Add More
              </button>
            </div>
          </FieldBox>
        </Section>

        {/* IRRIGATION */}
        <Section title="Irrigation & Harvesting Details" icon={<Droplets />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Source of Irrigation
              </label>
              <select
                {...register("irrigationSource")}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Select</option>
                <option value="Canal">Canal</option>
                <option value="Govt. TW">Govt. TW</option>
                <option value="Pvt. TW">Pvt. TW</option>
                <option value="Both">Both Canal/TW</option>
              </select>
            </div>
            <TextInput name="harvestingDate" label="Harvesting Date" type="date" />
            <TextInput
              name="cropYield"
              label="Crop Yield (q/acre)"
              numeric
            />
          </div>
        </Section>
       
        {/* COMMENTS */}
        <Section title="Remark" icon={<MessageSquare />}>
          <textarea
            {...register("comments")}
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </Section>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4">
          <button
            type="reset"
            className="px-5 py-2 bg-gray-300 rounded-md"
            onClick={() => setShowForm(true)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-green-700 text-white rounded-md"
          >
            Save Demonstration
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= HELPERS ================= */

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

const FieldBox: FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="relative border border-dashed border-green-300 rounded-lg p-4">
    <div className="absolute -top-3 left-4 bg-white px-2 flex items-center gap-2 text-green-800 font-semibold">
      {icon}
      <span className="text-sm">{title}</span>
    </div>
    {children}
  </div>
);
