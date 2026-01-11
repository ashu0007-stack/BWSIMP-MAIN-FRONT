import React, {
  FC,
  useMemo,
  useState,
  useEffect
} from "react";
import { Filter, Table, X } from "lucide-react";
import { useConduct } from "@/hooks/programesTraining/useCondcut";
import { Modal } from "@/components/shared/modal";
import { Eye, } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const ROWS_PER_PAGE = 20;

export const ConductProgrammeTable: FC = () => {
  const { data: cunductData, isLoading } = useConduct();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [fyFilter, setFyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  const handleView = (row: any) => {
    setViewData(row);
    setIsViewOpen(true);
  };

  /* ================= NORMALIZE DATA ================= */
  const allData = useMemo(() => {
    if (!cunductData?.data) return [];
    return cunductData.data.map((p: any) => ({
      ...p,
      financial_year: String(p.financial_year),
      conducted_by: p.conducted_by || "",
      designation: p.designation || "",
    }));
  }, [cunductData]);

  /* ================= FILTER DATA ================= */
  const filteredData = useMemo(() => {

    return allData.filter((p: any) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        p.conducted_by.toLowerCase().includes(searchText) ||
        p.designation.toLowerCase().includes(searchText);

      const matchesFy =
        fyFilter === "all" || p.financial_year === fyFilter;

      /* ===== DATE RANGE FILTER ===== */
      const recordDate = new Date(p.conduct_date);

      const matchesFromDate =
        !fromDate || recordDate >= new Date(fromDate);

      const matchesToDate =
        !toDate || recordDate <= new Date(toDate);

      return (
        matchesSearch &&
        matchesFy &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [allData, search, fyFilter, fromDate, toDate]);

  /* ================= RESET PAGE ON FILTER ================= */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fyFilter, fromDate, toDate]);

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
      "Conducted By",
      "Designation",
      "Contact",
      "Email",
      "Conduct Date",
      "Total Participants",
      "Male",
      "Female",
      "Govt Stakeholder",
      "Beneficiary",
      "Remarks"
    ];

    const rows = filteredData.map((c: any) => [
      c.financial_year,
      c.conducted_by,
      c.designation,
      c.contact,
      c.email,
      c.conduct_date,
      c.total_participants,
      c.participants_male,
      c.participants_female,
      c.government_stakeholder,
      c.beneficiary,
      c.remarks || ""
    ]);

    const csvContent =
      [headers, ...rows]
        .map(row =>
          row
            .map((val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "conduct_programme_list.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!filteredData.length) return;

    const doc = new jsPDF("l", "mm", "a4"); // landscape

    doc.setFontSize(14);
    doc.text("Conduct Programme List", 14, 15);

    const headers = [[
      "FY",
      "Conducted By",
      "Designation",
      "Contact",
      "Email",
      "Conduct Date",
      "Total",
      "Male",
      "Female",
      "Govt Stakeholder",
      "Beneficiary",
      "Remarks"
    ]];

    const body = filteredData.map((c: any) => [
      c.financial_year,
      c.conducted_by,
      c.designation,
      c.contact,
      c.email,
      c.conduct_date,
      c.total_participants,
      c.participants_male,
      c.participants_female,
      c.government_stakeholder,
      c.beneficiary,
      c.remarks || ""
    ]);

    autoTable(doc, {
      head: headers,
      body,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 64, 175] }, // blue header
    });

    doc.save("conduct_programme_list.pdf");
  };



  return (
    <div className="min-h-screen p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      {/* HEADER */}
      <div className="bg-blue-900 rounded-lg px-5 py-4 mb-6">
        <h2 className="text-xl font-bold text-white">
          Conduct Programme List
        </h2>
      </div>

      {/* FILTER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
        {/* Section Header */}
        <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
          <div className='flex items-center gap-3 '>
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <Filter className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-semibold text-blue-900">Filter Programmes</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search conducted by or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />

          <select
            value={fyFilter}
            onChange={(e) => setFyFilter(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="all">All Financial Year</option>
            {Array.from(
              new Set<string>(
                cunductData?.data?.map((p: any) =>
                  String(p.financial_year)
                ) ?? []
              )
            ).map((fy) => (
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>

          {/* FROM DATE */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />

          {/* TO DATE */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
        {/* Section Header */}
        <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
          <div className='flex items-center gap-3 '>
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <Table className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-semibold text-blue-900">Conduct Programmes Table</h2>
          </div>


          <div className="relative">
            <button
              onClick={() => setIsDownloadOpen((p) => !p)}
              className="
      flex items-center gap-2
      bg-emerald-600 hover:bg-emerald-700
      text-white
      px-5 py-2
      rounded-md
      text-sm font-semibold
      shadow
    "
            >
              ⬇ Download
            </button>

            {isDownloadOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    handleDownloadCSV();
                    setIsDownloadOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  📄 Download CSV
                </button>

                <button
                  onClick={() => {
                    handleDownloadPDF();
                    setIsDownloadOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  🧾 Download PDF
                </button>
              </div>
            )}
          </div>

        </div>
        <table className="w-full text-xs sm:text-sm md:text-[13px] text-gray-700 border-collapse">
          <thead className="bg-blue-50 text-gray-700 sticky top-0 z-10">
            <tr>
              <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">FY</th>
              <th colSpan={4} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Course Coordinator/Organiser detail</th>

              <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Date</th>
              <th colSpan={5} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Participants</th>

              {/*           <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Feedback</th> */}
              {/*  <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Status</th> */}
              <th rowSpan={2} className="px-2 py-2 border border-gray-300 text-center font-semibold break-words whitespace-normal">Action</th>
            </tr>

            <tr>

              <th className="border px-2 py-2 text-center font-semibold">Name</th>
              <th className="border px-2 py-2 text-center font-semibold text-blue-600">Designation</th>
              <th className="border px-2 py-2 text-center font-semibold text-pink-600">Contact No.</th>
              <th className="border px-2 py-2 text-center font-semibold text-green-600">Email</th>



              <th className="border px-2 py-2 text-center font-semibold">Total</th>
              <th className="border px-2 py-2 text-center font-semibold text-blue-600">Male</th>
              <th className="border px-2 py-2 text-center font-semibold text-pink-600">Female</th>
              <th className="border px-2 py-2 text-center font-semibold text-green-600">Govt Stakeholder</th>
              <th className="border px-2 py-2 text-center font-semibold text-purple-600">Beneficiary</th>
            </tr>

          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No record found
                </td>
              </tr>
            ) : (
              paginatedData.map((c: any) => (
                <tr key={c.conduct_id}>
                  <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{c.financial_year}</td>
                  <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{c.conducted_by}</td>
                  <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{c.designation}</td>
                  <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{c.contact}</td>
                  <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{c.email}</td>
                  <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{c.conduct_date}</td>
                  {/* Participants */}
                  <td className="border px-2 py-2 text-center">{c.total_participants}</td>
                  <td className="border px-2 py-2 text-center text-blue-600">{c.participants_male}</td>
                  <td className="border px-2 py-2 text-center text-pink-600">{c.participants_female}</td>
                  <td className="border px-2 py-2 text-center text-green-600">{c.government_stakeholder}</td>
                  <td className="border px-2 py-2 text-center text-purple-600">{c.beneficiary}</td>
                  {/*           <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal">{c.remarks}</td> */}

                  {/*    <td className="border px-2 py-2 border-gray-300 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${c.is_reschedule === 1
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {c.is_reschedule === 1 ? "Rescheduled" : "On Schedule"}
                                        </span>
                                    </td> */}



                  {/*   <td className="border px-2 py-2 border-gray-300 break-words whitespace-normal text-center"> */}
                  {/*   <div className="flex gap-2 justify-center"> */}
                  {/* <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md">
                                                Reschedule
                                            </button> */}
                  {/*   <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md">
                                                View
                                            </button> */}
                  {/* </div> */}
                  {/* </td> */}

                  <td className="border px-2 py-2 text-center">
                    <button
                      onClick={() => handleView(c)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md shadow"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          size="xl"
        >
          {viewData && (
            <div className="space-y-6 text-sm text-gray-700">


              {/* ================= HEADER ================= */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                    Conduct Programme Overview
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    View conducted programme details (read only)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsViewOpen(false)}
                  className="ml-2 rounded-full p-2 text-gray-500
                 hover:bg-red-50 hover:text-red-600
                 transition"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ================= BASIC INFORMATION ================= */}
              <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-white px-5 py-3 shadow-sm">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Financial Year</p>
                    <p className="font-medium">{viewData.financial_year}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Conduct Date</p>
                    <p className="font-medium">{viewData.conduct_date}</p>
                  </div>
                </div>
              </div>

              {/* ================= COORDINATOR DETAILS ================= */}
              <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide">
                  Coordinator Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{viewData.conducted_by}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Designation</p>
                    <p className="font-medium">{viewData.designation}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-medium">{viewData.contact}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{viewData.email}</p>
                  </div>
                </div>
              </div>

              {/* ================= PARTICIPANTS ================= */}
              <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-white px-5 py-3 shadow-sm">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide">
                  Participants Summary
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div className="bg-white rounded-xl p-4 shadow">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-bold">{viewData.total_participants}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow">
                    <p className="text-xs text-gray-500">Male</p>
                    <p className="text-xl font-bold text-blue-600">
                      {viewData.participants_male}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow">
                    <p className="text-xs text-gray-500">Female</p>
                    <p className="text-xl font-bold text-pink-600">
                      {viewData.participants_female}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow">
                    <p className="text-xs text-gray-500">Govt Stakeholder</p>
                    <p className="text-xl font-bold text-green-600">
                      {viewData.government_stakeholder}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow">
                    <p className="text-xs text-gray-500">Beneficiary</p>
                    <p className="text-xl font-bold text-purple-600">
                      {viewData.beneficiary}
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= FILES & REMARKS ================= */}
              <div className="rounded-xl border bg-white px-5 py-3 shadow-sm space-y-4">

                {viewData.participants_file && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${viewData.participants_file}`}
                    target="_blank"
                    className="inline-flex items-center gap-2
                       bg-gradient-to-r from-green-600 to-green-700
                       hover:from-green-700 hover:to-green-800
                       text-white px-5 py-2.5 rounded-lg
                       text-sm font-semibold shadow-md transition"
                  >
                    ⬇ Download Participants List
                  </a>
                )}

                {viewData.training_photo && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${viewData.training_photo}`}
                    target="_blank"
                    className="inline-flex items-center gap-2
                       bg-blue-600 hover:bg-blue-700
                       text-white px-5 py-2.5 rounded-lg
                       text-sm font-semibold shadow-md transition"
                  >
                    📷 View Training Photo
                  </a>
                )}

                {viewData.field_visit_file && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${viewData.field_visit_file}`}
                    target="_blank"
                    className="inline-flex items-center gap-2
                       bg-purple-600 hover:bg-purple-700
                       text-white px-5 py-2.5 rounded-lg
                       text-sm font-semibold shadow-md transition"
                  >
                    📄 Download Field Visit Report
                  </a>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <p>
                    <span className="font-semibold">Remarks:</span>{" "}
                    {viewData.remarks || <span className="text-gray-400">—</span>}
                  </p>
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
