"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function Logo({ 
  variant = 'light', 
  size = 'md', 
  className,
  showText = true
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-10'
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const isDarkBg = variant === 'dark';
  const textColor = isDarkBg ? 'text-white' : 'text-[#0A192F] dark:text-white';

  return (
    <div className={cn("flex items-center select-none", className)}>
      <img 
        alt="Freshworks Logo"
        role="presentation"
        src="https://dam.freshworks.com/m/1d230ee78c07681a/original/headerLogoLight.webp" 
        className={cn("shrink-0 object-contain", sizeClasses[size])}
      />
    </div>
  );
}
