import { FC } from "react";

export const TrainingDetailDrawer : FC<any> = ({ training, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="w-full md:w-2/3 lg:w-1/2 bg-white h-full overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Training Details</h2>
          <button onClick={onClose} className="text-red-600 font-bold">✕</button>
        </div>

        {/* Training Info */}
        <section className="mb-6 bg-green-50 p-4 rounded">
          <h3 className="font-semibold mb-2">📘 Training Information</h3>
          <p><b>ID:</b> {training.id}</p>
          <p><b>Type:</b> {training.type}</p>
          <p><b>Topic:</b> {training.topic}</p>
          <p><b>Duration:</b> {training.startDate} – {training.endDate}</p>
          <p><b>Venue:</b> {training.location}</p>
          <p><b>Trainer:</b> {training.trainer.name} ({training.trainer.designation})</p>
          <p><b>Contact:</b> {training.trainer.contact}</p>
        </section>

        {/* Officials */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2 text-blue-600">👔 Officials</h3>
          <table className="w-full text-sm border">
            <thead className="bg-blue-100">
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Position</th>
                <th className="border px-2 py-1">Contact</th>
                <th className="border px-2 py-1">Gender</th>
              </tr>
            </thead>
            <tbody>
              {training.officials.map((o: any, i: number) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{o.name}</td>
                  <td className="border px-2 py-1">{o.position}</td>
                  <td className="border px-2 py-1">{o.contact}</td>
                  <td className="border px-2 py-1">{o.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Farmers */}
        <section>
          <h3 className="font-semibold mb-2 text-orange-600">👨‍🌾 Farmers / WUA</h3>
          <table className="w-full text-sm border">
            <thead className="bg-orange-100">
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">DBT No</th>
                <th className="border px-2 py-1">Father</th>
                <th className="border px-2 py-1">Contact</th>
                <th className="border px-2 py-1">Gender</th>
                <th className="border px-2 py-1">Category</th>
              </tr>
            </thead>
            <tbody>
              {training.farmers.map((f: any, i: number) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{f.name}</td>
                  <td className="border px-2 py-1">{f.dbt}</td>
                  <td className="border px-2 py-1">{f.father}</td>
                  <td className="border px-2 py-1">{f.contact}</td>
                  <td className="border px-2 py-1">{f.gender}</td>
                  <td className="border px-2 py-1">{f.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Export */}
        <div className="mt-6 flex gap-3">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">
            Export Excel
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
