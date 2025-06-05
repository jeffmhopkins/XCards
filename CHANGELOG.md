# xCards Changelog

## v1.0.8

### Floating Search Functionality
- **Real-time Card Search**: Added floating search bar in deck view for instant card discovery across all decks
- **Search Results Display**: Live search results with card question, answer preview, deck context, and category tags
- **Card Details Modal**: Comprehensive card information modal accessible from search results
- **Context Preservation**: Search results show which deck each card belongs to for better navigation

### Auto-Selection Logic
- **Always Selected Deck**: Implemented logic ensuring one deck is always selected when decks exist
- **Smart Selection**: Auto-selects first deck on app load, newly created decks, and imported decks
- **Edge Case Handling**: Handles deck deletion scenarios by selecting next available deck
- **Seamless Navigation**: Eliminates need for manual deck selection in single-deck scenarios

### Smart Review Enhancements
- **Dynamic Status Indicators**: Smart Review now shows accurate card counts from entire deck rather than session-limited view
- **True Card Totals**: Status indicators display complete breakdown (e.g., "106 new" instead of "20 new") while maintaining 20-card session limits
- **Simplified Button Text**: Smart Review button shows just the session count (e.g., "(20)") for cleaner interface
- **Enhanced Card Due Logic**: Fixed day calculation for more accurate "due today" vs "overdue" classification
- **Positive Status Messaging**: "All caught up!" indicator with checkmark for when no cards need review

### Spaced Repetition Analytics
- **Comprehensive Statistics Section**: Added detailed spaced repetition analytics to statistics view
- **Card Status Overview**: Visual breakdown of New, Learning, Review, and Mastered card counts
- **Next Review Schedule**: Timeline showing cards due today/tomorrow, this week, and later
- **Difficulty Distribution**: Percentage breakdown of Easy/Good/Hard card classifications
- **Learning Curve Analysis**: Metrics for average reviews per card, accuracy rates, retention, and interval efficiency

### Layout and User Interface Improvements
- **Single Column Layout**: Smart Review Session maintains consistent single-column layout across all screen sizes
- **Responsive Search Bar**: Floating search bar positioned for optimal mobile and desktop use
- **Proper Scrolling**: Added bottom padding to ensure all content remains accessible above floating elements
- **Import Button Positioning**: Repositioned import button directly under deck cards for better visual hierarchy
- **Full-width Button**: Import button spans full width to match deck card styling in single-deck view
- **Improved Spacing**: Enhanced vertical spacing and visual hierarchy in study mode selection
- **Filter Integration**: Status indicators now properly reflect active category, difficulty, and recency filters
- **Deck Grid Optimization**: Limited deck view to maximum 2 columns to prevent cards from becoming too narrow on wide screens
- **Desktop Alignment**: Fixed header and main content alignment consistency across all desktop screen widths
- **Container Structure**: Unified layout container structure for consistent spacing and alignment

### User Experience Enhancements
- **Conditional Search Display**: Search bar only appears in deck view to maintain clean interface
- **Clear Search Functionality**: X button to quickly clear search query and results
- **Keyboard Navigation**: Maintained existing keyboard shortcuts while preserving search functionality
- **Visual Consistency**: Search components match overall design theme with glass effects and gradients

### Technical Improvements
- **Separate Calculation Functions**: Distinguished between full deck analysis and session-limited card selection
- **Real-time Filter Updates**: Dynamic status updates when filters are applied or removed
- **Accurate Breakdown Logic**: Improved card due classification algorithm for better status accuracy
- **Container Structure**: Unified layout container structure for consistent spacing and alignment

### User Interface Polish
- **Exit Study Modal**: Removed visual keyboard shortcut indicators while maintaining Enter and Escape key functionality
- **Responsive Layout**: Enhanced mobile and desktop responsive behavior for deck grid display

### Technical Improvements
- **Layout Consistency**: Standardized max-width containers and padding structure across header and main content areas
- **Visual Hierarchy**: Improved alignment between navigation elements and content sections

## v1.0.7

### Smart Review Sessions
- **Spaced Repetition Algorithm**: Added 20-card Smart Review Sessions with intelligent card selection
- **Priority System**: Cards prioritized by overdue status, new cards, and difficulty weighting
- **SM-2 Inspired Intervals**: Automatic next review calculation (Hard=60%, Good=100%, Easy=150% of base interval)
- **Exponential Scaling**: Review intervals grow exponentially (2.5x multiplier) with 180-day maximum
- **Mobile Responsive**: Optimized Smart Review button layout for mobile devices

### User Experience
- **Recommended Feature**: Smart Review Sessions prominently featured as recommended study method
- **Documentation**: Comprehensive algorithm details added to about modal
- **Interval Transparency**: Clear explanation of how review dates are calculated

### Technical Implementation
- **Next Review Dates**: Automatic calculation and storage of optimal review timing
- **Card Selection Logic**: Advanced prioritization algorithm for maximum learning efficiency
- **Performance**: Efficient card sorting and selection for 20-card sessions

## v1.0.6

### User Experience Improvements
- **Post-Study Navigation**: Study session completion now automatically navigates to statistics view
- **Button Updates**: Session complete modal button changed to "View Statistics" for clearer user flow
- **About Modal Updates**: Removed "sci-fi themed" branding, updated creator name to "Jeff Hopkins"
- **Smart Statistics Selection**: Statistics view now intelligently defaults to the most relevant deck based on context

### Technical Improvements
- **Shuffle Algorithm**: Fixed study mode shuffle logic with proper Fisher-Yates algorithm for reliable randomization
- **Documentation**: Added live application URL to README and updated version references
- **Build System**: Enhanced build-docs.js script with better GitHub Pages deployment support
- **Context-Aware Navigation**: Implemented priority-based deck selection for statistics view (last studied > selected deck > fallback)

## v1.0.5

### User Interface Improvements
- **Navigation Enhancement**: Replaced dropdown menu with 3 icon-only buttons featuring glow effects when selected
- **Visual Polish**: Updated Good button color from yellow to lime (yellow-green) for better color progression
- **Animation Fix**: Resolved inconsistent text behavior during card flip animations

### Study System Updates
- **Simplified Scoring**: Changed to binary scoring system - 0 points for "hard/unknown", 1 point for both "good" and "easy"
- **Consistent Experience**: Fixed card flip animation so instructional text fades out consistently in both directions

### Technical Improvements
- **Build Optimization**: Enhanced build system with dual output (dist/ and docs/)
- **Service Worker Fix**: Corrected service worker registration for subdirectory deployments

### About Modal
- **Version Update**: Updated about modal to display version 1.0.6

## v1.0.4

### CSV Import Enhancements
- **Multi-Category Support**: Fixed parsing for categories with embedded commas
- **Quote Handling**: Improved handling of quoted CSV fields
- **Category Processing**: Categories like "Math,Basic,Arithmetic" now import correctly

### Deployment Infrastructure
- **Build System**: Separate dist/docs outputs for different hosting needs
- **GitHub Pages**: Enhanced configuration for GitHub Pages deployment

## v1.0.3

### Advanced Filtering System
- **Cascading Filters**: Categories → Review Recency → Mastery Level progression
- **Dynamic Counts**: Filter counts update based on selections
- **Smart Analytics**: Category accuracy percentages for informed decisions
- **Memory Focus**: Review recency filtering for targeted study sessions

### Bug Fixes
- **Study Sessions**: Fixed filtered card count bug
- **Build Optimization**: Production build enhancements

## v1.0.2

### Study Experience
- **Enhanced Filtering**: Improved study mode filtering capabilities
- **User Experience**: More intuitive interfaces and interactions
- **Multi-Deck Stats**: Advanced learning statistics across multiple decks

## v1.0.1

### Gamification & Accessibility
- **Learning Motivation**: Gamification-driven study features
- **Cross-Platform**: Improved accessibility across devices
- **Performance**: Optimized application performance

## v1.0.0

### Initial Release
- **Core Features**: Complete deck management system
- **Study Modes**: Sequential, shuffled, and difficulty-based study
- **Analytics**: Comprehensive progress tracking and statistics
- **PWA Support**: Full Progressive Web App functionality with offline support
- **Modern Theme**: Clean user interface with animations
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