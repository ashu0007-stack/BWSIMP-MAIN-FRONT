import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  Shield,
  Target,
  IndianRupee,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Send,
  UserCheck,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  Users,
  Crop,
  CheckSquare,
  FileCheck,
  ThumbsUp
} from "lucide-react";
import { useAssignedWorks } from "@/hooks/wrdHooks/useWorks";

// Types
interface Work {
  id: string;
  name: string;
  code: string;
  budget: string | number | null;
  target: string;
  progress: number;
  zone: string;
  circle: string;
  division: string;
  location: string;
  status: string;
  deadline: string;
  completion_date: string;
  contractor_name: string;
  type: string;
  beneficiaries: number;
  improved_area: string;
  contractor_id: string | null;
}

interface UserProfile {
  role: "operator" | "reviewer" | "approver" | "admin";
  designation: string;
  department: string;
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  circle_id?: number;
  circle_name?: string;
  zone_id?: number;
  zone_name?: string;
  division_id?: number;
  division_name?: string;
  role_name?: string;
  user_level_id?: number;
  level_name?: string;
}

interface ProgressData {
  id: string;
  work_id: string;
  percentage: number;
  description: string;
  date: string;
  submitted_by: string;
  reviewed_by?: string;
  approved_by?: string;
  status: "submitted" | "reviewed" | "approved" | "rejected";
  attachments?: string[];
}

/* ---------- WorkCard Component ---------- */
function WorkCard({ work, userProfile, onAddProgress, onViewProgress, onReview, onApprove }: { 
  work: Work; 
  userProfile: UserProfile;
  onAddProgress?: (work: Work) => void;
  onViewProgress?: (work: Work) => void;
  onReview?: (work: Work) => void;
  onApprove?: (work: Work) => void;
}) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("completed")) return "from-green-100 to-green-50 text-green-800 border-green-200";
    if (statusLower.includes("progress")) return "from-blue-100 to-blue-50 text-blue-800 border-blue-200";
    if (statusLower.includes("delayed")) return "from-red-100 to-red-50 text-red-800 border-red-200";
    if (statusLower.includes("pending")) return "from-purple-100 to-purple-50 text-purple-800 border-purple-200";
    if (statusLower.includes("tender")) return "from-amber-100 to-amber-50 text-amber-800 border-amber-200";
    return "from-slate-100 to-slate-50 text-slate-800 border-slate-200";
  };

  // Format budget with ₹ symbol
  const formatBudget = (budget: string | number | null) => {
    if (!budget || budget === "null" || budget === "Not assigned") return "Contractor Not Assigned";
    if (typeof budget === "number") return `₹ ${budget.toLocaleString()} Cr`;
    if (typeof budget === "string") {
      const num = parseFloat(budget);
      if (!isNaN(num)) return `₹ ${num.toLocaleString()} Cr`;
    }
    return budget;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "Not set" || dateStr === "null") return "Not Set";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Check if work is in reviewer's circle
  const isInReviewerCircle = userProfile.role === "reviewer" && 
    work.circle === userProfile.circle_name;

  // Check if work is in approver's zone
  const isInApproverZone = userProfile.role === "approver" && 
    work.zone === userProfile.zone_name;

  // Show action buttons based on role and work status
  const showActionButtons = () => {
    switch(userProfile.role) {
      case "operator":
        return work.contractor_name !== "No contractor assigned" && 
               work.status !== "Completed";
      
      case "reviewer":
        return isInReviewerCircle && 
               work.status === "In Progress" && 
               work.contractor_name !== "No contractor assigned";
      
      case "approver":
        return isInApproverZone && 
               work.status === "In Progress" && 
               work.contractor_name !== "No contractor assigned";
      
      default:
        return false;
    }
  };

  return (
    <div className="group bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg p-6 border-2 border-slate-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-300">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
              userProfile.role === "operator" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
              userProfile.role === "reviewer" ? "bg-gradient-to-br from-amber-500 to-amber-600" :
              userProfile.role === "approver" ? "bg-gradient-to-br from-purple-500 to-purple-600" :
              "bg-gradient-to-br from-slate-500 to-slate-600"
            }`}>
              {userProfile.role === "operator" ? <TrendingUp className="w-6 h-6 text-white" /> :
               userProfile.role === "reviewer" ? <FileCheck className="w-6 h-6 text-white" /> :
               userProfile.role === "approver" ? <ThumbsUp className="w-6 h-6 text-white" /> :
               <Briefcase className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 group-hover:text-blue-800 line-clamp-2 transition-colors text-lg mb-1">
                {work.name || "Unnamed Work"}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-blue-600 font-semibold font-mono bg-blue-50 px-3 py-1 rounded-full">
                  {work.code || "No Code"}
                </p>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {work.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm bg-gradient-to-r ${getStatusColor(work.status)} border`}>
          {work.status || "Not Started"}
        </span>
      </div>

      {/* Role-based indicator */}
      {(userProfile.role === "reviewer" || userProfile.role === "approver") && (
        <div className={`mb-4 p-3 rounded-xl border ${
          userProfile.role === "reviewer" ? "bg-amber-50 border-amber-200" :
          "bg-purple-50 border-purple-200"
        }`}>
          <div className="flex items-center gap-2">
            {userProfile.role === "reviewer" ? (
              <>
                <FileCheck className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">
                  In your circle for review
                </span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">
                  In your zone for approval
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm font-bold text-blue-600">{work.progress || 0}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${work.progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Contractor Info */}
      {work.contractor_name && work.contractor_name !== "No contractor assigned" && (
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 mb-1">Contractor</p>
              <p className="text-sm font-bold text-slate-800">{work.contractor_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Budget */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600">Contract Value</div>
            <div className="text-sm font-bold text-slate-900">{formatBudget(work.budget)}</div>
          </div>
        </div>

        {/* Target Length */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600">Target Length</div>
            <div className="text-sm font-bold text-slate-900">{work.target || "N/A"}</div>
          </div>
        </div>

        {/* Beneficiaries */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600">Beneficiaries</div>
            <div className="text-sm font-bold text-slate-900">{work.beneficiaries?.toLocaleString() || "0"}</div>
          </div>
        </div>

        {/* Improved Area */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-100">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Crop className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600">Improved Area</div>
            <div className="text-sm font-bold text-slate-900">{work.improved_area || "0"} Ha</div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-700">Location</h4>
        </div>
        <div className="space-y-2">
          {work.zone && work.zone !== "Not specified" && (
            <div className="flex items-center justify-between bg-blue-50/50 px-3 py-2 rounded-lg">
              <span className="text-xs font-medium text-slate-600">Zone:</span>
              <span className="text-xs font-bold text-slate-800 truncate ml-2 max-w-[150px]">{work.zone}</span>
            </div>
          )}
          {work.circle && work.circle !== "Not specified" && (
            <div className="flex items-center justify-between bg-purple-50/50 px-3 py-2 rounded-lg">
              <span className="text-xs font-medium text-slate-600">Circle:</span>
              <span className="text-xs font-bold text-slate-800 truncate ml-2 max-w-[150px]">{work.circle}</span>
            </div>
          )}
          {work.division && work.division !== "Not specified" && (
            <div className="flex items-center justify-between bg-green-50/50 px-3 py-2 rounded-lg">
              <span className="text-xs font-medium text-slate-600">Division:</span>
              <span className="text-xs font-bold text-slate-800 truncate ml-2 max-w-[150px]">{work.division}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActionButtons() && (
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          {userProfile.role === "operator" && (
            <button
              onClick={() => onAddProgress?.(work)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Add Progress
            </button>
          )}
          
          {userProfile.role === "reviewer" && isInReviewerCircle && (
            <button
              onClick={() => onReview?.(work)}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-amber-700 hover:to-amber-800 transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Review Progress
            </button>
          )}

          {userProfile.role === "approver" && isInApproverZone && (
            <button
              onClick={() => onApprove?.(work)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Approve Progress
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-600">Deadline:</span>
              <span className="text-xs font-bold text-slate-800">{formatDate(work.deadline)}</span>
            </div>
            {work.completion_date && work.completion_date !== "Not set" && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-600">Expected Completion:</span>
                <span className="text-xs font-bold text-green-700">{formatDate(work.completion_date)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Last Updated */}
        <div className="text-xs text-slate-500 text-right">
          ID: {work.id}
        </div>
      </div>
    </div>
  );
}

/* ---------- ReviewModal Component ---------- */
function ReviewModal({ 
  isOpen, 
  onClose, 
  work, 
  userProfile,
  onSubmitReview
}: { 
  isOpen: boolean;
  onClose: () => void;
  work: Work | null;
  userProfile: UserProfile;
  onSubmitReview?: (reviewData: any) => void;
}) {
  const [reviewComment, setReviewComment] = useState("");
  const [action, setAction] = useState<"approve" | "reject">("approve");

  if (!isOpen || !work) return null;

  const handleSubmit = () => {
    if (onSubmitReview) {
      onSubmitReview({
        work_id: work.id,
        action,
        comment: reviewComment,
        reviewed_by: userProfile.user_id,
        reviewer_name: userProfile.full_name,
        date: new Date().toISOString()
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Review Progress Update</h3>
              <p className="text-slate-600">{work.name} - {work.code}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-blue-600 font-medium">Contractor:</span>
                <span className="text-sm font-bold">{work.contractor_name}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Work Summary */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2">Work Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Progress</p>
                <p className="text-lg font-bold text-blue-600">{work.progress}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Budget</p>
                <p className="text-lg font-bold text-emerald-600">
                  {work.budget ? `₹ ${work.budget} Cr` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Target</p>
                <p className="text-lg font-bold text-purple-600">{work.target}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Beneficiaries</p>
                <p className="text-lg font-bold text-green-600">{work.beneficiaries.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3">Select Action</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAction("approve")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === "approve" 
                    ? "border-green-500 bg-green-50" 
                    : "border-slate-200 hover:border-green-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    action === "approve" ? "bg-green-100" : "bg-slate-100"
                  }`}>
                    <CheckCircle className={`w-5 h-5 ${
                      action === "approve" ? "text-green-600" : "text-slate-500"
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Approve</div>
                    <div className="text-sm text-slate-600">Forward to Approver</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction("reject")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === "reject" 
                    ? "border-red-500 bg-red-50" 
                    : "border-slate-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    action === "reject" ? "bg-red-100" : "bg-slate-100"
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      action === "reject" ? "text-red-600" : "text-slate-500"
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Reject</div>
                    <div className="text-sm text-slate-600">Return to Operator</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Review Comments */}
          <div className="mb-6">
            <label className="block font-semibold text-slate-900 mb-2">
              Review Comments
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder={`Enter your review comments...${
                action === "approve" 
                  ? "\n• Any observations?\n• Any conditions for approval?\n• Suggestions for improvement?"
                  : "\n• Reasons for rejection?\n• Required changes?\n• Timeline for resubmission?"
              }`}
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Your comments will be visible to {action === "approve" ? "the approver" : "the operator"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className={`flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                action === "approve" 
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              }`}
              disabled={!reviewComment.trim()}
            >
              {action === "approve" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve & Forward
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Reject & Return
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- ApproveModal Component ---------- */
function ApproveModal({ 
  isOpen, 
  onClose, 
  work, 
  userProfile,
  onSubmitApprove
}: { 
  isOpen: boolean;
  onClose: () => void;
  work: Work | null;
  userProfile: UserProfile;
  onSubmitApprove?: (approvalData: any) => void;
}) {
  const [approvalComment, setApprovalComment] = useState("");
  const [action, setAction] = useState<"approve" | "reject">("approve");

  if (!isOpen || !work) return null;

  const handleSubmit = () => {
    if (onSubmitApprove) {
      onSubmitApprove({
        work_id: work.id,
        action,
        comment: approvalComment,
        approved_by: userProfile.user_id,
        approver_name: userProfile.full_name,
        date: new Date().toISOString()
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Final Approval</h3>
              <p className="text-slate-600">{work.name} - {work.code}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-blue-600 font-medium">Circle:</span>
                <span className="text-sm font-bold">{work.circle}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Final Approval Warning */}
          <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">Final Approval Stage</h4>
                <p className="text-sm text-purple-700">
                  This is the final approval step. Once approved, the progress will be officially recorded.
                </p>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3">Select Final Action</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAction("approve")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === "approve" 
                    ? "border-purple-500 bg-purple-50" 
                    : "border-slate-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    action === "approve" ? "bg-purple-100" : "bg-slate-100"
                  }`}>
                    <ThumbsUp className={`w-5 h-5 ${
                      action === "approve" ? "text-purple-600" : "text-slate-500"
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Final Approve</div>
                    <div className="text-sm text-slate-600">Mark as Completed</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction("reject")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === "reject" 
                    ? "border-red-500 bg-red-50" 
                    : "border-slate-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    action === "reject" ? "bg-red-100" : "bg-slate-100"
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      action === "reject" ? "text-red-600" : "text-slate-500"
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Return</div>
                    <div className="text-sm text-slate-600">Send back to Reviewer</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Approval Comments */}
          <div className="mb-6">
            <label className="block font-semibold text-slate-900 mb-2">
              Approval Comments
            </label>
            <textarea
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder={`Enter your final approval comments...${
                action === "approve" 
                  ? "\n• Final observations?\n• Completion notes?\n• Next steps?"
                  : "\n• Reasons for return?\n• Required improvements?\n• Review timeline?"
              }`}
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              {action === "approve" 
                ? "These comments will be recorded as final approval notes."
                : "These comments will be sent back to the reviewer for action."}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className={`flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                action === "approve" 
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              }`}
              disabled={!approvalComment.trim()}
            >
              {action === "approve" ? (
                <>
                  <ThumbsUp className="w-4 h-4" />
                  Final Approve
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Return to Reviewer
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- DashboardHeader Component ---------- */
function DashboardHeader({ userProfile, works }: { userProfile: UserProfile; works: Work[] }) {
  const getRoleDescription = () => {
    switch(userProfile.role) {
      case "operator": return "Track and update progress of your assigned works";
      case "reviewer": return `Review progress updates from ${userProfile.circle_name || "your circle"}`;
      case "approver": return `Approve progress updates for ${userProfile.zone_name || "your zone"}`;
      case "admin": return "Monitor all works and manage the system";
      default: return "";
    }
  };

  const getRoleIcon = () => {
    switch(userProfile.role) {
      case "operator": return <TrendingUp className="w-7 h-7" />;
      case "reviewer": return <FileCheck className="w-7 h-7" />;
      case "approver": return <ThumbsUp className="w-7 h-7" />;
      case "admin": return <Briefcase className="w-7 h-7" />;
      default: return <Briefcase className="w-7 h-7" />;
    }
  };

  const getRoleColor = () => {
    switch(userProfile.role) {
      case "operator": return "from-blue-600 to-blue-700";
      case "reviewer": return "from-amber-600 to-amber-700";
      case "approver": return "from-purple-600 to-purple-700";
      case "admin": return "from-slate-600 to-slate-700";
      default: return "from-blue-600 to-blue-700";
    }
  };

  const stats = {
    total: works.length,
    inProgress: works.filter(w => w.status?.toLowerCase().includes("progress")).length,
    withContractor: works.filter(w => w.contractor_name && w.contractor_name !== "No contractor assigned").length,
    inMyJurisdiction: works.filter(w => {
      if (userProfile.role === "reviewer") return w.circle === userProfile.circle_name;
      if (userProfile.role === "approver") return w.zone === userProfile.zone_name;
      return true;
    }).length,
    completed: works.filter(w => w.status?.toLowerCase().includes("completed")).length
  };

  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${getRoleColor()}`}>
            {getRoleIcon()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 capitalize">
                {userProfile.role} Dashboard
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                userProfile.role === "operator" ? "bg-blue-100 text-blue-800" :
                userProfile.role === "reviewer" ? "bg-amber-100 text-amber-800" :
                userProfile.role === "approver" ? "bg-purple-100 text-purple-800" :
                "bg-slate-100 text-slate-800"
              }`}>
                {userProfile.level_name || userProfile.role}
              </span>
            </div>
            <p className="text-slate-600">{getRoleDescription()}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-slate-500">
                {userProfile.designation || userProfile.designation} • {userProfile.department || userProfile.department}
              </span>
              {userProfile.circle_name && (
                <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  {userProfile.circle_name}
                </span>
              )}
              {userProfile.zone_name && (
                <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {userProfile.zone_name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-600">Welcome</p>
            <p className="font-bold text-slate-900">{userProfile.full_name || userProfile.username}</p>
            <p className="text-sm text-slate-600">{userProfile.email}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            {(userProfile.full_name || userProfile.username)?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border-2 border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Works</p>
              <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-5 border-2 border-green-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-green-800">{stats.inProgress}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border-2 border-amber-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">With Contractor</p>
              <p className="text-2xl font-bold text-amber-800">{stats.withContractor}</p>
            </div>
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        {(userProfile.role === "reviewer" || userProfile.role === "approver") && (
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border-2 border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">In My Area</p>
                <p className="text-2xl font-bold text-purple-800">{stats.inMyJurisdiction}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border-2 border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function AssignedWorksDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    zone: "",
    circle: ""
  });

  // Parse user profile from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("userdetail");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const user = parsed.user || parsed;
        
        console.log("User data from session:", user);
        
        // Determine role based on role_name or role_id
        let role: UserProfile["role"] = "operator";
        if (user.role_name) {
          const roleLower = user.role_name.toLowerCase();
          if (roleLower.includes("review")) role = "reviewer";
          else if (roleLower.includes("approv")) role = "approver";
          else if (roleLower.includes("admin")) role = "admin";
          else if (roleLower.includes("operat")) role = "operator";
        } else if (user.role_id) {
          // Map role_id to role (adjust based on your system)
          switch(user.role_id) {
            case 6: role = "reviewer"; break; // Reviewer
            case 7: role = "approver"; break; // Approver
            case 1: role = "admin"; break;    // Admin
            default: role = "operator"; break;
          }
        }

        const profile: UserProfile = {
          role,
          designation: user.designation_name || user.designation || "",
          department: user.department_name || user.department || "WRD",
          user_id: user.id?.toString() || user.user_id || "0",
          username: user.full_name || user.username || "User",
          email: user.email || "",
          full_name: user.full_name || user.username || "User",
          circle_id: user.circle_id,
          circle_name: user.circle_name,
          zone_id: user.zone_id,
          zone_name: user.zone_name,
          division_id: user.division_id,
          division_name: user.division_name,
          role_name: user.role_name,
          user_level_id: user.user_level_id,
          level_name: user.level_name
        };

        console.log("Setting user profile:", profile);
        setUserProfile(profile);

        // Store user info for API calls
        sessionStorage.setItem("current_user_id", profile.user_id);
        sessionStorage.setItem("current_user_role", profile.role);

      } catch (error) {
        console.error("Error parsing user profile:", error);
        // Fallback profile
        setUserProfile({
          role: "operator",
          designation: "Executive Engineer",
          department: "WRD",
          user_id: "0",
          username: "User",
          email: "",
          full_name: "User"
        });
      }
    } else {
      console.warn("No user details found in sessionStorage");
      // Redirect to login or show error
      window.location.href = "/login";
    }
  }, []);

  // Hook for assigned works data
  const {
    data: assignedWorksData,
    isLoading: worksLoading,
    error: worksError,
    refetch: refetchWorks
  } = useAssignedWorks(userProfile?.user_id || undefined);

  // Debug logs
  useEffect(() => {
    console.log("User Profile:", userProfile);
    console.log("Works Data:", assignedWorksData);
    console.log("Loading:", worksLoading);
    console.log("Error:", worksError);
  }, [userProfile, assignedWorksData, worksLoading, worksError]);

  // Filter works based on role
  const assignedWorks = assignedWorksData?.works || [];
  
  const filteredWorks = assignedWorks.filter((work: Work) => {
    // Apply role-based filtering
    if (userProfile?.role === "reviewer") {
      // Reviewer sees works from their circle
      if (work.circle !== userProfile.circle_name) return false;
    } else if (userProfile?.role === "approver") {
      // Approver sees works from their zone
      if (work.zone !== userProfile.zone_name) return false;
    }
    // Operator and Admin see all works (but API should filter for operator)

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        work.name?.toLowerCase().includes(searchLower) ||
        work.code?.toLowerCase().includes(searchLower) ||
        work.contractor_name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    if (filters.status && work.status !== filters.status) {
      return false;
    }
    
    if (filters.zone && work.zone !== filters.zone) {
      return false;
    }
    
    if (filters.circle && work.circle !== filters.circle) {
      return false;
    }
    
    return true;
  });

  const handleAddProgress = (work: Work) => {
    setSelectedWork(work);
    // For operator - you would show a different modal
    // For now, we'll use the review modal for operator too
    setIsReviewModalOpen(true);
  };

  const handleReview = (work: Work) => {
    setSelectedWork(work);
    setIsReviewModalOpen(true);
  };

  const handleApprove = (work: Work) => {
    setSelectedWork(work);
    setIsApproveModalOpen(true);
  };

  const handleSubmitReview = async (reviewData: any) => {
    try {
      console.log("Submitting review:", reviewData);
      // API call to submit review
      const response = await fetch('/api/progress/review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });
      
      if (response.ok) {
        alert(`Progress ${reviewData.action === 'approve' ? 'reviewed and forwarded' : 'returned for changes'} successfully!`);
        refetchWorks();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(`Error: ${error.message || 'Failed to submit review'}`);
    }
  };

  const handleSubmitApprove = async (approvalData: any) => {
    try {
      console.log("Submitting approval:", approvalData);
      // API call to submit approval
      const response = await fetch('/api/progress/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(approvalData)
      });
      
      if (response.ok) {
        alert(`Progress ${approvalData.action === 'approve' ? 'approved' : 'returned'} successfully!`);
        refetchWorks();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit approval');
      }
    } catch (error: any) {
      console.error('Error submitting approval:', error);
      alert(`Error: ${error.message || 'Failed to submit approval'}`);
    }
  };

  // Loading state
  if (worksLoading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Loading Dashboard</h2>
          <p className="text-slate-600">Setting up your workspace as {userProfile?.role}...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (worksError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Failed to Load Works</h2>
          <p className="text-slate-600 mb-4">
            {typeof worksError === 'string' ? worksError : 
             worksError.message || 'Unable to load works data. Please check your connection.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => refetchWorks()} 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 md:p-8">
      {/* Header */}
      <DashboardHeader userProfile={userProfile} works={filteredWorks} />

      {/* Works Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              userProfile.role === "operator" ? "bg-gradient-to-br from-blue-100 to-blue-50" :
              userProfile.role === "reviewer" ? "bg-gradient-to-br from-amber-100 to-amber-50" :
              userProfile.role === "approver" ? "bg-gradient-to-br from-purple-100 to-purple-50" :
              "bg-gradient-to-br from-slate-100 to-slate-50"
            }`}>
              {userProfile.role === "operator" ? <TrendingUp className="w-5 h-5 text-blue-600" /> :
               userProfile.role === "reviewer" ? <FileCheck className="w-5 h-5 text-amber-600" /> :
               userProfile.role === "approver" ? <ThumbsUp className="w-5 h-5 text-purple-600" /> :
               <Briefcase className="w-5 h-5 text-slate-600" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 capitalize">
                {userProfile.role === "operator" ? "My Assigned Works" :
                 userProfile.role === "reviewer" ? "Works for Your Review" :
                 userProfile.role === "approver" ? "Works for Your Approval" :
                 "All Works"}
              </h2>
              <p className="text-sm text-slate-600">
                Showing {filteredWorks.length} of {assignedWorks.length} works
                {userProfile.role === "reviewer" && ` in ${userProfile.circle_name}`}
                {userProfile.role === "approver" && ` in ${userProfile.zone_name}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => refetchWorks()}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {filteredWorks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorks.map((work: Work) => (
              <WorkCard
                key={work.id}
                work={work}
                userProfile={userProfile}
                onAddProgress={handleAddProgress}
                onReview={handleReview}
                onApprove={handleApprove}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 border-2 border-slate-200 text-center shadow-sm">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${
              userProfile.role === "operator" ? "bg-blue-50 border-blue-200" :
              userProfile.role === "reviewer" ? "bg-amber-50 border-amber-200" :
              userProfile.role === "approver" ? "bg-purple-50 border-purple-200" :
              "bg-slate-50 border-slate-200"
            }`}>
              {userProfile.role === "operator" ? <TrendingUp className="w-10 h-10 text-blue-400" /> :
               userProfile.role === "reviewer" ? <FileCheck className="w-10 h-10 text-amber-400" /> :
               userProfile.role === "approver" ? <ThumbsUp className="w-10 h-10 text-purple-400" /> :
               <Briefcase className="w-10 h-10 text-slate-400" />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">
              {filters.search || filters.status || filters.zone ? "No Matching Works Found" : 
               userProfile.role === "operator" ? "No Works Assigned" :
               userProfile.role === "reviewer" ? `No Works in ${userProfile.circle_name}` :
               userProfile.role === "approver" ? `No Works in ${userProfile.zone_name}` :
               "No Works Available"}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {userProfile.role === "operator" 
                ? "You don't have any works assigned to you at the moment. Contact your supervisor for work assignments."
                : userProfile.role === "reviewer"
                ? `There are currently no works in ${userProfile.circle_name} that require review.`
                : userProfile.role === "approver"
                ? `There are currently no works in ${userProfile.zone_name} that require approval.`
                : "There are no works available in the system."}
            </p>
            {(filters.search || filters.status || filters.zone) && (
              <button 
                onClick={() => setFilters({ search: "", status: "", zone: "", circle: "" })}
                className={`px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-md ${
                  userProfile.role === "operator" ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" :
                  userProfile.role === "reviewer" ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800" :
                  userProfile.role === "approver" ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800" :
                  "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                }`}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedWork(null);
        }}
        work={selectedWork}
        userProfile={userProfile}
        onSubmitReview={handleSubmitReview}
      />

      {/* Approve Modal */}
      <ApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedWork(null);
        }}
        work={selectedWork}
        userProfile={userProfile}
        onSubmitApprove={handleSubmitApprove}
      />

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-40">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Role: {userProfile?.role}</div>
          <div>Circle: {userProfile?.circle_name}</div>
          <div>Zone: {userProfile?.zone_name}</div>
          <div>Works: {filteredWorks.length}</div>
        </div>
      )}
    </div>
  );
}