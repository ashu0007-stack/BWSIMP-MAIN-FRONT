import React, { FC, useState } from 'react'
import { TrainingTable } from './TraningTabel';
import { TrainingForm } from './Traningform';

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
        <TrainingForm  setShowForm={setShowForm} />
      ) : (
        // Show table
        <TrainingTable  onAddNew={() => setShowForm(true)} data={[]} />
      )}
    </div>
  );
}
