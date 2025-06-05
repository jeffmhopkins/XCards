# xCards v1.0.9 - Flash Card Application

- Live at https://jeffmhopkins.github.io/XCards/

A comprehensive flash card application with adaptive study experiences and modern interactive design for effective learning.

## Features

### Core Functionality
- **Deck Management**: Create, edit, delete, and organize flash card decks with auto-selection
- **Smart Review Sessions**: 20-card spaced repetition algorithm with dynamic status indicators
- **Multiple Study Modes**: Sequential, shuffled, and difficulty-based study options
- **Floating Search**: Real-time card search across all decks with instant results
- **Dynamic Status Badges**: Real-time review indicators on each deck showing overdue, due today, and new card counts
- **Spaced Repetition Analytics**: Comprehensive analytics dashboard with card status overview, review scheduling, and learning curve analysis
- **Advanced Statistics**: Detailed progress tracking with retention rates and interval efficiency metrics
- **Category System**: Organize cards by subject areas with advanced filtering
- **Import/Export**: CSV support for data portability
- **PWA Ready**: Progressive Web App for mobile installation

### Study Experience
- **Spaced Repetition**: SM-2 inspired algorithm with intelligent card selection and priority-based scheduling
- **Dynamic Status Display**: Real-time indicators showing overdue, due today, and new card counts across entire deck
- **Adaptive Learning**: Automatic review interval calculation based on performance with exponential scaling
- **Visual Feedback**: Modern UI with glow effects, animations, and positive completion indicators
- **Session Management**: Track study sessions with comprehensive accuracy and retention metrics
- **Filter Integration**: Advanced category, difficulty, and recency filtering with live status updates
- **Exit Protection**: Save progress when exiting study sessions

### User Interface
- **Auto-Selection**: One deck is always selected when decks exist for seamless navigation
- **Floating Search Bar**: Persistent search functionality in deck view for quick card discovery
- **Card Details Modal**: Comprehensive card information display with deck context
- **Responsive Layout**: Optimized for mobile and desktop with proper spacing and scrolling
- **Consistent Layout**: Unified content width and spacing across all views (decks, study, statistics)
- **Enhanced Deck Cards**: Split action buttons for separate deck management and study access
- **Visual Status Indicators**: Color-coded badges showing deck review status at a glance
- **Streamlined Interface**: Simplified deck headers with cleaner action organization

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
- Post-study navigation automatically goes to statistics view
- Fixed shuffle algorithm with proper Fisher-Yates implementation
- Removed sci-fi theming from about modal and branding
- Enhanced GitHub Pages deployment configuration
- Updated creator attribution and live URL display
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