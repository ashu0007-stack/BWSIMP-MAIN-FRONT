import * as XLSX from "xlsx";

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportAllTrainingExcel = (rowsData: any[]) => {

  console.log("row data", rowsData)
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  /* ================= HEADER ROW 1 (MAIN HEADS) ================= */
 const headerRow1 = [

  "Training Details", "", "","","",
  // "Duration", "",
  // "Venue / Location with GPS",

  // "Resource Person Details", "", "",

  // "Target Groups (Officials)", "", "", "",

  // "Target Groups (WUA/Farmers)", "", "", "", "",

  // "Training Photo 2",
  // "Remarks"
];

const headerRow2 = [

  "Training ID / Batch",
  "Type of Training",
  "Topic of Training",

  // "Start Date",
  // "End Date",

  // "",

  // "Trainer’s Name",
  // "Designation / Affiliation",
  // "Contact Information",

  // "Participant’s Name",
  // "Position",
  // "Contact",
  // "Gender (M/F)",

  // "Participant’s Name",
  // "DBT Reg. No",
  // "Father’s Name",
  // "Contact",
  // "Category (Gen/OBC/SC/ST)",

  // "",
  // ""
];

  XLSX.utils.sheet_add_aoa(worksheet, [headerRow1, headerRow2], {
    origin: "A1",
  });

  /* ================= MERGE CONFIG ================= */
  worksheet["!merges"] = [
    { s: { r: 0, c: 1 }, e: { r: 1, c: 4 } },       // Training Details
    // { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } },       // Duration Details
    // { s: { r: 0, c: 7 }, e: { r: 0, c: 7 } },       // Venue Details
    // { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } },       // Resource Person
    // { s: { r: 0, c: 11 }, e: { r: 0, c: 14 } },     // Officials
    // { s: { r: 0, c: 15 }, e: { r: 0, c: 20 } },     // Farmers
    // { s: { r: 0, c: 21 }, e: { r: 1, c: 21 } },     // Training Photo
    // { s: { r: 0, c: 22 }, e: { r: 1, c: 22 } },     // Remarks
  ];

  /* ================= ADD DATA ROWS ================= */
  XLSX.utils.sheet_add_json(worksheet, rowsData, {
    origin: "A3",
    skipHeader: true,
  });

  /* ================= HEADER STYLE (BOLD) ================= */
  Object.keys(worksheet).forEach((cell) => {
    if (cell.startsWith("A1") || cell.startsWith("A2") || cell.includes("1") || cell.includes("2")) {
      if (!worksheet[cell].s) worksheet[cell].s = {};
      worksheet[cell].s.font = { bold: true };
      worksheet[cell].s.alignment = { vertical: "center", horizontal: "center", wrapText: true };
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Training Report");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  downloadFile(blob, "Training_Report.xlsx");
};



/* ================= Main Export Function ================= */
export const exportSingleTrainingExcel = (
  training: any,
  officials: any[],
  farmers: any[]
) => {
  const workbook = XLSX.utils.book_new();

  /* ================= Sheet-1 : Training Info ================= */
  const trainingInfo = [
    ["Training ID", training.training_id],
    ["Type of Training", training.type_of_training],
    ["Topic of Training", training.topic_of_training],
    ["Start Date", training.start_date],
    ["End Date", training.end_date],
    ["Venue", training.venue],
    ["Trainer Name", training.resource_person_name],
    ["Designation", training.resource_person_designation],
    ["Contact", training.contact_info],
    ["Remarks", training.remarks || "-"],
  ];

  const trainingSheet = XLSX.utils.aoa_to_sheet(trainingInfo);
  XLSX.utils.book_append_sheet(workbook, trainingSheet, "Training Info");

  /* ================= Sheet-2 : Officials ================= */
  if (officials.length > 0) {
    const formattedOfficials = officials.map((o: any) => ({
      Name: o.name,
      Position: o.position,
      Contact: o.contact,
      Gender: o.gender,
    }));

    const officialsSheet =
      XLSX.utils.json_to_sheet(formattedOfficials);
    XLSX.utils.book_append_sheet(workbook, officialsSheet, "Officials");
  }

  /* ================= Sheet-3 : Farmers ================= */
  if (farmers.length > 0) {
    const formattedFarmers = farmers.map((f: any) => ({
      Name: f.name,
      "DBT No": f.dbt_no,
      "Father Name": f.father_name,
      Contact: f.contact,
      Gender: f.gender,
      Category: f.category,
    }));

    const farmersSheet =
      XLSX.utils.json_to_sheet(formattedFarmers);
    XLSX.utils.book_append_sheet(workbook, farmersSheet, "Farmers");
  }

  /* ================= Generate Excel ================= */
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  downloadFile(blob, `Training_${training.training_id}.xlsx`);
};

