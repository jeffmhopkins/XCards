import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function AlertModal({ isOpen, onClose, title, message }: AlertModalProps) {
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
            <div className="p-2 rounded-full bg-cyan-500/20 border border-cyan-500/30">
              <AlertCircle className="w-5 h-5 text-cyan-400" />
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
        
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}