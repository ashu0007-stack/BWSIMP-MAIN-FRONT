import React, { FC } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Users, Plus, Trash2 } from "lucide-react";

interface FarmerParticipantFormProps {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

type Farmer = {
  participantName: string;
  fatherName: string;
  dbtRegNo?: string;
  contact: string;
  gender: "" | "M" | "F";
  category: "" | "Gen" | "OBC" | "SC" | "ST";
  remarks?: string;
};

type FormValues = {
  farmers: Farmer[];
};

export const FarmerParticipantForm: FC<FarmerParticipantFormProps> = ({
  setShowForm,
}) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      farmers: [
        {
          participantName: "",
          fatherName: "",
          dbtRegNo: "",
          contact: "",
          gender: "",
          category: "",
          remarks: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "farmers",
  });

  const onSubmit = (data: FormValues) => {
    console.log("ALL FARMERS DATA:", data.farmers);
    alert(`${data.farmers.length} farmer(s) saved successfully`);
    setShowForm(true);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8" />
          Farmer / WUA Participant Entry
        </h1>
        <p className="text-green-100 mt-2">
          Add multiple farmers at once. Fields marked with{" "}
          <span className="text-red-300">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6" >
          {/* SECTION HEADER WITH GREEN BAR */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Farmers Profile
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
                {/* DBT Reg */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    DBT Registration No
                  </label>
                  <input
                    {...register(`farmers.${index}.dbtRegNo`)}
                    className="w-full mt-1 px-2 py-2 border rounded-md"
                  />
                </div>

                {/* Farmer Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                   {" Farmer's Name"} 
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <input
                    {...register(`farmers.${index}.participantName`, {
                      required: "Farmer name is required",
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.farmers?.[index]?.participantName
                      ? "border-red-500"
                      : ""
                      }`}
                  />
                  {errors.farmers?.[index]?.participantName && (
                    <p className="text-red-500 text-sm">
                      {errors.farmers[index]?.participantName?.message}
                    </p>
                  )}
                </div>
                {/* Father Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {"Father's Name"}
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <input
                    {...register(`farmers.${index}.fatherName`, {
                      required: "Father name is required",
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.farmers?.[index]?.fatherName ? "border-red-500" : ""
                      }`}
                  />
                  {errors.farmers?.[index]?.fatherName && (
                    <p className="text-red-500 text-sm">
                      {errors.farmers[index]?.fatherName?.message}
                    </p>
                  )}
                </div>


                {/* Contact */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mobile Number 
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <input
                    {...register(`farmers.${index}.contact`, {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter valid 10 digit number",
                      },
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.farmers?.[index]?.contact ? "border-red-500" : ""
                      }`}
                  />
                  {errors.farmers?.[index]?.contact && (
                    <p className="text-red-500 text-sm">
                      {errors.farmers[index]?.contact?.message}
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
                    {...register(`farmers.${index}.gender`, {
                      required: "Gender is required",
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.farmers?.[index]?.gender ? "border-red-500" : ""
                      }`}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                  {errors.farmers?.[index]?.gender && (
                    <p className="text-red-500 text-sm">
                      {errors.farmers[index]?.gender?.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Category 
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <select
                    {...register(`farmers.${index}.category`, {
                      required: "Category is required",
                    })}
                    className={`w-full mt-1 px-2 py-2 border rounded-md ${errors.farmers?.[index]?.category ? "border-red-500" : ""
                      }`}
                  >
                    <option value="">Select</option>
                    <option value="Gen">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                  {errors.farmers?.[index]?.category && (
                    <p className="text-red-500 text-sm">
                      {errors.farmers[index]?.category?.message}
                    </p>
                  )}
                </div>

              </div>
            </div>
          ))}
          {/* ADD ANOTHER FARMER */}
          <button
            type="button"
            onClick={() =>
              append({
                participantName: "",
                fatherName: "",
                dbtRegNo: "",
                contact: "",
                gender: "",
                category: "",
                remarks: "",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-md"
          >
            <Plus size={18} />
            Add Another Farmer
          </button>
        </div>



        {/* SUBMIT BUTTONS */}
        <div className="flex justify-end gap-4">
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
