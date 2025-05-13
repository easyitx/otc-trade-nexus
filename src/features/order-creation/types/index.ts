
import { Dispatch, SetStateAction } from "react";
import { CurrencyPair, RateSource } from "@/hooks/useCurrencyRates";

// Order form data type
export interface OrderFormData {
  selectedPair: string;
  orderType: "BUY" | "SELL";
  amount: string;
  amountCurrency: string;
  rateType: "dynamic" | "fixed";
  rateSource: string;
  customRateValue: string;
  rateAdjustment: number;
  serviceFee: number;
  expiryDate: Date;
  purpose: string;
  notes: string;
  country: string;
  city: string;
}

// Order calculation result type
export interface OrderCalculationResult {
  youPay: string;
  youReceive: string;
  baseRate: string;
  adjustedRate: string;
  finalRate: string;
  serviceFeeAmount: string;
  adjustmentAmount: string;
  adjustmentPercentage: string;
  totalAmount: string;
  fromCurrency: string;
  toCurrency: string;
}

// Props for form components
export interface FormProps {
  // Form state
  formData: OrderFormData;
  updateFormData: <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => void;
  updateMultipleFields: (fields: Partial<OrderFormData>) => void;
  
  // Calculation
  calculationResult: OrderCalculationResult | null;
  showCalculation: boolean;
  setShowCalculation: Dispatch<SetStateAction<boolean>>;
  calculateOrder: () => void;
  
  // Currency rates
  currentRates: Record<string, string>;
  availablePairs: CurrencyPair[];
  availableSources: RateSource[];
  loading: boolean;
  
  // Utilities
  isCashPair: () => boolean;
  formatRate: () => string;
  applyRateSourceToFixed: (source: string) => void;
  formatOrderTypeDescription: () => string;
  getCurrencySymbol: (currency: string) => string;
  
  // Form steps
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  totalSteps: number;
  
  // UI
  theme: string;
  t: (key: string) => string;
  language: string;
  
  // Submission
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;

  // Selected pair info
  selectedPairInfo: any;
  autoCalculate: boolean;
}

// Geography data type
export interface GeographyData {
  country: string;
  city?: string;
}

// Rate data type
export interface RateData {
  type: "dynamic" | "fixed";
  source?: string;
  value?: string;
  adjustment?: number;
  serviceFee: number;
}

// Order submission data
export interface OrderSubmissionData {
  type: "BUY" | "SELL";
  amount: number;
  amountCurrency: string;
  rate: string;
  rateDetails: RateData;
  expiresAt: Date;
  purpose?: string;
  notes?: string;
  geography: GeographyData;
  status: "ACTIVE";
}
