import { describe, expect, it } from 'vitest';
import { FIT_SLACK, FRAME_GAP, FRAME_LABEL, MIN_FRAME_SCALE, deviceOuterSize, fitArea, fitScale } from './device';

/**
 * Fitted frames must always end strictly inside the stage. If they fill it to
 * the exact pixel, rounding overflows it, the stage gains scrollbars, shrinks,
 * refits, loses them, grows… and the frame jumps back and forth for good.
 */
describe('fitting frames to a stage', () => {
  const phone = deviceOuterSize('phone', { width: 390, height: 844 });
  const browser = deviceOuterSize('browser', { width: 1440, height: 900 });

  it('never fills the stage to the last pixel, alone or three-up, for any stage size', () => {
    for (let w = 300; w <= 2400; w += 7) {
      for (const h of [400, 517, 640, 768, 901, 1080]) {
        for (const count of [1, 3]) {
          const labelled = count === 3;
          for (const outer of [phone, browser]) {
            const s = fitScale({ width: w, height: h }, outer, { count, labelled });
            if (s === MIN_FRAME_SCALE) continue;
            const used = { width: outer.width * s * count + FRAME_GAP * (count - 1), height: outer.height * s + (labelled ? FRAME_LABEL : 0) };
            expect(used.width).toBeLessThanOrEqual(w - FIT_SLACK + 1e-9);
            expect(used.height).toBeLessThanOrEqual(h - FIT_SLACK + 1e-9);
          }
        }
      }
    }
  });

  it('never enlarges past 100% and rounds down to a stable value', () => {
    expect(fitScale({ width: 5000, height: 5000 }, phone)).toBe(1);
    const s = fitScale({ width: 1001, height: 777 }, browser, { fitHeight: false });
    expect(s).toBe(Math.floor(s * 1000) / 1000);
  });

  it('reserves gaps and captions in the usable area', () => {
    expect(fitArea({ width: 1000, height: 800 }, { count: 3, labelled: true })).toEqual({ width: 1000 - FIT_SLACK - 2 * FRAME_GAP, height: 800 - FIT_SLACK - FRAME_LABEL });
  });
});
