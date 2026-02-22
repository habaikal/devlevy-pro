import React from 'react';

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  subLabel?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, children, className = "", subLabel }) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      <label className="text-sm font-medium text-slate-700 flex justify-between items-center">
        {label}
        {subLabel && <span className="text-xs text-slate-400 font-normal">{subLabel}</span>}
      </label>
      {children}
    </div>
  );
};