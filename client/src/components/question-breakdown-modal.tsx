import { X, TrendingUp, TrendingDown, Target, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flashcard, StudySession } from '@/lib/types';
import { useState, useMemo } from 'react';

interface QuestionBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  sessions: StudySession[];
  deckId: string;
}

export function QuestionBreakdownModal({ 
  isOpen, 
  onClose, 
  cards, 
  sessions,
  deckId 
}: QuestionBreakdownModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get all unique categories from cards
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    cards.forEach(card => {
      (card.categories || []).forEach(category => categories.add(category));
    });
    return Array.from(categories).sort();
  }, [cards]);

  // Filter cards based on search term and category
  const filteredCards = useMemo(() => {
    let filtered = cards;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(card => 
        card.question.toLowerCase().includes(term) ||
        card.answer.toLowerCase().includes(term) ||
        (card.categories || []).some(category => category.toLowerCase().includes(term))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(card => 
        (card.categories || []).includes(selectedCategory)
      );
    }
    
    return filtered;
  }, [cards, searchTerm, selectedCategory]);

  // Generate autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    const allTerms = new Set<string>();
    
    cards.forEach(card => {
      // Add question words
      card.question.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2 && word.includes(term)) {
          allTerms.add(word);
        }
      });
      
      // Add answer words
      card.answer.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2 && word.includes(term)) {
          allTerms.add(word);
        }
      });
      
      // Add categories
      (card.categories || []).forEach(category => {
        if (category.toLowerCase().includes(term)) {
          allTerms.add(category);
        }
      });
    });
    
    return Array.from(allTerms)
      .filter(suggestion => suggestion !== term)
      .slice(0, 5);
  }, [cards, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-effect holographic rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-8 pb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-cyan-neon" />
            <h3 className="text-2xl font-bold text-cyan-neon">Question Performance History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Box */}
        <div className="px-8 pb-4 relative">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(searchTerm.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search..."
              className="w-full pr-12 p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-cyan-neon transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-effect border border-cyan-500/20 rounded-xl overflow-hidden z-10">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-text-primary hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          {/* Category Filter and Clear Filters */}
          <div className="flex items-center space-x-4 mt-4">
            {/* Category Filter */}
            {allCategories.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-text-secondary" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
                >
                  <option value="">All Categories</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory) && (
              <Button
                onClick={clearFilters}
                className="px-3 py-2 bg-text-secondary/20 border border-text-secondary/30 text-text-secondary rounded-xl hover:bg-text-secondary/30 transition-all duration-300"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {filteredCards.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No questions match your search criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card, index) => {
                const accuracy = card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0;
                const trend = card.correctCount > card.incorrectCount ? 'up' : card.correctCount < card.incorrectCount ? 'down' : 'stable';
                
                return (
                  <div key={card.id} className="bg-void/30 rounded-xl p-4 border border-cyan-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-4">
                        <h4 className="font-semibold text-text-primary mb-2">{card.question}</h4>
                        <p className="text-sm text-text-secondary">{card.answer}</p>
                        {card.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {card.categories.map((category, catIndex) => (
                              <span
                                key={catIndex}
                                className="px-2 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`text-lg font-bold ${
                            accuracy >= 80 ? 'text-green-400' : 
                            accuracy >= 60 ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {accuracy}%
                          </div>
                          {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {card.reviewCount} reviews
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">{card.correctCount}</div>
                        <div className="text-text-secondary">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 font-semibold">{card.incorrectCount}</div>
                        <div className="text-text-secondary">Incorrect</div>
                      </div>
                      <div className="text-center">
                        <div className="text-cyan-400 font-semibold">
                          {card.difficulty ? card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1) : 'New'}
                        </div>
                        <div className="text-text-secondary">Last Rating</div>
                      </div>
                    </div>
                    {card.lastReviewed && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/10">
                        <div className="text-xs text-text-secondary">
                          Last reviewed: {new Date(card.lastReviewed).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}