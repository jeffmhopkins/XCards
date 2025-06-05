import { useState, useEffect, useMemo } from 'react';
import { X, Edit2, Trash2, Plus, Download, Copy, FileText, Search, Filter, Zap, Flame, Calendar, Star, BookOpen, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Deck, Flashcard } from '@/lib/types';
import { ConfirmationModal } from './confirmation-modal';

interface EditDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deck: Deck) => void;
  onAddCard: () => void;
  deck: Deck | null;
}

export function EditDeckModal({ isOpen, onClose, onSave, onAddCard, deck }: EditDeckModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingCard, setEditingCard] = useState<{ index: number; card: Flashcard } | null>(null);
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');
  const [cardCategories, setCardCategories] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; cardIndex: number | null }>({
    isOpen: false,
    cardIndex: null
  });
  const [exportModal, setExportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('creation');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeckInfoExpanded, setIsDeckInfoExpanded] = useState(false);

  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description);
    }
  }, [deck]);

  // Get all unique categories from cards
  const allCategories = useMemo(() => {
    if (!deck) return [];
    const categories = new Set<string>();
    deck.cards.forEach(card => {
      (card.categories || []).forEach(category => categories.add(category));
    });
    return Array.from(categories).sort();
  }, [deck]);

  // Filter and sort cards based on search term, category, and sorting options
  const filteredCards = useMemo(() => {
    if (!deck) return [];
    
    let filtered = deck.cards;
    
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
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(card => 
        (card.categories || []).includes(selectedCategory)
      );
    }
    
    // Sort cards based on selected criteria
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'creation':
          // Sort by array index (creation order)
          const indexA = deck.cards.indexOf(a);
          const indexB = deck.cards.indexOf(b);
          comparison = indexA - indexB;
          break;
          
        case 'alphabetical':
          comparison = a.question.localeCompare(b.question);
          break;
          
        case 'accuracy':
          const accuracyA = a.reviewCount > 0 ? (a.correctCount / a.reviewCount) : 0;
          const accuracyB = b.reviewCount > 0 ? (b.correctCount / b.reviewCount) : 0;
          comparison = accuracyA - accuracyB;
          break;
          
        case 'difficulty':
          const difficultyOrder = { 'hard': 0, 'good': 1, 'easy': 2, '': 3 };
          const diffA = difficultyOrder[a.difficulty || ''] ?? 3;
          const diffB = difficultyOrder[b.difficulty || ''] ?? 3;
          comparison = diffA - diffB;
          break;
          
        case 'reviews':
          comparison = a.reviewCount - b.reviewCount;
          break;
          
        case 'lastReviewed':
          const timeA = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
          const timeB = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
          comparison = timeA - timeB;
          break;
          
        case 'nextReview':
          const nextA = a.nextReview ? new Date(a.nextReview).getTime() : Infinity;
          const nextB = b.nextReview ? new Date(b.nextReview).getTime() : Infinity;
          comparison = nextA - nextB;
          break;
          
        case 'categories':
          const categoriesA = (a.categories || []).join(', ');
          const categoriesB = (b.categories || []).join(', ');
          comparison = categoriesA.localeCompare(categoriesB);
          break;
          
        default:
          comparison = 0;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [deck, searchTerm, selectedCategory, sortBy, sortDirection]);

  // Generate autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim() || !deck) return [];
    
    const term = searchTerm.toLowerCase();
    const allTerms = new Set<string>();
    
    deck.cards.forEach(card => {
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
  }, [deck, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deck && name.trim()) {
      onSave({
        ...deck,
        name: name.trim(),
        description: description.trim(),
      });
      onClose();
    }
  };

  const handleEditCard = (index: number, card: Flashcard) => {
    setEditingCard({ index, card });
    setCardQuestion(card.question);
    setCardAnswer(card.answer);
    setCardCategories((card.categories || []).join(', '));
  };

  const handleSaveCard = () => {
    if (deck && editingCard && cardQuestion.trim() && cardAnswer.trim()) {
      const categoryList = cardCategories.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
      const updatedCards = [...deck.cards];
      updatedCards[editingCard.index] = {
        ...editingCard.card,
        question: cardQuestion.trim(),
        answer: cardAnswer.trim(),
        categories: categoryList,
      };
      
      const updatedDeck = {
        ...deck,
        cards: updatedCards,
      };
      
      onSave(updatedDeck);
      
      setEditingCard(null);
      setCardQuestion('');
      setCardAnswer('');
      setCardCategories('');
    }
  };

  const handleDeleteCard = (index: number) => {
    setDeleteConfirmation({ isOpen: true, cardIndex: index });
  };

  const confirmDeleteCard = () => {
    if (deck && deleteConfirmation.cardIndex !== null) {
      const updatedCards = deck.cards.filter((_, i) => i !== deleteConfirmation.cardIndex);
      onSave({
        ...deck,
        cards: updatedCards,
      });
    }
  };

  const generateCSV = () => {
    if (!deck) return '';
    
    const headers = ['Question', 'Answer', 'Categories'];
    const rows = deck.cards.map(card => [
      `"${card.question.replace(/"/g, '""')}"`,
      `"${card.answer.replace(/"/g, '""')}"`,
      `"${(card.categories || []).join(', ').replace(/"/g, '""')}"`
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateCSV());
      setExportModal(false);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadFile = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${deck?.name || 'deck'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportModal(false);
  };

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

  // Function to get spaced repetition status for a card
  const getSpacedRepetitionStatus = (card: Flashcard) => {
    const now = new Date().getTime();
    
    // New card (never reviewed)
    if (card.reviewCount === 0) {
      return {
        icon: Star,
        text: 'New',
        color: 'text-cyan-neon'
      };
    }

    // Check if card is overdue
    if (card.nextReview && new Date(card.nextReview).getTime() <= now) {
      const overdueDays = Math.floor((now - new Date(card.nextReview).getTime()) / (24 * 60 * 60 * 1000));
      return {
        icon: Flame,
        text: overdueDays === 0 ? 'Due Today' : `Overdue ${overdueDays}d`,
        color: overdueDays === 0 ? 'text-yellow-400' : 'text-red-400'
      };
    }

    // Check if card is due soon
    if (card.nextReview) {
      const daysUntilDue = Math.ceil((new Date(card.nextReview).getTime() - now) / (24 * 60 * 60 * 1000));
      if (daysUntilDue <= 1) {
        return {
          icon: Zap,
          text: 'Due Today',
          color: 'text-yellow-400'
        };
      }
      if (daysUntilDue <= 7) {
        return {
          icon: Calendar,
          text: `Due in ${daysUntilDue}d`,
          color: 'text-blue-400'
        };
      }
    }

    // Determine status based on performance
    const accuracy = card.reviewCount > 0 ? (card.correctCount / card.reviewCount) : 0;
    
    if (accuracy >= 0.9 && card.reviewCount >= 5) {
      return {
        icon: CheckCircle,
        text: 'Mastered',
        color: 'text-green-400'
      };
    }

    if (card.difficulty === 'hard' || accuracy < 0.6) {
      return {
        icon: BookOpen,
        text: 'Learning',
        color: 'text-orange-400'
      };
    }

    return {
      icon: Calendar,
      text: 'Review',
      color: 'text-purple-400'
    };
  };

  const handleClose = () => {
    setEditingCard(null);
    setCardQuestion('');
    setCardAnswer('');
    setCardCategories('');
    setDeleteConfirmation({ isOpen: false, cardIndex: null });
    setSearchTerm('');
    setSelectedCategory('');
    setShowSuggestions(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !deck) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-effect holographic rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-8 pb-6 border-b border-cyan-500/20">
          <h3 className="text-2xl font-bold text-cyan-neon">Deck Details</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddCard}
              className="p-2 text-text-secondary hover:text-green-400 transition-colors"
              title="Add Card"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-6">
        
        {/* Collapsible Deck Information Section */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setIsDeckInfoExpanded(!isDeckInfoExpanded)}
            className="w-full flex items-center justify-between p-4 bg-void/50 border border-cyan-500/20 rounded-xl text-text-primary hover:bg-void/70 transition-colors mb-4"
          >
            <h4 className="text-lg font-semibold text-cyan-neon">Deck Information</h4>
            {isDeckInfoExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-secondary" />
            )}
          </button>
          
          {isDeckInfoExpanded && (
            <form onSubmit={handleSubmit} className="glass-effect border border-cyan-500/20 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Deck Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
                    placeholder="Enter deck name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                    placeholder="Deck description"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={() => setExportModal(true)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500/50 to-purple-600/50 text-black/80 font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                >
                  Save Deck Info
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="border-t border-cyan-500/20 pt-6">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-text-primary">
              Cards ({filteredCards.length} of {deck.cards.length})
            </h4>
          </div>

          {/* Search and Filter Section */}
          <div className="space-y-4 mb-6">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search questions, answers, or categories..."
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
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-effect border border-cyan-500/20 rounded-xl overflow-hidden z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }}
                      className="w-full px-4 py-3 text-left text-text-primary hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters and Sorting Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              {allCategories.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-text-secondary" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-void border border-cyan-500/20 rounded-xl">
                      <SelectItem value="all" className="text-text-primary hover:bg-cyan-500/10">
                        All Categories
                      </SelectItem>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category} className="text-text-primary hover:bg-cyan-500/10">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sort By */}
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-text-secondary" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-void border border-cyan-500/20 rounded-xl">
                    <SelectItem value="creation" className="text-text-primary hover:bg-cyan-500/10">
                      Creation Order
                    </SelectItem>
                    <SelectItem value="alphabetical" className="text-text-primary hover:bg-cyan-500/10">
                      Alphabetical
                    </SelectItem>
                    <SelectItem value="accuracy" className="text-text-primary hover:bg-cyan-500/10">
                      Accuracy
                    </SelectItem>
                    <SelectItem value="difficulty" className="text-text-primary hover:bg-cyan-500/10">
                      Difficulty
                    </SelectItem>
                    <SelectItem value="reviews" className="text-text-primary hover:bg-cyan-500/10">
                      Review Count
                    </SelectItem>
                    <SelectItem value="lastReviewed" className="text-text-primary hover:bg-cyan-500/10">
                      Last Reviewed
                    </SelectItem>
                    <SelectItem value="nextReview" className="text-text-primary hover:bg-cyan-500/10">
                      Next Review
                    </SelectItem>
                    <SelectItem value="categories" className="text-text-primary hover:bg-cyan-500/10">
                      Categories
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Direction Toggle */}
              <Button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all duration-300 flex items-center space-x-1"
              >
                {sortDirection === 'asc' ? (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-xs">Asc</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4" />
                    <span className="text-xs">Desc</span>
                  </>
                )}
              </Button>

              {/* Clear Filters Button */}
              {(searchTerm || (selectedCategory && selectedCategory !== 'all') || sortBy !== 'creation' || sortDirection !== 'asc') && (
                <Button
                  onClick={() => {
                    clearFilters();
                    setSortBy('creation');
                    setSortDirection('asc');
                  }}
                  className="px-3 py-2 bg-text-secondary/20 border border-text-secondary/30 text-text-secondary rounded-xl hover:bg-text-secondary/30 transition-all duration-300"
                >
                  Reset All
                </Button>
              )}
            </div>
          </div>

          {deck.cards.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No cards in this deck yet. Click "Add Card" to get started.
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No cards match your search criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card, index) => {
                // Find the original index in the deck for editing
                const originalIndex = deck.cards.findIndex(c => c.id === card.id);
                return (
                <div key={card.id} className="glass-effect border border-cyan-500/20 rounded-xl p-4">
                  {editingCard?.index === originalIndex ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Question
                        </label>
                        <Textarea
                          value={cardQuestion}
                          onChange={(e) => setCardQuestion(e.target.value)}
                          className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Answer
                        </label>
                        <Textarea
                          value={cardAnswer}
                          onChange={(e) => setCardAnswer(e.target.value)}
                          className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Categories (Optional)
                        </label>
                        <Input
                          value={cardCategories}
                          onChange={(e) => setCardCategories(e.target.value)}
                          className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="Enter categories separated by commas"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => setEditingCard(null)}
                          className="px-4 py-2 bg-text-secondary/20 border border-text-secondary/30 text-text-secondary rounded-xl hover:bg-text-secondary/30 transition-all duration-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveCard}
                          className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-300"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-4">
                          <div className="text-sm text-cyan-neon font-medium mb-1">Question</div>
                          <div className="text-text-primary mb-3">{card.question}</div>
                          <div className="text-sm text-purple-neon font-medium mb-1">Answer</div>
                          <div className="text-text-primary mb-3">{card.answer}</div>
                          {(card.categories || []).length > 0 && (
                            <>
                              <div className="text-sm text-text-secondary font-medium mb-1">Categories</div>
                              <div className="flex flex-wrap gap-1">
                                {(card.categories || []).map((category, catIndex) => (
                                  <span
                                    key={catIndex}
                                    className="px-2 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCard(originalIndex, card)}
                            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(originalIndex)}
                            className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center space-x-4">
                          {card.reviewCount > 0 && (
                            <>
                              <span>Reviews: {card.reviewCount}</span>
                              <span>Correct: {card.correctCount}</span>
                              <span>Accuracy: {card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0}%</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {(() => {
                            const status = getSpacedRepetitionStatus(card);
                            const IconComponent = status.icon;
                            return (
                              <>
                                <IconComponent className={`w-3 h-3 ${status.color}`} />
                                <span className={`text-xs font-medium ${status.color}`}>
                                  {status.text}
                                </span>
                              </>
                            );
                          })()}
                        </div>
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

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, cardIndex: null })}
        onConfirm={confirmDeleteCard}
        title="Delete Card"
        message="Are you sure you want to delete this flashcard? This action cannot be undone."
        confirmText="Delete Card"
        confirmVariant="danger"
      />

      {/* Export CSV Modal */}
      {exportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-void border border-cyan-500/20 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary flex items-center">
                <FileText className="w-5 h-5 mr-2 text-cyan-400" />
                Export Deck to CSV
              </h3>
              <button
                onClick={() => setExportModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-secondary mb-6">
              Export all cards from "{deck?.name}" as a CSV file. Choose how you'd like to save the data:
            </p>

            <div className="space-y-3">
              <Button
                onClick={copyToClipboard}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500/70 to-cyan-500/70 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
              
              <Button
                onClick={downloadFile}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500/70 to-emerald-500/70 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as File
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-cyan-500/20">
              <p className="text-xs text-text-secondary">
                CSV format: Question, Answer, Categories
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}