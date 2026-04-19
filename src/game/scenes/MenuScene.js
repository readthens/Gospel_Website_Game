import Phaser from 'phaser';
import { playOptionalMusic, playOptionalSound } from '../utils/audio';

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

function collectEmitters(value) {
  const emitters = [value, value?.events, value?.emitter, value?.eventEmitter].filter(isEmitter);
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
  safeCall(gameState, ['resetRun', 'resetForNewRun', 'resetSession', 'reset']);

  const dialogueSystem = scene.registry.get('dialogueSystem') || scene.game.dialogueSystem || null;
  const taskSystem = scene.registry.get('taskSystem') || scene.game.taskSystem || null;

  safeCall(dialogueSystem, ['reset', 'clear', 'stopAll']);
  safeCall(taskSystem, ['reset', 'clear']);

  const eventTargets = [gameState, dialogueSystem, taskSystem, scene.game.events];

  eventTargets.forEach((target) => {
    collectEmitters(target).forEach((emitter) => {
      emitter.emit('run:reset');
      emitter.emit('ui:reset');
      emitter.emit('dialogue:hide');
      emitter.emit('interaction:clear');
      emitter.emit('narration:hide');
    });
  });
}

function createButton(scene, label, options = {}) {
  const width = options.width || 268;
  const height = options.height || 56;
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
    fontSize: '20px',
    fontStyle: 'bold',
    color: textColor,
    align: 'center',
  });
  text.setOrigin(0.5);

  const container = scene.add.container(0, 0, [shadow, backdrop, text]);
  container.setDepth(options.depth || 20);

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
    backdrop,
    text,
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

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');

    this.hasStarted = false;
    this.particles = [];
  }

  create(data = {}) {
    this.gameState = resolveGameState(this, data);
    this.cameras.main.fadeIn(420, 7, 15, 22);

    this.buildAtmosphere();
    this.buildCopy();
    this.buildButtons();
    this.layout(this.scale.width, this.scale.height);
    this.bindInput();
    this.startTitleMusic();

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', this.handleShutdown, this);
  }

  buildAtmosphere() {
    const { width, height } = this.scale;

    this.background = this.add.rectangle(0, 0, width, height, 0x111a1f).setOrigin(0);
    this.skyGlow = this.add.ellipse(width * 0.24, height * 0.34, width * 0.76, height * 0.82, 0x2b4656, 0.34);
    this.dryGlow = this.add.ellipse(width * 0.72, height * 0.74, width * 0.64, height * 0.3, 0x5a4128, 0.22);
    this.fieldBand = this.add.rectangle(width / 2, height * 0.83, width * 0.94, height * 0.14, 0x2f2218, 0.78);
    this.waterHint = this.add.rectangle(width * 0.74, height * 0.8, width * 0.28, 6, 0x6aa3b5, 0.18);
    this.hopeBand = this.add.ellipse(width * 0.74, height * 0.78, width * 0.34, height * 0.12, 0x9fcf9e, 0.12);

    this.horizonLines = [];
    for (let index = 0; index < 4; index += 1) {
      const line = this.add.rectangle(width / 2, height * (0.68 + index * 0.045), width * (0.58 + index * 0.09), 2, 0x8b704d, 0.22);
      this.horizonLines.push(line);
    }

    for (let index = 0; index < 12; index += 1) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 4),
        index % 3 === 0 ? 0xd7c07b : 0x89a8a5,
        0.18,
      );

      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-40, 40),
        y: particle.y + Phaser.Math.Between(-22, 22),
        alpha: { from: 0.08, to: 0.22 },
        duration: Phaser.Math.Between(2600, 4600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.particles.push(particle);
    }

    this.tweens.add({
      targets: this.skyGlow,
      scaleX: 1.03,
      scaleY: 1.04,
      alpha: { from: 0.28, to: 0.38 },
      duration: 4200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: [this.waterHint, this.hopeBand],
      alpha: { from: 0.08, to: 0.24 },
      y: '+=4',
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  buildCopy() {
    this.titleText = this.add.text(0, 0, "When the Water Doesn't Come", {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '46px',
      fontStyle: 'bold',
      color: '#f6ecd1',
      align: 'center',
    });
    this.titleText.setOrigin(0.5);

    this.subtitleText = this.add.text(
      0,
      0,
      'A short Gospel-shaped story about Filipino farmers, broken irrigation, and the choice to respond.',
      {
        fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
        fontSize: '22px',
        color: '#d9e7ef',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 760, useAdvancedWrap: true },
      },
    );
    this.subtitleText.setOrigin(0.5);

    this.aboutPanel = this.add.rectangle(0, 0, 760, 148, 0x0f2230, 0.9);
    this.aboutPanel.setStrokeStyle(2, 0xd7c07b, 0.75);

    this.aboutText = this.add.text(
      0,
      0,
      'Walk through a village still waiting on water.\nSee how a broken canal becomes hunger, debt, and fear at home.\nThen choose how to answer: by listening, naming the truth, and helping where you can.',
      {
        fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
        fontSize: '18px',
        color: '#edf5fa',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: 690, useAdvancedWrap: true },
      },
    );
    this.aboutText.setOrigin(0.5);

    this.controlsText = this.add.text(
      0,
      0,
      '',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#d7c07b',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: 690, useAdvancedWrap: true },
      },
    );
    this.controlsText.setOrigin(0.5);
    this.controlsText.setVisible(false);

    this.startHint = this.add.text(0, 0, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '15px',
      color: '#d6e4ec',
      align: 'center',
    });
    this.startHint.setOrigin(0.5);
    this.startHint.setVisible(false);
  }

  buildButtons() {
    this.startButton = createButton(this, 'Begin', {
      onClick: () => this.startGame(),
    });

    this.startButtonTween = this.tweens.add({
      targets: this.startButton.container,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.startHintTween = this.tweens.add({
      targets: this.startHint,
      alpha: { from: 0.56, to: 1 },
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  layout(width, height) {
    const compact = width < 760;
    const panelWidth = Math.min(compact ? width - 22 : 760, width - 24);
    const buttonWidth = Math.min(compact ? width - 80 : 280, 320);

    this.background.setSize(width, height);
    this.skyGlow.setPosition(width * 0.24, height * 0.34);
    this.skyGlow.setSize(width * 0.76, height * 0.82);
    this.dryGlow.setPosition(width * 0.72, height * 0.74);
    this.dryGlow.setSize(width * 0.64, height * 0.3);
    this.fieldBand.setPosition(width / 2, height * 0.83);
    this.fieldBand.setSize(width * 0.94, height * 0.14);
    this.waterHint.setPosition(width * 0.74, height * 0.8);
    this.waterHint.setSize(width * 0.28, 6);
    this.hopeBand.setPosition(width * 0.74, height * 0.78);
    this.hopeBand.setSize(width * 0.34, height * 0.12);

    this.horizonLines.forEach((line, index) => {
      line.setPosition(width / 2, height * (0.68 + index * 0.045));
      line.setSize(width * (0.58 + index * 0.09), 2);
    });

    this.titleText.setFontSize(compact ? 36 : 46);
    this.titleText.setPosition(width / 2, height * 0.18);
    this.subtitleText.setFontSize(compact ? 18 : 22);
    this.subtitleText.setPosition(width / 2, height * 0.33);
    this.subtitleText.setWordWrapWidth(Math.min(panelWidth - 38, 760), true);

    this.aboutPanel.setPosition(width / 2, height * 0.55);
    this.aboutPanel.setSize(panelWidth, compact ? 170 : 148);
    this.aboutText.setPosition(width / 2, height * 0.52);
    this.aboutText.setWordWrapWidth(panelWidth - 54, true);
    this.controlsText.setPosition(width / 2, height * (compact ? 0.61 : 0.63));
    this.controlsText.setWordWrapWidth(panelWidth - 58, true);

    this.startButton.resize(buttonWidth);
    this.startButton.setPosition(width / 2, height * (compact ? 0.74 : 0.75));
    this.startHint.setPosition(width / 2, height * (compact ? 0.84 : 0.85));
  }

  bindInput() {
    this.firstInteractionHandler = () => {
      this.startTitleMusic();
    };
    this.startHandler = () => this.startGame();
    this.keyHandler = (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        this.startGame();
      }
    };

    this.input.once('pointerdown', this.firstInteractionHandler);
    this.input.keyboard.once('keydown', this.firstInteractionHandler);
    this.input.keyboard.on('keydown', this.keyHandler);
  }

  startTitleMusic() {
    playOptionalMusic(this, 'bgm-title', { volume: 0.32 });
  }

  startGame() {
    if (this.hasStarted) {
      return;
    }

    this.hasStarted = true;
    playOptionalSound(this, 'sfx-confirm', { volume: 0.55 });
    const gameState = resolveGameState(this, { gameState: this.gameState });
    const sceneManager = this.game.scene;

    resetRunState(this, gameState);

    this.cameras.main.fadeOut(450, 8, 12, 16);

    this.time.delayedCall(470, () => {
      ['MenuScene', 'EndScene', 'UIScene', 'GameScene'].forEach((sceneKey) => {
        if (sceneManager.isActive(sceneKey) || sceneManager.isPaused(sceneKey)) {
          sceneManager.stop(sceneKey);
        }
      });

      sceneManager.start('GameScene', { gameState });
      sceneManager.start('UIScene', { gameState });
      sceneManager.bringToTop('UIScene');
    });
  }

  handleResize(gameSize) {
    this.layout(gameSize.width, gameSize.height);
  }

  handleShutdown() {
    this.scale.off('resize', this.handleResize, this);
    this.input.keyboard.off('keydown', this.keyHandler);
    this.input.off('pointerdown', this.firstInteractionHandler, this);
    this.input.keyboard.off('keydown', this.firstInteractionHandler, this);

    if (this.startButtonTween) {
      this.startButtonTween.stop();
    }

    if (this.startHintTween) {
      this.startHintTween.stop();
    }

    if (this.startButton) {
      this.startButton.destroy();
    }
  }
}

export default MenuScene;
