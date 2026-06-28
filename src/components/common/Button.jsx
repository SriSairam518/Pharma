
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    isloading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    
    const variantStyles = {
        primary : 'btn-primary',
        secondary : 'btn-secondary',
        danger : 'btn-danger',
        ghost : 'btn-ghost',
    }

    const sizeStyles = {
        sm : 'btn-sm',
        md : 'btn-md',
        lg : 'btn-lg',
    }

    const isActive = loading || isloading;

    return (
        <button 
            className={`btn ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isActive}
            aria-busy={isActive}
            {...props}
        >
            {isActive && (
                <Loader2
                    size={16}
                    className='btn-spinner'
                    aria-hidden='true'
                />
            )}
            {children}
        </button>
    );
};

export default Button;