import React, { FC, useState } from 'react'
import { TrainingForm } from './Traningform';
import { TrainingTable } from './TraningTabel';

export const Training: FC = () => {
  const [showForm, setShowForm] = useState(false);

  // const handleAddFarmer = (data: TrainingFormValues) => {
  //   // setTrainingRecords(prev => [...prev, data]);
  //   setShowForm(false);

  // };

  return (
    <div className="">
      {showForm ? (
        // Show form
        
        <TrainingTable  onAddNew={() => setShowForm(true)}/>
      ) : (
        // Show table
        <TrainingForm  setShowForm={setShowForm} />
      )}

       {/* <TrainingForm  setShowForm={setShowForm} /> */}
       {/* <TrainingDetails  onAddNew={() => setShowForm(true)} /> */}
       {/* <TrainingReportPage /> */}
    </div>
  );
}
