import { useState } from 'react';
import type React from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';

/** True once the page has scrolled past `offset` pixels (compact sticky nav). */
export function useScrolledPast(offset = 24): boolean {
  const { scrollY } = useScroll();
  const [past, setPast] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setPast(y > offset));
  return past;
}

/** Lets a card light its border where the pointer is (CSS reads --mx / --my). */
export const trackPointer = (e: React.PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};
