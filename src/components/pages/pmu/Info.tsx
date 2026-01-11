/* ================= INFO ================= */

interface InfoProps {
  label: string;
  value?: string | number | null;
}

export const Info = ({ label, value }: InfoProps) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">
      {value ?? <span className="text-gray-400">—</span>}
    </p>
  </div>
);

/* ================= STAT ================= */

interface StatProps {
  label: string;
  value?: number | string | null;
  colorClass?: string; // optional (blue, green, etc.)
}

export const Stat = ({label, value,colorClass = "text-gray-800",}: StatProps) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-xl font-bold ${colorClass}`}>
      {value ?? 0}
    </p>
  </div>
);
