interface ActionButtonsProps {
  onReview: () => void;
  submitting: boolean;
  districtResolved: boolean;
}

export default function ActionButtons({ onReview, submitting, districtResolved }: ActionButtonsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-end">
        <button
          type="button"
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onReview}
          disabled={submitting || !districtResolved}
        >
          Review
        </button>
      </div>
    </div>
  );
}