import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textSize?: string;
}

export function Logo({ className, textSize = "text-2xl" }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <span className={cn("font-bold text-primary", textSize)}>PayHub</span>
    </div>
  );
}
