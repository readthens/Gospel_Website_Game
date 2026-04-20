import Phaser from 'phaser';
import { playOptionalMusic, playOptionalSound } from '../utils/audio';
import { ENDING_VARIANTS, getEndingCopy } from '../data/endings.js';

const DEFAULT_ENDING = getEndingCopy(ENDING_VARIANTS.LEARNED);

function isEmitter(value) {
  return Boolean(value)
    && typeof value.on === 'function'
    && typeof value.off === 'function'
    && typeof value.emit === 'function';
}

function getGlobalSharedRoot() {
  return globalThis.__WWDC_GAME__
    || globalThis.__WHEN_THE_WATER_DOESNT_COME__
    || globalThis.__WHEN_THE_WATER_DOES_NOT_COME__
    || null;
}

function resolveGameState(scene, data = {}) {
  const root = getGlobalSharedRoot();

  return data.gameState
    || scene.registry.get('gameState')
    || scene.registry.get('GameState')
    || scene.game.gameState
    || scene.game.sharedState
    || root?.gameState
    || root?.GameState
    || null;
}

function collectEmitters(source) {
  const emitters = [source, source?.events, source?.emitter, source?.eventEmitter].filter(isEmitter);
  return Array.from(new Set(emitters));
}

function safeCall(target, methodNames) {
  if (!target) {
    return false;
  }

  return methodNames.some((methodName) => {
    if (typeof target[methodName] !== 'function') {
      return false;
    }

    target[methodName]();
    return true;
  });
}

function resetRunState(scene, gameState) {
  const dialogueSystem = scene.registry.get('dialogueSystem') || scene.game.dialogueSystem || null;
  const taskSystem = scene.registry.get('taskSystem') || scene.game.taskSystem || null;
  const challengeSystem = scene.registry.get('challengeSystem') || scene.game.challengeSystem || null;

  safeCall(gameState, ['resetRun', 'resetForNewRun', 'resetSession', 'reset']);
  safeCall(dialogueSystem, ['reset', 'clear', 'stopAll']);
  safeCall(taskSystem, ['reset', 'clear']);
  safeCall(challengeSystem, ['reset', 'clear']);

  [gameState, dialogueSystem, taskSystem, challengeSystem, scene.game.events].forEach((target) => {
    collectEmitters(target).forEach((emitter) => {
      emitter.emit('run:reset');
      emitter.emit('game:restart');
      emitter.emit('ui:reset');
      emitter.emit('dialogue:hide');
      emitter.emit('challenge:hide');
      emitter.emit('interaction:clear');
      emitter.emit('narration:hide');
    });
  });
}

function createButton(scene, label, options = {}) {
  const width = options.width || 248;
  const height = options.height || 52;
  const fillColor = options.fillColor || 0xd8c58f;
  const hoverColor = options.hoverColor || 0xe7d6a3;
  const textColor = options.textColor || '#13212a';
  const shadow = scene.add.rectangle(0, 5, width, height, 0x04070a, 0.22);
  shadow.setOrigin(0.5);

  const backdrop = scene.add.rectangle(0, 0, width, height, fillColor, 1);
  backdrop.setOrigin(0.5);
  backdrop.setStrokeStyle(2, 0xf8f1d7, 0.78);
  backdrop.setInteractive({ useHandCursor: true });

  const text = scene.add.text(0, 0, label, {
    fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
    fontSize: '18px',
    fontStyle: 'bold',
    color: textColor,
    align: 'center',
  });
  text.setOrigin(0.5);

  const container = scene.add.container(0, 0, [shadow, backdrop, text]);

  const setHovered = (hovered) => {
    backdrop.setFillStyle(hovered ? hoverColor : fillColor, 1);
    container.setScale(hovered ? 1.02 : 1);
  };

  backdrop.on('pointerover', () => setHovered(true));
  backdrop.on('pointerout', () => setHovered(false));
  backdrop.on('pointerdown', () => {
    if (options.onClick) {
      options.onClick();
    }
  });

  return {
    container,
    setPosition(x, y) {
      container.setPosition(x, y);
      return this;
    },
    resize(nextWidth) {
      shadow.setSize(nextWidth, height);
      backdrop.setSize(nextWidth, height);
      return this;
    },
    destroy() {
      container.destroy(true);
    },
  };
}

function resolveEndingCopy(data = {}) {
  const ending = data.ending || data.outcome || null;
  const endingVariant = data.endingVariant || ENDING_VARIANTS.LEARNED;
  const variantCopy = ending || getEndingCopy(endingVariant);

  return {
    headline: variantCopy?.headline || data.headline || DEFAULT_ENDING.headline,
    body: Array.isArray(variantCopy?.body) && variantCopy.body.length
      ? variantCopy.body
      : Array.isArray(data.lines) && data.lines.length
        ? data.lines
        : DEFAULT_ENDING.body,
    reflection: variantCopy?.reflection || data.reflection || DEFAULT_ENDING.reflection,
  };
}

export class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');

    this.transitioning = false;
    this.particles = [];
  }

  create(data = {}) {
    this.gameState = resolveGameState(this, data);
    this.endingCopy = resolveEndingCopy(data);

    this.buildAtmosphere();
    this.buildCopy();
    this.buildButtons();
    this.layout(this.scale.width, this.scale.height);
    this.bindInput();
    this.startHopeMusic();

    this.cameras.main.fadeIn(520, 4, 10, 16);

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', this.handleShutdown, this);
  }

  buildAtmosphere() {
    const { width, height } = this.scale;

    this.background = this.add.rectangle(0, 0, width, height, 0x081016).setOrigin(0);
    this.skyGlow = this.add.ellipse(width * 0.72, height * 0.24, width * 0.58, height * 0.34, 0x4f7588, 0.28);
    this.fieldGlow = this.add.ellipse(width * 0.34, height * 0.84, width * 0.8, height * 0.24, 0x4b7f66, 0.22);
    this.fieldBandBack = this.add.rectangle(width / 2, height * 0.8, width * 0.9, height * 0.08, 0x3f6a54, 0.18);
    this.fieldBandFront = this.add.rectangle(width / 2, height * 0.86, width * 0.84, height * 0.1, 0x6f935e, 0.22);
    this.waterGlow = this.add.ellipse(width * 0.54, height * 0.78, width * 0.5, height * 0.08, 0x8fd8e5, 0.16);
    this.waterLine = this.add.rectangle(width / 2, height * 0.78, width * 0.72, 4, 0x79c0d0, 0.32);
    this.riseGlow = this.add.ellipse(width * 0.22, height * 0.22, width * 0.4, height * 0.2, 0xece6c2, 0.08);

    for (let index = 0; index < 10; index += 1) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(Math.floor(height * 0.08), height),
        Phaser.Math.Between(2, 4),
        index % 2 === 0 ? 0xdcc68b : 0x9ed6d5,
        0.16,
      );

      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-24, 24),
        y: particle.y - Phaser.Math.Between(18, 42),
        alpha: { from: 0.06, to: 0.24 },
        duration: Phaser.Math.Between(2600, 4200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.particles.push(particle);
    }

    this.tweens.add({
      targets: [this.waterLine, this.waterGlow],
      alpha: { from: 0.18, to: 0.4 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: [this.skyGlow, this.fieldGlow, this.riseGlow],
      scaleX: 1.03,
      scaleY: 1.04,
      duration: 3800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  buildCopy() {
    this.titleText = this.add.text(0, 0, this.endingCopy.headline, {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#f6ecd1',
      align: 'center',
    });
    this.titleText.setOrigin(0.5);

    this.bodyText = this.add.text(0, 0, this.endingCopy.body.join('\n'), {
      fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
      fontSize: '22px',
      color: '#dce8ef',
      align: 'center',
      lineSpacing: 12,
      wordWrap: { width: 820, useAdvancedWrap: true },
    });
    this.bodyText.setOrigin(0.5);

    this.reflectionLabel = this.add.text(0, 0, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#d8c792',
      align: 'center',
    });
    this.reflectionLabel.setOrigin(0.5);
    this.reflectionLabel.setVisible(false);

    this.reflectionText = this.add.text(0, 0, this.endingCopy.reflection, {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '18px',
      color: '#f3e8c6',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: 760, useAdvancedWrap: true },
    });
    this.reflectionText.setOrigin(0.5);

    this.shortcutText = this.add.text(0, 0, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#d4dde4',
      align: 'center',
    });
    this.shortcutText.setOrigin(0.5);
    this.shortcutText.setVisible(false);
  }

  buildButtons() {
    this.playAgainButton = createButton(this, 'Play Again', {
      onClick: () => this.beginTransition('replay'),
    });

    this.menuButton = createButton(this, 'Back to Menu', {
      fillColor: 0x284050,
      hoverColor: 0x325369,
      textColor: '#eef5f7',
      onClick: () => this.beginTransition('menu'),
    });
  }

  startHopeMusic() {
    playOptionalMusic(this, 'bgm-hope', { volume: 0.34 });
  }

  layout(width, height) {
    const compact = width < 760;
    const buttonWidth = Math.min(compact ? width - 58 : 248, 260);

    this.background.setSize(width, height);
    this.skyGlow.setPosition(width * 0.72, height * 0.24);
    this.skyGlow.setSize(width * 0.58, height * 0.34);
    this.fieldGlow.setPosition(width * 0.34, height * 0.84);
    this.fieldGlow.setSize(width * 0.8, height * 0.24);
    this.fieldBandBack.setPosition(width / 2, height * 0.8);
    this.fieldBandBack.setSize(width * 0.9, height * 0.08);
    this.fieldBandFront.setPosition(width / 2, height * 0.86);
    this.fieldBandFront.setSize(width * 0.84, height * 0.1);
    this.waterGlow.setPosition(width * 0.54, height * 0.78);
    this.waterGlow.setSize(width * 0.5, height * 0.08);
    this.waterLine.setPosition(width / 2, height * 0.78);
    this.waterLine.setSize(width * 0.72, 4);
    this.riseGlow.setPosition(width * 0.22, height * 0.22);
    this.riseGlow.setSize(width * 0.4, height * 0.2);

    this.titleText.setFontSize(compact ? 34 : 42);
    this.titleText.setPosition(width / 2, height * 0.18);
    this.bodyText.setFontSize(compact ? 19 : 22);
    this.bodyText.setPosition(width / 2, height * 0.42);
    this.bodyText.setWordWrapWidth(Math.min(820, width - 60), true);
    this.reflectionLabel.setPosition(width / 2, height * 0.64);
    this.reflectionText.setFontSize(compact ? 17 : 18);
    this.reflectionText.setPosition(width / 2, height * 0.68);
    this.reflectionText.setWordWrapWidth(Math.min(760, width - 74), true);

    this.playAgainButton.resize(buttonWidth);
    this.menuButton.resize(buttonWidth);

    if (compact) {
      this.playAgainButton.setPosition(width / 2, height * 0.86);
      this.menuButton.setPosition(width / 2, height * 0.93);
      this.shortcutText.setPosition(width / 2, height * 0.985);
      this.shortcutText.setVisible(false);
    } else {
      this.playAgainButton.setPosition(width / 2 - 138, height * 0.86);
      this.menuButton.setPosition(width / 2 + 138, height * 0.86);
      this.shortcutText.setPosition(width / 2, height * 0.94);
      this.shortcutText.setVisible(true);
    }
  }

  bindInput() {
    this.keyHandler = (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        this.beginTransition('replay');
        return;
      }

      if (event.code === 'Escape' || event.code === 'KeyM') {
        this.beginTransition('menu');
      }
    };

    this.input.keyboard.on('keydown', this.keyHandler);
  }

  beginTransition(mode) {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    playOptionalSound(this, 'sfx-confirm', { volume: 0.55 });
    this.cameras.main.fadeOut(420, 4, 8, 12);

    globalThis.setTimeout(() => {
      const gameState = resolveGameState(this, { gameState: this.gameState });
      const sceneManager = this.game.scene;

      resetRunState(this, gameState);

      ['UIScene', 'GameScene'].forEach((sceneKey) => {
        if (sceneManager.isActive(sceneKey) || sceneManager.isPaused(sceneKey)) {
          sceneManager.stop(sceneKey);
        }
      });

      if (mode === 'replay') {
        sceneManager.start('GameScene', { gameState });
        sceneManager.start('UIScene', { gameState });
        sceneManager.bringToTop('UIScene');
        if (sceneManager.isActive('EndScene') || sceneManager.isPaused('EndScene')) {
          sceneManager.stop('EndScene');
        }
        return;
      }

      sceneManager.start('MenuScene', { gameState });
      if (sceneManager.isActive('EndScene') || sceneManager.isPaused('EndScene')) {
        sceneManager.stop('EndScene');
      }
    }, 440);
  }

  handleResize(gameSize) {
    this.layout(gameSize.width, gameSize.height);
  }

  handleShutdown() {
    this.scale.off('resize', this.handleResize, this);
    this.input.keyboard.off('keydown', this.keyHandler);

    if (this.playAgainButton) {
      this.playAgainButton.destroy();
    }

    if (this.menuButton) {
      this.menuButton.destroy();
    }
  }
}

export default EndScene;
