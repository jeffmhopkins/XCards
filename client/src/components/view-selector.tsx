import { ChevronDown, BookOpen, Brain, TrendingUp } from 'lucide-react';
import { ViewType } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isStudyActive?: boolean;
  onRequestExitStudy?: (targetView?: ViewType) => void;
}

export function ViewSelector({ currentView, onViewChange, isStudyActive, onRequestExitStudy }: ViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });

  const viewOptions = [
    { id: 'decks' as ViewType, label: 'Decks', icon: BookOpen },
    { id: 'study' as ViewType, label: 'Study', icon: Brain },
    { id: 'stats' as ViewType, label: 'Statistics', icon: TrendingUp },
  ];

  const currentOption = viewOptions.find(option => option.id === currentView);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  const handleSelect = (view: ViewType) => {
    if (isStudyActive && currentView === 'study' && view !== 'study' && onRequestExitStudy) {
      onRequestExitStudy(view);
      setIsOpen(false);
      return;
    }
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-4 py-2 glass-effect holographic rounded-xl text-text-primary hover:text-cyan-neon transition-all duration-300"
        >
          {currentOption && (
            <>
              <currentOption.icon className="w-5 h-5" />
              <span className="font-medium">{currentOption.label}</span>
            </>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed z-[9999] bg-space/95 backdrop-blur-md rounded-xl border border-cyan-500/30 shadow-xl shadow-cyan-500/20 overflow-hidden min-w-[150px]"
            style={{
              top: `${buttonPosition.top}px`,
              right: `${buttonPosition.right}px`,
            }}
          >
            {viewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                    currentView === option.id
                      ? 'text-cyan-neon bg-cyan-500/20'
                      : 'text-text-primary hover:text-cyan-neon hover:bg-cyan-500/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
  );
}