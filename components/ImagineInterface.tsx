import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { Button } from './ui/Button';
import { SparklesIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const ImagineInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "3:4">("1:1");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setGeneratedImages([]);
    try {
      const images = await generateImage(prompt, aspectRatio);
      setGeneratedImages(images);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = (base64Url: string, index: number) => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = `gemini-generated-${index}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                Imagine & Create
            </h2>
            <p className="text-slate-400">Turn your words into stunning visuals with Gemini.</p>
        </div>

        <div className="bg-surface/50 border border-slate-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic city with flying cars at sunset, cyberpunk style..."
                className="w-full bg-dark border border-slate-700 text-white rounded-xl p-4 mb-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32 resize-none"
            />
            
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 bg-dark rounded-lg p-1 border border-slate-700">
                    {(["1:1", "16:9", "3:4"] as const).map((ratio) => (
                        <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                aspectRatio === ratio 
                                ? 'bg-slate-700 text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>

                <Button 
                    onClick={handleGenerate} 
                    isLoading={isLoading} 
                    disabled={!prompt.trim()}
                    className="w-full sm:w-auto"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate
                </Button>
            </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading && generatedImages.length === 0 && (
                <div className="col-span-full h-64 flex items-center justify-center border border-slate-800 rounded-2xl bg-surface/20">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 animate-pulse">Dreaming up pixels...</p>
                    </div>
                </div>
            )}

            {generatedImages.map((imgSrc, idx) => (
                <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                    <img 
                        src={imgSrc} 
                        alt={`Generated ${idx}`} 
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <span className="text-white text-sm font-medium truncate w-2/3">{prompt}</span>
                        <button 
                            onClick={() => downloadImage(imgSrc, idx)}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                            title="Download"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};