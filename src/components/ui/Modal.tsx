import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-20 h-20 text-green-500 drop-shadow-lg" strokeWidth={1.5} />;
      case 'error':
        return <XCircle className="w-20 h-20 text-red-500 drop-shadow-lg" strokeWidth={1.5} />;
      case 'warning':
        return <AlertTriangle className="w-20 h-20 text-amber-500 drop-shadow-lg" strokeWidth={1.5} />;
      case 'confirm':
        return <AlertCircle className="w-20 h-20 text-blue-500 drop-shadow-lg" strokeWidth={1.5} />;
      default:
        return <Info className="w-20 h-20 text-blue-500 drop-shadow-lg" strokeWidth={1.5} />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-50';
      case 'error':
        return 'bg-gradient-to-br from-red-50 to-rose-50';
      case 'warning':
        return 'bg-gradient-to-br from-amber-50 to-orange-50';
      default:
        return 'bg-gradient-to-br from-blue-50 to-cyan-50';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-amber-700';
      default:
        return 'text-blue-700';
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-100 to-emerald-100 ring-4 ring-green-50';
      case 'error':
        return 'bg-gradient-to-br from-red-100 to-rose-100 ring-4 ring-red-50';
      case 'warning':
        return 'bg-gradient-to-br from-amber-100 to-orange-100 ring-4 ring-amber-50';
      default:
        return 'bg-gradient-to-br from-blue-100 to-cyan-100 ring-4 ring-blue-50';
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/40 hover:shadow-xl hover:shadow-amber-500/50';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn transform transition-all"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <div className={`${getHeaderBg()} px-6 pt-6 pb-4 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-1.5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className={`text-2xl font-bold ${getTitleColor()} pr-8`}>{title}</h3>
        </div>

        <div className="px-6 py-8 flex flex-col items-center text-center space-y-5">
          <div className={`${getIconBg()} p-5 rounded-full transform transition-transform hover:scale-105`}>
            {getIcon()}
          </div>
          <p className="text-gray-700 text-base leading-relaxed max-w-sm">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl transition-all hover:shadow-md"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-8 py-3 text-sm font-bold text-white rounded-xl transition-all transform hover:scale-105 active:scale-95 ${getButtonStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
