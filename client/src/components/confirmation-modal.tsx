import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning';
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Delete',
  confirmVariant = 'danger'
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-effect holographic rounded-3xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              confirmVariant === 'danger' 
                ? 'bg-red-500/20 border border-red-500/30' 
                : 'bg-yellow-500/20 border border-yellow-500/30'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                confirmVariant === 'danger' ? 'text-red-400' : 'text-yellow-400'
              }`} />
            </div>
            <h3 className="text-xl font-bold text-text-primary">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-8">
          <p className="text-text-secondary leading-relaxed">{message}</p>
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 px-6 py-3 glass-effect border border-text-secondary/20 text-text-secondary rounded-xl hover:border-cyan-500/30 transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
              confirmVariant === 'danger'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/20'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-lg hover:shadow-yellow-500/20'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}