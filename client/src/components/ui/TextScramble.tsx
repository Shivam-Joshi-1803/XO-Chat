'use client';
import React, { useState, useEffect, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  autostart?: boolean;
  speed?: number;
  className?: string;
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|;:,.<>?';

export function TextScramble({
  text,
  autostart = true,
  speed = 30,
  className = '',
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const frameRef = useRef<number | null>(null);
  const iterationRef = useRef(0);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    iterationRef.current = 0;
    
    const startTime = Date.now();
    const scramble = () => {
      setDisplayText((prev) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iterationRef.current) {
              return text[index];
            }
            return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          })
          .join('')
      );

      if (iterationRef.current >= text.length) {
        setDisplayText(text);
        setIsScrambling(false);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      } else {
        iterationRef.current += 1 / 3; // controls resolving speed
        frameRef.current = requestAnimationFrame(scramble);
      }
    };
    
    frameRef.current = requestAnimationFrame(scramble);
  };

  useEffect(() => {
    if (autostart) {
      startScramble();
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, autostart]);

  return (
    <span
      onMouseEnter={startScramble}
      className={`font-mono cursor-default select-none ${className}`}
    >
      {displayText}
    </span>
  );
}
