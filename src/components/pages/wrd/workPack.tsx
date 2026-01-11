import React, { FC } from 'react';

export const CurrentYearExpenditureForm : FC = () => {
  return (
    <div className="max-w-305 mx-auto p-2  bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold mb-4 bg-blue-900 text-white px-4 py-2 rounded">
        Current Year Expenditure
      </h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Financial Year</label>
          <select className="w-full mt-1 p-2 border rounded-md">
            <option>-Select Financial Year-</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Activity</label>
          <select className="w-full mt-1 p-2 border rounded-md">
            <option>Please Select AWP Activity</option>
          </select>
        </div>

        {/* Row 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Package</label>
          <select className="w-full mt-1 p-2 border rounded-md">
            <option>Please Select Package</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">PIP Expenditure</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md"  />
        </div>

        {/* Row 3 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">PIP Planned Amount</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md"  />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Expenditure</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md"  />
        </div>

        {/* Row 4 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Planned Amount</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md"  />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Balanced Amount</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md"  />
        </div>

        {/* Row 5 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Package Awarded Amount</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Package Expenditure</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md"  />
        </div>

        {/* Row 6 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Package Balanced Amount</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md"/>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bill No</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md" />
        </div>

        {/* Row 7 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bill Amount (INR)</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bill Date</label>
          <div className="flex space-x-2 mt-1">
            <input type="text" placeholder="Day" className="w-1/3 p-2 border rounded-md" />
            <input type="text" placeholder="Month" className="w-1/3 p-2 border rounded-md" />
            <input type="text" placeholder="Year" className="w-1/3 p-2 border rounded-md" />
          </div>
        </div>

        {/* Row 8 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mode of Payment</label>
          <select className="w-full mt-1 p-2 border rounded-md">
            <option>Mode of Payment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">DD/Challan/Transaction No</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md" />
        </div>

        {/* Row 9 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Status</label>
          <select className="w-full mt-1 p-2 border rounded-md">
            <option>Select Activity Status</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Date</label>
          <div className="flex space-x-2 mt-1">
            <input type="text" placeholder="Day" className="w-1/3 p-2 border rounded-md" />
            <input type="text" placeholder="Month" className="w-1/3 p-2 border rounded-md" />
            <input type="text" placeholder="Year" className="w-1/3 p-2 border rounded-md" />
          </div>
        </div>

        {/* Row 10 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Expenditure Month</label>
          <select className="w-full mt-1 p-2 border rounded-md">
            <option>Month</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Expenditure Type</label>
          <select className="w-full mt-1 p-2 border rounded-md">
            <option>Please Select Expenditure Type</option>
          </select>
        </div>

        {/* Row 11 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Remarks / Justification</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Category (For CGWB)</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-md" />
        </div>

        {/* Row 12 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Budget Head</label>
          <select className="w-full mt-1 p-2 border rounded-md">
            <option>Please Select Budget Head</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="col-span-2 flex justify-end space-x-4 mt-4">
          <button type="button" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Cancel
          </button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
