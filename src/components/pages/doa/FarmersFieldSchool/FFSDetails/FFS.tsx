import React, { FC, useState } from 'react'
import { FFSForm } from './FFSForm';
import { FSSDetails } from './FSSDetails';

export const FFS: FC = () => {

    const [showForm, setShowForm] = useState(false);

    return (
        <div className="">
            {showForm ? (
                // Show form
                <FFSForm  setShowForm={setShowForm} />
            ) : (
                // Show table
                <FSSDetails  onAddNew={() => setShowForm(true)} />
            )}
        </div>
    )
}
