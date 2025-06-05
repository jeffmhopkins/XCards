import { useState } from 'react';
import { Edit2, Trash2, Play, Flame, Zap, Star } from 'lucide-react';
import { Deck } from '@/lib/types';
import { ConfirmationModal } from './confirmation-modal';

interface DeckCardProps {
  deck: Deck;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => void;
  onStudy: (deck: Deck) => void;
  onSelect?: (deck: Deck) => void;
  isSelected?: boolean;
}

export function DeckCard({ deck, onEdit, onDelete, onStudy, onSelect, isSelected = false }: DeckCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const accuracy = deck.stats.totalReviews > 0 
    ? Math.round((deck.stats.correctAnswers / deck.stats.totalReviews) * 100)
    : 0;

  // Calculate card review status breakdown
  const getCardReviewBreakdown = () => {
    const now = new Date().getTime();
    let overdue = 0;
    let dueToday = 0;
    let newCards = 0;
    
    deck.cards.forEach(card => {
      if (card.reviewCount === 0) {
        newCards++;
      } else if (card.nextReview) {
        const reviewTime = new Date(card.nextReview).getTime();
        const daysDifference = Math.floor((reviewTime - now) / (24 * 60 * 60 * 1000));
        
        if (daysDifference < 0) {
          overdue++;
        } else if (daysDifference === 0) {
          dueToday++;
        }
      }
    });
    
    return { overdue, dueToday, newCards };
  };

  const reviewStatus = getCardReviewBreakdown();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onSelect) {
      onSelect(deck);
    } else {
      onStudy(deck);
    }
  };

  return (
    <div
      className={`glass-effect holographic rounded-2xl p-6 hover:neon-glow transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col h-full ${
        isSelected ? 'neon-glow ring-2 ring-cyan-400/50' : ''
      }`}
      style={isSelected ? {
        boxShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3), 0 0 90px rgba(6, 182, 212, 0.1)'
      } : {}}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-cyan-neon">{deck.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="p-2 text-text-secondary hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-text-secondary mb-4 flex-grow">
        {deck.description || 'No description'}
      </p>
      
      <div className="mt-auto">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-text-secondary">{deck.cards.length} cards</span>
          {deck.cards.length > 0 && accuracy > 0 && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                accuracy >= 80 ? 'bg-green-400' : 
                accuracy >= 60 ? 'bg-yellow-400' : 
                'bg-cyan-500'
              }`}></div>
              <span className={`${
                accuracy >= 80 ? 'text-green-400' : 
                accuracy >= 60 ? 'text-yellow-400' : 
                'text-cyan-500'
              }`}>
                {accuracy}% accuracy
              </span>
            </div>
          )}
          {deck.cards.length === 0 && (
            <span className="text-text-secondary">Empty deck</span>
          )}
        </div>
        
        {/* Review Status Indicators */}
        {deck.cards.length > 0 && (
          <div className="flex justify-between items-center flex-wrap gap-2 text-xs mb-2">
            <div className="flex flex-wrap gap-2">
              {reviewStatus.overdue > 0 && (
                <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-md border border-red-400/20">
                  <Flame className="w-3 h-3" />
                  {reviewStatus.overdue} overdue
                </span>
              )}
              {reviewStatus.dueToday > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md border border-yellow-400/20">
                  <Zap className="w-3 h-3" />
                  {reviewStatus.dueToday} due today
                </span>
              )}
              {reviewStatus.newCards > 0 && (
                <span className="flex items-center gap-1 text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20">
                  <Star className="w-3 h-3" />
                  {reviewStatus.newCards} new
                </span>
              )}
              {reviewStatus.overdue === 0 && reviewStatus.dueToday === 0 && reviewStatus.newCards === 0 && (
                <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  All caught up!
                </span>
              )}
            </div>
            {/* Ready to study indicator - right aligned */}
            {accuracy === 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-cyan-500">Ready to study</span>
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        {deck.cards.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(deck);
                }}
                className="flex-1 px-4 py-2 glass-effect border border-text-secondary/20 text-text-secondary rounded-lg hover:border-cyan-500/30 hover:text-cyan-neon transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Deck</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStudy(deck);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Study</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => onDelete(deck.id)}
          title="Delete Deck"
          message={`Are you sure you want to delete "${deck.name}"? This will permanently remove all ${deck.cards.length} flashcards in this deck. This action cannot be undone.`}
          confirmText="Delete Deck"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
