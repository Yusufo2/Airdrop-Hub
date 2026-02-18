import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Button } from './ui/Button';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

export const VisionInterface: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract pure base64 and mime type
        const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
            setMimeType(matches[1]);
            setSelectedImage(matches[2]); // The pure base64 data
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setMimeType('');
    setResponse('');
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !prompt) return;

    setIsLoading(true);
    setResponse('');
    
    try {
      const result = await analyzeImage(prompt, selectedImage, mimeType);
      setResponse(result.text || "No response text.");
    } catch (error) {
      console.error(error);
      setResponse("Error analyzing image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Multimodal Vision</h2>
          <p className="text-slate-400">Upload an image and ask Gemini about it.</p>
        </div>

        {/* Image Upload Area */}
        <div className="relative">
          {!selectedImage ? (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer bg-surface/30 hover:bg-surface/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ArrowUpTrayIcon className="w-10 h-10 text-slate-400 mb-3" />
                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-500">PNG, JPG, WEBP (MAX. 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative w-full h-64 bg-black/50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-700">
              <img 
                src={`data:${mimeType};base64,${selectedImage}`} 
                alt="Selected" 
                className="max-h-full max-w-full object-contain" 
              />
              <button 
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Describe this image in detail..."
              className="flex-1 bg-surface border border-slate-700 text-white text-sm rounded-xl focus:ring-primary focus:border-primary block p-3"
            />
            <Button 
                onClick={handleAnalyze} 
                disabled={!selectedImage || !prompt}
                isLoading={isLoading}
            >
                Analyze
            </Button>
        </div>

        {/* Response Area */}
        {response && (
            <div className="bg-surface border border-slate-700 rounded-xl p-6 shadow-xl animate-fade-in">
                <div className="flex items-center gap-2 mb-4 text-primary">
                    <PhotoIcon className="w-5 h-5" />
                    <h3 className="font-semibold">Analysis Result</h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    <ReactMarkdown>{response}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};