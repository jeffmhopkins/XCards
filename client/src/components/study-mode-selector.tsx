import { useState, useEffect, useMemo } from 'react';
import { Shuffle, List, Target, Play, CheckCircle, Tag, Check, ChevronDown, ChevronUp, Brain, Clock, Flame, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Deck } from '@/lib/types';
import { LocalStorage } from '@/lib/storage';

interface StudyModeSelectorProps {
  deck: Deck;
  onStartStudy: (mode: StudyMode, cards: any[]) => void;
  onCancel: () => void;
}

export type StudyMode = 'sequence' | 'shuffled' | 'not-easy' | 'not-difficult' | 'spaced-repetition-20' | 'quick-random-20';

export function StudyModeSelector({ deck, onStartStudy, onCancel }: StudyModeSelectorProps) {
  // Get all unique categories from the deck (memoized to prevent re-calculation)
  const allCategories = useMemo(() => {
    return Array.from(new Set(
      deck.cards.flatMap(card => card.categories.length > 0 ? card.categories : ['Uncategorized'])
    )).sort();
  }, [deck.cards]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategorySelectionExpanded, setIsCategorySelectionExpanded] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [isDifficultySelectionExpanded, setIsDifficultySelectionExpanded] = useState(false);
  const [selectedRecency, setSelectedRecency] = useState<string[]>([]);
  const [isRecencySelectionExpanded, setIsRecencySelectionExpanded] = useState(false);
  const [shuffleCards, setShuffleCards] = useState(true);

  // Initialize from saved preferences when categories are available
  useEffect(() => {
    if (allCategories.length > 0) {
      const savedPreferences = LocalStorage.getStudyFilterPreferences();
      
      // For categories, use saved preferences if they exist and are still valid, otherwise default to all categories
      const validSavedCategories = savedPreferences.selectedCategories.filter(cat => allCategories.includes(cat));
      const categoriesToUse = validSavedCategories.length > 0 ? validSavedCategories : allCategories;
      
      // Ensure default selections are always available for keyboard navigation
      const defaultDifficulties = savedPreferences.selectedDifficulties.length > 0 
        ? savedPreferences.selectedDifficulties 
        : ['ungraded', 'easy', 'good', 'hard'];
      const defaultRecency = savedPreferences.selectedRecency.length > 0 
        ? savedPreferences.selectedRecency 
        : ['fresh', 'familiar', 'fuzzy', 'forgotten'];
      
      setSelectedCategories(categoriesToUse);
      setSelectedDifficulties(defaultDifficulties);
      setSelectedRecency(defaultRecency);
      setShuffleCards(savedPreferences.shuffleCards);
    }
  }, [allCategories]); // Run when categories are available

  // Manual save function with explicit values to avoid state timing issues
  const savePreferences = (overrides?: Partial<{
    selectedCategories: string[];
    selectedDifficulties: string[];
    selectedRecency: string[];
    shuffleCards: boolean;
  }>) => {
    const categories = overrides?.selectedCategories ?? selectedCategories;
    const difficulties = overrides?.selectedDifficulties ?? selectedDifficulties;
    const recency = overrides?.selectedRecency ?? selectedRecency;
    const shuffle = overrides?.shuffleCards ?? shuffleCards;
    
    if (categories.length > 0 && difficulties.length > 0) {
      const preferences = {
        selectedCategories: categories,
        selectedDifficulties: difficulties,
        selectedRecency: recency,
        shuffleCards: shuffle,
      };
      LocalStorage.saveStudyFilterPreferences(preferences);
    }
  };



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

  // Spaced Repetition Algorithm - selects 20 cards optimally for retention
  const selectSpacedRepetitionCards = () => {
    const allCards = getFilteredCards();
    const now = new Date().getTime();
    
    // Calculate priority score for each card (lower score = higher priority)
    const cardsWithPriority = allCards.map(card => {
      let priority = 0;
      let difficultyRank = 0; // Secondary sort for tie-breaking
      let recencyRank = 0; // Tertiary sort for when difficulty is also tied
      
      // Priority 1: Overdue cards (nextReview has passed)
      if (card.nextReview && new Date(card.nextReview).getTime() <= now) {
        const overdueDays = Math.floor((now - new Date(card.nextReview).getTime()) / (24 * 60 * 60 * 1000));
        priority = -1000 - overdueDays; // Most overdue first
      }
      // Priority 2: Never reviewed cards
      else if (!card.lastReviewed) {
        priority = -500;
      }
      // Priority 3: Cards reviewed but not yet due
      else if (card.lastReviewed) {
        const daysSinceReview = Math.floor((now - new Date(card.lastReviewed).getTime()) / (24 * 60 * 60 * 1000));
        // Factor in difficulty - harder cards get higher priority
        const difficultyMultiplier = card.difficulty === 'hard' ? 2 : card.difficulty === 'good' ? 1.5 : 1;
        priority = daysSinceReview * difficultyMultiplier;
      }
      
      // Set difficulty rank for tie-breaking (lower = harder)
      difficultyRank = card.difficulty === 'hard' ? 0 : card.difficulty === 'good' ? 1 : 2;
      
      // Set recency rank for final tie-breaking (older = higher priority)
      if (card.lastReviewed) {
        recencyRank = -new Date(card.lastReviewed).getTime(); // Negative so older dates are smaller (higher priority)
      } else {
        recencyRank = 0; // Never reviewed cards get neutral recency
      }
      
      return { card, priority, difficultyRank, recencyRank };
    });
    
    // Sort by priority first, then difficulty, then recency
    const sortedCards = cardsWithPriority
      .sort((a, b) => {
        // Primary sort: Priority score
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Secondary sort: Difficulty (hardest first)
        if (a.difficultyRank !== b.difficultyRank) {
          return a.difficultyRank - b.difficultyRank;
        }
        // Tertiary sort: Recency (oldest first)
        return a.recencyRank - b.recencyRank;
      })
      .slice(0, 20)
      .map(item => item.card);
    
    // Shuffle the selected cards for varied study experience
    const shuffledCards = [...sortedCards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    
    return shuffledCards;
  };

  const filteredCards = getFilteredCards();
  const spacedRepetitionCards = selectSpacedRepetitionCards();

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category];
      // Save with the actual new values to avoid race condition
      setTimeout(() => savePreferences({ selectedCategories: newCategories }), 10);
      return newCategories;
    });
  };

  const selectAllCategories = () => {
    const newCategories = [...allCategories];
    setSelectedCategories(newCategories);
    setTimeout(() => savePreferences({ selectedCategories: newCategories }), 10);
  };

  const selectNoCategories = () => {
    const newCategories: string[] = [];
    setSelectedCategories(newCategories);
    setTimeout(() => savePreferences({ selectedCategories: newCategories }), 10);
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev => {
      const newDifficulties = prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty];
      setTimeout(() => savePreferences({ selectedDifficulties: newDifficulties }), 10);
      return newDifficulties;
    });
  };

  const selectAllDifficulties = () => {
    const newDifficulties = ['ungraded', 'easy', 'good', 'hard'];
    setSelectedDifficulties(newDifficulties);
    setTimeout(() => savePreferences({ selectedDifficulties: newDifficulties }), 10);
  };

  const selectNoDifficulties = () => {
    const newDifficulties: string[] = [];
    setSelectedDifficulties(newDifficulties);
    setTimeout(() => savePreferences({ selectedDifficulties: newDifficulties }), 10);
  };

  const toggleRecency = (recency: string) => {
    setSelectedRecency(prev => {
      const newRecency = prev.includes(recency) 
        ? prev.filter(r => r !== recency)
        : [...prev, recency];
      setTimeout(() => savePreferences({ selectedRecency: newRecency }), 10);
      return newRecency;
    });
  };

  const selectAllRecency = () => {
    const newRecency = ['fresh', 'familiar', 'fuzzy', 'forgotten'];
    setSelectedRecency(newRecency);
    setTimeout(() => savePreferences({ selectedRecency: newRecency }), 10);
  };

  const selectNoRecency = () => {
    const newRecency: string[] = [];
    setSelectedRecency(newRecency);
    setTimeout(() => savePreferences({ selectedRecency: newRecency }), 10);
  };

  const handleStartStudy = () => {
    let cards = [...filteredCards];
    
    if (shuffleCards) {
      // Fisher-Yates shuffle algorithm for proper randomization
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
    }

    onStartStudy('shuffled', cards);
  };

  const handleQuickStudy = () => {
    let cards = [...filteredCards];
    
    // Fisher-Yates shuffle for randomization
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Take first 20 cards (or all if less than 20)
    const quickStudyCards = cards.slice(0, Math.min(20, cards.length));
    
    onStartStudy('quick-random-20', quickStudyCards);
  };

  // Calculate cards due breakdown from ALL filtered cards (for status display)
  const getAllCardsDueBreakdown = () => {
    const cards = getFilteredCards();
    const now = new Date().getTime();
    
    let overdue = 0;
    let dueToday = 0;
    let newCards = 0;
    let dueThisWeek = 0;
    
    cards.forEach(card => {
      if (card.reviewCount === 0) {
        newCards++;
      } else if (card.nextReview) {
        const reviewTime = new Date(card.nextReview).getTime();
        const daysDifference = Math.floor((reviewTime - now) / (24 * 60 * 60 * 1000));
        
        if (daysDifference < 0) {
          overdue++;
        } else if (daysDifference === 0) {
          dueToday++;
        } else if (daysDifference <= 7) {
          dueThisWeek++;
        }
      }
    });
    
    return { overdue, dueToday, newCards, dueThisWeek, total: cards.length };
  };

  // Calculate cards due breakdown for button display (limited to study session)
  const getCardsDueBreakdown = () => {
    const cards = spacedRepetitionCards;
    const now = new Date().getTime();
    
    let overdue = 0;
    let dueToday = 0;
    let newCards = 0;
    let dueThisWeek = 0;
    
    cards.forEach(card => {
      if (card.reviewCount === 0) {
        newCards++;
      } else if (card.nextReview) {
        const reviewTime = new Date(card.nextReview).getTime();
        const daysDifference = Math.floor((reviewTime - now) / (24 * 60 * 60 * 1000));
        
        if (daysDifference < 0) {
          overdue++;
        } else if (daysDifference === 0) {
          dueToday++;
        } else if (daysDifference <= 7) {
          dueThisWeek++;
        }
      }
    });
    
    return { overdue, dueToday, newCards, dueThisWeek, total: cards.length };
  };

  const handleSpacedRepetitionStudy = () => {
    const cards = spacedRepetitionCards;
    onStartStudy('spaced-repetition-20', cards);
  };

  // Add keyboard event handler for Enter key to trigger Smart Review
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (!e.target || (e.target as HTMLElement).tagName !== 'BUTTON')) {
        e.preventDefault();
        // Force recalculation of cards with current filters to avoid stale data
        const currentCards = selectSpacedRepetitionCards();
        if (currentCards.length > 0) {
          onStartStudy('spaced-repetition-20', currentCards);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCategories, selectedRecency, selectedDifficulties, deck.cards, onStartStudy]);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
          Choose Study Mode
        </h2>
        <p className="text-text-secondary text-lg">
          Select how you'd like to study <span className="text-cyan-neon font-semibold">{deck.name}</span>
        </p>
      </div>

      {/* Spaced Repetition Quick Start */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-purple-600/20 to-cyan-500/20 border border-cyan-500/30 rounded-xl p-4 md:p-6 glass-effect">
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-cyan-neon" />
                <h3 className="text-lg md:text-xl font-bold text-text-primary">Smart Review Session</h3>
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                  Recommended
                </span>
              </div>
              <p className="text-text-secondary text-sm mb-3">
                Advanced spaced repetition algorithm intelligently selects up to 20 cards based on learning science. Dynamically prioritizes overdue cards, integrates new material, and adapts to your filter preferences for maximum retention efficiency.
              </p>
              {(() => {
                const breakdown = getAllCardsDueBreakdown();
                return (
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs">
                    {breakdown.overdue > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <Flame className="w-3 h-3" />
                        {breakdown.overdue} overdue
                      </span>
                    )}
                    {breakdown.dueToday > 0 && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Zap className="w-3 h-3" />
                        {breakdown.dueToday} due today
                      </span>
                    )}
                    {breakdown.newCards > 0 && (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Star className="w-3 h-3" />
                        {breakdown.newCards} new
                      </span>
                    )}
                    {breakdown.total === 0 && (
                      <span className="text-text-secondary">
                        No cards match current filters
                      </span>
                    )}
                    {breakdown.total > 0 && breakdown.overdue === 0 && breakdown.dueToday === 0 && breakdown.newCards === 0 && (
                      <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        All caught up! No cards due
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="w-full">
              <Button
                onClick={handleSpacedRepetitionStudy}
                disabled={spacedRepetitionCards.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="hidden md:inline">Start Smart Review</span>
                <span className="md:hidden">Smart Review</span>
                <span className="ml-2 text-sm opacity-80">
                  ({spacedRepetitionCards.length})
                </span>
              </Button>
            </div>
          </div>
        </div>
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
              onClick={() => {
                const newShuffleValue = !shuffleCards;
                setShuffleCards(newShuffleValue);
                setTimeout(() => savePreferences({ shuffleCards: newShuffleValue }), 10);
              }}
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

      <div className="space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={handleQuickStudy}
            disabled={filteredCards.length === 0}
            className="w-1/2 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className="w-4 h-4 mr-2" />
            Quick (20)
          </Button>
          <Button
            onClick={handleStartStudy}
            disabled={filteredCards.length === 0}
            className="w-1/2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 mr-2" />
            Study ({filteredCards.length})
          </Button>
        </div>
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full px-6 py-3 glass-effect border border-text-secondary/20 text-text-secondary rounded-xl hover:border-cyan-500/30 transition-all duration-300"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}