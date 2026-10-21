// Capacitor entry: the same Phaser game the Expo app hosts (../../src/engines/phaser/game.ts),
// running directly in the system WebView with no React Native around it.
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

import { startGame } from '../../src/engines/phaser/game';
import { keys } from '../../src/engines/phaser/input';

const handle = startGame(document.getElementById('game')!, (event) => {
  if (event.type === 'log') console.warn('[game]', event.message);
});

// Native-app glue (ported from swap's src/native.ts). In a plain browser none of this runs.
if (Capacitor.isNativePlatform()) {
  // One scene, so Android back closes the app. A multi-scene game should go back to its title first.
  void App.addListener('backButton', () => void App.exitApp());
  // Never leave an on-screen button held while the app is in the background.
  void App.addListener('pause', () => {
    keys.releaseAll();
    handle.command({ type: 'pause' });
  });
  void App.addListener('resume', () => handle.command({ type: 'resume' }));
}
