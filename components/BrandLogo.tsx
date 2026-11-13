"use client";

import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export default function BrandLogo({ size = "md", showTagline = true }: BrandLogoProps) {
  const sizeClasses = {
    sm: {
      text: "text-base sm:text-lg",
      sub: "text-[8px] sm:text-[9px] tracking-wider",
      line: "h-[2px] max-w-[30px]",
    },
    md: {
      text: "text-xl sm:text-2xl",
      sub: "text-[9px] sm:text-[11px] tracking-widest",
      line: "h-[2.5px] max-w-[40px] sm:max-w-[70px]",
    },
    lg: {
      text: "text-3xl sm:text-4xl",
      sub: "text-xs sm:text-sm tracking-[2px] sm:tracking-[3px]",
      line: "h-[3px] max-w-[60px] sm:max-w-[100px]",
    },
    xl: {
      text: "text-4xl sm:text-5xl md:text-6xl",
      sub: "text-sm sm:text-base md:text-lg tracking-[3px] sm:tracking-[4px]",
      line: "h-[4px] max-w-[80px] sm:max-w-[140px]",
    },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center select-none font-sans">
      {/* Bazaar in glowing warm golden amber (مطابق ليافطة المحل الحقيقية) */}
      <div className={`font-black tracking-wide ${sizeClasses.text} neon-bazaar-text`}>
        Bazaar
      </div>

      {/* CASUAL WEAR in vivid neon green with the horizontal neon slash */}
      {showTagline && (
        <div className="flex items-center gap-2 mt-0.5 w-full justify-center">
          <span className={`font-black uppercase font-mono ${sizeClasses.sub} neon-casual-text`}>
            CASUAL WEAR
          </span>
          <div className={`flex-1 rounded-full neon-green-line ${sizeClasses.line}`} />
        </div>
      )}
    </div>
  );
}
