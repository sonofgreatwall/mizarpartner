import React from 'react';

type ButtonProps = {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit';
    variant?: 'primary' | 'secondary' | 'neutral';
};

const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, className, variant, type='submit' }) => {
    const getVariantClassName = () => {
        switch (variant) {
          case 'primary':
            return 'bg-primary text-white';
          case 'secondary':
            return 'bg-secondary';
          case 'neutral':
          default:
            return '';
        }
      };
    return (
        <button type={type} className={`${className} ${getVariantClassName()} px-6 py-3 font-medium rounded-full ${disabled ? 'cursor-not-allowed' : ''}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};

export default Button;
