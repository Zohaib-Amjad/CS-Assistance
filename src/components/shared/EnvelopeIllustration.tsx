import React from "react";
import Image from "next/image";

interface EnvelopeIllustrationProps {
  className?: string;
  size?: number;
}

export function EnvelopeIllustration({ className = "", size = 120 }: EnvelopeIllustrationProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-indigo-500/15 dark:bg-indigo-500/25 blur-xl rounded-full scale-125" />
      <div className="relative flex items-center justify-center">
        <Image
          src="/assets/envelope-with-magnifier.svg"
          alt="Email Scanner Illustration"
          width={size}
          height={size}
          className="object-contain drop-shadow-md"
          priority
        />
      </div>
    </div>
  );
}
