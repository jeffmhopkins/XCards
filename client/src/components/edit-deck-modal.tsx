import { useState, useEffect, useMemo } from 'react';
import { X, Edit2, Trash2, Plus, Download, Copy, FileText, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  // Filter cards based on search term and category
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
    if (selectedCategory) {
      filtered = filtered.filter(card => 
        (card.categories || []).includes(selectedCategory)
      );
    }
    
    return filtered;
  }, [deck, searchTerm, selectedCategory]);

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
      <div className="glass-effect holographic rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-cyan-neon">Edit Deck</h3>
          <button
            onClick={handleClose}
            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-8">
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
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="Deck description"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={() => setExportModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500/50 to-purple-600/50 text-black/80 font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              Save Deck Info
            </Button>
          </div>
        </form>

        <div className="border-t border-cyan-500/20 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-semibold text-text-primary">
              Cards ({filteredCards.length} of {deck.cards.length})
            </h4>
            <Button
              onClick={onAddCard}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
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
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left text-text-primary hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter and Clear Filters */}
            <div className="flex items-center space-x-4">
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
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveCard}
                          className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-300"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingCard(null)}
                          className="px-4 py-2 bg-text-secondary/20 border border-text-secondary/30 text-text-secondary rounded-xl hover:bg-text-secondary/30 transition-all duration-300"
                        >
                          Cancel
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
                      {card.reviewCount > 0 && (
                        <div className="flex items-center space-x-4 text-xs text-text-secondary pt-2 border-t border-cyan-500/10">
                          <span>Reviews: {card.reviewCount}</span>
                          <span>Correct: {card.correctCount}</span>
                          <span>Accuracy: {card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
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