
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            modalRef.current?.focus();
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if(!isOpen) return null;

    const sizeStyles = {
        sm : 'modal--sm',
        md : 'modal--md',
        lg : 'modal--lg',
    };

    return (
        <div 
            className="modal-backdrop"
            onClick = {onClose}
            role = "presentaion"
        >
            <div
                ref = {modalRef}
                className = {`modal ${sizeStyles[size]}`}
                onClick = {(e) => e.stopPropagation()}
                role = "dialog"
                aria-modal="true"
                aria-labelledby='modal-title'
                tabIndex={-1}
            >
                <div className="modal-header">
                    <h2 id='modal-title' className="modal-title">
                        {title}
                    </h2>
                    <button 
                        className="modal-close"
                        onClick={onClose}
                        aria-label="close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;