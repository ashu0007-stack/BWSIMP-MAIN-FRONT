import { FileText } from "lucide-react";

export default function FormHeader() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Data Entry Form
        </h1>
        <p className="text-blue-100 mt-2">Please fill in all required fields marked with *</p>
      </div>
    </div>
  );
}