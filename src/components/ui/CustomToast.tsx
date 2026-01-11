"use client";

import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import clsx from "clsx";

export const showSuccessToast = (message: string) => {
  toast.custom(
    <div className="flex items-start gap-3 bg-white border border-green-300 rounded-xl p-4 shadow-lg w-[320px] animate-slide-in">
      <CheckCircle className="text-green-600 flex-shrink-0 mt-[2px]" size={22} />
      <div className="flex flex-col">
        <span className="font-semibold text-green-700">Success</span>
        <p className="text-gray-700 text-sm">{message}</p>
      </div>
    </div>
  );
};

export const showErrorToast = (message: string) => {
  toast.custom(
    <div className="flex items-start gap-3 bg-white border border-red-300 rounded-xl p-4 shadow-lg w-[320px] animate-slide-in">
      <XCircle className="text-red-600 flex-shrink-0 mt-[2px]" size={22} />
      <div className="flex flex-col">
        <span className="font-semibold text-red-700">Error</span>
        <p className="text-gray-700 text-sm">{message}</p>
      </div>
    </div>
  );
};

export const showInfoToast = (message: string) => {
  toast.custom(
    <div className="flex items-start gap-3 bg-white border border-blue-300 rounded-xl p-4 shadow-lg w-[320px] animate-slide-in">
      <Info className="text-blue-600 flex-shrink-0 mt-[2px]" size={22} />
      <div className="flex flex-col">
        <span className="font-semibold text-blue-700">Info</span>
        <p className="text-gray-700 text-sm">{message}</p>
      </div>
    </div>
  );
};

export const showWarningToast = (message: string) => {
  toast.custom(
    <div className="flex items-start gap-3 bg-white border border-yellow-300 rounded-xl p-4 shadow-lg w-[320px] animate-slide-in">
      <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-[2px]" size={22} />
      <div className="flex flex-col">
        <span className="font-semibold text-yellow-700">Warning</span>
        <p className="text-gray-700 text-sm">{message}</p>
      </div>
    </div>
  );
};
