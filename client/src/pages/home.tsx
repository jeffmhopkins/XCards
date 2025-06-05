import { useState, useEffect } from 'react';
import { Plus, BookOpen, TrendingUp, Brain, ChevronDown, BarChart3, Clock, Target, Tag, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewSelector } from '@/components/view-selector';
import { DeckCard } from '@/components/deck-card';
import { StudyCard } from '@/components/study-card';
import { CreateDeckModal } from '@/components/create-deck-modal';
import { EditDeckModal } from '@/components/edit-deck-modal';
import { AddCardModal } from '@/components/add-card-modal';
import { ImportDeckModal } from '@/components/import-deck-modal';
import { SessionCompleteModal } from '@/components/session-complete-modal';
import { StudyModeSelector, StudyMode } from '@/components/study-mode-selector';
import { QuestionBreakdownModal } from '@/components/question-breakdown-modal';
import { CategoryStatsModal } from '@/components/category-stats-modal';
import { AlertModal } from '@/components/alert-modal';
import { ConfirmationModal } from '../components/confirmation-modal';
import { ExitStudyModal } from '@/components/exit-study-modal';
import { AboutModal } from '@/components/about-modal';
import { CardDetailsModal } from '@/components/card-details-modal';
import { AnimatedBackground } from '@/components/animated-background';
import { LocalStorage } from '@/lib/storage';
import { Deck, StudySession, AppStats, ViewType, CreateDeckData, CreateCardData, Flashcard, StudySessionMetadata } from '@/lib/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('decks');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSessionCompleteModalOpen, setIsSessionCompleteModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [sessionResults, setSessionResults] = useState({
    accuracy: 0,
    cardsStudied: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
  });
  const [selectedStatsDecks, setSelectedStatsDecks] = useState<string[]>([]);
  const [isStatsDeckSelectorOpen, setIsStatsDeckSelectorOpen] = useState(false);
  const [showQuestionBreakdown, setShowQuestionBreakdown] = useState(false);
  const [showCategoryStats, setShowCategoryStats] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });
  const [studyModeSelection, setStudyModeSelection] = useState<{ deck: Deck; mode: StudyMode } | null>(null);
  const [currentStudyDeck, setCurrentStudyDeck] = useState<Deck | null>(null);
  const [studySessionCards, setStudySessionCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studySessionStats, setStudySessionStats] = useState({
    correct: 0,
    incorrect: 0,
  });
  const [studySessionMetadata, setStudySessionMetadata] = useState<StudySessionMetadata | null>(null);
  const [resetStatsConfirmation, setResetStatsConfirmation] = useState(false);
  const [exitStudyConfirmation, setExitStudyConfirmation] = useState(false);
  const [pendingViewChange, setPendingViewChange] = useState<ViewType | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [lastStudiedDeckId, setLastStudiedDeckId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{card: Flashcard, deckName: string, deckId: string}>>([]);
  const [selectedCard, setSelectedCard] = useState<{card: Flashcard, deckName: string} | null>(null);

  // Search functionality
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: Array<{card: Flashcard, deckName: string, deckId: string}> = [];
    const searchTerm = query.toLowerCase();

    decks.forEach(deck => {
      deck.cards.forEach(card => {
        const matchesQuestion = card.question.toLowerCase().includes(searchTerm);
        const matchesAnswer = card.answer.toLowerCase().includes(searchTerm);
        const matchesCategory = card.categories.some(cat => 
          cat.toLowerCase().includes(searchTerm)
        );

        if (matchesQuestion || matchesAnswer || matchesCategory) {
          results.push({
            card,
            deckName: deck.name,
            deckId: deck.id
          });
        }
      });
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  };

  // Calculate active stats decks and selected decks for modals
  const getDefaultStatsDeck = () => {
    // Priority 1: Last studied deck (from completed study session)
    if (lastStudiedDeckId && decks.find(d => d.id === lastStudiedDeckId)) {
      return lastStudiedDeckId;
    }
    // Priority 2: Currently selected deck from deck view
    if (selectedDeckId && decks.find(d => d.id === selectedDeckId)) {
      return selectedDeckId;
    }
    // Priority 3: First available deck
    return decks.length > 0 ? decks[0].id : null;
  };

  const activeStatsDecks = selectedStatsDecks.length > 0 
    ? selectedStatsDecks 
    : getDefaultStatsDeck() ? [getDefaultStatsDeck()!] : [];
  const selectedDecks = decks.filter(d => activeStatsDecks.includes(d.id));

  useEffect(() => {
    loadData();
  }, []);

  const selectSpacedRepetitionCards = (cards: Flashcard[], filters?: {
    categories?: string[];
    difficulties?: string[];
    recency?: string[];
  }) => {
    const now = new Date().getTime();
    
    // Apply filters if provided
    let filteredCards = cards;
    
    if (filters) {
      // Filter by categories
      if (filters.categories && filters.categories.length > 0) {
        filteredCards = filteredCards.filter(card => {
          if (card.categories.length === 0) {
            return filters.categories!.includes('Uncategorized');
          }
          return card.categories.some(category => filters.categories!.includes(category));
        });
      }
      
      // Filter by difficulties
      if (filters.difficulties && filters.difficulties.length > 0) {
        filteredCards = filteredCards.filter(card => {
          const cardDifficulty = card.difficulty || 'ungraded';
          return filters.difficulties!.includes(cardDifficulty);
        });
      }
      
      // Filter by recency (simplified for Smart Review)
      if (filters.recency && filters.recency.length > 0) {
        const reviewedCards = filteredCards.filter(card => card.lastReviewed);
        const neverReviewedCards = filteredCards.filter(card => !card.lastReviewed);
        
        let recencyFilteredCards: Flashcard[] = [];
        
        // Add never reviewed cards if 'fresh' is selected
        if (filters.recency.includes('fresh')) {
          recencyFilteredCards.push(...neverReviewedCards);
        }
        
        // Add reviewed cards based on recency segments
        if (reviewedCards.length > 0) {
          const sortedByRecency = reviewedCards.sort((a, b) => 
            new Date(b.lastReviewed!).getTime() - new Date(a.lastReviewed!).getTime()
          );
          
          const segmentSize = Math.max(1, Math.ceil(sortedByRecency.length / 4));
          
          if (filters.recency.includes('familiar')) {
            recencyFilteredCards.push(...sortedByRecency.slice(0, segmentSize));
          }
          if (filters.recency.includes('fuzzy')) {
            recencyFilteredCards.push(...sortedByRecency.slice(segmentSize, segmentSize * 2));
          }
          if (filters.recency.includes('forgotten')) {
            recencyFilteredCards.push(...sortedByRecency.slice(segmentSize * 2));
          }
        }
        
        filteredCards = recencyFilteredCards;
      }
    }
    
    // Calculate priority score for each filtered card (lower score = higher priority)
    const cardsWithPriority = filteredCards.map(card => {
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
    
    // Group cards by priority tiers for better shuffling
    const overdueCards: typeof cardsWithPriority = [];
    const newCards: typeof cardsWithPriority = [];
    const recentCards: typeof cardsWithPriority = [];
    
    cardsWithPriority.forEach(item => {
      if (item.priority < -500) {
        overdueCards.push(item);
      } else if (item.priority === -500) {
        newCards.push(item);
      } else {
        recentCards.push(item);
      }
    });
    
    // Fisher-Yates shuffle function
    const shuffleArray = (array: typeof cardsWithPriority) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    // Sort each priority group by difficulty and recency, then shuffle within equal priority subgroups
    const sortAndShuffleTier = (tier: typeof cardsWithPriority) => {
      // Group by exact priority value
      const priorityGroups = new Map<number, typeof cardsWithPriority>();
      
      tier.forEach(item => {
        if (!priorityGroups.has(item.priority)) {
          priorityGroups.set(item.priority, []);
        }
        priorityGroups.get(item.priority)!.push(item);
      });
      
      // Sort each priority group by difficulty and recency, then shuffle
      const result: typeof cardsWithPriority = [];
      Array.from(priorityGroups.entries())
        .sort(([a], [b]) => a - b) // Sort by priority (lower = higher priority)
        .forEach(([, group]) => {
          // Sort by difficulty and recency within the priority group
          const sortedGroup = group.sort((a, b) => {
            if (a.difficultyRank !== b.difficultyRank) {
              return a.difficultyRank - b.difficultyRank;
            }
            return a.recencyRank - b.recencyRank;
          });
          
          // Shuffle the sorted group to randomize cards with same priority+difficulty+recency
          result.push(...shuffleArray(sortedGroup));
        });
      
      return result;
    };
    
    // Process each tier and combine
    const processedOverdue = sortAndShuffleTier(overdueCards);
    const processedNew = sortAndShuffleTier(newCards);
    const processedRecent = sortAndShuffleTier(recentCards);
    
    // Combine tiers in priority order and take first 20 cards
    const finalCards = [
      ...processedOverdue,
      ...processedNew,
      ...processedRecent
    ]
      .slice(0, 20)
      .map(item => item.card);
    
    return finalCards;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea or modal is open
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                            document.activeElement?.tagName === 'TEXTAREA' ||
                            document.activeElement?.getAttribute('contenteditable') === 'true';
      
      const isModalOpen = isCreateModalOpen || isEditModalOpen || isAddCardModalOpen || 
                         isImportModalOpen || isSessionCompleteModalOpen || showQuestionBreakdown || 
                         showCategoryStats || alertModal.isOpen || isAboutModalOpen || exitStudyConfirmation;

      if (isInputFocused || isModalOpen) return;

      switch (event.code) {
        case 'Enter':
          event.preventDefault();
          if (currentView === 'decks' && selectedDeckId) {
            // Move to study view with selected deck
            setCurrentView('study');
          } else if (currentView === 'study' && !currentStudyDeck && selectedDeckId) {
            // Start Smart Review with selected deck and current filters
            const selectedDeck = decks.find(deck => deck.id === selectedDeckId);
            if (selectedDeck && selectedDeck.cards.length > 0) {
              // Get current filter preferences for Smart Review
              const filterPrefs = LocalStorage.getStudyFilterPreferences();
              const filters = {
                categories: filterPrefs.selectedCategories,
                difficulties: filterPrefs.selectedDifficulties,
                recency: filterPrefs.selectedRecency
              };
              
              // Generate spaced repetition cards for Smart Review with filters
              const spacedRepetitionCards = selectSpacedRepetitionCards(selectedDeck.cards, filters);
              if (spacedRepetitionCards.length > 0) {
                handleStudyModeStart('spaced-repetition-20', spacedRepetitionCards, filters);
              } else {
                showAlert('No Cards Available', 'No cards available for Smart Review with current filters!');
              }
            }
          }
          break;
        
        case 'Escape':
          event.preventDefault();
          if (currentView === 'study') {
            if (!currentStudyDeck) {
              // Return to deck view from study mode selector
              setCurrentView('decks');
              setStudyModeSelection(null);
            } else {
              // In active study session, trigger exit confirmation modal
              handleExitStudy('decks');
            }
          }
          break;
        
        case 'ArrowLeft':
          if (currentView === 'decks' && decks.length > 0) {
            event.preventDefault();
            const currentIndex = selectedDeckId ? decks.findIndex(deck => deck.id === selectedDeckId) : -1;
            const newIndex = currentIndex <= 0 ? decks.length - 1 : currentIndex - 1;
            setSelectedDeckId(decks[newIndex].id);
          }
          break;
        
        case 'ArrowRight':
          if (currentView === 'decks' && decks.length > 0) {
            event.preventDefault();
            const currentIndex = selectedDeckId ? decks.findIndex(deck => deck.id === selectedDeckId) : -1;
            const newIndex = currentIndex >= decks.length - 1 ? 0 : currentIndex + 1;
            setSelectedDeckId(decks[newIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentView, selectedDeckId, decks, currentStudyDeck, isCreateModalOpen, isEditModalOpen, 
      isAddCardModalOpen, isImportModalOpen, isSessionCompleteModalOpen, showQuestionBreakdown, 
      showCategoryStats, alertModal.isOpen, isAboutModalOpen, exitStudyConfirmation]);

  useEffect(() => {
    if (decks.length > 0) {
      const calculatedStats = LocalStorage.calculateStats(decks, sessions);
      setStats(calculatedStats);
      LocalStorage.saveStats(calculatedStats);
    }
  }, [decks, sessions]);

  // Auto-select deck when decks change
  useEffect(() => {
    if (decks.length > 0 && !selectedDeckId) {
      // Select first deck if no deck is selected
      setSelectedDeckId(decks[0].id);
    } else if (decks.length > 0 && selectedDeckId) {
      // Check if selected deck still exists, if not select first available
      const selectedDeckExists = decks.some(deck => deck.id === selectedDeckId);
      if (!selectedDeckExists) {
        setSelectedDeckId(decks[0].id);
      }
    } else if (decks.length === 0) {
      // Clear selection if no decks exist
      setSelectedDeckId(null);
    }
  }, [decks, selectedDeckId]);

  const loadData = () => {
    const loadedDecks = LocalStorage.getDecks();
    const loadedSessions = LocalStorage.getSessions();
    const loadedStats = LocalStorage.getStats();
    
    setDecks(loadedDecks);
    setSessions(loadedSessions);
    setStats(loadedStats);
    
    // Auto-select first deck if no deck is selected and decks exist
    if (loadedDecks.length > 0 && !selectedDeckId) {
      setSelectedDeckId(loadedDecks[0].id);
    }
  };

  const createDeck = (data: CreateDeckData) => {
    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      name: data.name,
      description: data.description,
      cards: [],
      createdAt: new Date(),
      totalStudySessions: 0,
      stats: {
        totalReviews: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageAccuracy: 0,
      },
    };

    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    LocalStorage.saveDecks(updatedDecks);
    setSelectedDeckId(newDeck.id); // Auto-select the newly created deck
  };

  const createSampleDeck = () => {
    const sampleDeck = LocalStorage.createSampleDeck();
    const updatedDecks = [...decks, sampleDeck];
    setDecks(updatedDecks);
    LocalStorage.saveDecks(updatedDecks);
    setSelectedDeckId(sampleDeck.id);
  };

  const importDeck = (deck: Deck) => {
    const updatedDecks = [...decks, deck];
    setDecks(updatedDecks);
    LocalStorage.saveDecks(updatedDecks);
    setSelectedDeckId(deck.id); // Auto-select the newly imported deck
  };

  const addCardsToExistingDeck = (deckId: string, cards: Flashcard[]) => {
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        // Check for duplicates and add unique cards only
        const existingQuestions = new Set(deck.cards.map(card => card.question.toLowerCase().trim()));
        const newCards = cards.filter(card => !existingQuestions.has(card.question.toLowerCase().trim()));
        
        return {
          ...deck,
          cards: [...deck.cards, ...newCards]
        };
      }
      return deck;
    });
    
    setDecks(updatedDecks);
    LocalStorage.saveDecks(updatedDecks);
    
    // Show success message
    const targetDeck = decks.find(deck => deck.id === deckId);
    const addedCount = cards.filter(card => {
      const existingQuestions = new Set(targetDeck?.cards.map(c => c.question.toLowerCase().trim()) || []);
      return !existingQuestions.has(card.question.toLowerCase().trim());
    }).length;
    const skippedCount = cards.length - addedCount;
    
    setAlertModal({
      isOpen: true,
      title: 'Cards Added Successfully',
      message: `Added ${addedCount} new cards to "${targetDeck?.name}"${skippedCount > 0 ? `. Skipped ${skippedCount} duplicate cards.` : '.'}`
    });
  };

  const deleteDeck = (deckId: string) => {
    const updatedDecks = decks.filter(deck => deck.id !== deckId);
    setDecks(updatedDecks);
    LocalStorage.saveDecks(updatedDecks);
  };

  const editDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setIsEditModalOpen(true);
  };

  const saveDeck = (updatedDeck: Deck) => {
    const updatedDecks = decks.map(deck => 
      deck.id === updatedDeck.id ? updatedDeck : deck
    );
    setDecks(updatedDecks);
    LocalStorage.saveDecks(updatedDecks);
  };

  const addCard = (data: CreateCardData) => {
    if (!editingDeck) return;

    const newCard: Flashcard = {
      id: `card_${Date.now()}`,
      question: data.question,
      answer: data.answer,
      categories: data.categories,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      createdAt: new Date(),
    };

    const updatedDeck = {
      ...editingDeck,
      cards: [...editingDeck.cards, newCard],
    };

    saveDeck(updatedDeck);
    setEditingDeck(updatedDeck);
  };

  const openAddCardModal = () => {
    setIsAddCardModalOpen(true);
  };

  const showAlert = (title: string, message: string) => {
    setAlertModal({ isOpen: true, title, message });
  };

  const resetAllStatistics = () => {
    // Reset all card statistics
    const resetDecks = decks.map(deck => ({
      ...deck,
      lastStudied: undefined,
      totalStudySessions: 0,
      stats: {
        totalReviews: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageAccuracy: 0,
      },
      cards: deck.cards.map(card => ({
        ...card,
        difficulty: undefined,
        nextReview: undefined,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: undefined,
      }))
    }));

    // Clear all sessions
    const resetSessions: StudySession[] = [];

    // Save to storage
    LocalStorage.saveDecks(resetDecks);
    LocalStorage.saveSessions(resetSessions);

    // Update state
    setDecks(resetDecks);
    setSessions(resetSessions);

    // Recalculate stats
    const calculatedStats = LocalStorage.calculateStats(resetDecks, resetSessions);
    setStats(calculatedStats);

    setResetStatsConfirmation(false);
    showAlert('Statistics Reset', 'All statistics have been successfully reset. Your cards remain but all progress data has been cleared.');
  };

  const handleExitStudy = (targetView?: ViewType) => {
    if (targetView) {
      setPendingViewChange(targetView);
    }
    setExitStudyConfirmation(true);
  };

  const confirmExitStudy = () => {
    // Save current session progress
    if (currentStudyDeck && (studySessionStats.correct > 0 || studySessionStats.incorrect > 0)) {
      const sessionAccuracy = studySessionStats.correct + studySessionStats.incorrect > 0 
        ? Math.round((studySessionStats.correct / (studySessionStats.correct + studySessionStats.incorrect)) * 100)
        : 0;

      const newSession: StudySession = {
        deckId: currentStudyDeck.id,
        startTime: new Date(),
        endTime: new Date(),
        cardsStudied: currentCardIndex + 1,
        correctAnswers: Math.floor(studySessionStats.correct),
        incorrectAnswers: studySessionStats.incorrect,
        sessionAccuracy: sessionAccuracy,
      };

      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);
      LocalStorage.saveSessions(updatedSessions);
    }

    // Get target view before clearing state
    const targetView = pendingViewChange || 'decks';
    
    // Clear all state immediately
    setCurrentStudyDeck(null);
    setStudySessionCards([]);
    setCurrentCardIndex(0);
    setStudySessionStats({ correct: 0, incorrect: 0 });
    setStudySessionMetadata(null);
    setPendingViewChange(null);
    setExitStudyConfirmation(false);
    setCurrentView(targetView);
  };

  const restartStudySession = () => {
    if (!studySessionMetadata) return;

    // Get the updated deck from current state
    const updatedDeck = decks.find(d => d.id === studySessionMetadata.originalDeck.id);
    if (!updatedDeck) {
      showAlert('Error', 'Deck not found for restart');
      return;
    }

    // Recalculate cards based on the original study mode and filters
    let newCards: Flashcard[] = [];
    
    switch (studySessionMetadata.mode) {
      case 'spaced-repetition-20':
        // Use stored filters or current filter preferences
        const filters = studySessionMetadata.filters || {
          categories: LocalStorage.getStudyFilterPreferences().selectedCategories,
          difficulties: LocalStorage.getStudyFilterPreferences().selectedDifficulties,
          recency: LocalStorage.getStudyFilterPreferences().selectedRecency
        };
        newCards = selectSpacedRepetitionCards(updatedDeck.cards, filters);
        break;
      case 'quick-random-20':
        newCards = [...updatedDeck.cards];
        // Apply Fisher-Yates shuffle
        for (let i = newCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
        }
        // Take first 20 cards (or all if less than 20)
        newCards = newCards.slice(0, Math.min(20, newCards.length));
        break;
      case 'shuffled':
        newCards = [...updatedDeck.cards];
        // Apply Fisher-Yates shuffle
        for (let i = newCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
        }
        break;
      case 'sequence':
        newCards = [...updatedDeck.cards];
        break;
      case 'not-easy':
        newCards = updatedDeck.cards.filter(card => card.difficulty !== 'easy');
        break;
      case 'not-difficult':
        newCards = updatedDeck.cards.filter(card => card.difficulty !== 'hard');
        break;
      default:
        newCards = [...updatedDeck.cards];
    }

    if (newCards.length === 0) {
      showAlert('No Cards Available', 'No cards available for this study mode!');
      return;
    }

    // Update metadata with current deck state
    const updatedMetadata = {
      ...studySessionMetadata,
      originalDeck: updatedDeck
    };

    // Restart the study session
    setCurrentStudyDeck(updatedDeck);
    setStudySessionCards(newCards);
    setCurrentCardIndex(0);
    setStudySessionStats({ correct: 0, incorrect: 0 });
    setStudySessionMetadata(updatedMetadata);
    setIsSessionCompleteModalOpen(false);
  };

  const discardStudySession = () => {
    // Get target view before clearing state
    const targetView = pendingViewChange || 'decks';
    
    // Clear all state immediately
    setCurrentStudyDeck(null);
    setCurrentCardIndex(0);
    setStudySessionStats({ correct: 0, incorrect: 0 });
    setPendingViewChange(null);
    setExitStudyConfirmation(false);
    setCurrentView(targetView);
  };

  const selectDeck = (deck: Deck) => {
    console.log('Selecting deck:', deck.name, deck.id);
    setSelectedDeckId(deck.id);
  };

  const startStudySession = (deck: Deck) => {
    if (deck.cards.length === 0) {
      showAlert('No Cards Available', 'This deck has no cards to study. Add some cards first!');
      return;
    }
    
    setSelectedDeckId(deck.id);
    setStudyModeSelection({ deck, mode: 'shuffled' });
    setCurrentView('study');
  };

  const handleStudyModeStart = (mode: StudyMode, cards: any[], filters?: any) => {
    if (cards.length === 0) {
      showAlert('No Cards Available', 'No cards available for this study mode!');
      return;
    }

    // Check if we have a valid study mode selection or use selected deck
    let deckToStudy;
    if (studyModeSelection?.deck) {
      deckToStudy = studyModeSelection.deck;
    } else if (selectedDeckId) {
      const selectedDeck = decks.find(deck => deck.id === selectedDeckId);
      if (selectedDeck) {
        deckToStudy = selectedDeck;
      } else {
        showAlert('Error', 'No deck selected for study!');
        return;
      }
    } else {
      showAlert('Error', 'No deck selected for study!');
      return;
    }

    // Store study session metadata for restart functionality
    const metadata: StudySessionMetadata = {
      mode,
      originalDeck: deckToStudy,
      filters
    };

    setCurrentStudyDeck(deckToStudy);
    setStudySessionCards(cards);
    setCurrentCardIndex(0);
    setStudySessionStats({ correct: 0, incorrect: 0 });
    setStudySessionMetadata(metadata);
    setStudyModeSelection(null);
  };

  const handleStudyModeCancel = () => {
    setStudyModeSelection(null);
    setCurrentView('decks');
  };

  // Calculate next review date using spaced repetition algorithm
  const calculateNextReview = (difficulty: 'easy' | 'good' | 'hard', currentReviewCount: number): Date => {
    const now = new Date();
    let intervalDays = 1;
    
    // SM-2 inspired algorithm with simplified intervals
    if (currentReviewCount === 0) {
      // First review
      intervalDays = difficulty === 'hard' ? 1 : difficulty === 'good' ? 2 : 4;
    } else {
      // Subsequent reviews
      const baseInterval = currentReviewCount === 1 ? 3 : Math.pow(2.5, currentReviewCount - 1);
      
      switch (difficulty) {
        case 'hard':
          intervalDays = Math.max(1, Math.floor(baseInterval * 0.6));
          break;
        case 'good':
          intervalDays = Math.floor(baseInterval);
          break;
        case 'easy':
          intervalDays = Math.floor(baseInterval * 1.5);
          break;
      }
    }
    
    // Cap maximum interval at 180 days
    intervalDays = Math.min(intervalDays, 180);
    
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + intervalDays);
    return nextReview;
  };

  const handleStudyAnswer = (difficulty: 'easy' | 'good' | 'hard') => {
    if (!currentStudyDeck || studySessionCards.length === 0) return;

    const currentCard = studySessionCards[currentCardIndex];

    // Calculate credit: easy = 1, good = 1, hard = 0
    const creditAmount = difficulty === 'easy' ? 1 : difficulty === 'good' ? 1 : 0;
    const isCorrect = difficulty !== 'hard';
    
    const updatedStats = {
      correct: studySessionStats.correct + creditAmount,
      incorrect: studySessionStats.incorrect + (isCorrect ? 0 : 1),
    };
    setStudySessionStats(updatedStats);

    // Update card statistics in the main deck
    const updatedDecks = decks.map(deck => {
      if (deck.id === currentStudyDeck.id) {
        const updatedCards = deck.cards.map(card => {
          if (card.id === currentCard.id) {
            const nextReview = calculateNextReview(difficulty, card.reviewCount);
            const updatedCard = {
              ...card,
              reviewCount: card.reviewCount + 1,
              correctCount: card.correctCount + creditAmount,
              incorrectCount: card.incorrectCount + (isCorrect ? 0 : 1),
              lastReviewed: new Date(),
              nextReview,
              difficulty,
            };
            return updatedCard;
          }
          return card;
        });

        const updatedDeckStats = {
          ...deck.stats,
          totalReviews: deck.stats.totalReviews + 1,
          correctAnswers: deck.stats.correctAnswers + creditAmount,
          incorrectAnswers: deck.stats.incorrectAnswers + (isCorrect ? 0 : 1),
        };
        updatedDeckStats.averageAccuracy = updatedDeckStats.totalReviews > 0 
          ? Math.round((updatedDeckStats.correctAnswers / updatedDeckStats.totalReviews) * 100)
          : 0;

        return {
          ...deck,
          cards: updatedCards,
          stats: updatedDeckStats,
          lastStudied: new Date(),
        };
      }
      return deck;
    });

    setDecks(updatedDecks);
    LocalStorage.saveDecks(updatedDecks);

    // Update the study session cards with the new difficulty
    const updatedStudySessionCards = studySessionCards.map(card => {
      if (card.id === currentCard.id) {
        const nextReview = calculateNextReview(difficulty, card.reviewCount);
        return {
          ...card,
          reviewCount: card.reviewCount + 1,
          correctCount: card.correctCount + creditAmount,
          incorrectCount: card.incorrectCount + (isCorrect ? 0 : 1),
          lastReviewed: new Date(),
          nextReview,
          difficulty,
        };
      }
      return card;
    });
    setStudySessionCards(updatedStudySessionCards);

    // Move to next card or finish session
    if (currentCardIndex < studySessionCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Session complete
      const newSession: StudySession = {
        deckId: currentStudyDeck.id,
        startTime: new Date(),
        endTime: new Date(),
        cardsStudied: studySessionCards.length,
        correctAnswers: updatedStats.correct,
        incorrectAnswers: updatedStats.incorrect,
        sessionAccuracy: Math.round((updatedStats.correct / studySessionCards.length) * 100),
      };

      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);
      LocalStorage.saveSessions(updatedSessions);

      // Show session complete modal
      setSessionResults({
        accuracy: newSession.sessionAccuracy,
        cardsStudied: newSession.cardsStudied,
        correctAnswers: newSession.correctAnswers,
        incorrectAnswers: newSession.incorrectAnswers,
      });
      setLastStudiedDeckId(currentStudyDeck.id);
      setIsSessionCompleteModalOpen(true);
      // Don't clear study deck and metadata yet - keep for restart functionality
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-20">
      <div className="inline-block p-6 glass-effect rounded-3xl holographic mb-8 animate-float">
        <BookOpen className="w-16 h-16 mx-auto text-cyan-neon" />
      </div>
      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
        Welcome to xCards
      </h2>
      <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
        Initialize your learning matrix. Create your first deck or generate sample data to begin neural training.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105"
        >
          Create New Deck
        </Button>
        <Button
          onClick={createSampleDeck}
          variant="outline"
          className="px-8 py-4 glass-effect holographic text-cyan-neon font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105"
        >
          Generate Sample Deck
        </Button>
        <Button
          onClick={() => setIsImportModalOpen(true)}
          variant="outline"
          className="px-8 py-4 glass-effect holographic text-purple-neon font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105"
        >
          Import Deck
        </Button>
      </div>
    </div>
  );

  const renderDecksView = () => {
    if (decks.length === 0) {
      return renderEmptyState();
    }

    return (
      <>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Your Decks</h2>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Deck
          </Button>
        </div>
        
        <div 
          className={`gap-6 ${
            decks.length === 1 
              ? "flex flex-col items-center" 
              : "grid grid-cols-1 md:grid-cols-2"
          }`}
          onClick={(e) => {
            // Prevent clearing selection when clicking in empty areas
            e.stopPropagation();
          }}
        >
          {decks.length === 1 && (
            <>
              <div className="w-full max-w-md">
                {decks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    onEdit={editDeck}
                    onDelete={deleteDeck}
                    onStudy={startStudySession}
                    onSelect={selectDeck}
                    isSelected={selectedDeckId === deck.id}
                  />
                ))}
              </div>
              <div className="w-full max-w-md">
                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  variant="outline"
                  className="w-full px-6 py-3 glass-effect border border-cyan-500/20 text-cyan-400 rounded-xl hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Import from CSV
                </Button>
              </div>
            </>
          )}
          {decks.length > 1 && (
            <>
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  onEdit={editDeck}
                  onDelete={deleteDeck}
                  onStudy={startStudySession}
                  onSelect={selectDeck}
                  isSelected={selectedDeckId === deck.id}
                />
              ))}
              <div className="flex justify-center md:col-span-2">
                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  variant="outline"
                  className="px-6 py-3 glass-effect border border-cyan-500/20 text-cyan-400 rounded-xl hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Import from CSV
                </Button>
              </div>
            </>
          )}
        </div>
        
        {/* Bottom padding for floating search bar */}
        <div className="pb-24"></div>

        {/* Floating Search Bar - Only show on deck view */}
        {currentView === 'decks' && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-3 glass-effect border border-cyan-500/30 rounded-xl p-2 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.deckId}-${result.card.id}`}
                    onClick={() => setSelectedCard({ card: result.card, deckName: result.deckName })}
                    className="w-full p-3 hover:bg-cyan-500/10 rounded-lg transition-colors duration-200 text-left border-b border-white/10 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-text-primary mb-1 truncate">
                      {result.card.question}
                    </div>
                    <div className="text-xs text-text-secondary truncate mb-1">
                      {result.card.answer}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cyan-400">{result.deckName}</span>
                      {result.card.categories.length > 0 && (
                        <div className="flex gap-1">
                          {result.card.categories.slice(0, 2).map((cat, i) => (
                            <span key={i} className="text-xs text-purple-400 bg-purple-500/20 px-1 py-0.5 rounded">
                              {cat}
                            </span>
                          ))}
                          {result.card.categories.length > 2 && (
                            <span className="text-xs text-text-secondary">+{result.card.categories.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  performSearch(e.target.value);
                }}
                className="w-full pl-10 pr-10 py-3 glass-effect border border-cyan-500/30 rounded-xl text-text-primary placeholder-text-secondary bg-transparent focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-text-secondary hover:text-text-primary transition-colors" />
                </button>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderStudyView = () => {
    // Show study mode selector if a deck is selected but study hasn't started
    if (studyModeSelection && !currentStudyDeck) {
      return (
        <StudyModeSelector
          deck={studyModeSelection.deck}
          onStartStudy={handleStudyModeStart}
          onCancel={handleStudyModeCancel}
        />
      );
    }

    // If no study session is active but there's a selected deck, show the study mode selector
    if (!currentStudyDeck && selectedDeckId) {
      const selectedDeck = decks.find(deck => deck.id === selectedDeckId);
      if (selectedDeck) {
        return (
          <StudyModeSelector
            deck={selectedDeck}
            onStartStudy={handleStudyModeStart}
            onCancel={() => {
              setSelectedDeckId(null);
              setCurrentView('decks');
            }}
          />
        );
      }
    }

    if (!currentStudyDeck) {
      return (
        <div className="text-center py-20">
          <div className="inline-block p-6 glass-effect rounded-3xl holographic mb-8 animate-float">
            <Brain className="w-16 h-16 mx-auto text-purple-neon" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Ready to Study
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
            Select a deck from your collection to begin a study session. Go to the Decks view to choose which cards you'd like to review.
          </p>
          <Button
            onClick={() => setCurrentView('decks')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105"
          >
            Browse Decks
          </Button>
        </div>
      );
    }

    if (studySessionCards.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg">This deck has no cards to study</p>
        </div>
      );
    }

    return (
      <>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-text-primary">{currentStudyDeck.name}</h2>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-neon">{currentCardIndex + 1}</div>
              <div className="text-text-secondary">of {studySessionCards.length}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{studySessionStats.correct}</div>
              <div className="text-text-secondary">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{studySessionStats.incorrect}</div>
              <div className="text-text-secondary">Incorrect</div>
            </div>
          </div>
        </div>

        <StudyCard
          card={studySessionCards[currentCardIndex]}
          onAnswer={handleStudyAnswer}
          onExit={handleExitStudy}
          currentIndex={currentCardIndex}
          totalCards={studySessionCards.length}
        />
      </>
    );
  };

  const renderStatsView = () => {

    if (selectedDecks.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="inline-block p-6 glass-effect rounded-3xl holographic mb-8 animate-float">
            <TrendingUp className="w-16 h-16 mx-auto text-magenta-neon" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Gather Statistics
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
            Track your learning progress and performance metrics. Create your first deck to begin analyzing your study patterns and accuracy rates.
          </p>
          <Button
            onClick={() => setCurrentView('decks')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105"
          >
            Browse Decks
          </Button>
        </div>
      );
    }

    // Calculate combined statistics for selected decks
    const deckSessions = sessions.filter(session => activeStatsDecks.includes(session.deckId));
    const recentSessions = deckSessions.slice(-7);
    const allCards = selectedDecks.flatMap(deck => deck.cards);
    const totalReviews = allCards.reduce((sum, card) => sum + card.reviewCount, 0);
    const totalCorrect = allCards.reduce((sum, card) => sum + card.correctCount, 0);
    const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    const recentAccuracy = recentSessions.length > 0 
      ? Math.round(recentSessions.reduce((sum, s) => sum + s.sessionAccuracy, 0) / recentSessions.length)
      : 0;
    const trend = recentSessions.length >= 2 
      ? recentSessions[recentSessions.length - 1].sessionAccuracy > recentSessions[0].sessionAccuracy 
        ? 'up' : 'down'
      : 'stable';

    return (
      <>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">
              {selectedDecks.length === 1 
                ? selectedDecks[0].name 
                : `${selectedDecks.length} Decks Combined`}
            </h2>
            <p className="text-text-secondary">
              {selectedDecks.length === 1 
                ? selectedDecks[0].description || 'Deck Statistics & Insights'
                : `Statistics across ${selectedDecks.map(d => d.name).join(', ')}`}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsStatsDeckSelectorOpen(!isStatsDeckSelectorOpen)}
              className="glass-effect rounded-xl p-3 flex items-center space-x-2 text-text-primary hover:text-cyan-neon transition-colors"
            >
              <span>Filter Decks ({activeStatsDecks.length})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isStatsDeckSelectorOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isStatsDeckSelectorOpen && (
              <div className="absolute top-full right-0 mt-2 glass-effect holographic rounded-xl border border-cyan-500/20 overflow-hidden z-50 min-w-64">
                <div className="p-3 border-b border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">Select Decks</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedStatsDecks(decks.map(d => d.id))}
                        className="text-xs text-cyan-400 hover:text-cyan-neon"
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedStatsDecks([])}
                        className="text-xs text-text-secondary hover:text-text-primary"
                      >
                        None
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {decks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => {
                        const isSelected = selectedStatsDecks.includes(deck.id);
                        if (isSelected) {
                          setSelectedStatsDecks(prev => prev.filter(id => id !== deck.id));
                        } else {
                          setSelectedStatsDecks(prev => [...prev, deck.id]);
                        }
                      }}
                      className={`w-full p-3 text-left transition-colors hover:bg-cyan-500/10 flex items-center justify-between ${
                        selectedStatsDecks.includes(deck.id) ? 'text-cyan-neon bg-cyan-500/5' : 'text-text-primary'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{deck.name}</div>
                        <div className="text-xs text-text-secondary">{deck.cards.length} cards</div>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedStatsDecks.includes(deck.id) 
                          ? 'bg-cyan-500 border-cyan-500' 
                          : 'border-cyan-500/30'
                      }`}>
                        {selectedStatsDecks.includes(deck.id) && (
                          <div className="w-full h-full flex items-center justify-center text-black text-xs">✓</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-cyan-500/20">
                  <button
                    onClick={() => setIsStatsDeckSelectorOpen(false)}
                    className="w-full px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all duration-300"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-effect holographic rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-neon mb-2">{allCards.length}</div>
              <div className="text-text-secondary">Total Cards</div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                overallAccuracy >= 80 ? 'text-green-400' : 
                overallAccuracy >= 60 ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {overallAccuracy}%
              </div>
              <div className="text-text-secondary">Overall Accuracy</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-neon mb-2">{deckSessions.length}</div>
              <div className="text-text-secondary">Study Sessions</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-effect holographic rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-neon">Recent Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-text-secondary">Last 7 Sessions Avg</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${
                    recentAccuracy >= 80 ? 'text-green-400' : 
                    recentAccuracy >= 60 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {recentAccuracy}%
                  </span>
                  {trend === 'up' && <span className="text-green-400">↗</span>}
                  {trend === 'down' && <span className="text-red-400">↘</span>}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-text-secondary">Total Reviews</span>
                </div>
                <span className="font-semibold text-text-primary">{totalReviews}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-text-secondary">Last Studied</span>
                </div>
                <span className="font-semibold text-text-primary">
                  {selectedDecks.length === 1 && selectedDecks[0].lastStudied 
                    ? new Date(selectedDecks[0].lastStudied).toLocaleDateString() 
                    : selectedDecks.length > 1 
                      ? 'Multiple decks' 
                      : 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-effect holographic rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-neon">Detailed Analysis</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowQuestionBreakdown(true)}
                className="w-full p-3 glass-effect border border-cyan-500/20 rounded-xl text-text-primary hover:border-cyan-500/40 hover:text-cyan-neon transition-all duration-300 text-left"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <div className="font-medium">Question Performance History</div>
                </div>
                <div className="text-sm text-text-secondary">View detailed breakdown of each question</div>
              </button>
              
              <button
                onClick={() => setShowCategoryStats(true)}
                className="w-full p-3 glass-effect border border-purple-500/20 rounded-xl text-text-primary hover:border-purple-500/40 hover:text-purple-neon transition-all duration-300 text-left"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <div className="font-medium">Category Statistics</div>
                </div>
                <div className="text-sm text-text-secondary">View performance by category</div>
              </button>
            </div>
          </div>
        </div>

        {/* Spaced Repetition Analytics */}
        {selectedDecks.some(deck => deck.cards.some(card => card.reviewCount > 0)) && (
          <div className="space-y-6 mb-8">
            <div className="glass-effect holographic rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-neon">Spaced Repetition Analytics</h3>
              
              {/* Card Status Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {(() => {
                  const allCards = selectedDecks.flatMap(deck => deck.cards);
                  const newCards = allCards.filter(card => card.reviewCount === 0).length;
                  const learningCards = allCards.filter(card => card.reviewCount > 0 && card.reviewCount < 3).length;
                  const reviewCards = allCards.filter(card => card.reviewCount >= 3 && (!card.nextReview || new Date(card.nextReview) <= new Date())).length;
                  const masteredCards = allCards.filter(card => card.reviewCount >= 5 && card.nextReview && new Date(card.nextReview) > new Date()).length;
                  
                  return (
                    <>
                      <div className="text-center p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <div className="text-2xl font-bold text-cyan-400 mb-1">{newCards}</div>
                        <div className="text-sm text-text-secondary">New</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">{learningCards}</div>
                        <div className="text-sm text-text-secondary">Learning</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-400 mb-1">{reviewCards}</div>
                        <div className="text-sm text-text-secondary">Review</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400 mb-1">{masteredCards}</div>
                        <div className="text-sm text-text-secondary">Mastered</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Next Review Schedule */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-purple-neon">Next Review Schedule</h4>
                <div className="space-y-2">
                  {(() => {
                    const allCards = selectedDecks.flatMap(deck => deck.cards);
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    
                    const dueToday = allCards.filter(card => 
                      card.nextReview && new Date(card.nextReview) <= tomorrow
                    ).length;
                    
                    const dueThisWeek = allCards.filter(card => 
                      card.nextReview && 
                      new Date(card.nextReview) > tomorrow && 
                      new Date(card.nextReview) <= nextWeek
                    ).length;
                    
                    const dueLater = allCards.filter(card => 
                      card.nextReview && new Date(card.nextReview) > nextWeek
                    ).length;
                    
                    return (
                      <>
                        <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <span className="text-text-primary">Due Today/Tomorrow</span>
                          <span className="font-bold text-red-400">{dueToday} cards</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <span className="text-text-primary">Due This Week</span>
                          <span className="font-bold text-yellow-400">{dueThisWeek} cards</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <span className="text-text-primary">Due Later</span>
                          <span className="font-bold text-green-400">{dueLater} cards</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Difficulty Distribution */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-green-400">Difficulty Distribution</h4>
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const allCards = selectedDecks.flatMap(deck => deck.cards);
                    const reviewedCards = allCards.filter(card => card.difficulty !== undefined);
                    
                    const easyCards = reviewedCards.filter(card => card.difficulty === 'easy').length;
                    const goodCards = reviewedCards.filter(card => card.difficulty === 'good').length;
                    const hardCards = reviewedCards.filter(card => card.difficulty === 'hard').length;
                    const total = reviewedCards.length;
                    
                    if (total === 0) {
                      return (
                        <div className="col-span-3 text-center text-text-secondary p-4">
                          No difficulty data available yet. Complete some reviews to see distribution.
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                          <div className="text-xl font-bold text-green-400 mb-1">{Math.round((easyCards / total) * 100)}%</div>
                          <div className="text-sm text-text-secondary">Easy</div>
                          <div className="text-xs text-text-secondary mt-1">{easyCards} cards</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                          <div className="text-xl font-bold text-yellow-400 mb-1">{Math.round((goodCards / total) * 100)}%</div>
                          <div className="text-sm text-text-secondary">Good</div>
                          <div className="text-xs text-text-secondary mt-1">{goodCards} cards</div>
                        </div>
                        <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                          <div className="text-xl font-bold text-red-400 mb-1">{Math.round((hardCards / total) * 100)}%</div>
                          <div className="text-sm text-text-secondary">Hard</div>
                          <div className="text-xs text-text-secondary mt-1">{hardCards} cards</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Learning Curve Analysis */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-cyan-400">Learning Curve Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const allCards = selectedDecks.flatMap(deck => deck.cards);
                    const reviewedCards = allCards.filter(card => card.reviewCount > 0);
                    
                    if (reviewedCards.length === 0) {
                      return (
                        <div className="col-span-2 text-center text-text-secondary p-4">
                          Start reviewing cards to see learning curve analysis.
                        </div>
                      );
                    }
                    
                    const avgReviewCount = reviewedCards.reduce((sum, card) => sum + card.reviewCount, 0) / reviewedCards.length;
                    const avgAccuracy = reviewedCards.reduce((sum, card) => {
                      const total = card.correctCount + card.incorrectCount;
                      return total > 0 ? sum + (card.correctCount / total) : sum;
                    }, 0) / reviewedCards.length;
                    
                    const retentionRate = reviewedCards.filter(card => {
                      const total = card.correctCount + card.incorrectCount;
                      return total > 0 && (card.correctCount / total) >= 0.7;
                    }).length / reviewedCards.length;
                    
                    const intervalEfficiency = reviewedCards.filter(card => 
                      card.nextReview && new Date(card.nextReview) > new Date()
                    ).length / reviewedCards.length;
                    
                    return (
                      <>
                        <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                          <div className="text-2xl font-bold text-cyan-400 mb-1">{avgReviewCount.toFixed(1)}</div>
                          <div className="text-sm text-text-secondary">Avg Reviews per Card</div>
                        </div>
                        <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                          <div className="text-2xl font-bold text-purple-400 mb-1">{Math.round(avgAccuracy * 100)}%</div>
                          <div className="text-sm text-text-secondary">Average Accuracy</div>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                          <div className="text-2xl font-bold text-green-400 mb-1">{Math.round(retentionRate * 100)}%</div>
                          <div className="text-sm text-text-secondary">Retention Rate</div>
                        </div>
                        <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                          <div className="text-2xl font-bold text-yellow-400 mb-1">{Math.round(intervalEfficiency * 100)}%</div>
                          <div className="text-sm text-text-secondary">Interval Efficiency</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {deckSessions.length > 0 && (
          <div className="glass-effect holographic rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-400">Session History</h3>
            <div className="space-y-3">
              {deckSessions.slice(-10).reverse().map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-void/30 rounded-xl">
                  <div>
                    <div className="text-text-primary font-medium">
                      {new Date(session.startTime).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {session.cardsStudied} cards studied
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      session.sessionAccuracy >= 80 ? 'text-green-400' : 
                      session.sessionAccuracy >= 60 ? 'text-yellow-400' : 
                      'text-red-400'
                    }`}>
                      {session.sessionAccuracy}%
                    </div>
                    <div className="text-sm text-text-secondary">
                      {session.correctAnswers}/{session.correctAnswers + session.incorrectAnswers}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Statistics Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setResetStatsConfirmation(true)}
            className="px-6 py-3 glass-effect border border-red-500/20 text-red-400 rounded-xl hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Statistics</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <button 
              onClick={() => setIsAboutModalOpen(true)}
              className="hover:scale-105 transition-transform duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow-lg shadow-cyan-500/20 flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300">
                <span className="text-black font-bold text-lg">X</span>
              </div>
            </button>
            <button
              onClick={() => {
                if (currentStudyDeck) {
                  handleExitStudy('decks');
                } else {
                  setCurrentView('decks');
                }
              }}
              className="hover:scale-105 transition-transform duration-300"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                xCards
              </h1>
            </button>
          </div>
          
          <ViewSelector 
            currentView={currentView} 
            onViewChange={(view) => {
              if (view === 'stats' && currentView === 'decks') {
                // When navigating to stats from deck view, clear lastStudiedDeckId 
                // so it uses selectedDeckId instead
                setLastStudiedDeckId(null);
                setSelectedStatsDecks([]);
              }
              setCurrentView(view);
            }}
            isStudyActive={!!currentStudyDeck}
            onRequestExitStudy={handleExitStudy}
          />
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="relative z-10 max-w-2xl mx-auto px-6 pb-12"
        onClick={(e) => {
          // Prevent any global handlers from clearing deck selection
          e.stopPropagation();
        }}
      >
        {currentView === 'decks' && renderDecksView()}
        {currentView === 'study' && renderStudyView()}
        {currentView === 'stats' && renderStatsView()}
      </main>

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createDeck}
      />

      {/* Edit Deck Modal */}
      <EditDeckModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDeck(null);
        }}
        onSave={(updatedDeck) => {
          saveDeck(updatedDeck);
          setEditingDeck(updatedDeck);
        }}
        onAddCard={openAddCardModal}
        deck={editingDeck}
      />

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onSubmit={addCard}
        deckName={editingDeck?.name || ''}
      />

      <ImportDeckModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importDeck}
        onAddToExisting={addCardsToExistingDeck}
        existingDecks={decks}
      />

      <SessionCompleteModal
        isOpen={isSessionCompleteModalOpen}
        onClose={() => {
          setIsSessionCompleteModalOpen(false);
          setCurrentView('decks');
          // Clear study state when modal is closed
          setCurrentStudyDeck(null);
          setStudySessionCards([]);
          setStudySessionMetadata(null);
        }}
        onViewStats={() => {
          setIsSessionCompleteModalOpen(false);
          // Clear any manual stats deck selection to use default logic
          setSelectedStatsDecks([]);
          setCurrentView('stats');
          // Clear study state when viewing stats
          setCurrentStudyDeck(null);
          setStudySessionCards([]);
          setStudySessionMetadata(null);
        }}
        onRestart={restartStudySession}
        accuracy={sessionResults.accuracy}
        cardsStudied={sessionResults.cardsStudied}
        correctAnswers={sessionResults.correctAnswers}
        incorrectAnswers={sessionResults.incorrectAnswers}
        canRestart={!!studySessionMetadata}
      />

      <QuestionBreakdownModal
        isOpen={showQuestionBreakdown}
        onClose={() => setShowQuestionBreakdown(false)}
        cards={selectedDecks.flatMap(deck => deck.cards)}
        sessions={sessions}
        deckId={selectedStatsDecks.length > 0 ? selectedStatsDecks[0] : decks[0]?.id || ''}
      />

      <CategoryStatsModal
        isOpen={showCategoryStats}
        onClose={() => setShowCategoryStats(false)}
        cards={selectedDecks.flatMap(deck => deck.cards)}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
        title={alertModal.title}
        message={alertModal.message}
      />

      <ConfirmationModal
        isOpen={resetStatsConfirmation}
        onClose={() => setResetStatsConfirmation(false)}
        onConfirm={resetAllStatistics}
        title="Reset All Statistics"
        message="Are you sure you want to reset all statistics? This will clear all progress data, review counts, accuracy scores, and study session history. Your cards and decks will remain, but all progress tracking will be permanently lost."
        confirmText="Reset Statistics"
        confirmVariant="danger"
      />

      <ExitStudyModal
        isOpen={exitStudyConfirmation}
        onClose={() => setExitStudyConfirmation(false)}
        onSaveAndExit={confirmExitStudy}
        onDiscardAndExit={discardStudySession}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Card Details Modal */}
      {selectedCard && (
        <CardDetailsModal
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          card={selectedCard.card}
          deckName={selectedCard.deckName}
        />
      )}
    </div>
  );
}
