import { useForm } from "react-hook-form";
import { financeFormConfig, fixedBudgetHeads } from "./financeData";
import { FC } from "react";

export interface BudgetUserInput {
    id: number;
    head: string;
    totalBudget: number;
    yearlyTarget: number;
    cumulativePlanned: number;
}

export const budgetHeadMaster = fixedBudgetHeads;

type FormType = keyof typeof financeFormConfig;

export const FinanceForm: FC<{
    formType: FormType;
    onSubmitData: (data: any) => void;
}> = ({ formType, onSubmitData }) => {
    const { register, handleSubmit, reset } = useForm();

    const fields = financeFormConfig[formType];

    const onSubmit = (data: any) => {
        onSubmitData({
            ...data,
            createdAt: new Date(),
        });
        reset();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white shadow rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
            <h2 className="md:col-span-2 text-lg font-semibold">
                {formType} Entry Form
            </h2>

            {fields?.map((field: any) => {
                if (field.type === "select" && field.key === "budgetHead") {
                    return (
                        <div key={field.key}>
                            <label className="block text-sm mb-1">{field.label}</label>
                            <select
                                {...register(field.key)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">Select</option>
                                {fixedBudgetHeads.map((item: any) => (
                                    <option key={item.id} value={item.head}>
                                        {item.head}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                }

                if (field.type === "select") {
                    return (
                        <div key={field.key}>
                            <label className="block text-sm mb-1">{field.label}</label>
                            <select
                                {...register(field.key)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">Select</option>
                                <option value="2024-25">2024-25</option>
                                <option value="2025-26">2025-26</option>
                            </select>
                        </div>
                    );
                }

                return (
                    <div key={field.key}>
                        <label className="block text-sm mb-1">{field.label}</label>
                        <input
                            type={field.type}
                            {...register(field.key)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                );
            })}

            <div className="md:col-span-2">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Save {formType}
                </button>
            </div>
        </form>
    );
}
