import { CheckCircle2 } from "lucide-react";

interface SuccessMessageProps {
  success: string;
}

export default function SuccessMessage({ success }: SuccessMessageProps) {
  if (!success) return null;

  return (
    <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-800">Success</h3>
          <p className="text-green-700 text-sm mt-1">{success}</p>
        </div>
      </div>
    </div>
  );
}