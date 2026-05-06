import { Rabbit } from "lucide-react";

interface LogoIconProps {
  size?: number;
  className?: string;
}

export default function LogoIcon({ size = 32, className = "" }: LogoIconProps) {
  const iconSize = Math.round(size * 0.55);
  return (
    <div
      className={`shrink-0 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-shadow ${className}`}
      style={{ width: size, height: size }}
    >
      <Rabbit size={iconSize} strokeWidth={2.2} />
    </div>
  );
}
