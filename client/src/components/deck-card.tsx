import { useState } from 'react';
import { Edit2, Trash2, Play } from 'lucide-react';
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
      className={`glass-effect holographic rounded-2xl p-6 hover:neon-glow transition-all duration-300 transform hover:scale-105 cursor-pointer ${
        isSelected ? 'neon-glow ring-2 ring-cyan-400/50' : ''
      }`}
      style={isSelected ? {
        boxShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3), 0 0 90px rgba(6, 182, 212, 0.1)'
      } : {}}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-cyan-neon">{deck.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deck);
            }}
            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
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
      </div>
      
      <p className="text-text-secondary mb-4">
        {deck.description || 'No description'}
      </p>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-text-secondary">{deck.cards.length} cards</span>
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
            {deck.cards.length > 0 ? (accuracy > 0 ? `${accuracy}% accuracy` : 'Ready to study') : 'Empty deck'}
          </span>
        </div>
      </div>
      
      {/* Study Button */}
      {deck.cards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStudy(deck);
            }}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Study Now</span>
          </button>
        </div>
      )}

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
