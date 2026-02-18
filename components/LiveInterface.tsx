import React, { useState, useRef, useEffect } from 'react';
import { getLiveClient } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';
import { createPcmBlob, decodeAudioData } from '../utils/audioUtils';
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

export const LiveInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [volume, setVolume] = useState(0); // For visualization
  
  // Audio Contexts and Nodes
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Audio Playback Queue
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Connection Session
  const sessionRef = useRef<Promise<any> | null>(null);

  // Clean up function
  const stopSession = () => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }
    if (outputContextRef.current) {
        outputContextRef.current.close();
        outputContextRef.current = null;
    }
    
    // Stop playing audio
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    
    // We cannot explicitly "close" the session via the SDK based on current docs provided in prompt 
    // other than relying on `onclose` callback or just stopping the sending of data.
    // However, keeping valid state is enough for the UI.
    
    setIsActive(false);
    setStatus('disconnected');
    setVolume(0);
  };

  const startSession = async () => {
    try {
      setStatus('connecting');

      // 1. Initialize Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // 2. Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Setup Gemini Live Client
      const liveClient = getLiveClient();
      
      // Connect
      const sessionPromise = liveClient.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a helpful, witty, and concise AI assistant. Keep responses short and conversational.',
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setStatus('connected');
            setIsActive(true);
            
            // Start processing audio input
            if (!inputContextRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Calculate volume for visualization
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length));

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
             // Handle interruptions
             const interrupted = msg.serverContent?.interrupted;
             if (interrupted) {
                audioSourcesRef.current.forEach(source => source.stop());
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                return;
             }

             // Handle Audio Output
             const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputContextRef.current) {
                const ctx = outputContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                    base64ToUint8Array(base64Audio),
                    ctx
                );

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
             }
          },
          onclose: () => {
            console.log("Live Session Closed");
            stopSession();
          },
          onerror: (err) => {
            console.error("Live Session Error", err);
            setStatus('error');
            stopSession();
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start session:", error);
      setStatus('error');
      stopSession();
    }
  };

  // Helper for base64 decoding needed in onmessage
  const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 bg-gradient-to-b from-dark to-slate-900">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Gemini Live</h2>
        <p className="text-slate-400 max-w-md mx-auto">
            Have a real-time voice conversation with Gemini. 
            <br/><span className="text-xs text-slate-500">(Requires microphone access)</span>
        </p>
      </div>

      {/* Visualizer Circle */}
      <div className="relative mb-12">
        <div className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
            status === 'connected' ? 'border-primary shadow-[0_0_50px_rgba(79,70,229,0.5)]' : 
            status === 'error' ? 'border-red-500' : 'border-slate-700'
        }`}>
            {status === 'connecting' && (
                <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            )}
            
            {/* Inner dynamic circle based on volume */}
            <div 
                className={`rounded-full bg-gradient-to-tr from-primary to-purple-500 transition-all duration-75 ease-out ${
                    status === 'connected' ? 'opacity-100' : 'opacity-20'
                }`}
                style={{
                    width: `${Math.max(40, 40 + volume * 400)}%`,
                    height: `${Math.max(40, 40 + volume * 400)}%`,
                }}
            />
            
            <div className="absolute z-10">
                {status === 'connected' ? <SpeakerWaveIcon className="w-12 h-12 text-white" /> : <MicrophoneIcon className="w-12 h-12 text-slate-400" />}
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {status === 'error' && (
            <p className="text-red-400 mb-2">Connection failed. Please check console or try again.</p>
        )}
        
        {!isActive ? (
            <button
                onClick={startSession}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary font-lg rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 offset-slate-900"
            >
                <MicrophoneIcon className="w-6 h-6 mr-2" />
                Start Conversation
            </button>
        ) : (
            <button
                onClick={stopSession}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-red-500 font-lg rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 offset-slate-900"
            >
                <StopIcon className="w-6 h-6 mr-2" />
                End Session
            </button>
        )}
        
        <p className="text-sm text-slate-500 mt-4">
            Status: <span className="uppercase font-semibold tracking-wider">{status}</span>
        </p>
      </div>
    </div>
  );
};