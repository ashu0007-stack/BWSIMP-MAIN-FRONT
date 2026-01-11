import { FC } from "react";
import { useForm, get } from "react-hook-form";
import { Sprout, Package, Droplets } from "lucide-react";

/* ================= TYPES ================= */

type CropCostFormValues = {
  farmer: string;
  father: string;
  area: number;
  financialYear: string;
  season: string;
  cropVariety: string;

  inputCost: {
    seed: number;
    fertilizer: number;
    irrigation: number;
    weedicide: number;
    pesticide: number;
    other: number;
  }[];

  operationalCost: {
    fieldPrep: number;
    nursery: number;
    sowing: number;
    manureApplication: number;
    irrigation: number;
    pesticideApp: number;
    harvesting: number;
    other: number;
  }[];

  totalIncome: {
    grainYield: number;
    sellingPrice: number;
    byProduct: number;
    total: number;
  };
};

/* ================= COMPONENT ================= */

export const CropCostForm: FC<any> = ({ setShowForm }) => {
  const {
    register,
    handleSubmit,
    watch,
    // control,
    formState: { errors },
  } = useForm<CropCostFormValues>({
    defaultValues: {
      inputCost: [
        { seed: 0, fertilizer: 0, irrigation: 0, weedicide: 0, pesticide: 0, other: 0 },
      ],
      operationalCost: [
        {
          fieldPrep: 0,
          nursery: 0,
          sowing: 0,
          manureApplication: 0,
          irrigation: 0,
          pesticideApp: 0,
          harvesting: 0,
          other: 0,
        },
      ],
      totalIncome: { grainYield: 0, sellingPrice: 0, byProduct: 0, total: 0 },
    },
  });

  /* ================= FIELD ARRAYS ================= */
  // const { fields: inputCostFields } = useFieldArray({ control, name: "inputCost" });
  // const { fields: operationalCostFields } = useFieldArray({ control, name: "operationalCost" });

  /* ================= CALCULATIONS ================= */
  const computeTotalCost = () => {
    const input = watch("inputCost")[0];
    const op = watch("operationalCost")[0];
    return Object.values(input).reduce((a, b) => a + Number(b), 0) +
           Object.values(op).reduce((a, b) => a + Number(b), 0);
  };

  const computeNetProfit = () => {
    const totalIncome = watch("totalIncome.total") || 0;
    return totalIncome - computeTotalCost();
  };

  /* ================= SUBMIT ================= */
  const onSubmitForm = (data: CropCostFormValues) => {
    // Check if at least some values are filled
    const totalValues = [
      ...Object.values(data.inputCost[0]),
      ...Object.values(data.operationalCost[0]),
      ...Object.values(data.totalIncome),
      data.farmer,
      data.area,
      data.financialYear,
      data.season,
      data.cropVariety,
    ];
    const hasValue = totalValues.some(val => val !== 0 && val !== null && val !== "");

    if (!hasValue) {
      alert("Please enter some values before submitting!");
      return;
    }

    console.log("Crop Cost Data:", data);
    alert("Crop cost saved successfully!");
    setShowForm(false);
  };

  /* ================= UI COMPONENTS ================= */
  const NumericInput = ({
    label,
    field,
    required = false,
  }: {
    label: string;
    field: string;
    required?: boolean;
  }) => {
    const error = get(errors, field);

    return (
      <div>
        <label className="text-sm font-medium text-gray-700">
          {label} 
          {/* {required && <span className="text-red-500">*</span>} */}
        </label>
        <input
          type="number"
          {...register(field as any, {
            required: required ? `${label} is required` : false,
          })}
          className={`w-full mt-1 p-2 border rounded-md ${error ? "border-red-500" : ""}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error.message as string}</p>}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 mt-4">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-4 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sprout className="w-8 h-8" />
          Crop Cost Entry
        </h1>
        <p className="text-green-100 mt-1">Fill crop cost and income details carefully</p>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-10">
        {/* Farmer Info */}
        <Section title="Farmer Information" icon={<Sprout />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NumericInput label="Farmer Name" field="farmer" required />
            <NumericInput label="Father's Name" field="father" required />
            <NumericInput label="Area Covered" field="area" required />
            <NumericInput label="Financial Year" field="financialYear" required />
            <NumericInput label="Season" field="season" required />
            <NumericInput label="Crop Variety" field="cropVariety" required />
          </div>
        </Section>

        {/* Input Cost */}
        <Section title="Input Cost" icon={<Package />}>
          <FieldBox title="Input Cost Details" icon={<Package className="w-4 h-4" />}>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
              {["seed","fertilizer","irrigation","weedicide","pesticide","other"].map(key => (
                <NumericInput key={key} label={key} field={`inputCost.0.${key}`} required />
              ))}
            </div>
          </FieldBox>
        </Section>

        {/* Operational Cost */}
        <Section title="Operational Cost" icon={<Package />}>
          <FieldBox title="Operational Details" icon={<Package className="w-4 h-4" />}>
            <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mt-4">
              {["fieldPrep","nursery","sowing","manureApplication","irrigation","pesticideApp","harvesting","other"].map(key => (
                <NumericInput key={key} label={key} field={`operationalCost.0.${key}`} required />
              ))}
            </div>
          </FieldBox>
        </Section>

        {/* Total Income */}
        <Section title="Total Income" icon={<Droplets />}>
          <FieldBox title="Income Details" icon={<Droplets className="w-4 h-4" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <NumericInput label="Grain Yield" field="totalIncome.grainYield" required />
              <NumericInput label="Selling Price" field="totalIncome.sellingPrice" required />
              <NumericInput label="By Product" field="totalIncome.byProduct" />
              <NumericInput label="Total Income" field="totalIncome.total" required />
            </div>
          </FieldBox>
        </Section>

        {/* Computed Totals */}
        <div className="flex justify-between text-lg font-medium">
          <span>Total Cost: {computeTotalCost()}</span>
          <span>Net Profit: {computeNetProfit()}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="reset"
            className="px-5 py-2 bg-gray-300 rounded-md"
            onClick={() => setShowForm(true)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-green-700 text-white rounded-md"
          >
            Save Crop Cost
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= HELPERS ================= */
const Section: FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1.5 h-8 bg-green-700 rounded-full" />
      <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
        {icon}
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const FieldBox: FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="relative border border-dashed border-green-300 rounded-lg p-4 mt-2">
    <div className="absolute -top-3 left-4 bg-white px-2 flex items-center gap-2 text-green-800 font-semibold">
      {icon}
      <span className="text-sm">{title}</span>
    </div>
    {children}
  </div>
);
