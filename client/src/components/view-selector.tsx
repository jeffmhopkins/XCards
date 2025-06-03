import { BookOpen, Brain, TrendingUp } from 'lucide-react';
import { ViewType } from '@/lib/types';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isStudyActive?: boolean;
  onRequestExitStudy?: (targetView?: ViewType) => void;
}

export function ViewSelector({ currentView, onViewChange, isStudyActive, onRequestExitStudy }: ViewSelectorProps) {
  const viewOptions = [
    { id: 'decks' as ViewType, icon: BookOpen },
    { id: 'study' as ViewType, icon: Brain },
    { id: 'stats' as ViewType, icon: TrendingUp },
  ];

  const handleSelect = (view: ViewType) => {
    if (isStudyActive && currentView === 'study' && view !== 'study' && onRequestExitStudy) {
      onRequestExitStudy(view);
      return;
    }
    onViewChange(view);
  };

  return (
    <div className="flex items-center space-x-2">
      {viewOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = currentView === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`
              p-3 rounded-xl transition-all duration-300 bg-transparent
              ${isSelected 
                ? 'text-cyan-400 shadow-lg shadow-cyan-500/50 ring-2 ring-cyan-500/30' 
                : 'text-text-secondary hover:text-cyan-300 hover:shadow-md hover:shadow-cyan-500/20'
              }
            `}
          >
            <Icon className="w-6 h-6" />
          </button>
        );
      })}
    </div>
  );
}