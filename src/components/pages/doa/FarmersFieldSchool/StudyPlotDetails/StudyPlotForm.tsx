import React, { FC } from "react";
import { useForm } from "react-hook-form";
import {
  MapPin,
  User,
  Phone,
  Ruler,
  Sprout,
  Package,
  Eye,
  CheckSquare,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";

export type FormValues = {
  additionalData: React.JSX.Element;
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
    console.log(errors);
  };

  /* ================= REUSABLE COMPONENTS ================= */
  const TextInput = ({
    name,
    label,
    type = "text",
    required = true,
    placeholder = "",
    icon
  }: {
    name: keyof FormValues;
    label: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    icon?: React.ReactNode;
  }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          {...register(name, required ? { required: `${label} is required` } : {})}
          placeholder={placeholder}
          className={`w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  const CheckboxInput = ({
    name,
    label,
    icon
  }: {
    name: keyof FormValues;
    label: string;
    icon?: React.ReactNode;
  }) => (
    <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <input
        type="checkbox"
        {...register(name)}
        className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
      />
      <div className="flex items-center space-x-2">
        {icon && <span className="text-gray-500">{icon}</span>}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </label>
  );

  const TextAreaInput = ({
    name,
    label,
    required = false,
    placeholder = "",
    icon
  }: {
    name: keyof FormValues;
    label: string;
    required?: boolean;
    placeholder?: string;
    icon?: React.ReactNode;
  }) => (
    <div className="md:col-span-2">
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            {icon}
          </div>
        )}
        <textarea
          {...register(name, required ? { required: `${label} is required` } : {})}
          placeholder={placeholder}
          rows={3}
          className={`w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  const Section: FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2 mb-6 pb-3 border-b">
        <span className="text-green-700">{icon}</span>
        {title}
      </h3>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-100 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-green-700 px-6 py-4 rounded-xl mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <MapPin size={28} />
          Study Plot Registration Form
        </h1>
        <p className="text-green-100 mt-1">
          Register a new study plot for agricultural research
        </p>
      </div>

      <form onSubmit={handleSubmit(handelFarmerDetailsSubmit)} className="space-y-8">
        {/* STUDY PLOT INFORMATION */}
        <Section title="Study Plot Details" icon={<MapPin size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextInput
              name="StudyPlotID"
              label="Study Plot ID"
              type="number"
              placeholder="Enter Study Plot ID"
              icon={<MapPin size={18} />}
              required
            />
            
            {/* <TextInput
              name="StudyPlotSize"
              label="Plot Size"
              placeholder="e.g., 1 acre, 0.5 hectare"
              icon={<Ruler size={18} />}
              required
            /> */}
            
            <div className="flex items-end">
              <CheckboxInput
                name="ControlPlot"
                label="Control Plot"
                icon={<CheckSquare size={18} />}
              />
            </div>
          </div>
        </Section>

        {/* HOST FARMER INFORMATION */}
        <Section title="Host Farmer Information" icon={<User size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              name="HostFarmerName"
              label="Farmer's Name"
              placeholder="Enter farmer's full name"
              icon={<User size={18} />}
              required
            />
            
            <TextInput
              name="HostFarmerContact"
              label="Contact Number"
              type="tel"
              placeholder="Enter contact number"
              icon={<Phone size={18} />}
              required={false}
            />
          </div>
        </Section>

        {/* CROP PRACTICES */}
        {/* <Section title="Crop & Practices" icon={<Sprout size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              name="CropPracticeDemonstrated"
              label="Crop Practice Demonstrated"
              placeholder="e.g., Organic farming, Drip irrigation"
              icon={<Sprout size={18} />}
              required
            />
            
            <TextInput
              name="InputsDetails"
              label="Inputs Details"
              placeholder="Fertilizers, seeds, tools used"
              icon={<Package size={18} />}
              required={false}
            />
          </div>
        </Section> */}

        {/* OBSERVATIONS */}
        <Section title="Observations & Notes" icon={<Eye size={20} />}>
          <div className="grid grid-cols-1 gap-6">
            <TextAreaInput
              name="ObservationsRecorded"
              label="Observations Recorded"
              placeholder="Record your observations about the plot..."
              icon={<FileText size={18} />}
              required={false}
            />
          </div>
        </Section>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
          >
            <XCircle size={18} />
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <CheckCircle size={18} />
            Register Study Plot
          </button>
        </div>
      </form>
    </div>
  );
};