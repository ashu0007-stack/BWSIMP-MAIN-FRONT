// import React, { FC, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useFarmerDetails } from '@/hooks/doaHooks/useFarmerDetails';
// import { useDistricts } from '@/hooks/location/useDistricts';
// import { useBlocks } from '@/hooks/location/useBlocks';
// import { useClusters } from '@/hooks/location/useClusters';
// import { useVillages } from '@/hooks/location/useVillages';
// import { MapPin, MessageSquare, Sprout, UserRoundCheck, Users } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { LocationFormSelect } from '@/components/shared/Location/locationSelction';

// export type DemoFarmerFormValues = {
//   demonstration: any;
//   farmerMode: "existing" | "new";
//   farmerId?: any;
//   farmer_reg_no: string;
//   farmer_photo: string;
//   farmer_name: string;
//   father_or_husband_name?: string;
//   gender?: string;
//   age?: number;
//   category?: string;
//   contact_number?: string;
//   village?: string;
//   land_holding_size?: number;
//   irrigated_area?: number;
//   member_of_wua?: any;
//   wuaName?: string
//   major_crops_grown?: string;
//   comments: string;
//   districtId: number;
//   blockId: number;
//   clusterId: number;
//   village_id: number;
// };

// export const DemonstrationFarmerForm: FC<any> = ({ setShowForm }) => {
//   const [selectedFarmerId, setSelectedFarmerId] = useState<number>();
//   const [isWuaMember, setIsWuaMember] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm<DemoFarmerFormValues>({
//     defaultValues: { farmerMode: "new" },
//   });

//   const selectedDistrict = watch("districtId");
//   const selectedBlock = watch("blockId");
//   const selectedCluster = watch("clusterId");
//   const farmerMode = watch("farmerMode");
//   const isExisting = farmerMode === "existing";

//   /* ================= LOCATION DATA ================= */
//   const { data: districtData = [] } = useDistricts();
//   const { data: blockData = [] } = useBlocks(selectedDistrict);
//   const { data: clusterData = [] } = useClusters(selectedBlock);
//   useVillages(selectedCluster);

//   const locationData = {
//     district: (districtData?.data ?? []).map((d: any) => ({
//       id: d.district_id,
//       name: d.district_name,
//     })),
//     block: (blockData?.data ?? []).map((b: any) => ({
//       id: b.block_id,
//       name: b.block_name,
//       parentId: b.district_id,
//     })),
//     cluster: (clusterData?.data ?? []).map((c: any) => ({
//       id: c.cluster_code,
//       name: c.cluster_name,
//       parentId: c.block_id,
//     })),
//   };

//   /* ================= EXISTING FARMERS ================= */
//   const clusterCode = selectedCluster ? Number(selectedCluster) : undefined;
//   const { data: existingFarmers } = useFarmerDetails(
//     clusterCode ? { clusterCode } : undefined
//   );

//   /* ================= HANDLERS ================= */
//   const handleFarmerSelect = (farmerId: any) => {
//     const id = Number(farmerId);

//     if (!id) {
//       // NEW FARMER
//       setSelectedFarmerId(undefined);
//       setValue("farmerMode", "new");
//       setIsWuaMember(false);
//       reset();
//       return;
//     }

//     // EXISTING FARMER
//     setSelectedFarmerId(id);
//     setValue("farmerMode", "existing");

//     const farmer = existingFarmers?.find((f: any) => f.farmerId === id);
//     if (!farmer) return;

//     setValue("farmerId", farmer.farmerId);
//     setValue("farmer_reg_no", farmer.farmerRegNo);
//     setValue("farmer_name", farmer.farmerName);
//     setValue("father_or_husband_name", farmer.fatherOrHusbandName);
//     setValue("gender", farmer.gender);
//     setValue("age", farmer.age);
//     setValue("category", farmer.category);
//     setValue("contact_number", farmer.contactNumber);
//     setValue("village", farmer.address);
//     setValue("land_holding_size", farmer.landHoldingSize);
//     setValue("irrigated_area", farmer.irrigatedArea);
//     setValue("major_crops_grown", farmer.majorCropsGrown);

//     const wuaValue = farmer.memberOfWua ? "Yes" : "No";
//     setValue("member_of_wua", wuaValue);
//     setIsWuaMember(wuaValue === "Yes");
//     if (farmer.memberOfWua) setValue("wuaName", farmer.wuaName || "");
//   };

// const handleSubmitForm = (data: DemoFarmerFormValues) => {
//   // If you have a file input
//   const formData = new FormData();

//   (Object.keys(data) as (keyof DemoFarmerFormValues)[]).forEach((key) => {
//     const value = data[key];
//     if (value instanceof FileList) {
//       if (value.length > 0) formData.append(key, value[0]);
//     } else if (value !== undefined && value !== null) {
//       formData.append(key, String(value));
//     }
//   });

//   // This will log each key-value pair
//   console.log("Submitted Form Data:");
//   for (const [key, value] of formData.entries()) {
//     console.log(key, value);
//   }

//   // Optional toast
//   toast.success("Demonstration data saved!");
//   reset();
//   setShowForm(false);
// };



// const renderInput = (
//   name: keyof DemoFarmerFormValues,
//   label: string,
//   placeholder?: string,
//   type: string = "text",
//   required = false
// ) => (
//   <div>
//     <label className="text-sm font-medium text-gray-700">{label}</label>
//     <input
//       type={type}
//       readOnly={isExisting && type !== "file"} // allow file input even for existing
//       {...(type === "file"
//         ? {
//             onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
//               const file = e.target.files?.[0] || null;
//               setValue(name, file); // store file in RHF
//             },
//           }
//         : register(name, required ? { required: `${label} is required` } : {}))}
//       placeholder={placeholder}
//       className={`w-full mt-1 px-2 py-2 border rounded-md 
//         ${errors[name] ? "border-red-500" : ""} 
//         ${isExisting && type !== "file" ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""}`}
//     />
//     {errors[name] && (
//       <p className="text-red-500 text-sm">{(errors[name] as any).message}</p>
//     )}
//   </div>
// );


//   return (
//     <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
//       {/* HEADER */}
//       <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
//         <h1 className="text-2xl font-bold text-white flex items-center gap-3">
//           <Sprout className="w-8 h-8" />
//           Demonstration Entry Form
//         </h1>
//         <p className="text-green-100 mt-2">Fill all the required fields marked with *</p>
//       </div>

//       <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-10">
//         {/* LOCATION */}
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
//             <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
//               <MapPin className="w-6 h-6" />
//               CRA Demonstration Location
//             </h3>
//           </div>

//           <div className="flex gap-6">
//             <LocationFormSelect
//               levels={["district", "block", "cluster"]}
//               data={locationData}
//               register={register}
//               watch={watch}
//               setValue={setValue}
//             />
//             <div>
//               <label className="text-sm font-medium text-gray-700">CRA Demonstration</label>
//               <select
//                 {...register("demonstration", { required: "Demonstration is required" })}
//                 className="w-full mt-1 px-2 py-[10px] border rounded-md"
//               >
//                 <option value="">Select Demonstration</option>
//                 <option value="demo1">Demo 1</option>
//                 <option value="demo2">Demo 2</option>
//                 <option value="demo3">Demo 3</option>
//                 <option value="demo4">Demo 4</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* FARMER SELECT */}
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
//             <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
//               <UserRoundCheck className="w-6 h-6" />
//               Select Farmer
//             </h3>
//           </div>

//           <select
//             value={selectedFarmerId}
//             onChange={(e) => handleFarmerSelect(e.target.value)}
//             className="w-full p-2 border rounded-md"
//           >
//             <option value="">-- New Farmer --</option>
//             {existingFarmers?.map((f: any) => (
//               <option key={f.farmerId} value={f.farmerId}>
//                 {f.farmerName} ({f.farmerRegNo})
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* FARMER DETAILS */}
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
//             <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
//               <Users className="w-6 h-6" />
//               Farmer's Details
//             </h3>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {renderInput("farmer_reg_no", "Farmer Reg. No", "Enter Reg No", "text", true)}
//             {renderInput("farmer_photo", "Farmer's Photo", undefined, "file")}
//             {renderInput("farmer_name", "Farmer's Name", "Enter Name", "text", true)}
//             {renderInput("father_or_husband_name", "Father's/Husband's Name")}
//             {renderInput("gender", "Gender")}
//             {renderInput("age", "Age", "Enter Age", "number")}
//             {renderInput("category", "Category")}
//             {renderInput("contact_number", "Contact Number")}
//             {renderInput("village", "Village")}
//             {renderInput("land_holding_size", "Land Holding Size (in acres)", "in acres", "number")}
//             {renderInput("irrigated_area", "Irrigated Areain (in acres)", "in acres", "number")}
//             {renderInput("major_crops_grown", "Major Crops Grown")}
//             <div>
//               <label className="text-sm font-medium text-gray-700">Member of WUA?</label>
//               <select
//                 {...register("member_of_wua")}
//                 value={isWuaMember ? "Yes" : "No"}
//                 onChange={(e) => {
//                   if (!isExisting) setIsWuaMember(e.target.value === "Yes");
//                 }}
//                 disabled={isExisting} // <-- disable if existing farmer
//                 className={`w-full mt-1 px-2 py-[10px] border rounded-md 
//                   ${isExisting ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""}`}
//                 >
//                 <option value="No">No</option>
//                 <option value="Yes">Yes</option>
//               </select>
//             </div>

//             {isWuaMember && renderInput("wuaName", "WUA Name", "Enter WUA Name")}
//           </div>
//         </div>

//         {/* COMMENTS */}
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-1.5 h-8 bg-green-700 rounded-full"></div>
//             <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
//               <MessageSquare className="w-6 h-6" />
//               Farmer's Details
//             </h3>
//           </div>

//           <textarea
//             {...register("comments")}
//             placeholder="Write comments..."
//             className="w-full p-3 border rounded-md"
//           />
//         </div>

//         {/* BUTTONS */}
//         <div className="flex justify-end gap-4">
//           <button type="button" className="px-5 py-2 bg-gray-300 rounded-md" onClick={()=>setShowForm(true)}>
//             Cancel
//           </button>
//           <button type="submit" className="px-5 py-2 bg-green-700 text-white rounded-md">
//             Submit
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };
