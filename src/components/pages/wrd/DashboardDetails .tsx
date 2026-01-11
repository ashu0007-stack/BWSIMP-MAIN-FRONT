import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  Shield,
  Target,
  IndianRupee,
} from "lucide-react";
import { useAssignedWorks } from "@/hooks/wrdHooks/useWorks";

function WorkCard({ work }: { work: any }) {
  return (
    <div
      className="group bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg p-6 border-2 border-slate-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-300"
    // onClick removed here
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-slate-900 group-hover:text-blue-800 line-clamp-4 transition-colors text-lg mb-1"
                title={work.name || "Unnamed Work"}
              >
                {work.name || "Unnamed Work"}
              </h3>
              <p className="text-sm text-blue-600 font-semibold font-mono bg-blue-50 px-3 py-1 rounded-full inline-block">
                {work.code || "No Code"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${work.status === "Completed" ? "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200" :
            work.status === "In Progress" ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200" :
              work.status === "Delayed" ? "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200" :
                "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200"
          }`}>
          {work.status || "Not Started"}
        </span>
      </div>

      {/* Contractor Info */}
      {work.contractor_name && work.contractor_name !== "Not assigned" && (
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 mb-1">Agency / Contractor Name</p>
              <p className="text-sm font-bold text-slate-800">{work.contractor_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        {/* Budget */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600">Contract Value</div>
            <div className="text-sm font-bold text-slate-900">{work.budget || "contractor not assigned"}</div>
          </div>
        </div>

        {/* Target */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600">Length of Work(Target) </div>
            <div className="text-sm font-bold text-slate-900">{work.target || "Not specified"}</div>
          </div>
        </div>
      </div>

      {/* Location Section - विस्तृत */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-700">Location Details</h4>
        </div>

        <div className="space-y-2">
          {work.zone && work.zone !== "Not specified" && (
            <div className="flex items-center justify-between bg-blue-50/50 px-4 py-2 rounded-lg">
              <span className="text-xs font-medium text-slate-600">Zone:</span>
              <span className="text-sm font-bold text-slate-800">{work.zone}</span>
            </div>
          )}

          {work.circle && work.circle !== "Not specified" && (
            <div className="flex items-center justify-between bg-purple-50/50 px-4 py-2 rounded-lg">
              <span className="text-xs font-medium text-slate-600">Circle:</span>
              <span className="text-sm font-bold text-slate-800">{work.circle}</span>
            </div>
          )}

          {work.division && work.division !== "Not specified" && (
            <div className="flex items-center justify-between bg-green-50/50 px-4 py-2 rounded-lg">
              <span className="text-xs font-medium text-slate-600">Division:</span>
              <span className="text-sm font-bold text-slate-800">{work.division}</span>
            </div>
          )}

          {(!work.zone || work.zone === "Not specified") &&
            (!work.circle || work.circle === "Not specified") &&
            (!work.division || work.division === "Not specified") && (
              <div className="text-center py-3 text-slate-500 text-sm">
                Location not specified
              </div>
            )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-600">Work Stipulated Date: </span>
            <span className="text-xs font-bold text-slate-800">{work.deadline}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function AssignedWorksDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);

  // Hook for assigned works data
  const {
    data: assignedWorksData,
    isLoading: worksLoading,
    error: worksError,
  } = useAssignedWorks(userProfile?.user_id);

  useEffect(() => {
    const stored = sessionStorage.getItem("userdetail");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const user = parsed.user || parsed;
        console.log("User:", user);
        const profile = {
          role: (user.role || "Operator").toString(),
          designation: user.designation || "Executive Engineer",
          department: user.department || "WRD",
          user_id: user.user_id || user.id || "0",
          username: user.username || user.name || "User",
        };

        setUserProfile(profile);

      } catch (error) {
        console.error("Error parsing user profile:", error);
      }
    }
  }, []);

  // Loading state
  if (worksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Loading Assigned Works</h2>
          <p className="text-slate-600">Fetching your work data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (worksError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-4">Unable to load assigned works. Please check your connection.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const assignedWorks = assignedWorksData?.works || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Assigned Works</h1>
            <p className="text-slate-600">Track and manage all works assigned to you</p>
          </div>
        </div>
      </div>

      {/* Work Status Summary */}
      {assignedWorks.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Work Status Overview</h2>
              <p className="text-sm text-slate-600">Summary of all assigned works</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Not Started */}
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border-2 border-red-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-800">
                    {assignedWorks.filter((w: any) => w.status === "Not Started").length}
                  </div>
                  <div className="text-sm font-bold text-yellow-700">Not Started</div>
                </div>
              </div>
              <p className="text-sm text-yellow-600">
                Works not yet started
              </p>
            </div>
            {/* In Progress */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-2 border-blue-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-800">
                    {assignedWorks.filter((w: any) => w.status === "In Progress").length}
                  </div>
                  <div className="text-sm font-bold text-blue-700">In Progress</div>
                </div>
              </div>
              <p className="text-sm text-blue-600">
                Works currently being executed
              </p>
            </div>

            {/* Completed */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border-2 border-green-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-800">
                    {assignedWorks.filter((w: any) => w.status === "Completed").length}
                  </div>
                  <div className="text-sm font-bold text-green-700">Completed</div>
                </div>
              </div>
              <p className="text-sm text-green-600">
                Works successfully finished
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Assigned Works Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Assigned Works</h2>
              <p className="text-sm text-slate-600">{assignedWorks.length} works found</p>
            </div>
          </div>
        </div>

        {assignedWorks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {assignedWorks.map((work: any) => (
              <WorkCard
                key={work.id}
                work={work}
              // onClick prop removed here
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 border-2 border-slate-200 text-center shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
              <Briefcase className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">No Works Assigned</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You don&apos;t have any works assigned to you at the moment. Contact your supervisor or administrator for work assignments.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
              Request Work Assignment
            </button>
          </div>
        )}
      </section>
    </div>
  );
}