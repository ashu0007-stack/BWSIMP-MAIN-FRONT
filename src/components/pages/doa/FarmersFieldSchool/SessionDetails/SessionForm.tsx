import { useFfsDetails } from "@/hooks/doaHooks/useFfsDetails";
import { useAddSessionDetails } from "@/hooks/doaHooks/useSesstionDetails";
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Calendar,
  Users,
  User,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Target,
  FileText,
  XCircle
} from "lucide-react";

export type SessionFormValues = {
  ffs_id: number;
  session_date: string;
  session_topic: string;
  resource_person: string;
  training_methods: string;
  farmers_attended_male: number;
  farmers_attended_female: number;
  agro_ecosystem: boolean;
  special_topic_planned: boolean;
  group_dynamics: boolean;
  feedback_collected: boolean;
  issues_challenges?: string;
  corrective_actions?: string;
};

interface SessionFormProps {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SessionForm: FC<SessionFormProps> = ({ setShowForm }) => {
  const { mutate: addSession } = useAddSessionDetails();
  const { data: ffsDetail, isLoading: ffsDetailLoading } = useFfsDetails();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionFormValues>();

  const handleTrainingDetailsSubmit = (data: SessionFormValues) => {
    console.log('submit data', data);
    addSession(data, {
      onSuccess: (response) => {
        console.log('submit data', response);
        toast.success("Session successfully added");
        setShowForm(false);
      },
      onError: (errors) => {
        console.log(errors);
        toast.error("Failed to save record");
      }
    });
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
    name: keyof SessionFormValues;
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
          {(errors[name]?.message as string)}
        </p>
      )}
    </div>
  );

  const SelectInput = ({
    name,
    label,
    options,
    icon
  }: {
    name: keyof SessionFormValues;
    label: string;
    options: { value: string | number; label: string }[];
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
        <select
          {...register(name, { required: `${label} is required` })}
          className={`w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {(errors[name]?.message as string)}
        </p>
      )}
    </div>
  );

  const CheckboxInput = ({
    name,
    label,
    icon
  }: {
    name: keyof SessionFormValues;
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
          <BookOpen size={28} />
          Session Training Form
        </h1>
        <p className="text-green-100 mt-1">
          Fill in the details for the new training session
        </p>
      </div>

      <form onSubmit={handleSubmit(handleTrainingDetailsSubmit)} className="space-y-8">
        {/* BASIC SESSION INFORMATION */}
        <Section title="Session Information" icon={<Calendar size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectInput
              name="ffs_id"
              label="FFS Program"
              icon={<Target size={18} />}
              options={
                ffsDetailLoading
                  ? [{ value: "", label: "Loading..." }]
                  : ffsDetail?.map((ffs: any) => ({
                      value: ffs.ffsId,
                      label: ffs.ffsTitle
                    })) || []
              }
            />
            
            <TextInput
              name="session_date"
              label="Session Date"
              type="date"
              icon={<Calendar size={18} />}
              required
            />
            
            <TextInput
              name="session_topic"
              label="Session Topic"
              placeholder="Enter session topic"
              icon={<BookOpen size={18} />}
              required
            />
          </div>
        </Section>

        {/* TRAINING DETAILS */}
        <Section title="Training Details" icon={<Users size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextInput
              name="resource_person"
              label="Resource Person"
              placeholder="Enter resource person name"
              icon={<User size={18} />}
              required
            />
            
            <TextInput
              name="training_methods"
              label="Training Methods"
              placeholder="Enter training methods used"
              icon={<FileText size={18} />}
              required
            />
            
            {/* <TextInput
              name="farmers_attended_male"
              label="Male Farmers Attended"
              type="number"
              placeholder="Enter number of male farmers"
              icon={<Users size={18} />}
              required
            /> */}
            
            {/* <TextInput
              name="farmers_attended_female"
              label="Female Farmers Attended"
              type="number"
              placeholder="Enter number of female farmers"
              icon={<Users size={18} />}
              required
            /> */}
          </div>
        </Section>

        {/* SESSION COMPONENTS */}
        {/* <Section title="Session Components" icon={<CheckCircle size={20} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CheckboxInput
              name="agro_ecosystem"
              label="Agro Ecosystem"
              icon={<CheckCircle size={16} />}
            />
            
            <CheckboxInput
              name="special_topic_planned"
              label="Special Topic Planned"
              icon={<CheckCircle size={16} />}
            />
            
            <CheckboxInput
              name="group_dynamics"
              label="Group Dynamics"
              icon={<CheckCircle size={16} />}
            />
            
            <CheckboxInput
              name="feedback_collected"
              label="Feedback Collected"
              icon={<CheckCircle size={16} />}
            />
          </div>
        </Section> */}

        {/* ISSUES & CORRECTIVE ACTIONS */}
        {/* <Section title="Issues & Corrective Actions" icon={<AlertTriangle size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Issues & Challenges
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <AlertTriangle size={18} />
                </div>
                <textarea
                  {...register("issues_challenges")}
                  placeholder="Describe any issues or challenges faced during the session"
                  rows={4}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Corrective Actions
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <CheckCircle size={18} />
                </div>
                <textarea
                  {...register("corrective_actions")}
                  placeholder="Describe corrective actions taken"
                  rows={4}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>
            </div>
          </div>
        </Section> */}

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
            Submit Session
          </button>
        </div>
      </form>
    </div>
  );
};