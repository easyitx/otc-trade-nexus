
import { useToast as useToastOriginal, toast as toastOriginal } from '@/components/ui/use-toast';

// Re-export the toast hook and function
export const useToast = useToastOriginal;
export const toast = toastOriginal;

// Export default for simpler imports
export default useToast;
