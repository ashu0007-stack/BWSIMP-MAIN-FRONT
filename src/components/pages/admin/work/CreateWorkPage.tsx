import React, { useState, useEffect } from "react";
import {
  MapPin,
  Package,
  Ruler,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Home,
  IndianRupee,
  Calendar,
  ArrowLeft,
  X,
  Calculator,
  Building,
  Shield,
  FileCheck,
  Target,
  Clock,
  Hash,
  Award,
  CheckSquare,
  Square,
  Eye
} from "lucide-react";

import {
  useCreateWork,
  useAddBeneficiaries,
  useAddVillages,
  useAddComponentsAndMilestones,
  useWorks,
  useAddSpurs,
} from "@/hooks/wrdHooks/useWorks";

import { useZones } from "@/hooks/location/useZone";
import { useComponents, useSubcomponentsByComponent, useSubworkcomponentsByworkComponentId } from "@/hooks/wrdHooks/useComponents";
import { useCirclesByZoneId } from "@/hooks/location/useCircle";
import { useDivisionByCircleId } from "@/hooks/location/useDivision";

import {
  WorkFormData,
  ValidationErrors,
  UserData,
  Village,
  WorkComponent,
  Beneficiaries,
  Zone,
  Circle,
  Division,
  Component,
  SubComponent,
  SubworkComponent,
  Work,
  SpurData 
} from "@/components/shared/work";

interface CreateWorkPageProps {
  user: UserData | null;
  onBackToList: () => void;
}

const CreateWorkPage: React.FC<CreateWorkPageProps> = ({ user, onBackToList }) => {
  // All your existing state variables remain the same
  const [formData, setFormData] = useState<WorkFormData>({
    zone_id: "",
    circle_id: "",
    division_id: "",
    component_id: "",
    subcomponent_id: "",
    workcomponentId: "",
    work_name: "",
    work_package_name: "",
    target_km: "",
    work_start_range: "",
    work_end_range: "",
    work_period_months: "",
    work_cost: "",
    package_number: "",
    package_details: "",
    district: "",
    Area_Under_improved_Irrigation: "",
    award_status: "",
    has_spurs: 0
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [beneficiaries, setBeneficiaries] = useState<Beneficiaries>({
    total_population: "",
    beneficiaries_youth_15_28: "",
    beneficiaries_female: "",
    beneficiaries_male: ""
  });
  const [beneficiariesErrors, setBeneficiariesErrors] = useState<ValidationErrors>({});
  const [villages, setVillages] = useState<Village[]>([
    {
      village_name: "",
      block_name: "",
      gram_panchayat: "",
      district_name: "",
      census_population: "",
      male_population: "",
      female_population: ""
    }
  ]);
  const [villagesErrors, setVillagesErrors] = useState<ValidationErrors[]>([]);
  const [extraComponents, setExtraComponents] = useState<WorkComponent[]>([
    {
      componentname: "",
      totalQty: "",
      unit: "",
      Numberofmilestone: "0",
      milestone1_qty: "",
      milestone2_qty: "",
      milestone3_qty: "",
      milestonedetails: "",
      num_of_milestones: "",
      total_qty: undefined,
      unitname: undefined,
      nameofcomponent: undefined
    },
  ]);
  const [componentsErrors, setComponentsErrors] = useState<ValidationErrors[]>([]);
  const [hasSpurs, setHasSpurs] = useState<boolean>(false);
  const [spursData, setSpursData] = useState<SpurData[]>([
    {
      spur_name: "Spur 1",
      location_km: "",
      spurs_length: "",
      is_new: ""
    }
  ]);
  const [spursErrors, setSpursErrors] = useState<ValidationErrors[]>([]);
  const [message, setMessage] = useState("");
  const [showMilestoneFields, setShowMilestoneFields] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedCircleId, setSelectedCircleId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'basic' | 'beneficiaries' | 'villages' | 'components' | 'spurs'>('basic');
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // All your existing React Query hooks remain the same
  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: circles, isLoading: circlesLoading } = useCirclesByZoneId(selectedZoneId);
  const { data: divisions, isLoading: divisionsLoading } = useDivisionByCircleId(selectedCircleId);
  const { data: components = [], isLoading: componentsLoading } = useComponents();
  const { data: filteredSubcomponents = [], isLoading: filteredSubcomponentsLoading } = useSubcomponentsByComponent(
    formData.component_id ? parseInt(formData.component_id) : undefined
  );
  const { data: filteredSubworkcomponents = [], isLoading: filteredSubworkcomponentsLoading } = useSubworkcomponentsByworkComponentId(
    formData.subcomponent_id ? parseInt(formData.subcomponent_id) : undefined
  );
  const { data: worksList = [], refetch: refetchWorks } = useWorks();

  // All your existing mutation hooks remain the same
  const createWorkMutation = useCreateWork();
  const addBeneficiariesMutation = useAddBeneficiaries();
  const addVillagesMutation = useAddVillages();
  const addComponentsMutation = useAddComponentsAndMilestones();
  const addSpursMutation = useAddSpurs();

  // All your existing useEffect hooks remain the same
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        zone_id: user.zone_id?.toString() || "",
        circle_id: user.circle_id?.toString() || "",
        division_id: user.division_id?.toString() || ""
      }));
      
      if (user.zone_id) setSelectedZoneId(user.zone_id.toString());
      if (user.circle_id) setSelectedCircleId(user.circle_id.toString());
    }
  }, [user]);

  // All your existing validation functions remain exactly the same
  const validateText = (value: string, fieldName: string): string => {
    if (!value.trim()) return `${fieldName} is required`;
    if (!/^[A-Za-z\s]+$/.test(value)) return `${fieldName} should contain only alphabets`;
    if (value.length < 2) return `${fieldName} should be at least 2 characters`;
    if (value.length > 100) return `${fieldName} should not exceed 100 characters`;
    return "";
  };

  const validateDecimalWithLimit = (value: string, fieldName: string, max?: number): string => {
    if (!value.trim()) return `${fieldName} is required`;
    if (!/^\d+(\.\d{1,2})?$/.test(value)) return `${fieldName} should be a valid number (max 2 decimals)`;

    const digitCount = value.replace('.', '').length;
    if (digitCount > 10) return `${fieldName} should not exceed 10 digits`;

    const numValue = parseFloat(value);
    if (numValue <= 0) return `${fieldName} must be greater than 0`;
    if (max !== undefined && numValue > max) return `${fieldName} should not exceed ${max}`;

    if (numValue > 99999999.99) return `${fieldName} should not exceed 99,999,999.99`;

    return "";
  };

  const validateWorkCost = (value: string): string => {
    if (!value.trim()) return "Work cost is required";
    if (!/^\d+$/.test(value)) return "Work cost should contain only numbers";
    if (parseInt(value) < 1) return "Work cost should be at least ₹1";
    if (parseInt(value) > 9999) return "Work cost should not exceed ₹9999";
    return "";
  };

  const validatePopulation = (value: string, fieldName: string): string => {
    if (!value.trim()) return `${fieldName} is required`;
    if (!/^\d+$/.test(value)) return `${fieldName} should contain only numbers`;

    const numValue = parseInt(value);
    if (numValue < 0) return `${fieldName} cannot be negative`;

    if (numValue > 9999999) return `${fieldName} should not exceed 99,99,999 (7 digits)`;

    return "";
  };

  const validateUnit = (value: string): string => {
    if (!value.trim()) return "Unit is required";
    if (!/^[A-Za-z]+$/.test(value)) return "Unit should contain only alphabets (e.g., m, km, kg)";
    if (value.length > 10) return "Unit should not exceed 10 characters";
    return "";
  };

  // Main Validation Function for Form - EXACTLY THE SAME
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validate main form fields
    if (!formData.zone_id) {
      errors.zone_id = "Zone is required";
      isValid = false;
    }
    if (!formData.circle_id) {
      errors.circle_id = "Circle is required";
      isValid = false;
    }
    if (!formData.division_id) {
      errors.division_id = "Division is required";
      isValid = false;
    }
    if (!formData.component_id) {
      errors.component_id = "Component is required";
      isValid = false;
    }
    if (!formData.workcomponentId) {
      errors.workcomponentId = "Work name is required";
      isValid = false;
    }

    const workCostError = validateWorkCost(formData.work_cost);
    if (workCostError) {
      errors.work_cost = workCostError;
      isValid = false;
    }

    if (!formData.work_period_months) {
      errors.work_period_months = "Period of completion is required";
      isValid = false;
    }

    if (!formData.package_number) {
      errors.package_number = "Package number is required";
      isValid = false;
    }

    if (!formData.Area_Under_improved_Irrigation.trim()) {
      errors.Area_Under_improved_Irrigation = "Area Under improved Irrigation Services is required";
      isValid = false;
    } else if (!/^\d*\.?\d*$/.test(formData.Area_Under_improved_Irrigation)) {
      errors.Area_Under_improved_Irrigation = "Please enter a valid number";
      isValid = false;
    } else {
      const areaValue = parseFloat(formData.Area_Under_improved_Irrigation);
      if (areaValue < 0) {
        errors.Area_Under_improved_Irrigation = "Area cannot be negative";
        isValid = false;
      }
      if (areaValue > 9999999) {
        errors.Area_Under_improved_Irrigation = "Area should not exceed 99,99,999 ha";
        isValid = false;
      }
    }

    // Validate beneficiaries
    const benErrors: ValidationErrors = {};
    const totalPopError = validatePopulation(beneficiaries.total_population, "Total population");
    if (totalPopError) {
      benErrors.total_population = totalPopError;
      isValid = false;
    }
    setBeneficiariesErrors(benErrors);

    // Validate villages
    const villageErrorsList: ValidationErrors[] = [];
    villages.forEach((village) => {
      const villageErrors: ValidationErrors = {};

      const villageNameError = validateText(village.village_name, "Village name");
      if (villageNameError) {
        villageErrors.village_name = villageNameError;
        isValid = false;
      }

      const blockNameError = validateText(village.block_name, "Block name");
      if (blockNameError) {
        villageErrors.block_name = blockNameError;
        isValid = false;
      }

      const districtNameError = validateText(village.district_name, "District name");
      if (districtNameError) {
        villageErrors.district_name = districtNameError;
        isValid = false;
      }

      const populationError = validatePopulation(village.census_population, "Population");
      if (populationError) {
        villageErrors.census_population = populationError;
        isValid = false;
      }

      villageErrorsList.push(villageErrors);
    });
    setVillagesErrors(villageErrorsList);

    // Validate components
    const compErrorsList: ValidationErrors[] = [];
    extraComponents.forEach((component) => {
      const compErrors: ValidationErrors = {};
      if (!component.componentname.trim()) {
        compErrors.componentname = "Component description is required";
        isValid = false;
      } else if (!/^[A-Za-z\s]+$/.test(component.componentname)) {
        compErrors.componentname = "Component description should contain only alphabets";
        isValid = false;
      } else if (component.componentname.length < 2) {
        compErrors.componentname = "Component description should be at least 2 characters";
        isValid = false;
      } else if (component.componentname.length > 25) {
        compErrors.componentname = "Component description should not exceed 10 characters";
        isValid = false;
      }

      if (!component.totalQty.trim()) {
        compErrors.totalQty = "Total quantity is required";
        isValid = false;
      } else {
        if (!/^\d+(\.\d{1,2})?$/.test(component.totalQty)) {
          compErrors.totalQty = "Please enter a valid number (max 2 decimal places)";
          isValid = false;
        } else {
          const digitCount = component.totalQty.replace('.', '').length;
          if (digitCount > 10) {
            compErrors.totalQty = "Total quantity should not exceed 10 digits";
            isValid = false;
          }

          const numValue = parseFloat(component.totalQty);
          if (numValue <= 0) {
            compErrors.totalQty = "Quantity must be greater than 0";
            isValid = false;
          }
          if (numValue > 99999999.99) {
            compErrors.totalQty = "Maximum value is 99,999,999.99";
            isValid = false;
          }
        }
      }

      const componentNameError = validateText(component.componentname, "Component description");
      if (componentNameError) {
        compErrors.componentname = componentNameError;
        isValid = false;
      }

      const unitError = validateUnit(component.unit);
      if (unitError) {
        compErrors.unit = unitError;
        isValid = false;
      }

      const totalQtyError = validateDecimalWithLimit(component.totalQty, "Total quantity");
      if (totalQtyError) {
        compErrors.totalQty = totalQtyError;
        isValid = false;
      }

      if (showMilestoneFields) {
        const milestones = parseInt(component.Numberofmilestone);
        const totalQty = parseFloat(component.totalQty) || 0;
        let milestoneSum = 0;
        const tolerance = 0.01;

        if (milestones >= 1) {
          const m1 = parseFloat(component.milestone1_qty) || 0;
          milestoneSum += m1;
        }

        if (milestones >= 2) {
          const m2 = parseFloat(component.milestone2_qty) || 0;
          milestoneSum += m2;
        }

        if (milestones >= 3) {
          const m3 = parseFloat(component.milestone3_qty) || 0;
          milestoneSum += m3;
        }

        if (totalQty > 0 && milestoneSum > 0) {
          const allowedTolerance = Math.max(totalQty * 0.01, 0.01);

          if (Math.abs(milestoneSum - totalQty) > allowedTolerance) {
            compErrors.milestone_sum = `Sum of milestone quantities (${milestoneSum.toFixed(2)}) must equal total quantity (${totalQty.toFixed(2)}) within ${(allowedTolerance * 100).toFixed(0)}% tolerance`;
            isValid = false;
          }
        }

        if (milestones >= 1) {
          const m1 = parseFloat(component.milestone1_qty) || 0;
          if (m1 > totalQty + tolerance) {
            isValid = false;
          }
        }

        if (milestones >= 2) {
          const m2 = parseFloat(component.milestone2_qty) || 0;
          if (m2 > totalQty + tolerance) {
            isValid = false;
          }
        }

        if (milestones >= 3) {
          const m3 = parseFloat(component.milestone3_qty) || 0;
          if (m3 > totalQty + tolerance) {
            isValid = false;
          }
        }
      }

      compErrorsList.push(compErrors);
    });
    setComponentsErrors(compErrorsList);
    if (hasSpurs) {
    const spurErrorsList: ValidationErrors[] = [];
    
    spursData.forEach((spur, index) => {
      const spurErrors: ValidationErrors = {};
      
      // Spur name validation
      if (!spur.spur_name.trim()) {
        spurErrors.spur_name = "Spur name is required";
        isValid = false;
      } else if (spur.spur_name.length > 50) {
        spurErrors.spur_name = "Spur name should not exceed 50 characters";
        isValid = false;
      }

      // Location validation
      if (!spur.location_km.trim()) {
        spurErrors.location_km = "Location is required";
        isValid = false;
      } else if (!/^\d+(\.\d{1,2})?$/.test(spur.location_km)) {
        spurErrors.location_km = "Location should be a valid number (max 2 decimals)";
        isValid = false;
      } else {
        const location = parseFloat(spur.location_km);
        if (location < 0) {
          spurErrors.location_km = "Location cannot be negative";
          isValid = false;
        }
        if (location > 999.99) {
          spurErrors.location_km = "Location should not exceed 999.99 KM";
          isValid = false;
        }
      }

      // Spur type validation
      if (!spur.is_new) {
        spurErrors.is_new = "Spur type is required";
        isValid = false;
      }

      spurErrorsList.push(spurErrors);
    });

    setSpursErrors(spurErrorsList);
  }

    setValidationErrors(errors);
    return isValid;
  };

  // All your existing helper functions remain exactly the same
  const validateMilestoneSum = (index: number, component: WorkComponent) => {
    const updatedErrors = [...componentsErrors];
    const milestones = parseInt(component.Numberofmilestone);
    const totalQty = parseFloat(component.totalQty) || 0;

    if (totalQty > 0 && showMilestoneFields) {
      let milestoneSum = 0;
      const milestoneValues: number[] = [];

      if (milestones >= 1) {
        const m1 = parseFloat(component.milestone1_qty) || 0;
        milestoneSum += m1;
        milestoneValues.push(m1);
      }

      if (milestones >= 2) {
        const m2 = parseFloat(component.milestone2_qty) || 0;
        milestoneSum += m2;
        milestoneValues.push(m2);
      }

      if (milestones >= 3) {
        const m3 = parseFloat(component.milestone3_qty) || 0;
        milestoneSum += m3;
        milestoneValues.push(m3);
      }

      const tolerance = 0.0001;

      if (milestoneSum > 0) {
        if (Math.abs(milestoneSum - totalQty) > tolerance) {
          const roundedSum = Math.round(milestoneSum * 100) / 100;
          const roundedTotal = Math.round(totalQty * 100) / 100;

          updatedErrors[index] = {
            ...updatedErrors[index],
            milestone_sum: `Sum of milestone quantities (${roundedSum}) must equal total quantity (${roundedTotal})`
          };
        } else {
          const { milestone_sum, ...rest } = updatedErrors[index];
          updatedErrors[index] = rest;
        }
      }

    }

    setComponentsErrors(updatedErrors);
  };

  const autoCalculateMilestones = (i: number, component: WorkComponent) => {
    const updated = [...extraComponents];
    const totalQty = parseFloat(component.totalQty) || 0;
    const milestones = parseInt(component.Numberofmilestone);

    if (totalQty > 0 && milestones > 0) {
      if (milestones === 1) {
        updated[i].milestone1_qty = totalQty.toFixed(2);
        updated[i].milestone2_qty = "";
        updated[i].milestone3_qty = "";
      }
      else if (milestones === 2) {
        const half = totalQty / 2;
        updated[i].milestone1_qty = half.toFixed(2);
        updated[i].milestone2_qty = half.toFixed(2);
        updated[i].milestone3_qty = "";
      }
      else if (milestones === 3) {
        const third = totalQty / 3;
        const m1 = third;
        const m2 = third;
        const m3 = totalQty - m1 - m2;

        updated[i].milestone1_qty = m1.toFixed(2);
        updated[i].milestone2_qty = m2.toFixed(2);
        updated[i].milestone3_qty = m3.toFixed(2);
      }

      setExtraComponents(updated);
      validateMilestoneSum(i, updated[i]);
    }
  };

  const checkForDuplicateWorkName = (workName: string) => {
    if (!worksList || worksList.length === 0) return false;

    const existingWork = worksList.find(
      (work: Work) =>
        work.work_name.toLowerCase().trim() === workName.toLowerCase().trim()
    );

    return !!existingWork;
  };

  const getUserDataForAPI = () => {
    if (user) {
      const apiData = {
        email: user.email,
        dept_id: user.dept_id,
        username: user.username
      };
      return apiData;
    }

    return {
      email: "unknown@example.com",
      dept_id: 1,
      username: "Unknown User"
    };
  };

  // All your existing handler functions remain exactly the same
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setValidationErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "workcomponentId") {
      const selectedOption = e.target as HTMLSelectElement;
      const selectedText = selectedOption.options[selectedOption.selectedIndex].text;

      setFormData(prev => ({
        ...prev,
        workcomponentId: value,
        work_name: selectedText,
        work_package_name: selectedText,
      }));

      if (value && filteredSubworkcomponents.length > 0) {
        const selectedWorkPackage = filteredSubworkcomponents.find(
          (wp: SubworkComponent) => wp.id.toString() === value
        );

        if (selectedWorkPackage) {
          setFormData(prev => ({
            ...prev,
            workcomponentId: value,
            target_km: selectedWorkPackage.length_of_work || prev.target_km,
            package_number: selectedWorkPackage.package_number || prev.package_number,
            work_name: selectedWorkPackage.work_package_name,
            work_package_name: selectedWorkPackage.work_package_name,
          }));
        }
      }
    }
    else if (name === "zone_id") {
      setSelectedZoneId(value);
      setFormData(prev => ({
        ...prev,
        zone_id: value,
        circle_id: "",
        division_id: ""
      }));
    } else if (name === "circle_id") {
      setSelectedCircleId(value);
      setFormData(prev => ({
        ...prev,
        circle_id: value,
        division_id: ""
      }));
    } else if (name === "component_id") {
      setFormData(prev => ({
        ...prev,
        component_id: value,
        subcomponent_id: "",
        workcomponentId: "",
        work_name: "",
        work_package_name: "",
      }));
    } else if (name === "subcomponent_id") {
      setFormData(prev => ({
        ...prev,
        subcomponent_id: value,
        workcomponentId: "",
        target_km: "",
        package_number: "",
        work_name: "",
        work_package_name: "",
      }));
    } else if (name === "work_cost") {
      const decimalRegex = /^\d*\.?\d*$/;
      if (value === "" || decimalRegex.test(value)) {
        if (value.length > 7) {
          setValidationErrors(prev => ({
            ...prev,
            work_cost: "Work cost should not exceed 7 characters"
          }));
          return;
        }

        setFormData(prev => ({ ...prev, work_cost: value }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          work_cost: "Please enter a valid number (e.g., 123.45)"
        }));
      }
    }
    else if (name === "Area_Under_improved_Irrigation") {
      const decimalRegex = /^\d*\.?\d*$/;
      if (value === "" || decimalRegex.test(value)) {
        if (value.length > 7) {
          setValidationErrors(prev => ({
            ...prev,
            Area_Under_improved_Irrigation: "Value should not exceed 7 characters"
          }));
          return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          Area_Under_improved_Irrigation: "Please enter a valid number (e.g., 123.45)"
        }));
      }
    }
    else {
      if (["work_name", "work_package_name", "package_number", "district"].includes(name)) {
        if (value && !/^[A-Za-z0-9\s\-_]+$/.test(value)) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: "Only alphabets, numbers, spaces, hyphens and underscores are allowed"
          }));
          return;
        }
      }

      if (["target_km", "work_period_months", "Area_Under_improved_Irrigation"].includes(name)) {
        if (value && !/^\d*\.?\d*$/.test(value)) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: "Please enter a valid number"
          }));
          return;
        }
      }

      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === "work_period_months") {
      const months = parseInt(value) || 0;
      let numMilestones = 0;

      if (months ===  12 || months === 16) {
        numMilestones = 1;
      } else if (months === 24 || months === 32) {
        numMilestones = 2;
      } else if (months === 36) {
        numMilestones = 3;
      } 

      setExtraComponents(prevComponents =>
        prevComponents.map(comp => ({
          ...comp,
          Numberofmilestone: numMilestones.toString()
        }))
      );

     if (months === 12 || months === 16 || months === 24 || months === 32 || months === 36) {
        setShowMilestoneFields(true);
      } else {
        setShowMilestoneFields(false);
      }
    }
  };

  const handleBeneficiariesChange = (field: keyof Beneficiaries, value: string) => {
    setBeneficiariesErrors(prev => ({ ...prev, [field]: "" }));

    if (field === "total_population") {
      if (value.length > 8) {
        setBeneficiariesErrors(prev => ({
          ...prev,
          [field]: "Value should not exceed 8 characters"
        }));
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        setBeneficiariesErrors(prev => ({
          ...prev,
          [field]: "Please enter numbers only"
        }));
        return;
      }

      const newBeneficiaries = { ...beneficiaries, [field]: value };

      if (field === "total_population") {
        const total = parseInt(value) || 0;

        if (total > 0) {
          const femaleCount = Math.round(total * 0.49);
          const maleCount = total - femaleCount;
          const youthCount = Math.round(total * 0.29);

          newBeneficiaries.beneficiaries_female = femaleCount.toString();
          newBeneficiaries.beneficiaries_male = maleCount.toString();
          newBeneficiaries.beneficiaries_youth_15_28 = youthCount.toString();
        } else {
          newBeneficiaries.beneficiaries_female = "";
          newBeneficiaries.beneficiaries_male = "";
          newBeneficiaries.beneficiaries_youth_15_28 = "";
        }
      }

      setBeneficiaries(newBeneficiaries);
    } else {
      if (value.length > 8) {
        setBeneficiariesErrors(prev => ({
          ...prev,
          [field]: "Value should not exceed 8 characters"
        }));
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        setBeneficiariesErrors(prev => ({
          ...prev,
          [field]: "Please enter numbers only"
        }));
        return;
      }

      setBeneficiaries(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleVillageChange = (i: number, field: keyof Village, value: string) => {
    const updatedErrors = [...villagesErrors];
    updatedErrors[i] = { ...updatedErrors[i], [field]: "" };
    setVillagesErrors(updatedErrors);

    if (["village_name", "block_name", "district_name", "gram_panchayat"].includes(field)) {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        updatedErrors[i] = { ...updatedErrors[i], [field]: "Only alphabets and spaces allowed" };
        setVillagesErrors(updatedErrors);
        return;
      }
    }

    if (["census_population", "male_population", "female_population"].includes(field)) {
      if (value.length > 7) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Population should not exceed 7 digits (99,99,999)"
        };
        setVillagesErrors(updatedErrors);
        return;
      }

      if (value && !/^\d*$/.test(value)) {
        updatedErrors[i] = { ...updatedErrors[i], [field]: "Only numbers allowed" };
        setVillagesErrors(updatedErrors);
        return;
      }

      if (value) {
        const numValue = parseInt(value, 10);
        if (numValue > 9999999) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Population should not exceed 99,99,999"
          };
          setVillagesErrors(updatedErrors);
          return;
        }
      }
    }

    const updated = [...villages];
    updated[i] = { ...updated[i], [field]: value };

    if (field === "census_population") {
      const total = parseInt(value) || 0;
      if (total > 0) {
        const femaleCount = Math.round(total * 0.49);
        const maleCount = total - femaleCount;

        updated[i].female_population = femaleCount.toString();
        updated[i].male_population = maleCount.toString();
      } else {
        updated[i].female_population = "";
        updated[i].male_population = "";
      }
    }

    setVillages(updated);
  };

  const handleComponentChange = (
    i: number,
    field: keyof WorkComponent,
    value: string
  ) => {
    const updatedErrors = [...componentsErrors];
    updatedErrors[i] = { ...updatedErrors[i], [field]: "" };
    setComponentsErrors(updatedErrors);

    if (field === "componentname") {
      if (value.length > 25) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Name should not exceed 25 characters"
        };
        setComponentsErrors(updatedErrors);
        return;
      }

      if (value && !/^[A-Za-z\s/]*$/.test(value)) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Only alphabets and spaces allowed"
        };
        setComponentsErrors(updatedErrors);
        return;
      }
    }

    if (field === "totalQty") {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Please enter a valid number"
        };
        setComponentsErrors(updatedErrors);
        return;
      }

      if (value) {
        const digitCount = value.replace('.', '').length;
        if (digitCount > 10) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum 10 digits allowed (including decimal places)"
          };
          setComponentsErrors(updatedErrors);
          return;
        }

        const decimalParts = value.split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum 2 decimal places allowed"
          };
          setComponentsErrors(updatedErrors);
          return;
        }

        const numValue = parseFloat(value);
        if (numValue <= 0) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Quantity must be greater than 0"
          };
          setComponentsErrors(updatedErrors);
          return;
        }

        if (numValue > 99999999.99) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum value is 99,999,999.99"
          };
          setComponentsErrors(updatedErrors);
          return;
        }
      }
    }

    if (["milestone1_qty", "milestone2_qty", "milestone3_qty"].includes(field)) {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        updatedErrors[i] = { ...updatedErrors[i], [field]: "Please enter a valid number" };
        setComponentsErrors(updatedErrors);
        return;
      }

      if (value) {
        const digitCount = value.replace('.', '').length;
        if (digitCount > 10) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum 10 digits allowed"
          };
          setComponentsErrors(updatedErrors);
          return;
        }

        const decimalParts = value.split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
          updatedErrors[i] = {
            ...updatedErrors[i],
            [field]: "Maximum 2 decimal places allowed"
          };
          setComponentsErrors(updatedErrors);
          return;
        }
      }
    }

    if (field === "unit") {
      if (value && !/^[A-Za-z]+$/.test(value)) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Only alphabets are allowed (e.g., m, km, kg, ton)"
        };
        setComponentsErrors(updatedErrors);
        return;
      }
      if (value.length > 10) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Unit should not exceed 10 characters"
        };
        setComponentsErrors(updatedErrors);
        return;
      }
    }

    if (field === "Numberofmilestone") {
      if (value && !/^[0-3]$/.test(value)) {
        updatedErrors[i] = {
          ...updatedErrors[i],
          [field]: "Milestone should be between 0 and 3"
        };
        setComponentsErrors(updatedErrors);
        return;
      }
    }

    const updated = [...extraComponents];
    updated[i] = { ...updated[i], [field]: value };

    setExtraComponents(updated);
    
    if (["totalQty", "milestone1_qty", "milestone2_qty", "milestone3_qty", "Numberofmilestone"].includes(field)) {
      validateMilestoneSum(i, updated[i]);
    }
  };

  const addComponentField = () => {
    const months = parseInt(formData.work_period_months) || 0;
    let numMilestones = 0;

    if (months === 12 || months === 16) {
      numMilestones = 1;
    } else if (months === 24 || months === 32) {
      numMilestones = 2;
    } else if (months === 36) {
      numMilestones = 3;
    } 

    setExtraComponents([...extraComponents, {
      componentname: "",
      totalQty: "",
      unit: "",
      Numberofmilestone: numMilestones.toString(),
      milestone1_qty: "",
      milestone2_qty: "",
      milestone3_qty: "",
      milestonedetails: "",
      num_of_milestones: "",
      total_qty: undefined,
      unitname: undefined,
      nameofcomponent: undefined
    }]);

    setComponentsErrors([...componentsErrors, {}]);
  };

  const removeComponentField = (i: number) => {
    const updated = [...extraComponents];
    updated.splice(i, 1);
    setExtraComponents(updated);

    const updatedErrors = [...componentsErrors];
    updatedErrors.splice(i, 1);
    setComponentsErrors(updatedErrors);
  };

  const addVillageField = () => {
    setVillages([...villages, {
      village_name: "",
      block_name: "",
      gram_panchayat: "",
      district_name: "",
      census_population: "",
      male_population: "",
      female_population: ""
    }]);

    setVillagesErrors([...villagesErrors, {}]);
  };

  const removeVillageField = (i: number) => {
    const updated = [...villages];
    updated.splice(i, 1);
    setVillages(updated);

    const updatedErrors = [...villagesErrors];
    updatedErrors.splice(i, 1);
    setVillagesErrors(updatedErrors);
  };

  const handleCancel = () => {
    setFormData({
      zone_id: user?.zone_id?.toString() || "",
      circle_id: user?.circle_id?.toString() || "",
      division_id: user?.division_id?.toString() || "",
      component_id: "",
      subcomponent_id: "",
      workcomponentId: "",
      work_name: "",
      work_package_name: "",
      target_km: "",
      work_start_range: "",
      work_end_range: "",
      work_period_months: "",
      work_cost: "",
      package_number: "",
      package_details: "",
      district: "",
      Area_Under_improved_Irrigation: "",
      award_status: "",
      has_spurs: 0,
    });

    setBeneficiaries({
      total_population: "",
      beneficiaries_youth_15_28: "",
      beneficiaries_female: "",
      beneficiaries_male: ""
    });

    setVillages([{
      village_name: "",
      block_name: "",
      gram_panchayat: "",
      district_name: "",
      census_population: "",
      male_population: "",
      female_population: ""
    }]);

    setExtraComponents([{
      componentname: "",
      totalQty: "",
      unit: "",
      Numberofmilestone: "0",
      milestone1_qty: "",
      milestone2_qty: "",
      milestone3_qty: "",
      milestonedetails: "",
      num_of_milestones: "",
      total_qty: undefined,
      unitname: undefined,
      nameofcomponent: undefined,
      
    }]);

    setHasSpurs(false);
    setSpursData([{
      spur_name: "Spur 1",
      location_km: "",
      spurs_length: "",
      is_new: ""
    }]);
    setSpursErrors([]);

    setMessage("");
    setShowMilestoneFields(false);

    setValidationErrors({});
    setBeneficiariesErrors({});
    setVillagesErrors([]);
    setComponentsErrors([]);
    setActiveTab('basic');
    setShowValidationSummary(false);
  };

  const handleSubmitAll = async () => {
    if (!user) {
      setMessage("⚠️ Please wait, user data is loading...");
      return;
    }

    if (checkForDuplicateWorkName(formData.work_name)) {
      setMessage("❌ This work name already exists in the list. Please use a different name.");
      return;
    }
    
    if (!validateForm()) {
      setMessage("⚠️ Please fix all validation errors before submitting.");
      return;
    }

    try {
      setMessage("🔄 Creating work package with all data...");

      const workRequestData = {
        ...formData,
         has_spurs: hasSpurs ? 1 : 0,
        user_data: getUserDataForAPI()
      };

      const workResult = await createWorkMutation.mutateAsync(workRequestData);
      const workId = workResult?.id || workResult?.workId || workResult?.data?.id || workResult?.data?.workId;

      if (!workId) {
        console.error("❌ Work ID not found in response:", workResult);
        setMessage("❌ Work created but could not get Work ID.");
        return;
      }

      if (beneficiaries.total_population) {
        const beneficiariesRequestData = {
          ...beneficiaries,
          beneficiaries_above_28: "",
          beneficiaries_other_gender: "",
          user_data: getUserDataForAPI()
        };
        await addBeneficiariesMutation.mutateAsync({
          workId,
          data: beneficiariesRequestData
        });
      }

      if (villages.length > 0 && villages[0].village_name) {
        const villagesRequestData = {
          villages: villages,
          user_data: getUserDataForAPI()
        };
        await addVillagesMutation.mutateAsync({
          workId,
          data: villagesRequestData
        });
      }

      if (extraComponents.length > 0 && extraComponents[0].componentname) {
        const componentsRequestData = {
          components: extraComponents.map(comp => ({
            ...comp,
            milestonedetails: `M1:${comp.milestone1_qty},M2:${comp.milestone2_qty},M3:${comp.milestone3_qty}`,
          })),
          user_data: getUserDataForAPI()
        };
        await addComponentsMutation.mutateAsync({
          workId,
          data: componentsRequestData
        });
      }

      if (hasSpurs && spursData.length > 0 && spursData[0].spur_name) {
        const spursRequestData = {
          spurs: spursData,
          user_data: getUserDataForAPI()
        };
        await addSpursMutation.mutateAsync({
          workId,
          data: spursRequestData
        });
      }

      setMessage(`✅ Complete work package created successfully by ${user.username}! Work ID: ${workId}.`);

      refetchWorks();

      setTimeout(() => {
        handleCancel();
        onBackToList();
      }, 2000);

    } catch (err: any) {
      console.error("❌ Error saving complete work package:", err);
      const errorMessage = err.message || err.response?.data?.error || err.response?.data?.message;

      if (errorMessage.includes('Duplicate entry') ||
        errorMessage.includes('work_name_UNIQUE') ||
        errorMessage.includes('already exists')) {
        setMessage("❌ This work name already exists in the database. Please use a different work name.");
      }
      else if (errorMessage.includes('Foreign key constraint')) {
        setMessage("❌ Invalid selection. Please check all dropdown values.");
      }
      else if (errorMessage.includes('SQLSTATE')) {
        setMessage("❌ Database error occurred. Please check your input data.");
      }
      else {
        setMessage(`❌ Error: ${errorMessage}`);
      }
    }
  };

  // ONLY THE RENDER/UI PART IS CHANGED BELOW
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Government Header */}
      <header className="bg-[#003087] text-white border-b-4 border-[#FF9933]">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Work Package Creation System</h1>
                <p className="text-sm opacity-90">{user ? `Logged in as: ${user.username}` : 'Please log in'}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToList}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            <Eye className="w-5 h-5" />
            View Works List
          </button>
        </div>
      </header>

      {/* Message Banner */}
      {message && (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-md">
          <div className="max-w-[1800px] mx-auto px-4 py-3">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${
              message.includes("✅") || message.includes("successfully")
                ? "bg-green-50 border-green-200 text-green-800"
                : message.includes("⚠️")
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
              <div className="flex items-center">
                {message.includes("✅") || message.includes("successfully") ? (
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                ) : message.includes("⚠️") ? (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                )}
                <span className="font-medium">{message}</span>
              </div>
              <button
                onClick={() => setMessage("")}
                className="ml-4 flex-shrink-0 hover:opacity-75"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gray-100 flex flex-col py-3">
        {/* Form Container */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-300">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex items-center gap-2 px-6 py-4 font-medium ${
                  activeTab === 'basic'
                    ? 'border-b-2 border-[#003087] text-[#003087] bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Building className="w-4 h-4" />
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('beneficiaries')}
                className={`flex items-center gap-2 px-6 py-4 font-medium ${
                  activeTab === 'beneficiaries'
                    ? 'border-b-2 border-[#003087] text-[#003087] bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Beneficiaries
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('villages')}
                className={`flex items-center gap-2 px-6 py-4 font-medium ${
                  activeTab === 'villages'
                    ? 'border-b-2 border-[#003087] text-[#003087] bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Home className="w-4 h-4" />
                Villages ({villages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('components')}
                className={`flex items-center gap-2 px-6 py-4 font-medium ${
                  activeTab === 'components'
                    ? 'border-b-2 border-[#003087] text-[#003087] bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4" />
                Components ({extraComponents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spurs')}
                className={`flex items-center gap-2 px-6 py-4 font-medium ${
                  activeTab === 'spurs'
                    ? 'border-b-2 border-[#003087] text-[#003087] bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Spurs ({spursData.length})
              </button>
            </div>
          </div>

          {/* Form Content */}
        <form className="p-6 space-y-8"onSubmit={(e) => {e.preventDefault(); handleSubmitAll();}}>
            {/* Validation Summary */}
            {showValidationSummary && Object.keys(validationErrors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-300 rounded">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-700" />
                  <h3 className="text-lg font-semibold text-red-800">Form Validation Errors</h3>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <div key={field} className="border-l-4 border-red-700 pl-3">
                      <h4 className="font-medium text-red-700 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</h4>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Work Details Section */}
                <section className="bg-gray-50 border border-gray-300 rounded p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-[#003087]" />
                    <h2 className="text-lg font-semibold text-gray-800">Work Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Component *</label>
                      <select
                        name="component_id"
                        value={formData.component_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.component_id ? 'border-red-500' : 'border-gray-400'
                        }`}
                        disabled={componentsLoading}
                      >
                        <option value="">{componentsLoading ? "Loading components..." : "Select Component"}</option>
                        {components.map((c: Component) => (
                          <option key={c.id} value={c.id}>
                            {c.component_name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.component_id && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.component_id}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Sub Component</label>
                      <select
                        name="subcomponent_id"
                        value={formData.subcomponent_id}
                        onChange={handleChange}
                        disabled={!formData.component_id || filteredSubcomponentsLoading}
                        className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                      >
                        <option value="">
                          {!formData.component_id ? "Select component first" : filteredSubcomponentsLoading ? "Loading subcomponents..." : "Select SubComponent"}
                        </option>
                        {filteredSubcomponents.map((s: SubComponent) => (
                          <option key={s.id} value={s.id}>
                            {s.work_component_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Name of Work *</label>
                      <select
                        name="workcomponentId"
                        value={formData.workcomponentId}
                        onChange={handleChange}
                        disabled={!formData.subcomponent_id || filteredSubworkcomponentsLoading}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.workcomponentId ? 'border-red-500' : 'border-gray-400'
                        }`}
                      >
                        <option value="">
                          {!formData.subcomponent_id
                            ? "Select sub component first"
                            : filteredSubworkcomponentsLoading
                              ? "Loading work packages..."
                              : "Select Work Package"
                          }
                        </option>
                        {filteredSubworkcomponents.map((s: SubworkComponent) => (
                          <option key={s.id} value={s.id}>
                            {s.work_package_name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.workcomponentId && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.workcomponentId}
                        </div>
                      )}
                    </div>

                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Zone *</label>
                      <select
                        name="zone_id"
                        value={formData.zone_id}
                        onChange={(e) => { handleChange(e); setSelectedZoneId(e.target.value) }}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.zone_id ? 'border-red-500' : 'border-gray-400'
                        }`}
                        disabled={zonesLoading}
                      >
                        <option value="">
                          {zonesLoading ? "Loading zones..." : "Select Zone"}
                        </option>
                        {zones?.data?.map((z: Zone) => (
                          <option key={z.zone_id} value={z.zone_id}>
                            {z.zone_name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.zone_id && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.zone_id}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Circle *</label>
                      <select
                        name="circle_id"
                        value={formData.circle_id}
                        onChange={(e) => { handleChange(e); setSelectedCircleId(e.target.value) }}
                        disabled={!formData.zone_id || circlesLoading}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.circle_id ? 'border-red-500' : 'border-gray-400'
                        }`}
                      >
                        <option value="">
                          {!formData.zone_id ? "Select zone first" : circlesLoading ? "Loading circles..." : "Select Circle"}
                        </option>
                        {circles?.data.map((c: Circle) => (
                          <option key={c.circle_id} value={c.circle_id}>
                            {c.circle_name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.circle_id && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.circle_id}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Division *</label>
                      <select
                        name="division_id"
                        value={formData.division_id}
                        onChange={handleChange}
                        disabled={!formData.circle_id || divisionsLoading}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.division_id ? 'border-red-500' : 'border-gray-400'
                        }`}
                      >
                        <option value="">
                          {!formData.circle_id ? "Select circle first" : divisionsLoading ? "Loading divisions..." : "Select Division"}
                        </option>
                        {divisions?.data?.map((d: Division) => (
                          <option key={d.division_id} value={d.division_id}>
                            {d.division_name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.division_id && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.division_id}
                        </div>
                      )}
                    </div>

                     <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Ruler className="w-4 h-4 mr-2 text-gray-500" />
                        Work Start Range (KM) *
                      </label>
                      <input
                        type="text"
                        name="work_start_range"
                        value={formData.work_start_range}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.work_start_range ? 'border-red-500' : 'border-gray-400'
                        }`}
                      />
                      {validationErrors.work_start_range && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.work_start_range}
                        </div>
                      )}
                    </div>

                     <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Ruler className="w-4 h-4 mr-2 text-gray-500" />
                        Work End Range (KM) *
                      </label>
                      <input
                        type="text"
                        name="work_end_range"
                        value={formData.work_end_range}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.work_end_range ? 'border-red-500' : 'border-gray-400'
                        }`}
                      />
                      {validationErrors.work_end_range && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.work_end_range}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Ruler className="w-4 h-4 mr-2 text-gray-500" />
                        Length of Work (KM) *
                      </label>
                      <input
                        type="text"
                        name="target_km"
                        value={formData.target_km}
                        readOnly
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.target_km ? 'border-red-500' : 'border-gray-400'
                        }`}
                      />
                      {validationErrors.target_km && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.target_km}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        Period of Completion (months) *
                      </label>
                      <select
                        name="work_period_months"
                        value={formData.work_period_months}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.work_period_months ? 'border-red-500' : 'border-gray-400'
                        }`}
                      >
                        <option value="">Select Period</option>
                        <option value="12">12 months (1 milestone)</option>
                        <option value="16">16 months (1 milestone)</option>
                        <option value="24">24 months (2 milestones)</option>
                        <option value="32">32 months (2 milestones)</option>
                        <option value="36">36 months (3 milestones)</option>
                      </select>
                      {validationErrors.work_period_months && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.work_period_months}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-500" />
                        Package Number *
                      </label>
                      <input
                        type="text"
                        name="package_number"
                        value={formData.package_number}
                        readOnly
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.package_number ? 'border-red-500' : 'border-gray-400'
                        }`}
                      />
                      {validationErrors.package_number && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.package_number}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2 text-gray-500" />
                        Estimated Cost (in Cr.) *
                      </label>
                      <input
                        type="number"
                        name="work_cost"
                        value={formData.work_cost}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.work_cost ? 'border-red-500' : 'border-gray-400'
                        }`}
                      />
                      {validationErrors.work_cost && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.work_cost}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Area Under improved Irrigation Services (ha) Targeted *
                      </label>
                      <input
                        type="number"
                        name="Area_Under_improved_Irrigation"
                        value={formData.Area_Under_improved_Irrigation}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                          validationErrors.Area_Under_improved_Irrigation ? 'border-red-500' : 'border-gray-400'
                        }`}
                      />
                      {validationErrors.Area_Under_improved_Irrigation && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.Area_Under_improved_Irrigation}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Beneficiaries Tab */}
            {activeTab === 'beneficiaries' && (
              <section className="bg-gray-50 border border-gray-300 rounded p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-[#003087]" />
                  <h2 className="text-lg font-semibold text-gray-800">Beneficiaries Information</h2>
                </div>

                {/* <div className="bg-blue-50 border border-blue-300 rounded p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Auto-calculation Rules:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Enter Total Population to auto-calculate other fields</li>
                    <li>• Female: 49% of total population (rounded)</li>
                    <li>• Male: Remaining population after female calculation</li>
                    <li>• Youth (15-28 years): 29% of total population (rounded)</li>
                  </ul>
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Population *
                    </label>
                    <input
                      type="number"
                      value={beneficiaries.total_population}
                      onChange={(e) => handleBeneficiariesChange("total_population", e.target.value)}
                      className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                        beneficiariesErrors.total_population ? 'border-red-500' : 'border-gray-400'
                      }`}
                    />
                    {beneficiariesErrors.total_population && (
                      <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {beneficiariesErrors.total_population}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        Male Beneficiaries
                      </span>
                    </label>
                    <input
                      type="number"
                      value={beneficiaries.beneficiaries_male}
                      onChange={(e) => handleBeneficiariesChange("beneficiaries_male", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-blue-50"
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        Female Beneficiaries
                      </span>
                    </label>
                    <input
                      type="number"
                      value={beneficiaries.beneficiaries_female}
                      onChange={(e) => handleBeneficiariesChange("beneficiaries_female", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-pink-50"
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        Youth (15-28 years)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={beneficiaries.beneficiaries_youth_15_28}
                      onChange={(e) => handleBeneficiariesChange("beneficiaries_youth_15_28", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-green-50"
                      readOnly
                    />
                  </div>
                </div>

                {beneficiaries.total_population && (
                  <div className="mt-6 bg-green-50 border border-green-300 rounded p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Population Summary:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-900">{beneficiaries.total_population}</div>
                        <div className="text-sm text-green-700">Total Population</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">{beneficiaries.beneficiaries_male}</div>
                        <div className="text-sm text-blue-700">Male</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-900">{beneficiaries.beneficiaries_female}</div>
                        <div className="text-sm text-pink-700">Female</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-900">{beneficiaries.beneficiaries_youth_15_28}</div>
                        <div className="text-sm text-yellow-700">Youth</div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Villages Tab */}
            {activeTab === 'villages' && (
              <section className="bg-gray-50 border border-gray-300 rounded p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-[#003087]" />
                    <h2 className="text-lg font-semibold text-gray-800">Villages Covered</h2>
                  </div>
                  <button
                    onClick={addVillageField}
                     type="button" 
                    className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Village
                  </button>
                </div>

                {/* <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-4">
                  <p className="text-yellow-700 text-sm">
                    <strong>Auto-calculation:</strong> Enter total population to auto-calculate male/female populations (49% female, remaining male)
                  </p>
                </div> */}

                <div className="space-y-6">
                  {villages.map((village, i) => (
                    <div key={i} className="bg-white border border-gray-300 rounded p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Hash className="w-4 h-4 text-[#003087]" />
                          <h3 className="text-lg font-semibold text-gray-800">Village {i + 1}</h3>
                        </div>
                        {villages.length > 1 && (
                          <button
                            onClick={() => removeVillageField(i)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">District Name *</label>
                          <input
                            type="text"
                            value={village.district_name}
                            onChange={(e) => handleVillageChange(i, "district_name", e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                              villagesErrors[i]?.district_name ? 'border-red-500' : 'border-gray-400'
                            }`}
                          />
                          {villagesErrors[i]?.district_name && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {villagesErrors[i]?.district_name}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Block Name *</label>
                          <input
                            type="text"
                            value={village.block_name}
                            onChange={(e) => handleVillageChange(i, "block_name", e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                              villagesErrors[i]?.block_name ? 'border-red-500' : 'border-gray-400'
                            }`}
                          />
                          {villagesErrors[i]?.block_name && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {villagesErrors[i]?.block_name}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Gram Panchayat *</label>
                          <input
                            type="text"
                            value={village.gram_panchayat}
                            onChange={(e) => handleVillageChange(i, "gram_panchayat", e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                              villagesErrors[i]?.gram_panchayat ? 'border-red-500' : 'border-gray-400'
                            }`}
                          />
                          {villagesErrors[i]?.gram_panchayat && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {villagesErrors[i]?.gram_panchayat}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Village Name *</label>
                          <input
                            type="text"
                            value={village.village_name}
                            onChange={(e) => handleVillageChange(i, "village_name", e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                              villagesErrors[i]?.village_name ? 'border-red-500' : 'border-gray-400'
                            }`}
                          />
                          {villagesErrors[i]?.village_name && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {villagesErrors[i]?.village_name}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Total Population</label>
                          <input
                            type="number"
                            value={village.census_population}
                            onChange={(e) => handleVillageChange(i, "census_population", e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                              villagesErrors[i]?.census_population ? 'border-red-500' : 'border-gray-400'
                            }`}
                          />
                          {villagesErrors[i]?.census_population && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {villagesErrors[i]?.census_population}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Male Population</label>
                          <input
                            type="number"
                            value={village.male_population}
                            className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-blue-50"
                            readOnly
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Female Population</label>
                          <input
                            type="number"
                            value={village.female_population}
                            className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] bg-pink-50"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Components Tab */}
            {activeTab === 'components' && (
              <section className="bg-gray-50 border border-gray-300 rounded p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#003087]" />
                    <h2 className="text-lg font-semibold text-gray-800">Components & Milestones</h2>
                  </div>
                  <button
                    onClick={addComponentField}
                     type="button" 
                    className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Component
                  </button>
                </div>

                {!showMilestoneFields && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-4">
                    <p className="text-yellow-700 text-sm">
                      <strong>Note:</strong> Please select "Period of Completion" in Basic Information tab to enable milestone fields
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {extraComponents.map((comp, i) => (
                    <div key={i} className="bg-white border border-gray-300 rounded p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Hash className="w-4 h-4 text-[#003087]" />
                          <h3 className="text-lg font-semibold text-gray-800">Component {i + 1}</h3>
                          {showMilestoneFields && comp.Numberofmilestone !== "0" && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              comp.Numberofmilestone === "1" ? "bg-blue-100 text-blue-800" :
                              comp.Numberofmilestone === "2" ? "bg-green-100 text-green-800" :
                              "bg-purple-100 text-purple-800"
                            }`}>
                              {comp.Numberofmilestone} Milestone(s)
                            </span>
                          )}
                        </div>
                        {extraComponents.length > 1 && (
                          <button
                            onClick={() => removeComponentField(i)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Name *</label>
                          <input
                            type="text"
                            value={comp.componentname}
                            onChange={(e) => handleComponentChange(i, "componentname", e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                              componentsErrors[i]?.componentname ? 'border-red-500' : 'border-gray-400'
                            }`}
                          />
                          {componentsErrors[i]?.componentname && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {componentsErrors[i]?.componentname}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Unit *</label>
                          <input
                            type="text"
                            value={comp.unit}
                            onChange={(e) => handleComponentChange(i, "unit", e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                              componentsErrors[i]?.unit ? 'border-red-500' : 'border-gray-400'
                            }`}
                          />
                          {componentsErrors[i]?.unit && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {componentsErrors[i]?.unit}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Total Quantity *</label>
                            {comp.totalQty && !componentsErrors[i]?.totalQty && (
                              <button
                                type="button"
                                onClick={() => autoCalculateMilestones(i, comp)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <Calculator className="w-3 h-3 mr-1" />
                                Auto-calc
                              </button>
                            )}
                          </div>
                          <input
                            type="number"
                            value={comp.totalQty}
                            onChange={(e) => handleComponentChange(i, "totalQty", e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                              componentsErrors[i]?.totalQty ? 'border-red-500' : 'border-gray-400'
                            }`}
                          />
                          {componentsErrors[i]?.totalQty && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {componentsErrors[i]?.totalQty}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">No of Milestones</label>
                          <input
                            type="text"
                            readOnly
                            value={
                              !showMilestoneFields ? "Select period first" :
                              comp.Numberofmilestone === "1" ?
                                formData.work_period_months === "12" ? "1 (12 months)" :
                                formData.work_period_months === "16" ? "1 (16 months)" : "1 milestone" :
                              comp.Numberofmilestone === "2" ?
                                formData.work_period_months === "24" ? "2 (24 months)" :
                                formData.work_period_months === "32" ? "2 (32 months)" : "2 milestones" :
                              comp.Numberofmilestone === "3" ? "3 (36 months)" :
                              "0"
                            }
                            className="w-full px-3 py-2 border border-gray-400 rounded bg-gray-50 text-gray-700 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {showMilestoneFields && parseInt(comp.Numberofmilestone) > 0 && (
                        <div className="mt-6 border-t pt-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Milestone Quantities</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {parseInt(comp.Numberofmilestone) >= 1 && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Milestone 1 Quantity *</label>
                                <input
                                  type="number"
                                  value={comp.milestone1_qty}
                                  onChange={(e) => handleComponentChange(i, "milestone1_qty", e.target.value)}
                                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                                    componentsErrors[i]?.milestone1_qty ? 'border-red-500' : 'border-gray-400'
                                  }`}
                                />
                                {componentsErrors[i]?.milestone1_qty && (
                                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {componentsErrors[i]?.milestone1_qty}
                                  </div>
                                )}
                              </div>
                            )}

                            {parseInt(comp.Numberofmilestone) >= 2 && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Milestone 2 Quantity *</label>
                                <input
                                  type="number"
                                  value={comp.milestone2_qty}
                                  onChange={(e) => handleComponentChange(i, "milestone2_qty", e.target.value)}
                                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                                    componentsErrors[i]?.milestone2_qty ? 'border-red-500' : 'border-gray-400'
                                  }`}
                                />
                                {componentsErrors[i]?.milestone2_qty && (
                                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {componentsErrors[i]?.milestone2_qty}
                                  </div>
                                )}
                              </div>
                            )}

                            {parseInt(comp.Numberofmilestone) >= 3 && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Milestone 3 Quantity *</label>
                                <input
                                  type="number"
                                  value={comp.milestone3_qty}
                                  onChange={(e) => handleComponentChange(i, "milestone3_qty", e.target.value)}
                                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] ${
                                    componentsErrors[i]?.milestone3_qty ? 'border-red-500' : 'border-gray-400'
                                  }`}
                                />
                                {componentsErrors[i]?.milestone3_qty && (
                                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {componentsErrors[i]?.milestone3_qty}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {componentsErrors[i]?.milestone_sum && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                              <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                                <div>
                                  <p className="font-medium">Milestone Quantity Error</p>
                                  <p className="text-sm mt-1">{componentsErrors[i]?.milestone_sum}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Spurs Tab */}
            {activeTab === 'spurs' && (
              <section className="bg-gray-50 border border-gray-300 rounded p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-[#003087]" />
                  <h2 className="text-lg font-semibold text-gray-800">Spurs Information</h2>
                </div>

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasSpurs}
                      onChange={(e) => setHasSpurs(e.target.checked)}
                      className="h-5 w-5 text-[#003087] border-gray-400 rounded focus:ring-[#003087]"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-900">
                      This work package has spurs
                    </span>
                  </label>
                  <p className="text-gray-600 text-sm mt-2 ml-8">
                    Spurs are small branch channels from the main canal.
                  </p>
                </div>

                {hasSpurs && (
                  <div className="space-y-6">
                    <div className="bg-white rounded border border-gray-300 p-6">
                      <div className="mb-4">
                        <label className="block text-lg font-medium text-gray-900 mb-2">
                          How many spurs are in this work package? *
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={spursData.length}
                              onChange={(e) => {
                                const newCount = parseInt(e.target.value) || 0;
                                if (newCount >= 1 && newCount <= 100) {
                                  const currentSpurs = [...spursData];
                                  const newSpurs: SpurData[] = [];
                                  
                                  for (let j = 0; j < newCount; j++) {
                                    if (j < currentSpurs.length) {
                                      newSpurs.push(currentSpurs[j]);
                                    } else {
                                      newSpurs.push({
                                        spur_name: `Spur ${j + 1}`,
                                        location_km: "",
                                         spurs_length: "",
                                        is_new: ""
                                      });
                                    }
                                  }
                                  
                                  setSpursData(newSpurs);
                                }
                              }}
                              className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-gray-500">spurs</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (spursData.length < 100) {
                                  setSpursData([
                                    ...spursData,
                                    {
                                      spur_name: `Spur ${spursData.length + 1}`,
                                      location_km: "",
                                       spurs_length: "",
                                      is_new: ""
                                    }
                                  ]);
                                }
                              }}
                              className="px-4 py-3 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add 1
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (spursData.length > 1) {
                                  const updated = [...spursData];
                                  updated.pop();
                                  setSpursData(updated);
                                }
                              }}
                              className="px-4 py-3 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove 1
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {spursData.length > 0 && (
                      <div className="space-y-4">
                        {spursData.map((spur, spurIndex) => (
                          <div key={spurIndex} className="bg-white border border-gray-300 rounded p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                                  <span className="font-bold text-blue-700">{spurIndex + 1}</span>
                                </div>
                                <h5 className="text-lg font-semibold text-gray-900">
                                  {spur.spur_name}
                                </h5>
                              </div>
                              {spursData.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...spursData];
                                    updated.splice(spurIndex, 1);
                                    updated.forEach((s, idx) => {
                                      s.spur_name = `Spur ${idx + 1}`;
                                    });
                                    setSpursData(updated);
                                  }}
                                  className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Spur Name *</label>
                                <input
                                  type="text"
                                  value={spur.spur_name}
                                  onChange={(e) => {
                                    const updated = [...spursData];
                                    updated[spurIndex].spur_name = e.target.value;
                                    setSpursData(updated);
                                  }}
                                  className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Location (KM) *</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={spur.location_km}
                                    onChange={(e) => {
                                      const updated = [...spursData];
                                      updated[spurIndex].location_km = e.target.value;
                                      setSpursData(updated);
                                    }}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-500">KM</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Length of Spur (Mtr) *</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={spur.spurs_length}
                                    onChange={(e) => {
                                      const updated = [...spursData];
                                      updated[spurIndex].spurs_length = e.target.value;
                                      setSpursData(updated);
                                    }}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-400 rounded focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-500">Mtr</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Spur Type *</label>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...spursData];
                                      updated[spurIndex].is_new = "new";
                                      setSpursData(updated);
                                    }}
                                    className={`px-4 py-3 text-center rounded border-2 ${
                                      spur.is_new === "new"
                                        ? 'bg-green-100 text-green-800 border-green-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                                    }`}
                                  >
                                    New Spur
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...spursData];
                                      updated[spurIndex].is_new = "old";
                                      setSpursData(updated);
                                    }}
                                    className={`px-4 py-3 text-center rounded border-2 ${
                                      spur.is_new === "old"
                                        ? 'bg-blue-100 text-blue-800 border-blue-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                    }`}
                                  >
                                    Old Spur
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-300">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onBackToList}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-red-400 text-red-700 rounded hover:bg-red-50 transition-colors"
                >
                  Reset Form
                </button>
              </div>
             
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => validateForm()}
                  className="px-6 py-3 border border-blue-400 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                >
                  Validate Form
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  disabled={createWorkMutation.isPending || !user}
                  className="flex items-center gap-2 px-8 py-3 bg-[#003087] text-white rounded hover:bg-[#00205b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {createWorkMutation.isPending ? 'Saving...' : user ? 'Create Work Package' : 'Please Log In'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateWorkPage;