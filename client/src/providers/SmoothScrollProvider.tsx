'use client';
import React from 'react';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * SmoothScrollProvider - Simplified Custom Scroller
 * Uses standard CSS smooth-scrolling and native HTML capabilities.
 * This completely removes Locomotive Scroll's layout conflicts, duplicate scrollbars, and locked viewports.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return <>{children}</>;
}
