import React, { useState, useMemo, useEffect } from "react";
import { useDeletePrograme, usePrograme } from "@/hooks/programesTraining/usePrograme";

import { Filter, Table, Trash, Edit, View, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Info,Stat } from "@/components/pages/pmu/Info";
import { Modal } from "@/components/shared/modal";

import { toIndianDate } from "@/components/utils/date";

import toast from "react-hot-toast";

interface Props {
  setActiveTab: (tab: string) => void;
  onAddNew: () => void;
  openCalendarTab: (programId: number) => void;
  onEdit: (row: any) => void;
}

const ROWS_PER_PAGE = 20;

export const ProgrammeTable: React.FC<Props> = ({ setActiveTab, openCalendarTab, onAddNew, onEdit }) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const { data: programData, isLoading } = usePrograme();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [durationFilter, setDurationFilter] = useState("all");


  const [search, setSearch] = useState("");
  /*  const [statusFilter, setStatusFilter] = useState("all"); */



  const [rescheduleFilter, setRescheduleFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);


  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const handleView = (programId: number) => {
    const selectedProgram = programData?.data?.find(
      (p: any) => p.programId === programId
    );

    if (!selectedProgram) {
      toast.error("Program not found");
      return;
    }

    setViewData(selectedProgram);
    setIsViewOpen(true);
  };


  const handleEdit = (proid: any) => { };

  const { mutate: deleteProgram } = useDeletePrograme();

  const handleDelete = (programId: number) => {
    const payload = { programId: programId }


    deleteProgram(payload, {
      onSuccess: () => {
        toast("Deleted sucees fully")
      },
      onError: (error) => {
        toast("Deleted faild")
      }
    })
    console.log("programId", programId)
  };


  const handleCalendar = (programId: number) => {
    console.log("click on the calanter button and select the program id ", programId)
    openCalendarTab(programId)
  };


  const uniqueLevels = useMemo(() => {
    if (!programData?.data) return [];

    return Array.from(
      new Set(programData.data.map((p: any) => p.levelName))
    );
  }, [programData]);



  const filteredData = useMemo(() => {
    if (!programData?.data) return [];

    return programData.data.filter((p: any) => {
      const searchText = search.toLowerCase();
      const matchesSearch =
        (p.activityName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.subActivityName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.departmentName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.levelName ?? "").toLowerCase().includes(search.toLowerCase());


      /*   const matchesStatus =
          statusFilter === "all" || Number(p.status) === Number(statusFilter); */

      const matchesReschedule =
        rescheduleFilter === "all" ||
        Number(p.reschedule) === Number(rescheduleFilter);

      const matchesLevel =
        levelFilter === "all" ||
        (p.levelName ?? "").toLowerCase() === levelFilter.toLowerCase();


      const recordDate = p.schedule?.date
        ? new Date(p.schedule.date)
        : null;

      const matchesFromDate =
        !fromDate || (recordDate && recordDate >= new Date(fromDate));

      const matchesToDate =
        !toDate || (recordDate && recordDate <= new Date(toDate));

      const matchesDuration =
        durationFilter === "all" ||
        (p.schedule?.duration ?? "").toLowerCase().includes(durationFilter.toLowerCase());


      return matchesSearch && matchesLevel && matchesReschedule && matchesFromDate && matchesToDate && matchesDuration;
    });
  }, [programData, search, levelFilter, rescheduleFilter, fromDate, toDate, durationFilter]);


  /* ================= RESET PAGE ON FILTER ================= */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, levelFilter, fromDate, toDate]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredData.slice(start, start + ROWS_PER_PAGE);
  }, [filteredData, currentPage]);

  /* ================= RECORD INFO ================= */
  const startRecord =
    filteredData.length === 0
      ? 0
      : (currentPage - 1) * ROWS_PER_PAGE + 1;

  const endRecord = Math.min(
    currentPage * ROWS_PER_PAGE,
    filteredData.length
  );


  const handleDownloadCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Financial Year",
      "Department",
      "Level",
      "Activity",
      "Component",
      "Topic",
      "Date",
      "Venue",
      "Session",
      "Duration",
      "Training Mode",
      "Target Group",
      "Resource Person",
      "Total Participants",
      "Male",
      "Female",
      "Govt Stakeholder",
      "Beneficiary",
      "Program Status",
      "Remarks"
    ];

    const rows = filteredData.map((p: any) => [
      p.financialYear,
      p.departmentName,
      p.levelName,
      p.activityName,
      p.componentName,
      p.topicName,
      toIndianDate(p.schedule?.date),
      p.schedule?.venue,
      p.schedule?.session,
      p.schedule?.duration,
      p.schedule?.trainingMode,
      p.targetGroup,
      p.resourcePerson,
      p.participants?.total,
      p.participants?.male,
      p.participants?.female,
      p.
        participants?.governmentStakeholder,
      p.participants?.beneficiary,
      p.reschedule === 1 ? "Rescheduled" : "On Schedule",
      p.remarks || ""
    ]);

    const csv =
      [headers, ...rows]
        .map((row) => row.map((v: any) => `"${v ?? ""}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "programme_list.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!filteredData.length) return;

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.text("Programme List", 14, 15);

    const tableColumn = [
      "FY",
      "Department",
      "Level",
      "Activity",
      "Component",
      "Topic",
      "Date",
      "Venue",
      "Session",
      "Duration",
      "Training Mode",
      "Target Group",
      "Resource Person",
      "Total",
      "Male",
      "Female",
      "Govt",
      "Beneficiary",
      "Status",
      "Remarks"

    ];

    const tableRows = filteredData.map((p: any) => [
      p.financialYear,
      p.departmentName,
      p.levelName,
      p.activityName,
      p.componentName,
      p.topicName,
      toIndianDate(p.schedule?.date),
      p.schedule?.venue,
      p.schedule?.session,
      p.schedule?.duration,
      p.schedule?.trainingMode,
      p.targetGroup,
      p.resourcePerson,
      p.participants?.total,
      p.participants?.male,
      p.participants?.female,
      p.participants?.governmentStakeholder,
      p.participants?.beneficiary,
      p.reschedule === 1 ? "Rescheduled" : "On Schedule",
      p.remarks || ""
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 64, 175] }, // blue
    });

    doc.save("programme_list.pdf");
  };



  return (
    <div className="min-h-screen p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-900 rounded-lg px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">Programme List</h2>

        <button
          onClick={onAddNew}
          className="mt-3 sm:mt-0 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-2 rounded-lg transition shadow-md"
        >
          + Add New Program
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-4 my-6">
        {/* Section Header */}
        <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <Filter className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-semibold text-blue-900">Filter Programmes</h2>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-5 items-center">
          <input
            type="text"
            placeholder="Search programme, activity, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Levels</option>
            {uniqueLevels?.map((level: any) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Durations</option>
            <option value="ours">Hours</option>
            <option value="Days">Days</option>
          </select>

          <select
            value={rescheduleFilter}
            onChange={(e) => setRescheduleFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Program Schedule</option>
            <option value="0">On Schedule</option>
            <option value="1">Rescheduled</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>



      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
        {/* Section Header */}
        <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
          <div className='flex items-center gap-3 '>
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <Table className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-semibold text-blue-900">Programmes/Activities Table</h2>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDownloadOpen((p) => !p)}
              className="
              flex items-center gap-2
              bg-green-600 hover:bg-green-700
              text-white
              px-6 py-2
              rounded-lg
              text-sm font-semibold
              shadow-lg
            "
            >
              ⬇ Download
            </button>

            {isDownloadOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    handleDownloadCSV();
                    setIsDownloadOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  📄 Download CSV
                </button>

                <button
                  onClick={() => {
                    handleDownloadPDF();
                    setIsDownloadOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  🧾 Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
            <table className="text-xs sm:text-sm md:text-[13px] text-gray-700 border-collapse">
            <thead className="bg-blue-50 text-gray-700 sticky top-0 z-10">
              <tr>
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Financial Year</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Department</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Level</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal"> Event Catgaory</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Component</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Topic</th>
                <th colSpan={3} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Schedule</th>
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Training Mode</th>
                {/* <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Target Group</th> */}
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Resource Person</th>
                {/* <th colSpan={5} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Participants</th> */}
                {/* <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Participants details upload</th> */}
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Program Reschedule</th>
                {/* <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Remark</th> */}
                <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Action</th>
              </tr>

              {/* Sub Headers → Date & Venue */}
              <tr>
                <th className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Date</th>
                <th className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Venue</th>
                <th className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Session</th>
                {/* <th className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Duration</th> */}

                {/* Participants sub cols */}
                {/* <th className="px-2 py-2 border border-gray-300 text-center font-semibold">Total</th>
                <th className="px-2 py-2 border border-gray-300 text-center font-semibold">Male</th>
                <th className="px-2 py-2 border border-gray-300 text-center font-semibold">Female</th>
                <th className="px-2 py-2 border border-gray-300 text-center font-semibold">Govt Stakeholder</th>
                <th className="px-2 py-2 border border-gray-300 text-center font-semibold">Beneficiary</th> */}
              </tr>
            </thead>


            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className=" flex justify-center py-4 text-center text-gray-500">
                    Loading programmes...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr className=" text-center text-gray-500 italic">
                  <td colSpan={15} className="py-2">
                    No matching programme found.
                  </td>
                </tr>
              ) : (
                filteredData.map((pro: any) => (
                  <tr key={pro.programId} className="hover:bg-gray-50 transition border-t">
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.financialYear}</td>
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.departmentName}</td>
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.levelName}</td>
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.activityName}</td>
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.componentName}</td>
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.topicName}</td>
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{toIndianDate(pro.schedule.date)}</td>
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.schedule.venue}</td>
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.schedule.session}</td>
                    {/* <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.schedule.duration}</td> */}
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.schedule.trainingMode}</td>
                    {/* <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.targetGroup}</td> */}
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.resourcePerson}</td>
                    {/* <td className="border px-2 py-2 border-gray-300 text-center font-semibold"> {pro.participants.total} </td> */}
                    {/* <td className="border px-2 py-2 border-gray-300 text-center text-blue-600 font-medium">
                      {pro.participants.male}
                    </td>

                    <td className="border px-2 py-2 border-gray-300 text-center text-pink-600 font-medium">
                      {pro.participants.female}
                    </td>

                    <td className="border px-2 py-2 border-gray-300 text-center text-green-600 font-medium">
                      {pro.participants.governmentStakeholder}
                    </td>

                    <td className="border px-2 py-2 border-gray-300 text-center text-purple-600 font-medium">
                      {pro.participants.beneficiary}
                    </td> */}

                    {/* <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.participantsFile}</td> */}
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${pro.reschedule === 1
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                        }`}
                      >
                        {pro.reschedule === 1 ? "Rescheduled" : "On Schedule"}
                      </span>
                    </td>
                    {/* <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{pro.remarks}</td> */}
                    <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">
                      <div className="flex flex-nowrap justify-center gap-2">
                        {/* <button
                        onClick={() => handleCalendar(pro.programId)}
                        disabled={pro.status !== 0}
                        className={`px-3 py-1.5 rounded-md text-xs shadow transition ${pro.status === 0
                          ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        Conduct Traning
                      </button> */}


                        <button
                          onClick={() => handleCalendar(pro.programId)}
                          disabled={pro.status !== 0}
                          className={`
    px-4 py-2 rounded-md font-medium transition-colors duration-200
    ${pro.status === 0
                              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `}
                          aria-label={`Conduct training for program ${pro.programName || pro.programId}`}
                          aria-disabled={pro.status !== 0}
                          title={pro.status !== 0 ? "Training cannot be conducted in current status" : "Start training session"}
                        >
                          Conduct Training
                        </button>
                        {/* <button
                        onClick={() => handleCalendar(pro.programId)}
                        className="px-3 py-1.5 rounded-md text-xs shadow bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Conduct Training
                      </button> */}


                        <button
                          onClick={() => onEdit(pro)}
                          disabled={pro.status !== 0} // <-- Add this line
                          className={`bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md shadow flex items-center justify-center 
                         ${pro.status !== 0 ? "opacity-50 cursor-not-allowed" : ""}`} // <-- Optional: visually indicate disabled
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleView(pro.programId)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md shadow"
                          title="View"
                        >
                          <View className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(pro.programId)}
                          // disabled={deleteMutation.isLoading}
                          className={`bg-red-500 hover:bg-red-600 text-white p-2 rounded-md shadow flex items-center justify-center `}
                        >
                          <Trash className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* ================= VIEW MODAL ================= */}
        
     <Modal
  isOpen={isViewOpen}
  onClose={() => setIsViewOpen(false)}
  size="full"
  className="w-[200vw] max-w-[1800px]" // Almost full width
>
  {viewData && (
  <div className="fixed inset-0 z-50 bg-white overflow-hidden">
  <div className="h-full flex flex-col">
    
    {/* HEADER - Fixed height */}
    <div className="flex-shrink-0 flex items-center justify-between border-b px-8 py-5 bg-white">
      <div>
        <h2 className="text-2xl font-bold text-blue-900">
          Programme Overview
        </h2>
        <p className="text-xs text-gray-500">
          View programme information (read only)
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-semibold
          ${viewData.reschedule === 1
              ? "bg-red-100 text-red-700 ring-1 ring-red-300"
              : "bg-green-100 text-green-700 ring-1 ring-green-300"
            }`}
        >
          {viewData.reschedule === 1 ? "Rescheduled" : "On Schedule"}
        </span>

        <button
          onClick={() => setIsViewOpen(false)}
          className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* BODY - Scrollable content */}
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex">
        
        {/* LEFT PANEL - Main content (70-80% width) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Basic Information */}
          <div className="rounded-xl border bg-blue-50 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-6 uppercase">
              Basic Information
            </h3>
            <div className="grid grid-cols-4 gap-8">
              <Info label="Financial Year" value={viewData.financialYear} />
              <Info label="Department" value={viewData.departmentName} />
              <Info label="Level" value={viewData.levelName} />
              <Info label="Activity" value={viewData.activityName} />
              <Info label="Component" value={viewData.componentName} />
              <Info label="Topic" value={viewData.topicName} />
              <Info label="Target Group" value={viewData.targetGroup} />
              <Info label="Resource Person" value={viewData.resourcePerson} />
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-6 uppercase">
              Schedule Details
            </h3>
            <div className="grid grid-cols-5 gap-8">
              <Info label="Date" value={toIndianDate(viewData.schedule?.date)} />
              <Info label="Venue" value={viewData.schedule?.venue} />
              <Info label="Session" value={viewData.schedule?.session} />
              <Info label="Duration" value={viewData.schedule?.duration} />
              <Info label="Training Mode" value={viewData.schedule?.trainingMode} />
            </div>
          </div>

          {/* Coordinator */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-6 uppercase">
              Coordinator Details
            </h3>
            <div className="grid grid-cols-4 gap-8">
              <Info label="Name" value={viewData.coordinator?.name} />
              <Info label="Designation" value={viewData.coordinator?.designation} />
              <Info label="Contact" value={viewData.coordinator?.contact} />
              <Info label="Email" value={viewData.coordinator?.email} />
            </div>
          </div>

        </div>

        {/* RIGHT PANEL - Sidebar (30-20% width) */}
        <div className="w-1/4 border-l bg-gray-50 overflow-y-auto p-8 space-y-8">
          
          {/* Participants Summary */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-6 uppercase">
              Participants Summary
            </h3>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Total Participants</p>
                <p className="text-4xl font-bold text-blue-700">{viewData.participants?.total || 0}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Male</p>
                  <p className="text-2xl font-bold text-blue-600">{viewData.participants?.male || 0}</p>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Female</p>
                  <p className="text-2xl font-bold text-pink-600">{viewData.participants?.female || 0}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Govt Stakeholder</span>
                  <span className="font-bold text-green-700">{viewData.participants?.governmentStakeholder || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Beneficiary</span>
                  <span className="font-bold text-purple-700">{viewData.participants?.beneficiary || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* File Download */}
          {viewData.participantsFile && (
            <a
              href={viewData.participantsFile}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="block w-full text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Participants File
              </div>
            </a>
          )}

          {/* Remarks */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-4 uppercase">
              Remarks
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
              <p className="text-gray-700 leading-relaxed">
                {viewData.remarks || <span className="text-gray-400 italic">No remarks provided</span>}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
  )}
</Modal>


        {/* PAGINATION + COUNT */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <span className="text-sm">
            Showing {startRecord}–{endRecord} of {filteredData.length}
          </span>

          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage(p => Math.min(p + 1, totalPages))
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
  
};
