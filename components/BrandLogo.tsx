"use client";

import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export default function BrandLogo({ size = "md", showTagline = true }: BrandLogoProps) {
  const sizeClasses = {
    sm: {
      text: "text-lg",
      sub: "text-[9px] tracking-wider",
      line: "h-[2px]",
    },
    md: {
      text: "text-2xl",
      sub: "text-[11px] tracking-widest",
      line: "h-[3px]",
    },
    lg: {
      text: "text-4xl",
      sub: "text-sm tracking-[3px]",
      line: "h-[4px]",
    },
    xl: {
      text: "text-5xl md:text-6xl",
      sub: "text-base md:text-lg tracking-[4px]",
      line: "h-[5px]",
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
          <div className={`flex-1 max-w-[80px] rounded-full neon-green-line ${sizeClasses.line}`} />
        </div>
      )}
    </div>
  );
}
