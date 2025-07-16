import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md',
  showText = false
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <img
        src="/favicon.ico"
        alt="ICP Logo"
        className={cn(sizeMap[size], "object-contain")}
      />
      {showText && (
        <span className="text-octave-dark-3 font-semibold text-lg">
          ICP Wizard
        </span>
      )}
    </div>
  );
};

export default Logo;
