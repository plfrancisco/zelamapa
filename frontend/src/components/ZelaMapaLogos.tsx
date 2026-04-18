import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  variant?: 'light' | 'dark';
}

export const ZelaMapaIcon: React.FC<LogoProps> = ({ className = '', ...props }) => {
  return (
    <svg 
      width="48" 
      height="60" 
      viewBox="0 0 64 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path 
        d="M32 0C14.327 0 0 14.327 0 32C0 56 32 80 32 80C32 80 64 56 64 32C64 14.327 49.673 0 32 0Z" 
        fill="#104A8A"
      />
      <circle cx="32" cy="32" r="18" fill="white"/>
      <path 
        d="M23.5 42C23.5 42 20.5 29 33 21C45 13 45.5 20 45.5 20C45.5 20 45.5 32 35.5 40.5C27.5 47 23.5 42 23.5 42Z" 
        fill="#56B947"
      />
      <path 
        d="M23.5 42C23.5 42 25 35 32 31.5" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ZelaMapaFullLogo: React.FC<LogoProps> = ({ className = '', variant = 'dark', ...props }) => {
  const textColor = variant === 'light' ? '#FFFFFF' : '#104A8A';
  const subtitleColor = variant === 'light' ? '#E2E8F0' : '#64748B';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ZelaMapaIcon width="40" height="50" {...props} />
      <div className="flex flex-col justify-center">
        <span 
          style={{ color: textColor, fontFamily: 'Arial, sans-serif' }} 
          className="text-3xl font-black tracking-tight leading-none"
        >
          ZelaMapa
        </span>
        <span 
          style={{ color: subtitleColor }} 
          className="text-[10px] font-semibold uppercase tracking-wider mt-1"
        >
          Gestão Urbana e Inteligente
        </span>
      </div>
    </div>
  );
};
