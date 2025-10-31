import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal, { ModalType } from '../components/ui/Modal';

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string, confirmText?: string, cancelText?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({
    title: '',
    message: '',
    type: 'info'
  });

  const showModal = useCallback((options: ModalOptions) => {
    setModalOptions(options);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const showSuccess = useCallback((message: string, title: string = 'Success') => {
    showModal({ title, message, type: 'success' });
  }, [showModal]);

  const showError = useCallback((message: string, title: string = 'Error') => {
    showModal({ title, message, type: 'error' });
  }, [showModal]);

  const showWarning = useCallback((message: string, title: string = 'Warning') => {
    showModal({ title, message, type: 'warning' });
  }, [showModal]);

  const showInfo = useCallback((message: string, title: string = 'Information') => {
    showModal({ title, message, type: 'info' });
  }, [showModal]);

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title: string = 'Confirm Action',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    showModal({
      title,
      message,
      type: 'warning',
      showCancel: true,
      confirmText,
      cancelText,
      onConfirm
    });
  }, [showModal]);

  return (
    <ModalContext.Provider
      value={{
        showModal,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        closeModal
      }}
    >
      {children}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={modalOptions.onConfirm}
        title={modalOptions.title}
        message={modalOptions.message}
        type={modalOptions.type}
        confirmText={modalOptions.confirmText}
        cancelText={modalOptions.cancelText}
        showCancel={modalOptions.showCancel}
      />
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
