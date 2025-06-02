import { X, Trophy, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  accuracy: number;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export function SessionCompleteModal({ 
  isOpen, 
  onClose, 
  accuracy, 
  cardsStudied, 
  correctAnswers, 
  incorrectAnswers 
}: SessionCompleteModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-effect holographic rounded-3xl p-8 max-w-md w-full animate-float">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-cyan-neon">Session Complete!</h3>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center mb-8">
          <div className="inline-block p-6 glass-effect rounded-3xl holographic mb-6 animate-pulse">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 glass-effect rounded-xl">
              <Target className="w-8 h-8 mx-auto text-cyan-neon mb-2" />
              <div className="text-2xl font-bold text-cyan-neon">{accuracy}%</div>
              <div className="text-sm text-text-secondary">Accuracy</div>
            </div>
            
            <div className="text-center p-4 glass-effect rounded-xl">
              <Clock className="w-8 h-8 mx-auto text-purple-neon mb-2" />
              <div className="text-2xl font-bold text-purple-neon">{cardsStudied}</div>
              <div className="text-sm text-text-secondary">Cards Studied</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <div className="text-center">
              <div className="text-xl font-semibold text-green-400">{correctAnswers}</div>
              <div className="text-xs text-text-secondary">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-red-400">{incorrectAnswers}</div>
              <div className="text-xs text-text-secondary">Incorrect</div>
            </div>
          </div>
          
          <p className="text-text-secondary mb-8">
            {accuracy >= 80 ? "Excellent work! You're mastering this material." :
             accuracy >= 60 ? "Good progress! Keep studying for better results." :
             "Keep practicing! Every session helps you improve."}
          </p>
        </div>
        
        <Button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}