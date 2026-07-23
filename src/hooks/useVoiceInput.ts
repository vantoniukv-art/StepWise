"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "listening" | "processing" | "error";

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useVoiceInput(onResult: (transcript: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = typeof window !== "undefined" && getRecognitionConstructor() !== null;

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setStatus("error");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "uk-UA";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setStatus("processing");
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript ?? "";
      onResult(transcript.trim());
      setStatus("idle");
    };

    recognition.onerror = () => {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2200);
    };

    recognition.onend = () => {
      setStatus((current) => (current === "listening" ? "idle" : current));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { status, isSupported, start, stop };
}
