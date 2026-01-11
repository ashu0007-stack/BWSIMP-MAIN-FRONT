import React, { FC } from 'react'
import FinanceTabs from './FinanceTabs';
import { Sprout } from 'lucide-react';

export const Finance: FC = () => {
    // const [showForm, setShowForm] = useState(false);
    return (
        // <div className="p-6">
        //     <h1 className="text-2xl font-bold mb-2">
        //         Bihar Water Security and Irrigation Modernization Project (BWSIMP)
        //     </h1>
        //     <p className="text-sm text-gray-600 mb-6">
        //         Implementing Agency : DoA
        //     </p>

        //     <FinanceTabs />
        // </div>
        <div className="p-4 bg-white shadow-md rounded-xl mt-4 border border-gray-200">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-6 rounded-xl shadow-md mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Sprout className="w-8 h-8" />
                    Bihar Water Security and Irrigation Modernization Project (BWSIMP)
                </h1>
                <p className="text-green-100 mt-2">Implementing Agency : DoA</p>
            </div>

            <FinanceTabs />
        </div>
    )
}
