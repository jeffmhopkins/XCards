import { useState, useEffect } from 'react';
import { Plus, BookOpen, TrendingUp, Brain, ChevronDown, BarChart3, Clock, Target, Tag, RotateCcw } from 'lucide-react';
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
import { LocalStorage } from '@/lib/storage';
import { Deck, StudySession, AppStats, ViewType, CreateDeckData, CreateCardData, Flashcard } from '@/lib/types';

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
  const [resetStatsConfirmation, setResetStatsConfirmation] = useState(false);
  const [exitStudyConfirmation, setExitStudyConfirmation] = useState(false);
  const [pendingViewChange, setPendingViewChange] = useState<ViewType | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (decks.length > 0) {
      const calculatedStats = LocalStorage.calculateStats(decks, sessions);
      setStats(calculatedStats);
      LocalStorage.saveStats(calculatedStats);
    }
  }, [decks, sessions]);

  const loadData = () => {
    const loadedDecks = LocalStorage.getDecks();
    const loadedSessions = LocalStorage.getSessions();
    const loadedStats = LocalStorage.getStats();
    
    setDecks(loadedDecks);
    setSessions(loadedSessions);
    setStats(loadedStats);
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
    setPendingViewChange(null);
    setExitStudyConfirmation(false);
    setCurrentView(targetView);
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

  const handleStudyModeStart = (mode: StudyMode, cards: any[]) => {
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

    setCurrentStudyDeck(deckToStudy);
    setStudySessionCards(cards);
    setCurrentCardIndex(0);
    setStudySessionStats({ correct: 0, incorrect: 0 });
    setStudyModeSelection(null);
  };

  const handleStudyModeCancel = () => {
    setStudyModeSelection(null);
    setCurrentView('decks');
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
            const updatedCard = {
              ...card,
              reviewCount: card.reviewCount + 1,
              correctCount: card.correctCount + creditAmount,
              incorrectCount: card.incorrectCount + (isCorrect ? 0 : 1),
              lastReviewed: new Date(),
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
        return {
          ...card,
          reviewCount: card.reviewCount + 1,
          correctCount: card.correctCount + creditAmount,
          incorrectCount: card.incorrectCount + (isCorrect ? 0 : 1),
          lastReviewed: new Date(),
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
      setIsSessionCompleteModalOpen(true);
      setCurrentStudyDeck(null);
      setStudySessionCards([]);
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
          className={`gap-6 mb-8 ${
            decks.length === 1 
              ? "flex justify-center" 
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
          onClick={(e) => {
            // Prevent clearing selection when clicking in empty areas
            e.stopPropagation();
          }}
        >
          {decks.length === 1 && (
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
          )}
          {decks.length > 1 && decks.map((deck) => (
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
        
        <div className="flex justify-center">
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
            <BookOpen className="w-16 h-16 mx-auto text-purple-neon" />
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
    // Use selected decks or default to first deck if none selected
    const activeStatsDecks = selectedStatsDecks.length > 0 
      ? selectedStatsDecks 
      : decks.length > 0 ? [decks[0].id] : [];

    const selectedDecks = decks.filter(d => activeStatsDecks.includes(d.id));

    if (selectedDecks.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="inline-block p-6 glass-effect rounded-3xl holographic mb-8 animate-float">
            <TrendingUp className="w-16 h-16 mx-auto text-purple-neon" />
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
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-600 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-cyan-500 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setIsAboutModalOpen(true)}
            className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-300"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow-lg shadow-cyan-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/40 transition-all duration-300">
              <span className="text-black font-bold text-lg">X</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
              xCards
            </h1>
          </button>
          
          <ViewSelector 
            currentView={currentView} 
            onViewChange={setCurrentView}
            isStudyActive={!!currentStudyDeck}
            onRequestExitStudy={handleExitStudy}
          />
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="relative z-10 max-w-6xl mx-auto px-6 pb-12"
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
      />

      <SessionCompleteModal
        isOpen={isSessionCompleteModalOpen}
        onClose={() => {
          setIsSessionCompleteModalOpen(false);
          setCurrentView('decks');
        }}
        accuracy={sessionResults.accuracy}
        cardsStudied={sessionResults.cardsStudied}
        correctAnswers={sessionResults.correctAnswers}
        incorrectAnswers={sessionResults.incorrectAnswers}
      />

      <QuestionBreakdownModal
        isOpen={showQuestionBreakdown}
        onClose={() => setShowQuestionBreakdown(false)}
        cards={selectedStatsDecks.length > 0 ? decks.find(d => d.id === selectedStatsDecks[0])?.cards || [] : decks[0]?.cards || []}
        sessions={sessions}
        deckId={selectedStatsDecks.length > 0 ? selectedStatsDecks[0] : decks[0]?.id || ''}
      />

      <CategoryStatsModal
        isOpen={showCategoryStats}
        onClose={() => setShowCategoryStats(false)}
        cards={selectedStatsDecks.length > 0 ? decks.find(d => d.id === selectedStatsDecks[0])?.cards || [] : decks[0]?.cards || []}
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
    </div>
  );
}
