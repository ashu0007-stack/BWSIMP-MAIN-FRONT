import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: any;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  let errorMessage = '';
  // let fieldErrors: Record<string, string> = {};

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
  } else if (error.errors && Array.isArray(error.errors)) {
    error.errors.forEach((err: string) => {
      errorMessage += err + ' ';
    });
  }

  return (
    <>
      {errorMessage && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Validation Error</h3>
              <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}