import { ViewType } from '@/lib/types';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'decks' as ViewType, label: 'Decks' },
    { id: 'study' as ViewType, label: 'Study' },
    { id: 'stats' as ViewType, label: 'Statistics' },
  ];

  return (
    <nav className="hidden md:flex glass-effect rounded-full px-6 py-3 border border-cyan-500/20">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`px-4 py-2 rounded-full transition-all duration-300 ${
            currentView === item.id
              ? 'text-cyan-neon bg-cyan-500/10'
              : 'text-text-secondary hover:text-cyan-neon'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
