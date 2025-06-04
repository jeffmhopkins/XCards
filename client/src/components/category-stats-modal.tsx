import { X, Tag, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/lib/types';
import { useState, useMemo } from 'react';

interface CategoryStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
}

interface CategoryStats {
  name: string;
  cardCount: number;
  totalReviews: number;
  correctAnswers: number;
  accuracy: number;
  averageDifficulty: string;
  lastReviewed?: Date;
}

export function CategoryStatsModal({ 
  isOpen, 
  onClose, 
  cards 
}: CategoryStatsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getCategoryStats = (): CategoryStats[] => {
    const categoryMap = new Map<string, Flashcard[]>();
    
    // Group cards by category
    cards.forEach(card => {
      if (card.categories.length === 0) {
        // Handle uncategorized cards
        if (!categoryMap.has('Uncategorized')) {
          categoryMap.set('Uncategorized', []);
        }
        categoryMap.get('Uncategorized')!.push(card);
      } else {
        card.categories.forEach(category => {
          if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
          }
          categoryMap.get(category)!.push(card);
        });
      }
    });

    // Calculate stats for each category
    const categoryStats: CategoryStats[] = [];
    categoryMap.forEach((categoryCards, categoryName) => {
      const totalReviews = categoryCards.reduce((sum, card) => sum + card.reviewCount, 0);
      const correctAnswers = categoryCards.reduce((sum, card) => sum + card.correctCount, 0);
      const accuracy = totalReviews > 0 ? Math.round((correctAnswers / totalReviews) * 100) : 0;
      
      // Calculate average difficulty
      const difficultyScores = categoryCards
        .filter(card => card.difficulty)
        .map(card => {
          switch (card.difficulty) {
            case 'easy': return 3;
            case 'good': return 2;
            case 'hard': return 1;
            default: return 0;
          }
        });
      
      const avgDifficultyScore = difficultyScores.length > 0 
        ? difficultyScores.reduce((sum: number, score: number) => sum + score, 0) / difficultyScores.length
        : 0;
      
      let averageDifficulty = 'New';
      if (avgDifficultyScore > 2.5) averageDifficulty = 'Easy';
      else if (avgDifficultyScore > 1.5) averageDifficulty = 'Good';
      else if (avgDifficultyScore > 0) averageDifficulty = 'Hard';

      // Find last reviewed date
      const lastReviewedDates = categoryCards
        .filter(card => card.lastReviewed)
        .map(card => new Date(card.lastReviewed!));
      const lastReviewed = lastReviewedDates.length > 0 
        ? new Date(Math.max(...lastReviewedDates.map(date => date.getTime())))
        : undefined;

      categoryStats.push({
        name: categoryName,
        cardCount: categoryCards.length,
        totalReviews,
        correctAnswers,
        accuracy,
        averageDifficulty,
        lastReviewed
      });
    });

    // Sort by accuracy descending
    return categoryStats.sort((a, b) => b.accuracy - a.accuracy);
  };

  const allCategoryStats = getCategoryStats();
  
  // Get all available categories for autocomplete
  const allCategories = useMemo(() => {
    return allCategoryStats.map(stat => stat.name);
  }, [allCategoryStats]);

  // Filter categories based on search term
  const filteredCategoryStats = useMemo(() => {
    if (!searchTerm.trim()) {
      return allCategoryStats;
    }
    return allCategoryStats.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategoryStats, searchTerm]);

  // Get suggestions for autocomplete
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    return allCategories.filter(category => 
      category.toLowerCase().includes(searchTerm.toLowerCase()) &&
      category.toLowerCase() !== searchTerm.toLowerCase()
    ).slice(0, 5);
  }, [allCategories, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-effect holographic rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-8 pb-6">
          <div className="flex items-center space-x-3">
            <Tag className="w-6 h-6 text-cyan-neon" />
            <h3 className="text-2xl font-bold text-cyan-neon">Category Performance</h3>
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
              placeholder="Search categories..."
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
            <div className="absolute top-full left-8 right-8 mt-1 glass-effect border border-cyan-500/20 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left text-text-primary hover:bg-cyan-500/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {filteredCategoryStats.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary text-lg">No categories found matching "{searchTerm}"</p>
              <button
                onClick={clearSearch}
                className="text-cyan-400 hover:text-cyan-neon transition-colors mt-2"
              >
                Clear search
              </button>
            </div>
          ) : filteredCategoryStats.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary text-lg">No categories found in this deck</p>
              <p className="text-text-secondary text-sm mt-2">Add categories to your cards to see performance breakdowns</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategoryStats.map((category: CategoryStats, index: number) => (
                <div key={category.name} className="bg-void/30 rounded-xl p-6 border border-cyan-500/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-xl font-semibold text-text-primary">{category.name}</h4>
                        <span className="px-2 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
                          {category.cardCount} cards
                        </span>
                      </div>
                      {category.lastReviewed && (
                        <p className="text-sm text-text-secondary">
                          Last reviewed: {category.lastReviewed.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold mb-1 ${
                        category.accuracy >= 80 ? 'text-green-400' : 
                        category.accuracy >= 60 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {category.accuracy}%
                      </div>
                      <div className="text-sm text-text-secondary">Accuracy</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-text-primary">{category.totalReviews}</div>
                      <div className="text-xs text-text-secondary">Total Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-400">{category.correctAnswers}</div>
                      <div className="text-xs text-text-secondary">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-400">{category.totalReviews - category.correctAnswers}</div>
                      <div className="text-xs text-text-secondary">Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        category.averageDifficulty === 'Easy' ? 'text-green-400' :
                        category.averageDifficulty === 'Good' ? 'text-yellow-400' :
                        category.averageDifficulty === 'Hard' ? 'text-red-400' :
                        'text-text-secondary'
                      }`}>
                        {category.averageDifficulty}
                      </div>
                      <div className="text-xs text-text-secondary">Avg Difficulty</div>
                    </div>
                  </div>
                  
                  {/* Performance indicator */}
                  <div className="mt-4 pt-4 border-t border-cyan-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Performance Trend</span>
                      <div className="flex items-center space-x-2">
                        {category.accuracy >= 80 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">Mastered</span>
                          </>
                        ) : category.accuracy >= 60 ? (
                          <>
                            <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
                            <span className="text-sm text-yellow-400">Learning</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-400">Needs Practice</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        

      </div>
    </div>
  );
}