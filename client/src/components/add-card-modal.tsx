import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreateCardData } from '@/lib/types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCardData) => void;
  deckName: string;
}

export function AddCardModal({ isOpen, onClose, onSubmit, deckName }: AddCardModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [categories, setCategories] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      const categoryList = categories.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
      onSubmit({
        question: question.trim(),
        answer: answer.trim(),
        categories: categoryList,
      });
      setQuestion('');
      setAnswer('');
      setCategories('');
      onClose();
    }
  };

  const handleClose = () => {
    setQuestion('');
    setAnswer('');
    setCategories('');
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
      <div className="glass-effect holographic rounded-3xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-cyan-neon">Add New Card</h3>
            <p className="text-text-secondary mt-1">to {deckName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-text-secondary hover:text-cyan-neon transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Question
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-4 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="Enter your question"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Answer
            </label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-4 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              rows={4}
              placeholder="Enter the answer"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Categories (Optional)
            </label>
            <Input
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              className="w-full p-4 bg-void border border-cyan-500/20 rounded-xl text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Enter categories separated by commas (e.g., Science, Biology)"
            />
            <p className="text-xs text-text-secondary mt-1">
              Categories help organize your cards for easier studying
            </p>
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
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}