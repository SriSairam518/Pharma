// ============================================================
// src/components/common/Button.jsx
//
// A reusable Button component.
//
// WHY BUILD A CUSTOM BUTTON INSTEAD OF USING <button>?
// Because you'll use buttons everywhere. If you decide to
// change the style, you update ONE component instead of
// hunting through 50 files. This is called DRY:
// "Don't Repeat Yourself" — a core programming principle.
//
// PROPS EXPLAINED:
// - variant:  "primary" (green), "secondary" (outline),
//             "danger" (red), "ghost" (transparent)
// - size:     "sm", "md", "lg"
// - loading:  shows a spinner and disables the button
// - ...props: passes anything else (onClick, type, etc.)
//             to the underlying <button> element
// ============================================================
 
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

    // Support both naming styles: loading={true} or isLoading={true}
    const isActive = loading || isloading;

    return (
        <button 
            className={`btn ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isActive}
            aria-busy={isActive}
            {...props}
        >
            {/* Show spinner when loading */}
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