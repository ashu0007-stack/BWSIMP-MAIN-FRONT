import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  programData: any;
  cunductData: any;
}

export const TrainingSummary: React.FC<any> = ({
  programData,
  cunductData,
}) => {
  const [filterDate, setFilterDate] = useState("");
   const [openDownload, setOpenDownload] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDownload(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  /* =========================
     FILTERED CONDUCT DATA
  ========================== */
  const filteredConduct = filterDate
    ? cunductData?.data?.filter(
        (row: any) => row.conduct_date <= filterDate
      )
    : cunductData?.data ?? [];

  /* =========================
     TRAININGS
  ========================== */
  const totalTrainings = programData?.data?.length ?? 0;
  const conductedTrainings = filteredConduct?.length ?? 0;

  const achievementPercentage =
    totalTrainings > 0
      ? (conductedTrainings / totalTrainings) * 100
      : 0;

  /* =========================
     PARTICIPANTS
  ========================== */
  const totalPlannedParticipants = Array.isArray(programData?.data)
    ? programData.data.reduce(
        (sum: number, row: any) =>
          sum + (row?.participants?.total ?? 0),
        0
      )
    : 0;

  const totalConductedParticipants = Array.isArray(filteredConduct)
    ? filteredConduct.reduce(
        (sum: number, row: any) =>
          sum + (row?.total_participants ?? 0),
        0
      )
    : 0;

  const achievementParticipants =
    totalPlannedParticipants > 0
      ? (totalConductedParticipants /
          totalPlannedParticipants) *
        100
      : 0;

  /* =========================
     ON-SCHEDULE
  ========================== */
  const totalConducted = filteredConduct?.length ?? 0;

  const onScheduleConducted = Array.isArray(filteredConduct)
    ? filteredConduct.filter(
        (row: any) => row.is_reschedule === 0
      ).length
    : 0;

  const onScheduleAchievement =
    totalConducted > 0
      ? (onScheduleConducted / totalConducted) *
        100
      : 0;

  /* =========================
     YEAR RANGE
  ========================== */
  const getYearRange = () => {
    if (!filteredConduct || filteredConduct.length === 0)
      return "All";

    const years = filteredConduct.map(
      (row: any) =>
        new Date(row.conduct_date).getFullYear()
    );

    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return minYear === maxYear
      ? `${minYear}`
      : `${minYear}-${maxYear}`;
  };


//csv

  const downloadSummaryCSV = () => {
    const yearRange = getYearRange();

    const rows = [
      ["Training Programme Summary"],
      [`Year / Period: ${yearRange}`],
      [""],
      ["Indicator", "Planned", "Conducted", "Achievement (%)"],
      [
        "Number of Trainings",
        totalTrainings,
        conductedTrainings,
        achievementPercentage.toFixed(0),
      ],
      [
        "Number of Participants",
        totalPlannedParticipants,
        totalConductedParticipants,
        achievementParticipants.toFixed(0),
      ],
      [
        "Training Completed on Schedule",
        "100%",
        onScheduleConducted,
        onScheduleAchievement.toFixed(0),
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `training_summary_${yearRange}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* =========================
     PDF DOWNLOAD
  ========================== */
  const downloadSummaryPDF = () => {
    const doc = new jsPDF();
    const yearRange = getYearRange();

    doc.setFontSize(14);
    doc.text("Training Programme Summary", 14, 15);

    doc.setFontSize(10);
    doc.text(`Year / Period: ${yearRange}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [
        ["Indicator", "Planned", "Conducted", "Achievement (%)"],
      ],
      body: [
        [
          "Number of Trainings",
          totalTrainings,
          conductedTrainings,
          `${achievementPercentage.toFixed(0)}%`,
        ],
        [
          "Number of Participants",
          totalPlannedParticipants,
          totalConductedParticipants,
          `${achievementParticipants.toFixed(0)}%`,
        ],
        [
          "Training Completed on Schedule",
          "100%",
          onScheduleConducted,
          `${onScheduleAchievement.toFixed(0)}%`,
        ],
      ],
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
      },
    });

    doc.save(`training_summary_${yearRange}.pdf`);
  };

 
  
 



  /* =========================
     UI
  ========================== */
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-900">
          Training Programme Summary
        </h2>

             <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenDownload(!openDownload)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Download
            <span
              className={`transition-transform ${
                openDownload ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {openDownload && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  downloadSummaryCSV();
                  setOpenDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Download CSV
              </button>

              <button
                onClick={() => {
                  downloadSummaryPDF();
                  setOpenDownload(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Download PDF
              </button>
            </div>
    )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="border px-4 py-2 text-left">
                Indicator
              </th>
              <th className="border px-4 py-2 text-center">
                Planned
              </th>
              <th className="border px-4 py-2 text-center">
                Conducted
              </th>
              <th className="border px-4 py-2 text-center">
                Achievement (%)
              </th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            <tr>
              <td className="border px-4 py-2 font-medium">
                Number of Trainings
              </td>
              <td className="border px-4 py-2 text-center">
                {totalTrainings}
              </td>
              <td className="border px-4 py-2 text-center">
                {conductedTrainings}
              </td>
              <td className="border px-4 py-2 text-center">
                {achievementPercentage.toFixed(0)}%
              </td>
            </tr>

            <tr>
              <td className="border px-4 py-2 font-medium">
                Number of Participants
              </td>
              <td className="border px-4 py-2 text-center">
                {totalPlannedParticipants}
              </td>
              <td className="border px-4 py-2 text-center">
                {totalConductedParticipants}
              </td>
              <td className="border px-4 py-2 text-center">
                {achievementParticipants.toFixed(0)}%
              </td>
            </tr>

            <tr>
              <td className="border px-4 py-2 font-medium">
                Training Completed on Schedule
              </td>
              <td className="border px-4 py-2 text-center">
                100%
              </td>
              <td className="border px-4 py-2 text-center font-semibold text-green-700">
                {onScheduleConducted}
              </td>
              <td className="border px-4 py-2 text-center font-semibold text-green-700">
                {onScheduleAchievement.toFixed(0)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>    
    </div>
  );
};
