import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Flashcard } from '@/lib/types';

interface StudyCardProps {
  card: Flashcard;
  onAnswer: (difficulty: 'easy' | 'good' | 'hard') => void;
  onExit: () => void;
  currentIndex: number;
  totalCards: number;
}

export function StudyCard({ card, onAnswer, onExit, currentIndex, totalCards }: StudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [contentOpacity, setContentOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent default behavior and stop propagation
      if (['Space', 'Digit1', 'Digit2', 'Digit3'].includes(event.code)) {
        event.preventDefault();
        event.stopPropagation();
      }

      switch (event.code) {
        case 'Space':
          handleCardClick();
          break;
        case 'Digit1':
          // For keyboard shortcuts, reset visual state and call onAnswer with delay to ensure proper card advancement
          setIsFlipped(false);
          setShowControls(false);
          setContentOpacity(0);
          setTimeout(() => {
            onAnswer('hard');
            setContentOpacity(1);
          }, 100);
          break;
        case 'Digit2':
          setIsFlipped(false);
          setShowControls(false);
          setContentOpacity(0);
          setTimeout(() => {
            onAnswer('good');
            setContentOpacity(1);
          }, 100);
          break;
        case 'Digit3':
          setIsFlipped(false);
          setShowControls(false);
          setContentOpacity(0);
          setTimeout(() => {
            onAnswer('easy');
            setContentOpacity(1);
          }, 100);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onAnswer]);

  const handleCardClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setShowControls(true);
    } else {
      setIsFlipped(false);
      setShowControls(false); // Hide controls immediately
    }
  };

  const handleAnswer = (difficulty: 'easy' | 'good' | 'hard') => {
    setIsTransitioning(true);
    setIsFlipped(false);
    setShowControls(false); // Hide controls immediately
    
    // Start fade out immediately when flip starts
    setContentOpacity(0);
    
    // At half flip time (333ms): update content
    setTimeout(() => {
      onAnswer(difficulty);
      // Start fade in for second half
      setContentOpacity(1);
    }, 333);
    
    // Reset transition state when flip completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 666);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="text-center mb-8">
        <div className="text-2xl font-bold text-cyan-neon mb-2">
          {currentIndex + 1} of {totalCards}
        </div>
        <div className="w-full bg-void rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Study Card */}
      <div className="relative w-full mb-8" style={{ aspectRatio: '5/3' }}>
        <div 
          className={`card-3d w-full h-full cursor-pointer transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleCardClick}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transitionDuration: '666ms'
          }}
        >
          {/* Card Front */}
          <div className="card-face glass-effect holographic rounded-3xl p-8">
            <div 
              className="text-center h-full flex flex-col transition-opacity duration-300"
              style={{ opacity: contentOpacity }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-cyan-neon">Question</h3>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg leading-relaxed text-text-primary">
                  {card.question}
                </p>
              </div>
              <p className="text-sm text-text-secondary h-5 mt-4">
                {!isFlipped ? (
                  <>
                    <span className="md:hidden">Tap to reveal answer</span>
                    <span className="hidden md:inline">Click or press Space to reveal answer</span>
                  </>
                ) : ""}
              </p>
            </div>
          </div>
          
          {/* Card Back */}
          <div 
            className="card-face card-back glass-effect holographic rounded-3xl p-8"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div 
              className="text-center h-full flex flex-col transition-opacity duration-300"
              style={{ opacity: contentOpacity }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-purple-neon">Answer</h3>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg leading-relaxed text-text-primary">
                  {card.answer}
                </p>
              </div>
              <p className="text-sm text-text-secondary mt-4">
                <span className="md:hidden">Tap to show question again</span>
                <span className="hidden md:inline">Click or press Space to show question again</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Study Controls */}
      {showControls && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleAnswer('hard')}
            className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 relative"
          >
            <span className="block">Hard</span>
            <span className="text-xs opacity-60 hidden md:inline">Press 1</span>
          </button>
          <button
            onClick={() => handleAnswer('good')}
            className="px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition-all duration-300 relative"
          >
            <span className="block">Good</span>
            <span className="text-xs opacity-60 hidden md:inline">Press 2</span>
          </button>
          <button
            onClick={() => handleAnswer('easy')}
            className="px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-300 relative"
          >
            <span className="block">Easy</span>
            <span className="text-xs opacity-60 hidden md:inline">Press 3</span>
          </button>
        </div>
      )}
    </div>
  );
}
