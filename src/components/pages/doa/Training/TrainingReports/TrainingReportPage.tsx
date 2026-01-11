import React, { FC, useState } from "react";
import { LocationFilter } from "@/components/shared/LocationFilter";
import { useDistricts } from "@/hooks/location/useDistricts";
import { useBlocks } from "@/hooks/location/useBlocks";
import { useClusters } from "@/hooks/location/useClusters";
import { trainingData, officialData, farmerData } from "./trainingData";
import { Download, Filter, Table } from "lucide-react";
import { Users, UserCheck, Info } from "lucide-react";
import { Pagination } from "@/components/shared/Pagination";
import { exportAllTrainingExcel, exportSingleTrainingExcel } from "@/components/utils/exportTrainingReportCSV";

export const TrainingReportTable: FC = () => {
  const [selected, setSelected] = useState<any>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: districtData, isPending: loadingDistricts } = useDistricts();
  const { data: blockData, isLoading: loadingBlocks } = useBlocks(selected.district);
  const { data: clusterData, isPending: loadingClusters } = useClusters(selected.block);

  const toggleRow = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const TRAINING_PAGE_SIZE = 20;
  const [trainingPage, setTrainingPage] = useState(1);

  const totalTrainingPages = Math.ceil(
    trainingData.length / TRAINING_PAGE_SIZE
  );

  const paginatedTrainings = trainingData.slice(
    (trainingPage - 1) * TRAINING_PAGE_SIZE,
    trainingPage * TRAINING_PAGE_SIZE
  );
  return (
    <div className="min-h-screen p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-900 rounded-lg px-5 py-4 mb-6 shadow">
        <h2 className="text-xl font-bold text-white tracking-wide">Training Report</h2>

        {/* <button
          onClick={onAddNew}
          className="mt-3 sm:mt-0 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-5 py-2 rounded-lg transition shadow-md"
        >
          + Add New Program
        </button> */}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
        {/* Section Header */}
        <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
          <div className='flex items-center gap-3 '>
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <Filter className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-semibold text-blue-900">Filter Training</h2>
          </div>
        </div>
        <LocationFilter
          levels={["district", "block", "cluster"]}
          data={{
            district: districtData?.data?.map((d: any) => ({
              id: d.district_id,
              name: d.district_name,
            })) || [],
            block: blockData?.data?.map((b: any) => ({
              id: b.block_id,
              name: b.block_name,
            })) || [],
            cluster: clusterData?.data?.map((c: any) => ({
              id: c.cluster_id,
              name: c.cluster_name,
            })) || [],
          }}
          loading={{
            district: loadingDistricts,
            block: loadingBlocks,
            cluster: loadingClusters,
          }}
          onChange={setSelected}
        />
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 my-6">
        <div className="flex items-center justify-between w-full gap-2 mb-3 pb-3 border-b border-slate-200">
          <div className='flex items-center gap-3 '>
            <div className="w-1.5 h-8 bg-blue-900 rounded-full"></div>
            <Table className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-semibold text-blue-900">Training Details</h2>
          </div>
          <button
            onClick={() =>
              exportAllTrainingExcel(trainingData)
            }
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow"
          >
            <Download className="w-4 h-4" />
            Download Full Report (Excel)
          </button>
        </div>
        <table className="w-full text-xs sm:text-sm md:text-[13px] text-gray-700 border-collapse">
          <thead className="bg-blue-50 text-gray-700 sticky top-0 z-10">
            <tr>
              <th rowSpan={2} className="px-2 py-2 border text-center font-semibold">
                Training ID / Batch
              </th>
              <th rowSpan={2} className="px-2 py-2 border text-center font-semibold">
                Type of Training
              </th>
              <th rowSpan={2} className="px-2 py-2 border text-center font-semibold">
                Topic of Training
              </th>

              {/* Duration Parent */}
              <th colSpan={2} className="px-2 py-2 border text-center font-semibold">
                Duration
              </th>

              <th rowSpan={2} className="px-2 py-2 border text-center font-semibold">
                Venue
              </th>
              {/* <th rowSpan={2} className="px-2 py-2 border text-center font-semibold">
                Target Groups
              </th> */}
              <th rowSpan={2} className="px-2 py-2 border text-center font-semibold">
                Action
              </th>
            </tr>
            {/* 🔹 SUB HEADER ROW */}
            <tr>
              <th className="px-2 py-2 border text-center font-medium">
                Start Date
              </th>
              <th className="px-2 py-2 border text-center font-medium">
                End Date
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedTrainings.map((t: any, index: number) => {
              const officials = officialData.filter((o: any) => o.training_id === t.training_id);
              const farmers = farmerData.filter((f: any) => f.training_id === t.training_id);
              const isOpen = expandedId === t.training_id;

              return (
                <React.Fragment key={t.training_id}>
                  {/* 🔹 MAIN ROW */}
                  <tr
                    onClick={() => toggleRow(t.training_id)}
                    className={`border-b hover:bg-blue-50 transition-all cursor-pointer
                      ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <td className="p-2 text-center font-medium text-blue-700">
                      {t.training_id}
                    </td>
                    <td className="p-2 text-center">{t.type_of_training}</td>
                    <td className="p-2 text-center break-words">
                      {t.topic_of_training}
                    </td>
                    <td className="p-2 text-center">{t.start_date}</td>
                    <td className="p-2 text-center">{t.end_date}</td>
                    <td className="p-2 text-center break-words">{t.venue}</td>
                    {/* <td className="p-2 text-center font-semibold"></td> */}
                    <td className="p-2 text-center">
                      <td className="p-2 text-center flex justify-center gap-2">
                        {/* View / Hide */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(t.training_id);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>

                        {/* Excel Download */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportSingleTrainingExcel(t, officials, farmers);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                        >
                          Excel
                        </button>
                      </td>
                    </td>
                  </tr>

                  {/* 🔹 EXPANDED ROW */}
                  {isOpen && (
                    <tr className="bg-gray-50">
                      <td colSpan={9} className="p-4">
                        <ExpandedTrainingDetails
                          training={t}
                          officials={officials}
                          farmers={farmers}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        <Pagination
          currentPage={trainingPage}
          totalPages={totalTrainingPages}
          onPageChange={setTrainingPage}
        />
      </div>

    </div>
  );
};




const ExpandedTrainingDetails = ({ training, officials, farmers }: any) => {
  const [activeTab, setActiveTab] = useState<"info" | "officials" | "farmers">(
    "info"
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">

      {/* 🔹 TABS HEADER */}
      <div className="flex flex-wrap gap-2 border-b mb-4">
        <TabButton
          active={activeTab === "info"}
          onClick={() => setActiveTab("info")}
          label="Training Info"
          icon={<Info className="w-4 h-4" />}
        />

        <TabButton
          active={activeTab === "officials"}
          onClick={() => setActiveTab("officials")}
          label={`Officials (${officials.length})`}
          icon={<Users className="w-4 h-4" />}
        />

        <TabButton
          active={activeTab === "farmers"}
          onClick={() => setActiveTab("farmers")}
          label={`Farmers (${farmers.length})`}
          icon={<UserCheck className="w-4 h-4" />}
        />
      </div>

      {/* 🔹 TAB CONTENT */}
      {activeTab === "info" && <TrainingInfo training={training} />}

      {activeTab === "officials" && (
        <ScrollableTable
          headers={["Name", "Position", "Contact", "Gender"]}
          rows={officials.map((o: any) => [
            o.name,
            o.position,
            o.contact,
            o.gender,
          ])}
          color="blue"
        />
      )}

      {activeTab === "farmers" && (
        <ScrollableTable
          headers={[
            "Name",
            "DBT",
            "Father's Name",
            "Contact",
            "Gender",
            "Category",
          ]}
          rows={farmers.map((f: any) => [
            f.name,
            f.dbt_no,
            f.father_name,
            f.contact,
            f.gender,
            f.category,
          ])}
          color="green"
        />
      )}
    </div>
  );
};

export default ExpandedTrainingDetails;




const TabButton = ({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm font-medium transition
      ${active
        ? "bg-blue-900 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
  >
    {icon}
    {label}
  </button>
);




const TrainingInfo = ({ training }: any) => (
  <div className="border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
    <InfoItem label="Trainer Name" value={training.resource_person_name} />
    <InfoItem
      label="Designation"
      value={training.resource_person_designation}
    />
    <InfoItem
      label="Resource Affiliation"
      value={training.resource_affiliation}
    />
    <InfoItem label="Contact" value={training.contact_info} />
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);


type ScrollableTableProps = {
  headers: string[];
  rows: (string | number | null)[][];
  color: "blue" | "green";
};
export const ScrollableTable: FC<ScrollableTableProps> = ({
  headers,
  rows,
  color,
}) => {
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);

  const paginatedRows = rows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const hoverClass =
    color === "blue" ? "hover:bg-blue-50" : "hover:bg-green-50";

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-xs text-gray-700">
          <thead
            className={`sticky top-0 z-10 ${color === "blue" ? "bg-blue-100" : "bg-green-100"
              }`}
          >
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-2 border text-center font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedRows.map((row, i) => (
              <tr
                key={i}
                className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${hoverClass}`}
              >
                {row.map((cell, j) => (
                  <td key={j} className="p-2 border text-center">
                    {cell ?? "-"}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="p-4 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};



