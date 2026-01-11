import React, { FC, useState } from "react";
import { ProgrammeTable } from "./traningDetails";
import { CreateTrainig } from "./createTrainig";
import { EditTraining } from "./EditTraining";

interface Props {
  setActiveTab: (tab: string) => void;
  openCalendarTab: (proid: number) => void;
}

export const Programs: FC<Props> = ({ setActiveTab, openCalendarTab }) => {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editData, setEditData] = useState<any>(null);

  return (
    <>
      {mode === "list" && (
        <ProgrammeTable
          setActiveTab={setActiveTab}
          openCalendarTab={openCalendarTab}
          onAddNew={() => setMode("create")}
          onEdit={(row) => {
            console.log("EDIT ROW 👉", row); // 🔍 confirm data
            setEditData(row);
            setMode("edit");
          }}
        />
      )}

      {mode === "create" && (
        <CreateTrainig setShowForm={() => setMode("list")} />
      )}

      {mode === "edit" && editData && (
        <EditTraining
          editData={editData}
          onBack={() => setMode("list")}
        />
      )}
    </>
  );
};

