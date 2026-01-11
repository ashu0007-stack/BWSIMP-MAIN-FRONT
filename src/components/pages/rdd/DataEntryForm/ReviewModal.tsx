import { FileText, X, Upload, CheckCircle2 } from "lucide-react";
import { DataEntryFormData,FormProps } from "../types";

interface ReviewModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: DataEntryFormData;
  formProps: FormProps;
  submitting: boolean;
  getUserName: () => string;
}

export default function ReviewModal({ 
  show, 
  onClose, 
  onSubmit, 
  formData, 
  formProps,
  submitting, 
  getUserName 
}: ReviewModalProps) {
  
  if (!show) return null;

  const {
    workCategories,
    subCategories,
    blocks,
    panchayats,
    districts,
    districtResolved
  } = formProps;

  // Helper functions
  const getWorkCategoryName = () => {
    const category = workCategories.find(c => c.id === parseInt(formData.workCategory));
    return category ? category.category_name : formData.workCategory;
  };

  const getWorkTypeName = () => {
    const subCategory = subCategories.find(s => s.id === parseInt(formData.workType));
    return subCategory ? subCategory.sub_category_name : formData.workType;
  };

  const getDistrictName = () => {
    return formData.districts || '-';
  };

  const getBlockName = () => {
    const block = blocks.find(b => b.block_id === parseInt(formData.block));
    return block ? block.block_name : formData.block;
  };

  const getPanchayatName = () => {
    const panchayat = panchayats.find(p => p.gp_id === parseInt(formData.panchayat));
    return panchayat ? panchayat.gp_name : formData.panchayat;
  };

  const totalAmount = (parseFloat(formData.sanctionAmtWages) || 0) + (parseFloat(formData.sanctionAmtMaterial) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Review Form Data
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {/* User & Schema Information */}
                <tr className="bg-slate-100">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700 border border-slate-300">
                    User & Scheme Information
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50 w-1/3">
                    User
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {getUserName()}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Scheme Type
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.schemaType || '-'}
                  </td>
                </tr>

                {/* Location Information */}
                <tr className="bg-slate-100">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700 border border-slate-300">
                    Location Information
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    District Name
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    <div className="flex items-center gap-2">
                      {getDistrictName()}
                      {districtResolved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Block Name
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {getBlockName() || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Gram Panchayat
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {getPanchayatName() || '-'}
                  </td>
                </tr>

                {/* Work Details */}
                <tr className="bg-slate-100">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700 border border-slate-300">
                    Work Details
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Financial Year
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.financialYear || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Work Code
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.workCode || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Work Name
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.workName || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Work Category
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {getWorkCategoryName() || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Work Type
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {getWorkTypeName() || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Agency Name
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.agency || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Command Area (Hac.)
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.commandArea || '-'}
                  </td>
                </tr>

                {/* Measurements & Finances */}
                <tr className="bg-slate-100">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700 border border-slate-300">
                    Measurements & Finances
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Proposed Dimensions (L × W × H) m
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.propLength || '-'} × {formData.propWidth || '-'} × {formData.propHeight || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Sanction Amount - Wages (₹)
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.sanctionAmtWages ? `₹ ${parseFloat(formData.sanctionAmtWages).toLocaleString('en-IN')}` : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Sanction Amount - Material (₹)
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.sanctionAmtMaterial ? `₹ ${parseFloat(formData.sanctionAmtMaterial).toLocaleString('en-IN')}` : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Total Sanction Amount (₹)
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300 font-semibold">
                    {totalAmount > 0 
                      ? `₹ ${totalAmount.toLocaleString('en-IN')}`
                      : '-'
                    }
                  </td>
                </tr>

                {/* Timeline & Documents */}
                <tr className="bg-slate-100">
                  <td colSpan={2} className="px-4 py-3 font-semibold text-slate-700 border border-slate-300">
                    Timeline & Documents
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Work Start Date
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.workStartDate ? new Date(formData.workStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Completion Date
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.workCompletionDate ? new Date(formData.workCompletionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    AS Document
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.asUpload ? (
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-blue-600" />
                          {formData.asUpload.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          Size: {(formData.asUpload.size / 1024 / 1024).toFixed(2)} MB • Type: PDF
                        </span>
                      </div>
                    ) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-600 border border-slate-300 bg-slate-50">
                    Remarks
                  </td>
                  <td className="px-4 py-3 text-slate-800 border border-slate-300">
                    {formData.remarks || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 px-6 py-4 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Form
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}