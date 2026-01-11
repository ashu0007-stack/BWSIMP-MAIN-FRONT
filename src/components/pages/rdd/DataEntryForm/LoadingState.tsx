interface LoadingStateProps {
  loading: boolean;
}

export default function LoadingState({ loading }: LoadingStateProps) {
  if (!loading) return null;

  return (
    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <p className="text-blue-700 font-medium">Loading data...</p>
      </div>
    </div>
  );
}