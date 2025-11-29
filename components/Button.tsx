import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-orange-700 shadow-sm active:scale-95",
    secondary: "bg-stone-200 text-stone-800 hover:bg-stone-300 active:scale-95",
    ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
    danger: "text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && icon}
      {children}
    </button>
  );
};
