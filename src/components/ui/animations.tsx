
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: "none" | "short" | "medium" | "long";
}

export const FadeIn = ({ children, className, delay = "none" }: FadeInProps) => {
  const delays = {
    none: "delay-0",
    short: "delay-150",
    medium: "delay-300",
    long: "delay-500"
  };

  return (
    <div
      className={cn(
        "animate-fade-in opacity-0",
        delays[delay],
        className
      )}
    >
      {children}
    </div>
  );
};
