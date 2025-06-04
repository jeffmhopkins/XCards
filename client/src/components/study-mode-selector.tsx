import { useState } from 'react';
import { Shuffle, List, Target, Play, CheckCircle, Tag, Check, ChevronDown, ChevronUp, Brain, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Deck } from '@/lib/types';

interface StudyModeSelectorProps {
  deck: Deck;
  onStartStudy: (mode: StudyMode, cards: any[]) => void;
  onCancel: () => void;
}

export type StudyMode = 'sequence' | 'shuffled' | 'not-easy' | 'not-difficult';

export function StudyModeSelector({ deck, onStartStudy, onCancel }: StudyModeSelectorProps) {
  // Get all unique categories from the deck
  const allCategories = Array.from(new Set(
    deck.cards.flatMap(card => card.categories.length > 0 ? card.categories : ['Uncategorized'])
  )).sort();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(allCategories);
  const [isCategorySelectionExpanded, setIsCategorySelectionExpanded] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['ungraded', 'easy', 'good', 'hard']);
  const [isDifficultySelectionExpanded, setIsDifficultySelectionExpanded] = useState(false);
  const [selectedRecency, setSelectedRecency] = useState<string[]>(['fresh', 'familiar', 'fuzzy', 'forgotten']);
  const [isRecencySelectionExpanded, setIsRecencySelectionExpanded] = useState(false);
  const [shuffleCards, setShuffleCards] = useState(true);



  // Get cards filtered by categories only (for recency calculations)
  const getCategoryFilteredCards = () => {
    let cards = deck.cards;
    
    // Filter by categories only
    if (selectedCategories.length > 0) {
      cards = cards.filter(card => {
        if (card.categories.length === 0) {
          return selectedCategories.includes('Uncategorized');
        }
        return card.categories.some(category => selectedCategories.includes(category));
      });
    }
    
    return cards;
  };

  // Calculate review recency segments with minimum time floors (based on category-filtered cards)
  const getRecencyOptions = () => {
    const categoryFilteredCards = getCategoryFilteredCards();
    const reviewedCards = categoryFilteredCards.filter(card => card.lastReviewed);
    
    if (reviewedCards.length === 0) {
      // If no cards reviewed, only show "Never Studied"
      return [
        {
          id: 'forgotten',
          label: 'Never Studied',
          description: 'Cards not yet reviewed',
          count: categoryFilteredCards.length,
          color: 'text-gray-400',
          bg: 'bg-gray-500/10'
        }
      ];
    }

    const now = new Date().getTime();
    
    // Define minimum time thresholds in milliseconds
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const TWO_DAYS = 2 * ONE_DAY;
    const ONE_WEEK = 7 * ONE_DAY;
    const TWO_WEEKS = 14 * ONE_DAY;

    // Calculate adaptive thresholds with minimum floors
    const reviewTimes = reviewedCards.map(card => new Date(card.lastReviewed!).getTime());
    const oldestTime = Math.min(...reviewTimes);
    const newestTime = Math.max(...reviewTimes);
    const actualSpan = newestTime - oldestTime;
    
    // Use larger of: calculated quarter or minimum threshold
    const freshThreshold = Math.max(ONE_DAY, actualSpan / 4);
    const familiarThreshold = Math.max(TWO_DAYS, actualSpan / 2);
    const fuzzyThreshold = Math.max(ONE_WEEK, (actualSpan * 3) / 4);
    const forgottenThreshold = Math.max(TWO_WEEKS, actualSpan);

    return [
      {
        id: 'fresh',
        label: 'Fresh in Memory',
        description: 'Last 1-2 days (minimum)',
        count: categoryFilteredCards.filter(card => {
          if (!card.lastReviewed) return false;
          const reviewTime = new Date(card.lastReviewed).getTime();
          return now - reviewTime <= freshThreshold;
        }).length,
        color: 'text-green-400',
        bg: 'bg-green-500/10'
      },
      {
        id: 'familiar',
        label: 'Still Familiar',
        description: '2-7 days ago',
        count: categoryFilteredCards.filter(card => {
          if (!card.lastReviewed) return false;
          const reviewTime = new Date(card.lastReviewed).getTime();
          const timeSince = now - reviewTime;
          return timeSince > freshThreshold && timeSince <= familiarThreshold;
        }).length,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10'
      },
      {
        id: 'fuzzy',
        label: 'Getting Fuzzy',
        description: '1-2 weeks ago',
        count: categoryFilteredCards.filter(card => {
          if (!card.lastReviewed) return false;
          const reviewTime = new Date(card.lastReviewed).getTime();
          const timeSince = now - reviewTime;
          return timeSince > familiarThreshold && timeSince <= fuzzyThreshold;
        }).length,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10'
      },
      {
        id: 'forgotten',
        label: 'Likely Forgotten',
        description: '2+ weeks ago or never studied',
        count: categoryFilteredCards.filter(card => {
          if (!card.lastReviewed) return true;
          const reviewTime = new Date(card.lastReviewed).getTime();
          const timeSince = now - reviewTime;
          return timeSince > fuzzyThreshold;
        }).length,
        color: 'text-red-400',
        bg: 'bg-red-500/10'
      }
    ];
  };

  // Get cards filtered by categories and recency (for mastery calculations)
  const getCategoryAndRecencyFilteredCards = () => {
    let cards = getCategoryFilteredCards();
    
    // Filter by recency
    cards = cards.filter(card => {
      if (!card.lastReviewed) {
        return selectedRecency.includes('forgotten');
      }
      
      const now = new Date().getTime();
      const reviewTime = new Date(card.lastReviewed).getTime();
      const timeSince = now - reviewTime;
      
      // Define minimum time thresholds in milliseconds
      const ONE_DAY = 24 * 60 * 60 * 1000;
      const TWO_DAYS = 2 * ONE_DAY;
      const ONE_WEEK = 7 * ONE_DAY;
      const TWO_WEEKS = 14 * ONE_DAY;

      // Calculate adaptive thresholds with minimum floors
      const reviewedCards = deck.cards.filter(c => c.lastReviewed);
      if (reviewedCards.length === 0) {
        return selectedRecency.includes('forgotten');
      }

      const reviewTimes = reviewedCards.map(c => new Date(c.lastReviewed!).getTime());
      const oldestTime = Math.min(...reviewTimes);
      const newestTime = Math.max(...reviewTimes);
      const actualSpan = newestTime - oldestTime;
      
      // Use larger of: calculated quarter or minimum threshold
      const freshThreshold = Math.max(ONE_DAY, actualSpan / 4);
      const familiarThreshold = Math.max(TWO_DAYS, actualSpan / 2);
      const fuzzyThreshold = Math.max(ONE_WEEK, (actualSpan * 3) / 4);

      if (timeSince <= freshThreshold) {
        return selectedRecency.includes('fresh');
      } else if (timeSince <= familiarThreshold) {
        return selectedRecency.includes('familiar');
      } else if (timeSince <= fuzzyThreshold) {
        return selectedRecency.includes('fuzzy');
      } else {
        return selectedRecency.includes('forgotten');
      }
    });
    
    return cards;
  };

  const recencyOptions = getRecencyOptions();

  // Mastery level options with counts (based on category + recency filtered cards)
  const getDifficultyOptions = () => {
    const filteredCards = getCategoryAndRecencyFilteredCards();
    
    return [
      { 
        id: 'ungraded', 
        label: 'Ungraded', 
        description: 'Cards never studied',
        count: filteredCards.filter(card => !card.difficulty).length,
        color: 'text-gray-400',
        bg: 'bg-gray-500/10'
      },
      { 
        id: 'easy', 
        label: 'High Mastery', 
        description: 'Cards you know well',
        count: filteredCards.filter(card => card.difficulty === 'easy').length,
        color: 'text-green-400',
        bg: 'bg-green-500/10'
      },
      { 
        id: 'good', 
        label: 'Medium Mastery', 
        description: 'Cards you know moderately',
        count: filteredCards.filter(card => card.difficulty === 'good').length,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10'
      },
      { 
        id: 'hard', 
        label: 'Low Mastery', 
        description: 'Cards you need more practice',
        count: filteredCards.filter(card => card.difficulty === 'hard').length,
        color: 'text-red-400',
        bg: 'bg-red-500/10'
      }
    ];
  };

  const difficultyOptions = getDifficultyOptions();

  // Filter cards based on selected categories, recency, and mastery level
  const getFilteredCards = () => {
    let cards = deck.cards;
    
    // 1. Filter by categories first
    if (selectedCategories.length > 0) {
      cards = cards.filter(card => {
        if (card.categories.length === 0) {
          return selectedCategories.includes('Uncategorized');
        }
        return card.categories.some(category => selectedCategories.includes(category));
      });
    }
    
    // 2. Filter by recency second
    cards = cards.filter(card => {
      if (!card.lastReviewed) {
        return selectedRecency.includes('forgotten');
      }
      
      const now = new Date().getTime();
      const reviewTime = new Date(card.lastReviewed).getTime();
      const timeSince = now - reviewTime;
      
      // Define minimum time thresholds in milliseconds
      const ONE_DAY = 24 * 60 * 60 * 1000;
      const TWO_DAYS = 2 * ONE_DAY;
      const ONE_WEEK = 7 * ONE_DAY;
      const TWO_WEEKS = 14 * ONE_DAY;

      // Calculate adaptive thresholds with minimum floors
      const reviewedCards = deck.cards.filter(c => c.lastReviewed);
      if (reviewedCards.length === 0) {
        return selectedRecency.includes('forgotten');
      }

      const reviewTimes = reviewedCards.map(c => new Date(c.lastReviewed!).getTime());
      const oldestTime = Math.min(...reviewTimes);
      const newestTime = Math.max(...reviewTimes);
      const actualSpan = newestTime - oldestTime;
      
      // Use larger of: calculated quarter or minimum threshold
      const freshThreshold = Math.max(ONE_DAY, actualSpan / 4);
      const familiarThreshold = Math.max(TWO_DAYS, actualSpan / 2);
      const fuzzyThreshold = Math.max(ONE_WEEK, (actualSpan * 3) / 4);

      if (timeSince <= freshThreshold) {
        return selectedRecency.includes('fresh');
      } else if (timeSince <= familiarThreshold) {
        return selectedRecency.includes('familiar');
      } else if (timeSince <= fuzzyThreshold) {
        return selectedRecency.includes('fuzzy');
      } else {
        return selectedRecency.includes('forgotten');
      }
    });

    // 3. Filter by mastery level last
    cards = cards.filter(card => {
      const cardDifficulty = card.difficulty || 'ungraded';
      return selectedDifficulties.includes(cardDifficulty);
    });
    
    return cards;
  };

  const filteredCards = getFilteredCards();

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories([...allCategories]);
  };

  const selectNoCategories = () => {
    setSelectedCategories([]);
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const selectAllDifficulties = () => {
    setSelectedDifficulties(['ungraded', 'easy', 'good', 'hard']);
  };

  const selectNoDifficulties = () => {
    setSelectedDifficulties([]);
  };

  const toggleRecency = (recency: string) => {
    setSelectedRecency(prev => 
      prev.includes(recency) 
        ? prev.filter(r => r !== recency)
        : [...prev, recency]
    );
  };

  const selectAllRecency = () => {
    setSelectedRecency(['fresh', 'familiar', 'fuzzy', 'forgotten']);
  };

  const selectNoRecency = () => {
    setSelectedRecency([]);
  };

  const handleStartStudy = () => {
    let cards = [...filteredCards];
    
    if (shuffleCards) {
      cards = cards.sort(() => Math.random() - 0.5);
    }

    onStartStudy('shuffled', cards);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
          Choose Study Mode
        </h2>
        <p className="text-text-secondary text-lg">
          Select how you'd like to study <span className="text-cyan-neon font-semibold">{deck.name}</span>
        </p>
      </div>

      {/* Category Selection */}
      {allCategories.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setIsCategorySelectionExpanded(!isCategorySelectionExpanded)}
            className="w-full p-4 glass-effect border border-text-secondary/20 rounded-xl text-text-primary hover:border-cyan-500/30 transition-all duration-300 text-left mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-cyan-neon" />
                <h3 className="text-lg font-semibold text-text-primary">Filter by Categories</h3>
                <span className="text-sm text-text-secondary">
                  ({selectedCategories.length === 0 ? 'All' : selectedCategories.length} selected)
                </span>
              </div>
              {isCategorySelectionExpanded ? (
                <ChevronUp className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              )}
            </div>
          </button>
          
          {isCategorySelectionExpanded && (
            <div className="glass-effect border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-text-secondary">
                  Choose specific categories to focus your study session
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={selectAllCategories}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1 text-xs glass-effect border border-cyan-500/20 text-cyan-400 rounded-lg hover:border-cyan-500/40 transition-all duration-300"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={selectNoCategories}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1 text-xs glass-effect border border-text-secondary/20 text-text-secondary rounded-lg hover:border-text-secondary/40 transition-all duration-300"
                  >
                    Select None
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  const categoryCards = deck.cards.filter(card => 
                    card.categories.length === 0 
                      ? category === 'Uncategorized' 
                      : card.categories.includes(category)
                  );
                  
                  // Calculate category accuracy
                  const reviewedCards = categoryCards.filter(card => card.reviewCount > 0);
                  const totalCorrect = reviewedCards.reduce((sum, card) => sum + card.correctCount, 0);
                  const totalReviews = reviewedCards.reduce((sum, card) => sum + card.reviewCount, 0);
                  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : null;
                  
                  // Determine accuracy color
                  const getAccuracyColor = (acc: number | null) => {
                    if (acc === null) return 'text-gray-400';
                    if (acc >= 80) return 'text-green-400';
                    if (acc >= 60) return 'text-yellow-400';
                    return 'text-red-400';
                  };
                  
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 glass-effect'
                          : 'border-text-secondary/20 bg-void/30 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-cyan-500 bg-cyan-500' 
                            : 'border-text-secondary/40'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-black" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className={`font-medium text-sm ${
                              isSelected ? 'text-cyan-neon' : 'text-text-primary'
                            }`}>
                              {category}
                            </div>
                            {accuracy !== null && (
                              <div className={`text-xs font-semibold ${getAccuracyColor(accuracy)}`}>
                                {accuracy}%
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {categoryCards.length} {categoryCards.length === 1 ? 'card' : 'cards'}
                            {accuracy === null && ' • Not studied'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Recency Filter */}
      <div className="mb-4">
        <button
          onClick={() => setIsRecencySelectionExpanded(!isRecencySelectionExpanded)}
          className="w-full p-4 glass-effect border border-text-secondary/20 rounded-xl text-text-primary hover:border-cyan-500/30 transition-all duration-300 text-left mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-neon" />
              <h3 className="text-lg font-semibold text-text-primary">Filter by Review Recency</h3>
              <span className="text-sm text-text-secondary">
                ({selectedRecency.length} selected)
              </span>
            </div>
            {isRecencySelectionExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-secondary" />
            )}
          </div>
        </button>
        
        {isRecencySelectionExpanded && (
          <div className="glass-effect border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-text-secondary">
                Select cards based on when you last studied them
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={selectAllRecency}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1 text-xs glass-effect border border-cyan-500/20 text-cyan-400 rounded-lg hover:border-cyan-500/40 transition-all duration-300"
                >
                  Select All
                </Button>
                <Button
                  onClick={selectNoRecency}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1 text-xs glass-effect border border-text-secondary/20 text-text-secondary rounded-lg hover:border-text-secondary/40 transition-all duration-300"
                >
                  Select None
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {recencyOptions.map((option) => {
                const isSelected = selectedRecency.includes(option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleRecency(option.id)}
                    className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 glass-effect'
                        : 'border-text-secondary/20 bg-void/30 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-500' 
                          : 'border-text-secondary/40'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-black" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`font-medium text-sm ${
                            isSelected ? 'text-cyan-neon' : 'text-text-primary'
                          }`}>
                            {option.label}
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-lg ${option.bg} ${option.color} border border-current/20`}>
                            {option.count}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mastery Level Filter */}
      <div className="mb-4">
        <button
          onClick={() => setIsDifficultySelectionExpanded(!isDifficultySelectionExpanded)}
          className="w-full p-4 glass-effect border border-text-secondary/20 rounded-xl text-text-primary hover:border-cyan-500/30 transition-all duration-300 text-left mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-neon" />
              <h3 className="text-lg font-semibold text-text-primary">Filter by Mastery Level</h3>
              <span className="text-sm text-text-secondary">
                ({selectedDifficulties.length} selected)
              </span>
            </div>
            {isDifficultySelectionExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-secondary" />
            )}
          </div>
        </button>
        
        {isDifficultySelectionExpanded && (
          <div className="glass-effect border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-text-secondary">
                Select cards based on your mastery level
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={selectAllDifficulties}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1 text-xs glass-effect border border-cyan-500/20 text-cyan-400 rounded-lg hover:border-cyan-500/40 transition-all duration-300"
                >
                  Select All
                </Button>
                <Button
                  onClick={selectNoDifficulties}
                  variant="outline"
                  size="sm"
                  className="px-3 py-1 text-xs glass-effect border border-text-secondary/20 text-text-secondary rounded-lg hover:border-text-secondary/40 transition-all duration-300"
                >
                  Select None
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {difficultyOptions.map((option) => {
                const isSelected = selectedDifficulties.includes(option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleDifficulty(option.id)}
                    className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 glass-effect'
                        : 'border-text-secondary/20 bg-void/30 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-500' 
                          : 'border-text-secondary/40'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-black" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`font-medium text-sm ${
                            isSelected ? 'text-cyan-neon' : 'text-text-primary'
                          }`}>
                            {option.label}
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-lg ${option.bg} ${option.color} border border-current/20`}>
                            {option.count}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Shuffle Toggle */}
      <div className="mb-4">
        <div className="glass-effect border border-text-secondary/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shuffle className="w-5 h-5 text-cyan-neon" />
              <div>
                <div className="font-semibold text-text-primary">Card Order</div>
                <div className="text-sm text-text-secondary">
                  {shuffleCards ? 'Cards will be shuffled randomly' : 'Cards will follow deck order'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShuffleCards(!shuffleCards)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                shuffleCards ? 'bg-cyan-500' : 'bg-text-secondary/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  shuffleCards ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 px-6 py-3 glass-effect border border-text-secondary/20 text-text-secondary rounded-xl hover:border-cyan-500/30 transition-all duration-300"
        >
          Cancel
        </Button>
        <Button
          onClick={handleStartStudy}
          disabled={filteredCards.length === 0}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Study ({filteredCards.length} cards)
        </Button>
      </div>
    </div>
  );
}