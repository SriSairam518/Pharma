// ============================================================
// src/components/common/ConfirmDialog.jsx
//
// A confirmation dialog for destructive actions like Delete.
//
// WHY ALWAYS CONFIRM BEFORE DELETE?
// Accidental deletions are frustrating and sometimes
// irreversible. A quick "Are you sure?" dialog saves users
// from mistakes. This is a core UX best practice.
// ============================================================

import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  isloading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="confirm-dialog">
        {/* Warning icon */}
        <div className="confirm-dialog__icon" aria-hidden="true">
          <AlertTriangle size={28} />
        </div>

        {/* Title and message */}
        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>

        {/* Action buttons */}
        <div className="confirm-dialog__actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isloading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={isloading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;