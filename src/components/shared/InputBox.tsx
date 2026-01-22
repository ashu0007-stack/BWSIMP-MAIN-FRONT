import React, { FC } from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface InputWithIconProps {
    label?: string;
    icon?: React.ReactNode;
    placeholder?: string;
    error?: FieldError;
    type?: "text" | "number" | "date" | "email" | "file";
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    register?: UseFormRegisterReturn;
    value?: string | number;
    readOnly?: boolean;
    className?: string; // 👈 add this
    disabled?: boolean;
    multiple?: boolean;
    maxLength?: number;
}

export const InputBox: FC<InputWithIconProps> = ({
    label,
    icon,
    error,
    placeholder,
    type = "text",
    inputProps,
    register,
    value,
    readOnly = false,
    className = "",
    disabled,
    multiple,
    maxLength,


}) => (
    <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative mt-1">
            {icon && <span className="absolute inset-y-0 left-3 flex items-center text-green-700">{icon}</span>}
            <input
                type={type}
                value={value}
                {...register}
                {...inputProps}
                readOnly={readOnly}
                disabled={disabled}
                placeholder={placeholder}
                multiple={multiple}
                maxLength={maxLength}
                className={` w-full p-2 border rounded-md focus:ring-1 focus:ring-green-600
                    ${icon ? "pl-9" : ""}
                    ${error ? "border-red-500" : "border-gray-300"}
                    ${disabled ? "bg-green-100 text-green-800" : ""}
                    ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}
                    ${type === "number" ? "input-number" : ""}
                    ${className}
                `}

            />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
);
