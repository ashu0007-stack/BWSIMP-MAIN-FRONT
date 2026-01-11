import { useFfsDetails } from "@/hooks/doaHooks/useFfsDetails";
import { useAddSessionDetails } from "@/hooks/doaHooks/useSesstionDetails";
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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
    console.log('submit data', data)
    addSession(data, {
      onSuccess: (response) => {
        console.log('submit data', response);
        toast.success("Session successfully add");
        setShowForm(false);
      },
      onError: (errors) => {
        console.log(errors)
        toast.success("Failed to save record");
      }
    })
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 border-b pb-3">
        Session Training Form
      </h2>

      <form
        onSubmit={handleSubmit(handleTrainingDetailsSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Select FFS */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">Select FFS</label>
          <select
            {...register("ffs_id", { required: "FFS is required" })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select FFS</option>
            {ffsDetailLoading ? (
              <option>Loading...</option>
            ) : (
              ffsDetail?.map((ffs: any) => (
                <option key={ffs.ffsId} value={ffs.ffsId}>
                  {ffs.ffsTitle}
                </option>
              ))
            )}
          </select>
          {errors.ffs_id && <p className="text-red-500 text-sm">{errors.ffs_id.message}</p>}
        </div>

        {/* Session Date */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Session Date
          </label>
          <input
            type="date"
            {...register("session_date", { required: "Session date is required" })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
          />
          {errors.session_date && (
            <p className="text-red-500 text-sm">{errors.session_date.message}</p>
          )}
        </div>

        {/* Session Topic */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Session Topic
          </label>
          <input
            type="text"
            {...register("session_topic", { required: "Topic is required" })}
            placeholder="Enter Session Topic"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
          />
          {errors.session_topic && (
            <p className="text-red-500 text-sm">{errors.session_topic.message}</p>
          )}
        </div>

        {/* Resource Person */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Resource Person
          </label>
          <input
            type="text"
            {...register("resource_person", {
              required: "Resource person is required",
            })}
            placeholder="Enter Resource Person Name"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
          />
          {errors.resource_person && (
            <p className="text-red-500 text-sm">{errors.resource_person.message}</p>
          )}
        </div>

        {/* Training Methods */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Training Methods
          </label>
          <input
            type="text"
            {...register("training_methods", {
              required: "Training method is required",
            })}
            placeholder="Enter Training Method"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
          />
          {errors.training_methods && (
            <p className="text-red-500 text-sm">{errors.training_methods.message}</p>
          )}
        </div>

        {/* Farmers Male */}
        {/* <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Farmers (Male)
          </label>
          <input
            type="number"
            {...register("farmers_attended_male", {
              required: "Please enter number of male farmers",
              min: { value: 0, message: "Number cannot be negative" },
            })}
            placeholder="Number of Male Farmers"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
          />
          {errors.farmers_attended_male && (
            <p className="text-red-500 text-sm mt-1">
              {errors.farmers_attended_male.message}
            </p>
          )}
        </div> */}

        {/* Farmers Female */}
        {/* <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Farmers (Female)
          </label>
          <input
            type="number"
            {...register("farmers_attended_female", {
              required: "Please enter number of female farmers",
              min: { value: 0, message: "Number cannot be negative" },
            })}
            placeholder="Number of Female Farmers"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
          />
          {errors.farmers_attended_female && (
            <p className="text-red-500 text-sm mt-1">
              {errors.farmers_attended_female.message}
            </p>
          )}
        </div> */}

        {/* Checkboxes */}
        {/* <div className="col-span-1 md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <label className="flex items-center font-semibold text-gray-700">
            <input type="checkbox" {...register("agro_ecosystem")} className="mr-2" />
            Agro Ecosystem
          </label>
          <label className="flex items-center font-semibold text-gray-700">
            <input type="checkbox" {...register("special_topic_planned")} className="mr-2" />
            Special Topic
          </label>
          <label className="flex items-center font-semibold text-gray-700">
            <input type="checkbox" {...register("group_dynamics")} className="mr-2" />
            Group Dynamics
          </label>
          <label className="flex items-center font-semibold text-gray-700">
            <input type="checkbox" {...register("feedback_collected")} className="mr-2" />
            Feedback Collected
          </label>
        </div> */}

        {/* Issues */}
        {/* <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Issues / Challenges
          </label>
          <textarea
            {...register("issues_challenges")}
            placeholder="Enter any issues or challenges"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
            rows={3}
          />
        </div> */}

        {/* Corrective Actions */}
        {/* <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Corrective Actions
          </label>
          <textarea
            {...register("corrective_actions")}
            placeholder="Enter corrective actions taken"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
            rows={3}
          />
        </div> */}

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

