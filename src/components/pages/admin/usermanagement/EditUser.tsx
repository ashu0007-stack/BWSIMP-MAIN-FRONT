import { InputBox } from "@/components/shared/InputBox";
import { useEditUser } from "@/hooks/userHooks/useUserDetails";
import { useQueryClient } from "@tanstack/react-query";
import React, { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface EditUserProps {
  user: any;
  onClose: () => void;
  onSubmit: (data: { full_name: string; mobno: string }) => void;
}

export const EditUser: FC<EditUserProps> = ({ user, onClose, onSubmit }) => {

  const { mutate: editUser, isPending } = useEditUser()
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ full_name: string; mobno: string }>({
    defaultValues: {
      full_name: user?.full_name || "",
      mobno: user?.mobno || "",
    },
  });

  // Reset form if user changes
  useEffect(() => {
    reset({
      full_name: user?.full_name || "",
      mobno: user?.mobno || "",
    });
  }, [user, reset]);

  const onFormSubmit = (data: { full_name: string; mobno: string }) => {
    const payload = {
      userId: user.id,
      full_name: data.full_name,
      mobno: data.mobno,
    };
    editUser(payload, {
      onSuccess: () => {
        toast.success("User details successfully edit.")

        // ✅ Refetch the user list to show updated data
        queryClient.invalidateQueries({ queryKey: ["userList"] });

        
        onClose();

      },
      onError: (error) => {
        toast.error("somthing went wrong.")
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onFormSubmit)}>
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-lg font-bold text-gray-800">Edit User Details</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Read-only fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <InputBox
            label="Email"
            value={user?.email}
            disabled={true}
          />
        </div>
        <div>
          <InputBox
            label="Role"
            value={user?.role_name}
            disabled={true}
          />
        </div>
      </div>

      {/* Editable fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <InputBox
            type="text"
            register={{ ...register("full_name", { required: "Name is required" }) }}
            error={errors.full_name}
          />

        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <InputBox
            type="text"
            register={
              {
                ...register("mobno", {
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit mobile number",
                  },
                })
              }
            }
            maxLength={10}
            error={errors.mobno}
          />

        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
