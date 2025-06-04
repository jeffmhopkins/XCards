export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  categories: string[];
  difficulty?: 'easy' | 'good' | 'hard';
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  createdAt: Date;
  lastReviewed?: Date;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
  lastStudied?: Date;
  totalStudySessions: number;
  stats: {
    totalReviews: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageAccuracy: number;
  };
}

export interface StudySession {
  deckId: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionAccuracy: number;
}

export interface AppStats {
  totalDecks: number;
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  newCards: number;
  currentStreak: number;
  bestStreak: number;
  totalStudySessions: number;
  accuracyRate: number;
  totalCorrectAnswers: number;
  totalAnswers: number;
}

export type ViewType = 'decks' | 'study' | 'stats';

export interface CreateDeckData {
  name: string;
  description: string;
}

export interface CreateCardData {
  question: string;
  answer: string;
  categories: string[];
}
