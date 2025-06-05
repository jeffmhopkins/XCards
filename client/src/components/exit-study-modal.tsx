import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExitStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
}

export function ExitStudyModal({ 
  isOpen, 
  onClose, 
  onSaveAndExit, 
  onDiscardAndExit 
}: ExitStudyModalProps) {
  const handleSaveAndExit = () => {
    onSaveAndExit();
    onClose();
  };

  const handleDiscardAndExit = () => {
    onDiscardAndExit();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleSaveAndExit();
          break;
        case 'Escape':
          e.preventDefault();
          onClose(); // Continue studying
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="glass-effect border border-white/10 rounded-2xl p-6 w-full max-w-md holographic transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Exit Study Session</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-8">
          <p className="text-text-secondary leading-relaxed">
            Do you want to save your progress from this study session before exiting? 
            Your current answers will be recorded for statistics and spaced repetition.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleSaveAndExit}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105"
          >
            Save Progress & Exit
          </Button>
          
          <button
            onClick={handleDiscardAndExit}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-400 text-white font-semibold rounded-xl glass-effect hover:shadow-lg hover:shadow-red-600/20 transition-all duration-300 transform hover:scale-105"
          >
            Discard Progress & Exit
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 glass-effect border border-cyan-500/20 text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300 rounded-xl"
          >
            Continue Studying
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}