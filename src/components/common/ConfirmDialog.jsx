import { memo, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = memo(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Megerősítés',
  message,
  confirmText = 'Igen',
  cancelText = 'Mégse',
  variant = 'danger',
  ...props
}) => {
  if (!isOpen) return null;

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="space-y-4">
        {message && (
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleConfirm}
            variant={variant}
            className="flex-1"
          >
            {confirmText}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;

