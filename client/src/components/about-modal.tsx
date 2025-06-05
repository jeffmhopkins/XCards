import { X, Github, Info, Smartphone, Database, Brain, Shield, Code, Layers, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalStorage } from '@/lib/storage';
import { useState, useRef } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = LocalStorage.exportAllData();
      const filename = `xCards-backup-${new Date().toISOString().split('T')[0]}.json`;
      LocalStorage.downloadFile(exportData, filename);
      setImportMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setImportMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportMessage(null);
      
      const text = await file.text();
      const result = LocalStorage.importAllData(text);
      
      if (result.success) {
        setImportMessage({ type: 'success', text: 'Data imported successfully! Refresh the page to see changes.' });
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setImportMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setImportMessage({ type: 'error', text: 'Failed to read file. Please check the file format.' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const confirmResetData = async () => {
    try {
      setIsResetting(true);
      setImportMessage(null);
      setShowResetConfirm(false);
      
      // Clear all local storage data
      localStorage.clear();
      
      setImportMessage({ type: 'success', text: 'All data has been reset successfully! Refresh the page to see changes.' });
    } catch (error) {
      setImportMessage({ type: 'error', text: 'Failed to reset data. Please try again.' });
    } finally {
      setIsResetting(false);
    }
  };

  const cancelResetData = () => {
    setShowResetConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-effect holographic rounded-3xl p-8 shadow-2xl border border-cyan-500/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center justify-center animate-float mx-auto mb-4">
              <span className="text-black font-bold text-3xl">X</span>
            </div>
            <h2 className="text-6xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
              xCards
            </h2>
          </div>
          <p className="text-sm text-text-secondary font-mono mb-2">
            Version 1.0.9
          </p>
          <p className="text-text-secondary text-lg">
            A flashcard application for immersive and adaptive learning
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* How It Works */}
          <div className="glass-effect rounded-2xl p-6 border border-cyan-500/10">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">How It Works</h3>
            </div>
            <div className="space-y-3 text-text-secondary text-sm">
              <p>• Create custom flashcard decks with questions and answers</p>
              <p>• Use <strong>Smart Review Sessions</strong> - 20 cards selected by spaced repetition algorithm</p>
              <p>• Study in multiple modes: sequential, shuffled, or filtered by difficulty</p>
              <p>• Rate your confidence on each card (easy, good, hard)</p>
              <p>• Track progress with detailed statistics and analytics</p>
              <p>• SM-2 inspired algorithm calculates optimal review intervals automatically</p>
            </div>
          </div>

          {/* Key Features */}
          <div className="glass-effect rounded-2xl p-6 border border-purple-500/10">
            <div className="flex items-center space-x-3 mb-4">
              <Layers className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Key Features</h3>
            </div>
            <div className="space-y-3 text-text-secondary text-sm">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-green-400" />
                <span><strong>Smart Review Sessions</strong> - 20-card spaced repetition</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-orange-400" />
                <span>Multiple study modes with intelligent filtering</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span>CSV import/export functionality</span>
              </div>
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Progressive Web App (PWA)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span>Detailed progress analytics & statistics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Review Algorithm Details */}
        <div className="mb-8">
          <div className="glass-effect rounded-2xl p-6 border border-cyan-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Smart Review Algorithm (v1.0.8)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Card Selection Priority</h4>
                <div className="space-y-2 text-xs text-text-secondary">
                  <p>1. <strong>Overdue cards</strong> - Past their scheduled review date</p>
                  <p>2. <strong>New cards</strong> - Never studied before</p>
                  <p>3. <strong>Recent cards</strong> - Weighted by difficulty rating</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Next Review Calculation</h4>
                <div className="space-y-2 text-xs text-text-secondary">
                  <p><strong>First review:</strong> Hard=1d, Good=2d, Easy=4d</p>
                  <p><strong>Subsequent:</strong> Exponential intervals (2.5x multiplier)</p>
                  <p><strong>Hard:</strong> 60% of base interval</p>
                  <p><strong>Good:</strong> 100% of base interval</p>
                  <p><strong>Easy:</strong> 150% of base interval</p>
                  <p><strong>Maximum:</strong> 180 days between reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Privacy & Local Data */}
          <div className="glass-effect rounded-2xl p-6 border border-green-500/10">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Privacy & Local Data</h3>
            </div>
            <div className="space-y-3 text-text-secondary text-sm">
              <p>• <strong>100% local storage</strong> - your data never leaves your device</p>
              <p>• <strong>No server required</strong> - works completely offline</p>
              <p>• <strong>No tracking or analytics</strong> - your learning is private</p>
              <p>• <strong>Cross-device sync</strong> - export/import your decks easily</p>
              <p>• <strong>Browser storage</strong> - data persists until you clear it</p>
            </div>
          </div>

          {/* Built With */}
          <div className="glass-effect rounded-2xl p-6 border border-orange-500/10">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Built With</h3>
            </div>
            <div className="space-y-3 text-text-secondary text-sm">
              <p>• <strong>React</strong> - Modern user interface framework</p>
              <p>• <strong>TypeScript</strong> - Type-safe development</p>
              <p>• <strong>Tailwind CSS</strong> - Utility-first styling</p>
              <p>• <strong>Vite</strong> - Fast build tooling</p>
              <p>• <strong>PWA</strong> - Service workers for offline capability</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6">
          {/* Data Transfer Section */}
          <div className="mb-6 p-4 glass-effect rounded-xl border border-cyan-500/20">
            <h4 className="text-lg font-semibold text-white mb-3">Data Transfer</h4>
            <p className="text-text-secondary text-sm mb-4">
              Export your decks and progress to transfer between devices. All data is stored locally in your browser cache - no external servers are used.
            </p>
            
            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <Button
                onClick={handleImportClick}
                disabled={isImporting}
                className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-all duration-300 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import'}
              </Button>

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
              
              <Button
                onClick={handleResetData}
                disabled={isResetting}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isResetting ? 'Resetting...' : 'Reset'}
              </Button>
            </div>
            
            {/* Status Message */}
            {importMessage && (
              <div className={`text-sm px-3 py-2 rounded-lg ${
                importMessage.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}>
                {importMessage.text}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-text-secondary text-sm mb-4">
              Created by{' '}
              <span className="text-cyan-400 font-semibold">Jeff Hopkins</span>
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              <a
                href="https://github.com/jeffmhopkins/XCards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors duration-200"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">View on GitHub</span>
              </a>
            </div>

            <Button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancelResetData}></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">Reset All Data</h3>
              
              <p className="text-text-secondary text-sm mb-6">
                Are you sure you want to reset all data? This will permanently delete all your decks, statistics, and progress. This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  onClick={cancelResetData}
                  variant="outline"
                  className="flex-1 px-4 py-3 bg-gray-600/20 border border-gray-500/30 text-gray-300 hover:bg-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={confirmResetData}
                  disabled={isResetting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-400 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-600/20 transition-all duration-300 disabled:opacity-50"
                >
                  {isResetting ? 'Resetting...' : 'Reset Data'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}