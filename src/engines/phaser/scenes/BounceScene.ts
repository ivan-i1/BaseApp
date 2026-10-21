import * as Phaser from 'phaser';

import type { GameEvent, HostCommand } from '../bridge';
import { keys, type TouchButton } from '../input';

const MIN_IMPACT_SPEED = 90; // px/s
const ROLL_ACCEL = 900; // px/s² while ◀ / ▶ is held
const JUMP_SPEED = 650; // px/s upward kick per press

/** The on-screen buttons this scene wants on touch devices (arrow keys / Space on a keyboard). */
export const BOUNCE_BUTTONS: readonly TouchButton[] = [
  { key: 'LEFT', label: '◀', name: 'Roll left', side: 'left', row: 0, col: 0 },
  { key: 'RIGHT', label: '▶', name: 'Roll right', side: 'left', row: 0, col: 1 },
  { key: 'SPACE', label: 'JUMP', name: 'Jump', side: 'right', row: 0, col: 0 },
];

/**
 * Example scene: a ball under gravity. Roll it with ◀ ▶ (or the arrow keys), jump with JUMP (or Space),
 * or tap anywhere to launch it away from your finger. Replace with your own scenes; keep talking to the
 * host only through `emit` and `onCommand`, and read input from the shared `keys` latch.
 * This file is bundled into the native WebView by scripts/build-phaser-html.mjs —
 * import only 'phaser' and relative files, never React Native modules.
 */
export class BounceScene extends Phaser.Scene {
  private ball!: Phaser.Physics.Arcade.Image;
  private bounces = 0;

  constructor(private emit: (e: GameEvent) => void) {
    super('bounce');
  }

  create() {
    const g = this.add.graphics();
    g.fillStyle(0x8c98ff, 1).fillCircle(24, 24, 24);
    g.generateTexture('ball', 48, 48);
    g.destroy();

    const { width, height } = this.scale;
    this.ball = this.physics.add.image(width / 2, height / 3, 'ball');
    this.ball.setCollideWorldBounds(true).setBounce(0.8).setVelocity(180, 0).setDragX(240);
    (this.ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;

    // Arcade fires 'worldbounds' every frame while the ball rests on or slides along a
    // wall, so only count hits with real speed INTO that wall (the perpendicular axis).
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean) => {
      const into = up || down ? Math.abs(body.velocity.y) : Math.abs(body.velocity.x);
      if (into < MIN_IMPACT_SPEED) return;
      this.bounces++;
      this.emit({ type: 'bounce', count: this.bounces });
    });

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const dx = this.ball.x - p.x;
      const dy = this.ball.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      this.ball.setVelocity((dx / len) * 700, (dy / len) * 700);
    });

    this.scale.on('resize', (size: Phaser.Structs.Size) => {
      this.physics.world.setBounds(0, 0, size.width, size.height);
    });
  }

  update() {
    // Sample once per tick so justPressed is true for exactly one frame, whichever source pressed it.
    keys.sample();
    const roll = (keys.pressed('RIGHT') ? 1 : 0) - (keys.pressed('LEFT') ? 1 : 0);
    this.ball.setAccelerationX(roll * ROLL_ACCEL);
    // One kick per press, in the air too. A real platformer would gate this on ground contact plus a
    // short jump buffer, because justPressed lasts a single frame.
    if (keys.justPressed('SPACE')) this.ball.setVelocityY(-JUMP_SPEED);
  }

  onCommand(c: HostCommand) {
    if (c.type === 'pause') {
      keys.releaseAll(); // a button held when the menu opened must not stay held after resume
      this.scene.pause();
    }
    else if (c.type === 'resume') this.scene.resume();
    else if (c.type === 'restart') {
      this.bounces = 0;
      this.scene.restart();
    }
  }
}
