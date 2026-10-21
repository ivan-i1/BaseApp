import * as Phaser from 'phaser';

import type { GameEvent, GameHandle, HostCommand } from './bridge';
import { createTouchControls, isTouchDevice, listenToKeyboard } from './input';
import { BOUNCE_BUTTONS, BounceScene } from './scenes/BounceScene';

/**
 * Boots the Phaser game into `parent`. Shared by every host: the web page (PhaserView.web.tsx),
 * the React Native WebView page (PhaserView.tsx) and the Capacitor app (capacitor/src/main.ts).
 */
export function startGame(parent: HTMLElement, emit: (e: GameEvent) => void, background = '#0F1016'): GameHandle {
  const scene = new BounceScene(emit);
  const stopKeyboard = listenToKeyboard();
  // Touch buttons live inside the game's container, which must be positioned for them to anchor to.
  if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
  const touch = isTouchDevice() ? createTouchControls(parent, BOUNCE_BUTTONS) : null;
  touch?.setVisible(true);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: background,
    // Two thumbs on the buttons plus one on the canvas.
    input: { activePointers: 3, keyboard: false },
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 } } },
    scene,
    banner: false,
  });
  game.events.once(Phaser.Core.Events.READY, () => emit({ type: 'ready' }));
  return {
    command: (c: HostCommand) => scene.onCommand(c),
    destroy: () => {
      touch?.destroy();
      stopKeyboard();
      game.destroy(true);
    },
  };
}
