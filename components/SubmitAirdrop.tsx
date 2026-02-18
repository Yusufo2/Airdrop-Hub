import React, { useState } from 'react';
import { enhanceAirdropDescription } from '../services/geminiService';
import { Button } from './ui/Button';
import { SparklesIcon, DocumentPlusIcon, LinkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface SubmitAirdropProps {
  onBack: () => void;
}

export const SubmitAirdrop: React.FC<SubmitAirdropProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!name || !notes) return;
    setIsEnhancing(true);
    try {
      const polished = await enhanceAirdropDescription(name, notes);
      setDescription(polished);
    } catch (e) {
      console.error(e);
      alert("AI enhancement failed. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Airdrop submitted for review! (Demo only)");
    // Reset form
    setName('');
    setNotes('');
    setDescription('');
    // Optional: go back after submit
    onBack();
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-3xl mx-auto relative">
        
        {/* Back Button */}
        <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all group z-10"
            title="Back to Feed"
        >
            <ArrowLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="text-center mb-10 pt-2">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl mb-4 border border-white/5 shadow-inner">
             <DocumentPlusIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Publish Airdrop</h2>
          <p className="text-slate-400 max-w-md mx-auto">Contribute to the community. Submissions are vetted by our AI and community moderators.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Project Name</label>
              <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-0 group-focus-within:opacity-50 transition duration-500 blur-sm" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="relative w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:bg-dark transition-all"
                    placeholder="e.g. StarkNet"
                    required
                  />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Rough Notes / Details</label>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">
                    <LinkIcon className="w-3 h-3" />
                    <span>Links allowed</span>
                </div>
              </div>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-dark transition-all h-32 resize-none"
                placeholder="Paste URLs, requirements, or rough points here..."
              />
            </div>

            {/* AI Action */}
            <div className="flex justify-end -mt-4">
                <Button 
                    type="button" 
                    onClick={handleEnhance}
                    disabled={!name || !notes}
                    isLoading={isEnhancing}
                    variant="secondary"
                    className="text-xs backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10"
                >
                    <SparklesIcon className={`w-4 h-4 mr-2 text-accent ${isEnhancing ? 'animate-spin' : ''}`} />
                    Generate Professional Description
                </Button>
            </div>

            <div className={`space-y-1 transition-all duration-500 ${description ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Final Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-1 focus:ring-secondary/50 focus:bg-dark transition-all h-48 resize-none font-light leading-relaxed"
                placeholder="The polished description will appear here..."
                required
              />
            </div>

            <Button type="submit" className="w-full py-4 text-lg font-bold bg-gradient-to-r from-primary to-primaryDark hover:to-primary shadow-lg shadow-primary/20">
                Submit Airdrop
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};