import { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Deck, Flashcard } from '@/lib/types';

interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (deck: Deck) => void;
  onAddToExisting: (deckId: string, cards: Flashcard[]) => void;
  existingDecks: Deck[];
}

export function ImportDeckModal({ isOpen, onClose, onImport, onAddToExisting, existingDecks }: ImportDeckModalProps) {
  const [csvText, setCsvText] = useState('');
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('file');
  const [importMode, setImportMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingDeck, setSelectedExistingDeck] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvText(text);
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const parseCsvToCards = (csvData: string): Flashcard[] | null => {
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length === 0) {
        throw new Error('CSV data is empty');
      }

      const cards: Flashcard[] = [];
      const now = Date.now();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const columns = parseCsvLine(line);
          
          if (columns.length >= 2) {
            const question = columns[0]?.trim();
            const answer = columns[1]?.trim();
            
            if (question && answer) {
              const categoriesText = columns[2]?.trim();
              const categories = categoriesText 
                ? categoriesText.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0)
                : [];
                
              cards.push({
                id: `card_${Date.now()}_${i}`,
                question,
                answer,
                categories,
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0,
                createdAt: new Date(),
              });
            }
          }
        }
      }

      if (cards.length === 0) {
        throw new Error('No valid cards found in CSV data');
      }

      return cards;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV data');
      return null;
    }
  };

  const parseCsvToDeck = (csvData: string, name: string, description: string): Deck | null => {
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and one data row');
      }

      const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
      const questionIndex = headers.findIndex(h => h.includes('question') || h.includes('front'));
      const answerIndex = headers.findIndex(h => h.includes('answer') || h.includes('back'));
      const categoriesIndex = headers.findIndex(h => h.includes('categories') || h.includes('category') || h.includes('tags'));

      if (questionIndex === -1 || answerIndex === -1) {
        throw new Error('CSV must contain "question" and "answer" columns (or "front" and "back")');
      }

      const cards: Flashcard[] = [];
      const now = new Date();

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        
        const maxIndex = Math.max(questionIndex, answerIndex, categoriesIndex === -1 ? 0 : categoriesIndex);
        if (values.length >= maxIndex + 1) {
          const question = values[questionIndex]?.trim();
          const answer = values[answerIndex]?.trim();
          const categoriesText = categoriesIndex !== -1 ? values[categoriesIndex]?.trim() : '';
          
          if (question && answer) {
            const categories = categoriesText 
              ? categoriesText.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0)
              : [];
              
            cards.push({
              id: `card_${Date.now()}_${i}`,
              question,
              answer,
              categories,
              reviewCount: 0,
              correctCount: 0,
              incorrectCount: 0,
              createdAt: now,
            });
          }
        }
      }

      if (cards.length === 0) {
        throw new Error('No valid cards found in CSV data');
      }

      return {
        id: `deck_${Date.now()}`,
        name: name || 'Imported Deck',
        description: description || 'Imported from CSV',
        cards,
        createdAt: now,
        totalStudySessions: 0,
        stats: {
          totalReviews: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          averageAccuracy: 0,
        },
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV data');
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!csvText.trim()) {
      setError('Please provide CSV data');
      return;
    }

    if (importMode === 'new') {
      if (!deckName.trim()) {
        setError('Please provide a deck name');
        return;
      }

      const deck = parseCsvToDeck(csvText, deckName.trim(), deckDescription.trim());
      if (deck) {
        onImport(deck);
        handleClose();
      }
    } else {
      if (!selectedExistingDeck) {
        setError('Please select an existing deck');
        return;
      }

      const cards = parseCsvToCards(csvText);
      if (cards && cards.length > 0) {
        onAddToExisting(selectedExistingDeck, cards);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setCsvText('');
    setDeckName('');
    setDeckDescription('');
    setError('');
    setImportMethod('file');
    setImportMode('new');
    setSelectedExistingDeck('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-effect holographic rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-8 pb-6 border-b border-cyan-500/20">
          <h3 className="text-2xl font-bold text-cyan-neon">Import Deck from CSV</h3>
          <button
            onClick={handleClose}
            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-6">
          <form onSubmit={handleSubmit}>
            {/* Import Mode Selection */}
            <div className="mb-6">
              <Label className="block text-sm font-medium text-text-primary mb-3">
                Import Options
              </Label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setImportMode('new')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    importMode === 'new'
                      ? 'bg-cyan-500/20 text-cyan-neon border border-cyan-500/30'
                      : 'bg-void/50 text-text-secondary border border-text-secondary/20 hover:border-cyan-500/30'
                  }`}
                >
                  <span>Create New Deck</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('existing')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    importMode === 'existing'
                      ? 'bg-cyan-500/20 text-cyan-neon border border-cyan-500/30'
                      : 'bg-void/50 text-text-secondary border border-text-secondary/20 hover:border-cyan-500/30'
                  }`}
                >
                  <span>Add to Existing Deck</span>
                </button>
              </div>
            </div>

            {/* Deck Information */}
            {importMode === 'new' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="block text-sm font-medium text-text-primary mb-2">
                    Deck Name
                  </Label>
                  <Input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
                    placeholder="Enter deck name"
                    required
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </Label>
                  <Textarea
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                    placeholder="Deck description"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <Label className="block text-sm font-medium text-text-primary mb-2">
                  Select Existing Deck
                </Label>
                <Select value={selectedExistingDeck} onValueChange={setSelectedExistingDeck}>
                  <SelectTrigger className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors">
                    <SelectValue placeholder="Choose a deck..." />
                  </SelectTrigger>
                  <SelectContent className="bg-void border border-cyan-500/20 rounded-xl">
                    {existingDecks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id} className="text-text-primary hover:bg-cyan-500/10">
                        {deck.name} ({deck.cards.length} cards)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="mb-6">
              <Label className="block text-sm font-medium text-text-primary mb-3">
                Import Method
              </Label>
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setImportMethod('file')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    importMethod === 'file'
                      ? 'bg-cyan-500/20 text-cyan-neon border border-cyan-500/30'
                      : 'bg-void/50 text-text-secondary border border-text-secondary/20 hover:border-cyan-500/30'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportMethod('text')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    importMethod === 'text'
                      ? 'bg-cyan-500/20 text-cyan-neon border border-cyan-500/30'
                      : 'bg-void/50 text-text-secondary border border-text-secondary/20 hover:border-cyan-500/30'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Text</span>
                </button>
              </div>

            {importMethod === 'text' ? (
              <div>
                <Label className="block text-sm font-medium text-text-primary mb-2">
                  CSV Data
                </Label>
                <Textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-4 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                  rows={8}
                  placeholder="Paste your CSV data here..."
                  required
                />
              </div>
            ) : (
              <div>
                <Label className="block text-sm font-medium text-text-primary mb-2">
                  Select CSV File
                </Label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-neon hover:file:bg-cyan-500/30 transition-colors"
                />
                {csvText && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-sm text-green-400">File loaded successfully</p>
                  </div>
                )}
              </div>
            )}
            </div>

            <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <h4 className="text-sm font-medium text-cyan-neon mb-2">CSV Format</h4>
              <p className="text-xs text-text-secondary mb-2">
                Your CSV should have columns named "question" and "answer" (or "front" and "back"). Categories are optional:
              </p>
              <code className="text-xs text-text-primary bg-void/50 p-2 rounded block">
                question,answer,categories<br/>
                "What is 2+2?","4","Math,Basic"<br/>
                "Capital of France?","Paris","Geography,Europe"
              </code>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 glass-effect border border-text-secondary/20 text-text-secondary rounded-xl hover:border-cyan-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Deck
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}