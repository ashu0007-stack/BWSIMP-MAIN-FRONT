import React, { FC, useState } from 'react'
import { CropCostTable } from './CropCostTable';
import { CropCostForm } from './CropCostForm';

export const CostofCultivation: FC = () => {
    const [showForm, setShowForm] = useState(true);
    

    const user = sessionStorage.getItem("userdetail")
        ? JSON.parse(sessionStorage.getItem("userdetail")!)
        : null;
    console.log('user details', user?.user_level_id)

    const isUserLevel = user?.user_level_id === 1;

    return (
        <div>
            {isUserLevel ? (
                // Level 1 users see only table
                <CropCostTable isUserLevel={isUserLevel} onAddNew={() => setShowForm(false)} />
            ) : (
                // Other levels can toggle form/table
                showForm ? (
                    <CropCostTable isUserLevel={isUserLevel} onAddNew={() => setShowForm(false)} />
                ) : (
                    <CropCostForm userDetails={user} setShowForm={setShowForm} />
                )
            )}
        </div>
    )
}
