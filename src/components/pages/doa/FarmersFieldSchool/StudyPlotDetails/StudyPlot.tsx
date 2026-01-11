import React, { FC, useState } from 'react'
import { FormValues, StudyForm } from './StudyPlotForm';
import { StudyDetails } from './StudyPlotDetails';

export const StudyPlot : FC = () => {
  const [StudyFormRecords, setStudyFormRecords] = useState<FormValues[]>([]);
  const [showForm, setShowForm] = useState(false);

  // const handleAddFarmer = (data: FormValues) => {
  //   setStudyFormRecords((prev) => [...prev, data]);
  //   setShowForm(false);
  // };

  return (
   <div className="">
        {showForm ? (
          // Show form
          <StudyForm setStudyFormRecords={setStudyFormRecords} setShowForm={setShowForm} />
        ) : (
          // Show table
          <StudyDetails data={StudyFormRecords} onAddNew={() => setShowForm(true)} />
        )}
      </div>
  );
}
