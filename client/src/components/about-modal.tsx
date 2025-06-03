import { X, Github, Info, Smartphone, Database, Brain, Shield, Code, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
            Version 1.0.4
          </p>
          <p className="text-text-secondary text-lg">
            A sci-fi themed flashcard application for immersive and adaptive learning
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
              <p>• Study in multiple modes: sequential, shuffled, or filtered by difficulty</p>
              <p>• Rate your confidence on each card (easy, good, hard)</p>
              <p>• Track progress with detailed statistics and analytics</p>
              <p>• Adaptive algorithm adjusts repetition based on performance</p>
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
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Progressive Web App (PWA)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-green-400" />
                <span>Spaced repetition algorithm</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span>CSV import/export functionality</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-orange-400" />
                <span>Multiple study modes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span>Detailed progress analytics</span>
              </div>
            </div>
          </div>

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
        <div className="text-center border-t border-white/10 pt-6">
          <p className="text-text-secondary text-sm mb-4">
            Created by{' '}
            <span className="text-cyan-400 font-semibold">jeffmhopkins</span>
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
  );
}