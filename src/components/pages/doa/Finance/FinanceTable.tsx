import { FC } from "react";

interface FinanceTableProps {
  title: string;
  columns: string[];
  data: any[];
}

export const FinanceTable : FC<FinanceTableProps> = ({ title, columns, data })  => {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">{title} Details</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="border px-3 py-2 text-left font-semibold"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map((col, j) => (
                  <td key={j} className="border px-3 py-2">
                    {row[col] || "-"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Total Row */}
            <tr className="bg-gray-200 font-bold">
              <td colSpan={columns.length} className="text-center py-2">
                Total: ₹220.00 Cr
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
