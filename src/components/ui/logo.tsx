import React from "react";

interface LogoProps {
  className?: string;
  variant?: "orange" | "white";
}

export function BoxOSLogo({ className = "", variant = "orange" }: LogoProps) {
  const textColor = variant === "orange" ? "text-primary" : "text-white";
  
  return (
    <div className={`flex items-center gap-2 font-black tracking-tighter ${className}`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20`}>
        <span className="text-xl">B</span>
      </div>
      <span className={`text-2xl ${textColor}`}>BoxOS</span>
    </div>
  );
}
