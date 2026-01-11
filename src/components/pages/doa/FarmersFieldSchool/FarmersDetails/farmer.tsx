import React, { FC, useState } from 'react'
import { FarmerProfileForm } from './FarmerProfileForm';
import { FarmersDetails } from './FarmerDetails';

export const Farmer: FC = () => {
  const [showForm, setShowForm] = useState(false);



  return (
    <div className="">
      {showForm ? (
        // Show form
        <FarmerProfileForm  setShowForm={setShowForm} />
      ) : (
        // Show table
        <FarmersDetails onAddNew={() => setShowForm(true)} />
      )}
    </div>
  );
}
