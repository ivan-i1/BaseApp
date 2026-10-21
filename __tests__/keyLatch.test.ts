// Ported from swap (ivan-i1/swap@b71c719 web/tests/keyLatch.test.ts), vitest → jest.
import { KeyLatch } from '@/engines/phaser/input/keyLatch';

describe('KeyLatch (keyboard + touch buttons merged into one per-tick key state)', () => {
  it('reports justPressed for one tick, pressed while held, justReleased after release', () => {
    const k = new KeyLatch();
    k.down('S', 'touch');
    k.sample();
    expect(k.justPressed('S')).toBe(true);
    expect(k.pressed('S')).toBe(true);
    k.sample();
    expect(k.justPressed('S')).toBe(false);
    expect(k.pressed('S')).toBe(true);
    k.up('S', 'touch');
    k.sample();
    expect(k.pressed('S')).toBe(false);
    expect(k.justReleased('S')).toBe(true);
    k.sample();
    expect(k.justReleased('S')).toBe(false);
  });

  it('does not lose a tap that starts and ends between two ticks', () => {
    const k = new KeyLatch();
    k.down('X', 'touch');
    k.up('X', 'touch');
    k.sample();
    expect(k.justPressed('X')).toBe(true);
    expect(k.pressed('X')).toBe(true);
    expect(k.justReleased('X')).toBe(true);
  });

  it('keeps a key held until every source lets go', () => {
    const k = new KeyLatch();
    k.down('LEFT', 'keyboard');
    k.down('LEFT', 'touch');
    k.sample();
    k.up('LEFT', 'touch');
    k.sample();
    expect(k.pressed('LEFT')).toBe(true);
    expect(k.justReleased('LEFT')).toBe(false);
    k.up('LEFT', 'keyboard');
    k.sample();
    expect(k.pressed('LEFT')).toBe(false);
    expect(k.justReleased('LEFT')).toBe(true);
  });

  it('ignores repeated downs from the same source (key repeat, double events)', () => {
    const k = new KeyLatch();
    k.down('SPACE', 'keyboard');
    k.sample();
    k.down('SPACE', 'keyboard');
    k.sample();
    expect(k.justPressed('SPACE')).toBe(false);
  });

  it('releaseAll drops every held key, e.g. when the app goes to the background', () => {
    const k = new KeyLatch();
    k.down('RIGHT', 'touch');
    k.down('S', 'keyboard');
    k.sample();
    k.releaseAll();
    k.sample();
    expect(k.pressed('RIGHT')).toBe(false);
    expect(k.pressed('S')).toBe(false);
    expect(k.justReleased('S')).toBe(true);
  });
});
