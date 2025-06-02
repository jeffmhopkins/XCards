import { useState } from 'react';
import { Shuffle, List, Target, Play, CheckCircle, Tag, Check, ChevronDown, ChevronUp, Brain } from 'lucide-react';
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
  const [shuffleCards, setShuffleCards] = useState(true);

  // Difficulty options with counts
  const difficultyOptions = [
    { 
      id: 'ungraded', 
      label: 'Ungraded', 
      description: 'Cards never studied',
      count: deck.cards.filter(card => !card.difficulty).length,
      color: 'text-gray-400',
      bg: 'bg-gray-500/10'
    },
    { 
      id: 'easy', 
      label: 'Easy', 
      description: 'Last marked as easy',
      count: deck.cards.filter(card => card.difficulty === 'easy').length,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    { 
      id: 'good', 
      label: 'Good', 
      description: 'Last marked as good',
      count: deck.cards.filter(card => card.difficulty === 'good').length,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10'
    },
    { 
      id: 'hard', 
      label: 'Hard', 
      description: 'Last marked as hard',
      count: deck.cards.filter(card => card.difficulty === 'hard').length,
      color: 'text-red-400',
      bg: 'bg-red-500/10'
    }
  ];

  // Filter cards based on selected categories and difficulties
  const getFilteredCards = () => {
    let cards = deck.cards;
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      cards = cards.filter(card => {
        if (card.categories.length === 0) {
          return selectedCategories.includes('Uncategorized');
        }
        return card.categories.some(category => selectedCategories.includes(category));
      });
    }
    
    // Filter by difficulties
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

      {/* Difficulty Filter */}
      <div className="mb-8">
        <button
          onClick={() => setIsDifficultySelectionExpanded(!isDifficultySelectionExpanded)}
          className="w-full p-4 glass-effect border border-text-secondary/20 rounded-xl text-text-primary hover:border-cyan-500/30 transition-all duration-300 text-left mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-neon" />
              <h3 className="text-lg font-semibold text-text-primary">Filter by Difficulty</h3>
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
                Select cards based on how they were last answered
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

      {/* Category Selection */}
      {allCategories.length > 0 && (
        <div className="mb-8">
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
                  const categoryCardCount = deck.cards.filter(card => 
                    card.categories.length === 0 
                      ? category === 'Uncategorized' 
                      : card.categories.includes(category)
                  ).length;
                  
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
                          <div className={`font-medium text-sm ${
                            isSelected ? 'text-cyan-neon' : 'text-text-primary'
                          }`}>
                            {category}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {categoryCardCount} {categoryCardCount === 1 ? 'card' : 'cards'}
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

      {/* Shuffle Toggle */}
      <div className="mb-8">
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