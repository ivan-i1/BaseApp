// On-screen controls for phones and tablets: scenes only know keys, so each button holds a key in the
// shared latch for as long as a finger is on it (multi-touch, pointer capture). Adapted from swap
// (ivan-i1/swap@b71c719 web/src/input/touchControls.ts): buttons are passed in per game, and they mount
// inside the game's own container instead of the whole page, so on web they never cover the app header.
import { keys } from './keyLatch';

export type TouchButton = {
  /** Latch key the button holds, e.g. 'LEFT', 'SPACE'. */
  key: string;
  label: string;
  /** Accessible name; defaults to the label. */
  name?: string;
  side: 'left' | 'right';
  /** 0 = bottom row. */
  row: number;
  /** 0 = outer edge. */
  col: number;
  small?: boolean;
};

export type TouchControls = { setVisible(visible: boolean): void; destroy(): void };

const CSS = `
.touch-controls { position: absolute; inset: 0; pointer-events: none; z-index: 10; display: none;
  font-family: ui-sans-serif, system-ui, sans-serif; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
.touch-controls.visible { display: block; }
.touch-controls button { position: absolute; pointer-events: auto; touch-action: none;
  width: var(--size); height: var(--size); border-radius: 50%; border: 2px solid rgba(255,255,255,0.6);
  background: rgba(20, 22, 40, 0.45); color: #fff; font: inherit; font-size: 13px; font-weight: 700; line-height: 1; padding: 0;
  -webkit-tap-highlight-color: transparent; }
.touch-controls button.small { width: calc(var(--size) * 0.66); height: calc(var(--size) * 0.66); font-size: 20px; }
.touch-controls button.big-glyph { font-size: 26px; }
.touch-controls button.long { font-size: 10px; }
.touch-controls button.held { background: rgba(140, 152, 255, 0.8); border-color: #fff; }
`;

/** Phones and tablets get touch controls; desktops with a mouse do not. */
export function isTouchDevice(win: Window = window): boolean {
  return win.matchMedia('(pointer: coarse)').matches || win.navigator.maxTouchPoints > 0;
}

/**
 * Creates the buttons inside `container`, hidden until setVisible(true). The container must be a
 * positioned element that already sits inside the safe area.
 */
export function createTouchControls(container: HTMLElement, buttons: readonly TouchButton[]): TouchControls {
  const doc = container.ownerDocument;
  const style = doc.createElement('style');
  style.textContent = CSS;
  doc.head.appendChild(style);

  const root = doc.createElement('div');
  root.className = 'touch-controls';
  root.style.setProperty('--size', 'clamp(56px, 11vmin, 84px)');
  container.appendChild(root);
  const gap = '12px';
  const held = new Set<string>();

  for (const def of buttons) {
    const b = doc.createElement('button');
    b.type = 'button';
    b.textContent = def.label;
    b.setAttribute('aria-label', def.name ?? def.label);
    if (def.small) b.classList.add('small');
    if (def.label.length === 1) b.classList.add('big-glyph');
    if (def.label.length > 4) b.classList.add('long');

    // No env(safe-area-inset-*) here: the container is responsible for avoiding notches and the home
    // indicator (Capacitor's #game is inset, the Expo screen is a SafeAreaView). Adding it again would
    // lift the buttons above the game's own floor on iPhones.
    b.style[def.side] = `calc(${gap} + ${def.col} * (var(--size) + ${gap}))`;
    b.style.bottom = `calc(${gap} + ${def.row} * (var(--size) + ${gap}))`;

    const release = () => {
      b.classList.remove('held');
      held.delete(def.key);
      keys.up(def.key, 'touch');
    };
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation(); // the canvas behind must not also see this touch
      b.setPointerCapture(e.pointerId);
      b.classList.add('held');
      held.add(def.key);
      keys.down(def.key, 'touch');
    });
    b.addEventListener('pointerup', release);
    b.addEventListener('pointercancel', release);
    b.addEventListener('lostpointercapture', release);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    root.appendChild(b);
  }

  return {
    // No releaseAll on hide: a scene restart hides and re-shows the controls, and a held ▶ should survive
    // it. Hidden buttons lose pointer capture, which releases their keys anyway.
    setVisible: (visible) => root.classList.toggle('visible', visible),
    destroy: () => {
      for (const key of held) keys.up(key, 'touch');
      root.remove();
      style.remove();
    },
  };
}
