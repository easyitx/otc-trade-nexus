
// Import from the hook to avoid circular references
import { useToast as useToastHook, toast as toastFunction } from "@/components/ui/toast";

// Re-export with standard names
export const useToast = useToastHook;
export const toast = toastFunction;
