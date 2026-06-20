// ============================================================
// src/components/common/Modal.jsx
//
// A reusable modal/dialog component.
//
// WHAT IS A MODAL?
// A modal is a popup window that appears over the main content.
// We use it for "Add Agency" and "Edit Agency" forms so the
// user doesn't have to navigate to a new page.
//
// IMPORTANT CONCEPTS:
// - Trap focus inside the modal (keyboard accessibility)
// - Close on Escape key press
// - Close when clicking the dark backdrop
// - Prevent background scrolling when modal is open
// ============================================================

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

    // ---- CLOSE ON ESCAPE KEY ----
    // Good UX: users expect Escape to close modals
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // ---- PREVENT BACKGROUND SCROLLING ----
    // When modal is open, lock the page scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            modalRef.current?.focus();
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Don't render anything if modal is closed
    // (this saves memory and keeps the DOM clean)
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
                {/* Modal Header */}
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

                {/* Modal Body — content goes here */}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;