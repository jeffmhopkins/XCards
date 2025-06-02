import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreateDeckData } from '@/lib/types';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeckData) => void;
}

export function CreateDeckModal({ isOpen, onClose, onSubmit }: CreateDeckModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        description: description.trim(),
      });
      setName('');
      setDescription('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
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
      <div className="glass-effect holographic rounded-3xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-cyan-neon">Create New Deck</h3>
          <button
            onClick={handleClose}
            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Deck Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Enter deck name"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description (Optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="Describe your deck"
            />
          </div>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 px-6 py-3 glass-effect border border-text-secondary/20 text-text-secondary rounded-xl hover:border-cyan-500/30 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              Create Deck
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
