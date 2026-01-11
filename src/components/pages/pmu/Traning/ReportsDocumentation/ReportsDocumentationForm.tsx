"use client";

import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { FileText, BookCheck, UploadCloud } from "lucide-react";

interface Props {
  selectProgramme: any;
  selectTrainingAssessmentId: any
  onCloseForm: () => void;
}

interface DocumentFormValues {
  geoPhotos: FileList;
  videos: FileList;
  reportFiles: FileList;
  feedbackPdf: FileList;
  billsPdf: FileList;
  remarks?: string;
}

export const ReportsDocumentationForm: FC<Props> = ({
  selectProgramme,
  selectTrainingAssessmentId,
  onCloseForm,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormValues>();

  const submitForm = (data: any) => {
    console.log("Submitted Reports & Documentation Data:", data);

    alert("Reports & Documentation saved successfully!");

    reset();
    onCloseForm();
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookCheck className="w-8 h-8" />
            Reports & Documentation (Workshop – W1)
          </h1>
          <p className="text-blue-100 mt-2">
            Upload all required documentation and workshop-related materials.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(submitForm)} className="space-y-10">
        
        {/* PROGRAMME INFORMATION */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Programme Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Financial Year", value: selectProgramme?.financialYear },
              { label: "Level", value: selectProgramme?.levelName },
              { label: "Programme / Activity Type", value: selectProgramme?.activityName },
              { label: "Sub Programme / Sub Activity Type", value: selectProgramme?.subActivityName },
              { label: "Dept. / Agency", value: selectProgramme?.departmentName },
            ].map((item, index) => (
              <div key={index}>
                <label className="text-sm font-medium text-gray-700">{item.label}</label>
                <input
                  type="text"
                  value={item.value || ""}
                  readOnly
                  className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
            ))}
          </div>
        </div>

        
        {/* UPLOAD SECTION */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
              <UploadCloud className="w-6 h-6" />
              Upload Required Files
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* GEO TAGGED PHOTOS */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Geo-Tagged Photos (4 JPEG) *
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg"
                multiple
                {...register("geoPhotos", {
                  required: "Upload 4 geo-tagged photos",
                  validate: (files) =>
                    files.length === 4 || "Exactly 4 photos required",
                })}
                className="w-full mt-2 p-2 border rounded-md"
              />
              {errors.geoPhotos && (
                <p className="text-red-500 text-sm">{errors.geoPhotos.message as string}</p>
              )}
            </div>

            {/* VIDEO SHORTS */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Video Shorts (Upload Video File)
              </label>
              <input
                type="file"
                accept="video/*"
                {...register("videos")}
                className="w-full mt-2 p-2 border rounded-md"
              />
            </div>

            {/* REPORTS PDF */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Reports / PPT / Handouts / Materials (PDF) *
              </label>
              <input
                type="file"
                accept="application/pdf"
                {...register("reportFiles", {
                  required: "Upload reports or materials PDF",
                })}
                className="w-full mt-2 p-2 border rounded-md"
              />
              {errors.reportFiles && (
                <p className="text-red-500 text-sm">{errors.reportFiles.message as string}</p>
              )}
            </div>

            {/* FEEDBACK PDF */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                W1 Session Feedback (PDF) *
              </label>
              <input
                type="file"
                accept="application/pdf"
                {...register("feedbackPdf", {
                  required: "Upload feedback PDF",
                })}
                className="w-full mt-2 p-2 border rounded-md"
              />
              {errors.feedbackPdf && (
                <p className="text-red-500 text-sm">{errors.feedbackPdf.message as string}</p>
              )}
            </div>

            {/* BILLS PDF */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Bills Submitted (PDF) *
              </label>
              <input
                type="file"
                accept="application/pdf"
                {...register("billsPdf", {
                  required: "Upload bills PDF",
                })}
                className="w-full mt-2 p-2 border rounded-md"
              />
              {errors.billsPdf && (
                <p className="text-red-500 text-sm">{errors.billsPdf.message as string}</p>
              )}
            </div>

            {/* REMARKS */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Remarks (Optional)</label>
              <textarea
                {...register("remarks")}
                placeholder="Enter remarks"
                className="w-full mt-2 p-2 border rounded-md min-h-[100px]"
              />
            </div>
          </div>
        </div>

        
        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-2">
          <button
            type="button"
            onClick={onCloseForm}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-5 rounded-md"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-md"
          >
            Save Documentation
          </button>
        </div>
      </form>
    </div>
  );
};
