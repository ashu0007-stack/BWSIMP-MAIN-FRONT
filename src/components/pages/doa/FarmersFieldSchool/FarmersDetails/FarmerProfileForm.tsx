import React, { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Sprout, Users, User } from "lucide-react";
import { useFfsDetails } from "@/hooks/doaHooks/useFfsDetails";
import { useAddFarmerDetails } from "@/hooks/doaHooks/useFarmerDetails";
import { useVillages } from "@/hooks/location/useVillages";
import { FarmerFields } from "../../farmerFields";

export const FarmerProfileForm: FC<any> = ({
  setFarmersRecords,
  setShowForm,
}) => {
  const { mutate: addfarmerDetails, isPending } = useAddFarmerDetails();
  const { data: ffsDetail = [], isLoading: ffsDetailLoading } = useFfsDetails();
  const [selectedCluster, setSelectedCluster] = useState<number | undefined>();
  const [selectedFfs, setSelectedFfs] = useState<any>(null);
  const { data: villageData = [], isPending: loadingVillages } = useVillages(selectedCluster);
  const [isWuaMember, setIsWuaMember] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const selectedFfsId = watch("ffs_id");
  // const memberOfWua = watch("member_of_wua");

  useEffect(() => {
    const ffs = ffsDetail.find((f: any) => f.ffsId === Number(selectedFfsId));
    if (ffs) {
      setSelectedFfs(ffs);
      setSelectedCluster(ffs.clusterCode);
    } else {
      setSelectedFfs(null);
      setSelectedCluster(undefined);
    }
  }, [selectedFfsId, ffsDetail]);

  const handleSubmitForm = (data: any) => {
    const payload = {
      ...data,
      district_id: selectedFfs?.district_id,
      block_id: selectedFfs?.block_id,
      cluster_code: selectedFfs?.clusterCode,
      member_of_wua: data.member_of_wua == 1 ? 1 : 0,
    };

    setFarmersRecords((prev: any) => [...prev, payload]);

    addfarmerDetails(payload, {
      onSuccess: () => {
        alert("Farmer record added successfully!");
        reset();
        setShowForm(false);
      },
      onError: (error: any) => {
        alert(error.message);
      },
    });
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8" />
          Farmer Profile Form
        </h1>
        <p className="text-green-100 mt-2">
          Fill all the required fields marked with *
        </p>
      </div>

      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-10">
        {/* ============= FFS SELECTION ============= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <Sprout className="w-6 h-6" />
              FFS Selection & Location
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Select FFS */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select FFS *
              </label>
              <select
                {...register("ffs_id", { required: "FFS is required" })}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Select FFS</option>
                {ffsDetailLoading ? (
                  <option>Loading...</option>
                ) : (
                  ffsDetail.map((f: any) => (
                    <option key={f.ffsId} value={f.ffsId}>
                      {f.ffsTitle}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Auto fields */}
            <div>
              <label className="text-sm font-medium text-gray-700">District</label>
              <input
                value={selectedFfs?.district || ""}
                readOnly
                className="w-full p-2 mt-1 border bg-gray-100 rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Block</label>
              <input
                value={selectedFfs?.block || ""}
                readOnly
                className="w-full p-2 mt-1 border bg-gray-100 rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cluster</label>
              <input
                value={selectedFfs?.cluster || ""}
                readOnly
                className="w-full p-2 mt-1 border bg-gray-100 rounded-md"
              />
            </div>

            {/* Village */}
            <div>
              <label className="text-sm font-medium text-gray-700">Village *</label>
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

        {/* ================= FARMER DETAILS SECTION ================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <User className="w-6 h-6" />
              Farmer Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <FarmerFields
              register={register}
              errors={errors}
              readOnly={false}
              selectWuaMember={isWuaMember}
              onWuaChange={(v: any) => setIsWuaMember(v)}
            />
          </div>
        </div>

        {/* ============= BUTTONS ============= */}
        <div className="flex justify-end gap-4 mt-4">
          <button type="reset" className="px-5 py-2 bg-gray-300 rounded-md">
            Reset
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};
