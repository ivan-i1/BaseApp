// Physical keyboard → shared key latch. Registered once on the window rather than through Phaser's
// per-scene keyboard plugin, so a key held across a scene restart cannot get stuck.
import { keys } from './keyLatch';

/** KeyboardEvent.code → latch key name. Extend per game. */
export const DEFAULT_KEY_CODES: Record<string, string> = {
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  Space: 'SPACE',
  KeyX: 'X',
  KeyS: 'S',
  KeyR: 'R',
};

/** Starts listening; returns a function that stops. */
export function listenToKeyboard(codes: Record<string, string> = DEFAULT_KEY_CODES, target: Window = window): () => void {
  const onDown = (e: KeyboardEvent) => {
    const name = codes[e.code];
    if (!name) return;
    e.preventDefault();
    keys.down(name, 'keyboard');
  };
  const onUp = (e: KeyboardEvent) => {
    const name = codes[e.code];
    if (!name) return;
    e.preventDefault();
    keys.up(name, 'keyboard');
  };
  const onBlur = () => keys.releaseAll();
  const onVisibility = () => target.document.hidden && keys.releaseAll();
  target.addEventListener('keydown', onDown);
  target.addEventListener('keyup', onUp);
  target.addEventListener('blur', onBlur);
  target.document.addEventListener('visibilitychange', onVisibility);
  return () => {
    target.removeEventListener('keydown', onDown);
    target.removeEventListener('keyup', onUp);
    target.removeEventListener('blur', onBlur);
    target.document.removeEventListener('visibilitychange', onVisibility);
    keys.releaseAll();
  };
}
