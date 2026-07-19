declare module 'locomotive-scroll' {
  export interface LocomotiveScrollOptions {
    el?: HTMLElement;
    name?: string;
    offset?: [number, number];
    repeat?: boolean;
    smooth?: boolean;
    initPosition?: { x: number; y: number };
    direction?: 'vertical' | 'horizontal';
    lerp?: number;
    getDirection?: boolean;
    getSpeed?: boolean;
    class?: string;
    initClass?: string;
    scrollingClass?: string;
    draggingClass?: string;
    smoothClass?: string;
    scrollbarClass?: string;
    multiplier?: number;
    firefoxMultiplier?: number;
    touchMultiplier?: number;
    scrollFromAnywhere?: boolean;
    smartphone?: {
      smooth?: boolean;
      multiplier?: number;
      breakpoint?: number;
    };
    tablet?: {
      smooth?: boolean;
      multiplier?: number;
      breakpoint?: number;
    };
    reloadOnContextChange?: boolean;
    resetNativeScroll?: boolean;
  }

  export default class LocomotiveScroll {
    constructor(options?: LocomotiveScrollOptions);
    init(): void;
    on(event: string, callback: (args: any) => void): void;
    update(): void;
    destroy(): void;
    scrollTo(target: any, options?: any): void;
  }
}
