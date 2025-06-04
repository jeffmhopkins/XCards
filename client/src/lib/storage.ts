import { Deck, StudySession, AppStats } from './types';

const STORAGE_KEYS = {
  DECKS: 'xCards_decks',
  SESSIONS: 'xCards_sessions',
  STATS: 'xCards_stats',
} as const;

export class LocalStorage {
  static getDecks(): Deck[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DECKS);
      if (!data) return [];
      
      const decks = JSON.parse(data);
      return decks.map((deck: any) => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        lastStudied: deck.lastStudied ? new Date(deck.lastStudied) : undefined,
        cards: deck.cards.map((card: any) => ({
          ...card,
          categories: card.categories || [], // Migration: ensure categories exist
          createdAt: new Date(card.createdAt),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
          nextReview: card.nextReview ? new Date(card.nextReview) : undefined,
        })),
      }));
    } catch (error) {
      console.error('Error loading decks:', error);
      return [];
    }
  }

  static saveDecks(decks: Deck[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
    } catch (error) {
      console.error('Error saving decks:', error);
    }
  }

  static getSessions(): StudySession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return [];
      
      const sessions = JSON.parse(data);
      return sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  static saveSessions(sessions: StudySession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  static getStats(): AppStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) {
        return {
          totalDecks: 0,
          totalCards: 0,
          masteredCards: 0,
          learningCards: 0,
          newCards: 0,
          currentStreak: 0,
          bestStreak: 0,
          totalStudySessions: 0,
          accuracyRate: 0,
          totalCorrectAnswers: 0,
          totalAnswers: 0,
        };
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      return {
        totalDecks: 0,
        totalCards: 0,
        masteredCards: 0,
        learningCards: 0,
        newCards: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalStudySessions: 0,
        accuracyRate: 0,
        totalCorrectAnswers: 0,
        totalAnswers: 0,
      };
    }
  }

  static saveStats(stats: AppStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }

  static createSampleDeck(): Deck {
    const now = new Date();
    const sampleCards = [
      { question: "Who was the first president of the United States?", categories: ["History"], answer: "George Washington" },
      { question: "What is the chemical symbol for water?", categories: ["Science"], answer: "H2O" },
      { question: "What is the capital of France?", categories: ["Geography"], answer: "Paris" },
      { question: "Who wrote \"Pride and Prejudice\"?", categories: ["Literature"], answer: "Jane Austen" },
      { question: "What is 5 factorial?", categories: ["Math"], answer: "120" },
      { question: "Who painted the Mona Lisa?", categories: ["Art"], answer: "Leonardo da Vinci" },
      { question: "What instrument did Beethoven primarily compose for?", categories: ["Music"], answer: "Piano" },
      { question: "What year did World War II end?", categories: ["History"], answer: "1945" },
      { question: "What gas do plants use for photosynthesis?", categories: ["Science"], answer: "Carbon Dioxide" },
      { question: "What is the longest river in the world?", categories: ["Geography"], answer: "Nile" },
      { question: "Who wrote \"1984\"?", categories: ["Literature"], answer: "George Orwell" },
      { question: "What is the square root of 64?", categories: ["Math"], answer: "8" },
      { question: "What art movement is associated with Picasso?", categories: ["Art"], answer: "Cubism" },
      { question: "Who composed \"The Four Seasons\"?", categories: ["Music"], answer: "Antonio Vivaldi" },
      { question: "Who was the first man to walk on the moon?", categories: ["History", "Science"], answer: "Neil Armstrong" },
      { question: "What is the largest planet in our solar system?", categories: ["Science"], answer: "Jupiter" },
      { question: "What country has the most deserts?", categories: ["Geography"], answer: "Antarctica" },
      { question: "What is the main theme of \"To Kill a Mockingbird\"?", categories: ["Literature"], answer: "Justice" },
      { question: "What is the value of pi to two decimal places?", categories: ["Math"], answer: "3.14" },
      { question: "Who created the \"Starry Night\"?", categories: ["Art"], answer: "Vincent van Gogh" },
      { question: "What is the time signature of a waltz?", categories: ["Music"], answer: "3/4" },
      { question: "What was the main cause of the American Civil War?", categories: ["History"], answer: "Slavery" },
      { question: "What is the primary source of energy for Earth's climate system?", categories: ["Science", "Geography"], answer: "Sun" },
      { question: "What is the smallest country by land area?", categories: ["Geography"], answer: "Vatican City" },
      { question: "Who wrote \"The Great Gatsby\"?", categories: ["Literature"], answer: "F. Scott Fitzgerald" },
      { question: "What is 10% of 200?", categories: ["Math"], answer: "20" },
      { question: "What is the primary color used in impressionist paintings?", categories: ["Art"], answer: "Blue" },
      { question: "Who composed the \"Moonlight Sonata\"?", categories: ["Music"], answer: "Ludwig van Beethoven" },
      { question: "What year was the Declaration of Independence signed?", categories: ["History"], answer: "1776" },
      { question: "What element is essential for human bone health?", categories: ["Science"], answer: "Calcium" },
      { question: "What is the capital of Japan?", categories: ["Geography"], answer: "Tokyo" },
      { question: "Who is the author of \"Moby-Dick\"?", categories: ["Literature"], answer: "Herman Melville" },
      { question: "What is the formula for the area of a circle?", categories: ["Math"], answer: "πr²" },
      { question: "Who sculpted \"David\"?", categories: ["Art"], answer: "Michelangelo" },
      { question: "What genre of music did Elvis Presley popularize?", categories: ["Music", "History"], answer: "Rock and Roll" },
      { question: "Who discovered penicillin?", categories: ["Science", "History"], answer: "Alexander Fleming" },
      { question: "What is the largest continent by land area?", categories: ["Geography"], answer: "Asia" },
      { question: "What is the name of Shakespeare's theater?", categories: ["Literature", "History"], answer: "Globe" },
      { question: "What is the sum of angles in a triangle?", categories: ["Math"], answer: "180 degrees" },
      { question: "Who painted \"The Scream\"?", categories: ["Art"], answer: "Edvard Munch" },
      { question: "What instrument is associated with Miles Davis?", categories: ["Music"], answer: "Trumpet" },
      { question: "What was the Renaissance period known for?", categories: ["History", "Art"], answer: "Rebirth of art and learning" },
      { question: "What is the atomic number of hydrogen?", categories: ["Science"], answer: "1" },
      { question: "What is the capital of Brazil?", categories: ["Geography"], answer: "Brasilia" },
      { question: "Who wrote \"The Catcher in the Rye\"?", categories: ["Literature"], answer: "J.D. Salinger" },
      { question: "What is the Pythagorean theorem?", categories: ["Math"], answer: "a² + b² = c²" },
      { question: "What is the style of Claude Monet's paintings?", categories: ["Art"], answer: "Impressionism" },
      { question: "Who composed \"Symphony No. 9\"?", categories: ["Music"], answer: "Ludwig van Beethoven" },
      { question: "What event started World War I?", categories: ["History"], answer: "Assassination of Archduke Franz Ferdinand" },
      { question: "What is the process of cell division called?", categories: ["Science"], answer: "Mitosis" }
    ];

    return {
      id: `deck_${Date.now()}`,
      name: 'General Knowledge',
      description: 'Comprehensive collection covering History, Science, Geography, Literature, Math, Art, and Music',
      createdAt: now,
      totalStudySessions: 0,
      stats: {
        totalReviews: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageAccuracy: 0,
      },
      cards: sampleCards.map((card, index) => ({
        id: `card_${Date.now()}_${index + 1}`,
        question: card.question,
        answer: card.answer,
        categories: card.categories,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        createdAt: now,
      })),
    };
  }

  static calculateStats(decks: Deck[], sessions: StudySession[]): AppStats {
    const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
    const masteredCards = decks.reduce((sum, deck) => 
      sum + deck.cards.filter(card => card.correctCount >= 3 && card.correctCount > card.incorrectCount).length, 0
    );
    const learningCards = decks.reduce((sum, deck) => 
      sum + deck.cards.filter(card => card.reviewCount > 0 && !(card.correctCount >= 3 && card.correctCount > card.incorrectCount)).length, 0
    );
    const newCards = totalCards - masteredCards - learningCards;
    
    const totalCorrectAnswers = decks.reduce((sum, deck) => 
      sum + deck.cards.reduce((cardSum, card) => cardSum + card.correctCount, 0), 0
    );
    const totalAnswers = decks.reduce((sum, deck) => 
      sum + deck.cards.reduce((cardSum, card) => cardSum + card.reviewCount, 0), 0
    );
    const accuracyRate = totalAnswers > 0 ? Math.round((totalCorrectAnswers / totalAnswers) * 100) : 0;

    // Calculate streak (simplified - consecutive days with study sessions)
    const today = new Date();
    const sortedSessions = sessions
      .map(s => s.startTime)
      .sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    let currentDate = new Date(today);
    
    for (const sessionDate of sortedSessions) {
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else if (daysDiff > currentStreak + 1) {
        break;
      }
    }

    return {
      totalDecks: decks.length,
      totalCards,
      masteredCards,
      learningCards,
      newCards,
      currentStreak,
      bestStreak: Math.max(currentStreak, 0), // Simplified
      totalStudySessions: sessions.length,
      accuracyRate,
      totalCorrectAnswers,
      totalAnswers,
    };
  }
}
