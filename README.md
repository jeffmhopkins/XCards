# xCards v1.0.6 - Flash Card Application
- Live at https://jeffmhopkins.github.io/XCards/ 

A comprehensive flash card application with adaptive study experiences and modern interactive design for effective learning.

## Features

### Core Functionality
- **Deck Management**: Create, edit, delete, and organize flash card decks
- **Smart Study Modes**: Sequential, shuffled, and difficulty-based study options
- **Advanced Analytics**: Detailed statistics and progress tracking
- **Category System**: Organize cards by subject areas
- **Import/Export**: CSV support for data portability
- **PWA Ready**: Progressive Web App for mobile installation

### Study Experience
- **Adaptive Learning**: Spaced repetition with difficulty tracking
- **Visual Feedback**: Modern UI with glow effects and animations
- **Session Management**: Track study sessions with accuracy metrics
- **Exit Protection**: Save progress when exiting study sessions

### Technical Features
- **Local Storage**: Complete client-side data persistence
- **Dark Theme**: Modern dark color scheme
- **Responsive Design**: Works on desktop and mobile devices
- **Static Deployment**: No backend dependencies required

## Project Structure

```
xCards/
├── client/                 # Frontend React application
│   ├── public/            # Static assets and PWA files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and storage
│   │   └── pages/         # Main application pages
├── server/                # Express server (for development)
├── shared/                # Shared types and schemas
└── Configuration files
```

## Installation & Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/jeffmhopkins/XCards.git
   cd XCards
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Key Technologies

- **Frontend**: React, TypeScript, Tailwind CSS
- **Build Tools**: Vite, PostCSS
- **UI Components**: Radix UI, Lucide React
- **State Management**: React hooks with localStorage
- **PWA**: Service Worker, Web App Manifest

## Data Management

- **Storage**: Browser localStorage only
- **Backup**: Export decks as CSV files
- **Migration**: Automatic schema updates
- **Privacy**: All data stays on user's device

## Development Guidelines

- Follow TypeScript strict mode
- Use Tailwind CSS for styling
- Implement responsive design patterns
- Maintain sci-fi theme consistency
- Ensure PWA compliance

## Version History

### v1.0.6 (Current)
- Updated navigation to icon-only buttons with glow effects
- Simplified scoring system: binary points (0 for unknown, 1 for known)
- Fixed card flip animation text behavior consistency
- Changed Good button color to lime (yellow-green) for better progression
- Enhanced PWA configuration for GitHub Pages deployment
- Fixed service worker registration for subdirectory deployment
- Complete deployment readiness for both generic hosting and GitHub Pages

### v1.0.4
- Fixed CSV import parsing for multiple categories
- Improved handling of quoted fields with commas
- Categories like "Math,Basic,Arithmetic" now import correctly
- Updated PWA configuration for GitHub Pages deployment
- Enhanced build system with separate dist/docs outputs

### v1.0.3
- Enhanced filtering system with cascading filters
- Categories → Review Recency → Mastery Level filter order
- Dynamic filter counts that update based on selections
- Category accuracy percentages for informed decisions
- Review recency filtering with memory-focused categories
- Fixed filtered card count bug in study sessions
- GitHub Pages PWA compatibility
- Production build optimization

### v1.0.2
- Improved study mode filtering
- Enhanced user experience with intuitive interfaces
- Advanced multi-deck learning statistics

### v1.0.1
- Gamification-driven learning motivation
- Cross-platform accessibility improvements

### v1.0.0
- Complete deck management system
- Advanced study modes and analytics
- PWA functionality with offline support
- Modern themed UI with animations
- Local storage persistence
- CSV import/export capabilities
- Mobile-responsive design

## License

This project is open source and available under the MIT License.

## Author

Jeff M Hopkins
GitHub: https://github.com/jeffmhopkins/xCards
