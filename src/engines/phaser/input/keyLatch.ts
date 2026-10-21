// Key state shared by the keyboard and the on-screen touch buttons, sampled once per game tick so a
// scene sees pressed / justPressed / justReleased the same way whichever source the input came from.
// Ported from swap (ivan-i1/swap@b71c719 web/src/input/keyLatch.ts). Import-free and unit-tested.

export type InputSource = 'keyboard' | 'touch';

export class KeyLatch {
  private held = new Map<string, Set<InputSource>>();
  private downs = new Set<string>();
  private ups = new Set<string>();
  private justDown = new Set<string>();
  private justUp = new Set<string>();

  down(key: string, source: InputSource): void {
    let sources = this.held.get(key);
    if (!sources) this.held.set(key, (sources = new Set()));
    if (sources.has(source)) return;
    if (sources.size === 0) this.downs.add(key);
    sources.add(source);
  }

  up(key: string, source: InputSource): void {
    const sources = this.held.get(key);
    if (!sources?.delete(source)) return;
    if (sources.size === 0) this.ups.add(key);
  }

  releaseAll(): void {
    for (const [key, sources] of this.held) {
      if (sources.size > 0) this.ups.add(key);
      sources.clear();
    }
  }

  /** Call at the start of each game tick (a scene's update()). */
  sample(): void {
    this.justDown = this.downs;
    this.justUp = this.ups;
    this.downs = new Set();
    this.ups = new Set();
  }

  pressed(key: string): boolean {
    return (this.held.get(key)?.size ?? 0) > 0 || this.justDown.has(key);
  }

  justPressed(key: string): boolean {
    return this.justDown.has(key);
  }

  justReleased(key: string): boolean {
    return this.justUp.has(key);
  }
}

/** The one latch the running game reads; keyboard and touch controls both write to it. */
export const keys = new KeyLatch();
