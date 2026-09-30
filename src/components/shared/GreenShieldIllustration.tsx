import React from "react";
import Image from "next/image";

interface GreenShieldIllustrationProps {
  className?: string;
  size?: number;
}

export function GreenShieldIllustration({ className = "", size = 120 }: GreenShieldIllustrationProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Background radial emerald glow */}
      <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/30 blur-xl rounded-full scale-125" />
      <div className="relative flex items-center justify-center">
        <Image
          src="/assets/shield-with-check.svg"
          alt="Strong Security Shield Illustration"
          width={size}
          height={size}
          className="object-contain drop-shadow-md animate-pulse"
          priority
        />
      </div>
    </div>
  );
}
