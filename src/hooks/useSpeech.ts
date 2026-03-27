
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechOptions {
  onTranscript?: (transcript: string) => void;
  onPartialTranscript?: (transcript: string) => void;
  language?: string;
  silenceTimeout?: number;
}

export function useSpeech({ onTranscript, onPartialTranscript, language = 'en-US', silenceTimeout = 3000 }: UseSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTranscriptRef = useRef<string>('');
  
  // Use refs for callbacks to prevent effect re-runs
  const onTranscriptRef = useRef(onTranscript);
  const onPartialTranscriptRef = useRef(onPartialTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onPartialTranscriptRef.current = onPartialTranscript;
  }, [onTranscript, onPartialTranscript]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setPartialTranscript('');
      currentTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let fullText = '';
      for (let i = 0; i < event.results.length; ++i) {
        fullText += event.results[i][0].transcript;
      }

      setPartialTranscript(fullText);
      currentTranscriptRef.current = fullText;
      onPartialTranscriptRef.current?.(fullText);

      // Reset silence timer whenever we get any result
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      
      silenceTimerRef.current = setTimeout(() => {
        if (currentTranscriptRef.current.trim() && isListening) {
          onTranscriptRef.current?.(currentTranscriptRef.current.trim());
          // Stop recognition after successful transcript to prevent duplicates
          recognition.stop();
        }
      }, silenceTimeout);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      if (event.error === 'aborted') return;
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable it in your browser settings.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      
      // If we have a transcript when it ends, send it if not already sent
      if (currentTranscriptRef.current.trim()) {
        onTranscriptRef.current?.(currentTranscriptRef.current.trim());
        currentTranscriptRef.current = '';
        setPartialTranscript('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [language, silenceTimeout, isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Speech recognition start error:', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }, []);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Attempt to find a natural sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && v.name.includes('Google'));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
    return utterance;
  }, []);

  return {
    isListening,
    transcript,
    partialTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    speak,
  };
}
