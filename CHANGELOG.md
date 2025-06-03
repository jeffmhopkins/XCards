# xCards Changelog

## v1.0.5 - December 2024

### User Interface Improvements
- **Navigation Enhancement**: Replaced dropdown menu with 3 icon-only buttons featuring glow effects when selected
- **Visual Polish**: Updated Good button color from yellow to lime (yellow-green) for better color progression
- **Animation Fix**: Resolved inconsistent text behavior during card flip animations

### Study System Updates
- **Simplified Scoring**: Changed to binary scoring system - 0 points for "hard/unknown", 1 point for both "good" and "easy"
- **Consistent Experience**: Fixed card flip animation so instructional text fades out consistently in both directions

### Technical Improvements
- **Deployment Ready**: Complete PWA configuration for both generic hosting and GitHub Pages
- **Service Worker Fix**: Corrected service worker registration for subdirectory deployments
- **Build Optimization**: Enhanced build system with dual output (dist/ and docs/)

### About Modal
- **Version Update**: Updated about modal to display version 1.0.5

## v1.0.4 - November 2024

### CSV Import Enhancements
- **Multi-Category Support**: Fixed parsing for categories with embedded commas
- **Quote Handling**: Improved handling of quoted CSV fields
- **Category Processing**: Categories like "Math,Basic,Arithmetic" now import correctly

### Deployment Infrastructure
- **GitHub Pages**: Enhanced PWA configuration for GitHub Pages deployment
- **Build System**: Separate dist/docs outputs for different hosting needs
- **PWA Optimization**: Improved Progressive Web App functionality

## v1.0.3 - October 2024

### Advanced Filtering System
- **Cascading Filters**: Categories → Review Recency → Mastery Level progression
- **Dynamic Counts**: Filter counts update based on selections
- **Smart Analytics**: Category accuracy percentages for informed decisions
- **Memory Focus**: Review recency filtering for targeted study sessions

### Bug Fixes
- **Study Sessions**: Fixed filtered card count bug
- **PWA Compatibility**: GitHub Pages Progressive Web App support
- **Build Optimization**: Production build enhancements

## v1.0.2 - September 2024

### Study Experience
- **Enhanced Filtering**: Improved study mode filtering capabilities
- **User Experience**: More intuitive interfaces and interactions
- **Multi-Deck Stats**: Advanced learning statistics across multiple decks

## v1.0.1 - August 2024

### Gamification & Accessibility
- **Learning Motivation**: Gamification-driven study features
- **Cross-Platform**: Improved accessibility across devices
- **Performance**: Optimized application performance

## v1.0.0 - July 2024

### Initial Release
- **Core Features**: Complete deck management system
- **Study Modes**: Sequential, shuffled, and difficulty-based study
- **Analytics**: Comprehensive progress tracking and statistics
- **PWA Support**: Full Progressive Web App functionality with offline support
- **Sci-Fi Theme**: Immersive space-themed user interface with animations
- **Data Persistence**: Local storage for complete client-side operation
- **Import/Export**: CSV file support for data portability
- **Responsive Design**: Mobile-first responsive design
- **Category System**: Organizational structure for flash cards
- **Session Management**: Study session tracking with accuracy metrics

## Technical Architecture

### Frontend Stack
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- Radix UI components
- Lucide React icons

### PWA Features
- Service Worker for offline functionality
- Web App Manifest for installation
- Cache-first strategy for performance
- Background sync capabilities

### Data Management
- Browser localStorage for persistence
- CSV import/export functionality
- Automatic schema migration
- No external dependencies

### Build & Deployment
- Vite-based build system
- Dual output configuration (generic/GitHub Pages)
- Optimized asset bundling
- Service worker registration
- PWA compliance validation

Each version builds upon the previous release while maintaining backward compatibility and data integrity.