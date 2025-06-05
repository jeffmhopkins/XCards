import { X } from 'lucide-react';
import { Flashcard } from '@/lib/types';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Flashcard;
  deckName: string;
}

export function CardDetailsModal({ isOpen, onClose, card, deckName }: CardDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'good': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-text-secondary bg-text-secondary/10 border-text-secondary/20';
    }
  };

  const getDifficultyLabel = (difficulty: string | undefined) => {
    return difficulty || 'Ungraded';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect holographic rounded-2xl p-6 w-full max-w-md border border-cyan-500/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-neon">Card Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Deck Info */}
        <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="text-sm text-text-secondary">From deck:</div>
          <div className="font-semibold text-purple-400">{deckName}</div>
        </div>

        {/* Question */}
        <div className="mb-4">
          <div className="text-sm text-text-secondary mb-2">Question</div>
          <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-text-primary">
            {card.question}
          </div>
        </div>

        {/* Answer */}
        <div className="mb-4">
          <div className="text-sm text-text-secondary mb-2">Answer</div>
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-text-primary">
            {card.answer}
          </div>
        </div>

        {/* Categories */}
        {card.categories.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-text-secondary mb-2">Categories</div>
            <div className="flex flex-wrap gap-2">
              {card.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="space-y-3">
          <div className="text-sm text-text-secondary">Statistics</div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-void/30 rounded-lg">
              <div className="text-xs text-text-secondary">Reviews</div>
              <div className="text-lg font-bold text-text-primary">{card.reviewCount}</div>
            </div>
            
            <div className="p-3 bg-void/30 rounded-lg">
              <div className="text-xs text-text-secondary">Accuracy</div>
              <div className="text-lg font-bold text-text-primary">
                {card.correctCount + card.incorrectCount > 0 
                  ? Math.round((card.correctCount / (card.correctCount + card.incorrectCount)) * 100) + '%'
                  : 'N/A'
                }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-void/30 rounded-lg">
              <div className="text-xs text-text-secondary">Difficulty</div>
              <span className={`inline-block px-2 py-1 text-xs rounded border ${getDifficultyColor(card.difficulty)}`}>
                {getDifficultyLabel(card.difficulty)}
              </span>
            </div>
            
            <div className="p-3 bg-void/30 rounded-lg">
              <div className="text-xs text-text-secondary">Last Reviewed</div>
              <div className="text-sm text-text-primary">{formatDate(card.lastReviewed)}</div>
            </div>
          </div>

          {card.nextReview && (
            <div className="p-3 bg-void/30 rounded-lg">
              <div className="text-xs text-text-secondary">Next Review</div>
              <div className="text-sm text-text-primary">{formatDate(card.nextReview)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}