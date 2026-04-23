import Phaser from 'phaser';

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 188;
const AVERAGE_READING_CHARS_PER_SECOND = 18;
const TYPEWRITER_CHAR_DELAY_MS = 1000 / AVERAGE_READING_CHARS_PER_SECOND;
const TYPEWRITER_INITIAL_DELAY_MS = 90;
const TYPING_INDICATOR_INTERVAL_MS = 280;
const PUNCTUATION_PAUSES_MS = Object.freeze({
  '.': 150,
  ',': 85,
  '?': 180,
  '!': 180,
  ';': 110,
  ':': 110,
  '\n': 120,
});

function getDialogueSignature(dialogue = {}) {
  return [
    dialogue.speaker || dialogue.name || '',
    dialogue.body || dialogue.text || '',
    dialogue.continueText || dialogue.promptText || '',
    dialogue.lineIndex || 0,
    dialogue.totalLines || 0,
    dialogue.showContinue === false ? 'hide' : 'show',
  ].join('::');
}

function getTypewriterDelay(character) {
  return TYPEWRITER_CHAR_DELAY_MS + (PUNCTUATION_PAUSES_MS[character] || 0);
}

export default class DialogueBox extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, config = {}) {
    super(scene, x, y);

    this.scene = scene;
    this.panelWidth = width;
    this.panelHeight = height;
    this.promptTween = null;
    this.currentSignature = null;
    this.fullBodyText = '';
    this.typewriterCharacters = [];
    this.typewriterIndex = 0;
    this.typewriterTimer = null;
    this.typingIndicatorTimer = null;
    this.typingIndicatorStep = 0;
    this.typing = false;
    this.pendingPrompt = 'Continue  ENTER / SPACE';
    this.pendingShowContinue = true;

    this.shadow = scene.add.rectangle(0, 6, width, height, 0x04070a, 0.28);
    this.shadow.setOrigin(0.5);

    this.backdrop = scene.add.rectangle(0, 0, width, height, config.fillColor || 0x0d1b24, 0.94);
    this.backdrop.setOrigin(0.5);
    this.backdrop.setStrokeStyle(2, config.strokeColor || 0xd7c07b, 0.82);

    this.topBand = scene.add.rectangle(0, -height / 2 + 22, width - 20, 30, config.bandColor || 0x142734, 0.95);
    this.topBand.setOrigin(0.5);

    this.accent = scene.add.rectangle(-width / 2 + 16, 0, 10, height - 18, config.accentColor || 0xd7c07b, 0.98);
    this.accent.setOrigin(0.5);

    this.namePlate = scene.add.rectangle(-width / 2 + 126, -height / 2 + 22, 212, 30, config.plateColor || 0x274052, 0.98);
    this.namePlate.setOrigin(0.5);
    this.namePlate.setStrokeStyle(1, 0xffffff, 0.12);

    this.nameText = scene.add.text(-width / 2 + 28, -height / 2 + 9, '', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f4e8c8',
      align: 'left',
    });

    this.counterText = scene.add.text(width / 2 - 26, -height / 2 + 8, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#d8c792',
      align: 'right',
    });
    this.counterText.setOrigin(1, 0);

    this.bodyText = scene.add.text(-width / 2 + 32, -height / 2 + 52, '', {
      fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
      fontSize: '22px',
      color: '#f3f7fa',
      lineSpacing: 8,
      wordWrap: { width: width - 96, useAdvancedWrap: true },
      align: 'left',
    });

    this.promptText = scene.add.text(width / 2 - 28, height / 2 - 24, 'Continue  ENTER / SPACE', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#ead89e',
      align: 'right',
    });
    this.promptText.setOrigin(1, 0.5);

    this.promptCaret = scene.add.text(width / 2 - 12, height / 2 - 24, '>', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#f4e6ba',
    });
    this.promptCaret.setOrigin(1, 0.5);

    this.add([
      this.shadow,
      this.backdrop,
      this.topBand,
      this.accent,
      this.namePlate,
      this.nameText,
      this.counterText,
      this.bodyText,
      this.promptText,
      this.promptCaret,
    ]);

    this.setSize(width, height);
    this.setScrollFactor(0);
    this.setDepth(config.depth || 30);
    this.setVisible(false);
    this.setAlpha(0);

    scene.add.existing(this);
    this.applyResponsiveLayout();
    this.updatePromptTween();
  }

  applyResponsiveLayout() {
    const compact = this.panelWidth < 700;
    const titleY = compact ? -this.panelHeight / 2 + 8 : -this.panelHeight / 2 + 9;
    const bodyY = compact
      ? -this.panelHeight / 2 + (this.nameText.visible ? 48 : 34)
      : -this.panelHeight / 2 + (this.nameText.visible ? 52 : 34);

    this.topBand.setPosition(0, -this.panelHeight / 2 + 22);
    this.topBand.setSize(this.panelWidth - 20, 30);
    this.accent.setPosition(-this.panelWidth / 2 + 16, 0);
    this.accent.setSize(10, this.panelHeight - 18);
    this.namePlate.setPosition(-this.panelWidth / 2 + (compact ? 112 : 126), -this.panelHeight / 2 + 22);
    this.namePlate.setSize(compact ? 184 : 212, 30);
    this.nameText.setPosition(-this.panelWidth / 2 + 28, titleY);
    this.counterText.setPosition(this.panelWidth / 2 - 24, -this.panelHeight / 2 + 8);
    this.bodyText.setPosition(-this.panelWidth / 2 + 32, bodyY);
    this.bodyText.setFontSize(compact ? 19 : 22);
    this.bodyText.setWordWrapWidth(this.panelWidth - (compact ? 76 : 96), true);
    this.promptText.setPosition(this.panelWidth / 2 - 30, this.panelHeight / 2 - 24);
    this.promptText.setFontSize(compact ? 12 : 13);
    this.promptCaret.setPosition(this.panelWidth / 2 - 14, this.panelHeight / 2 - 24);
  }

  updatePromptTween() {
    if (this.promptTween) {
      this.promptTween.stop();
    }

    this.promptCaret.setAlpha(0.55);
    this.promptTween = this.scene.tweens.add({
      targets: [this.promptText, this.promptCaret],
      alpha: { from: 0.42, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  resize(width = this.panelWidth, height = this.panelHeight) {
    this.panelWidth = width;
    this.panelHeight = height;

    this.shadow.setSize(width, height);
    this.backdrop.setSize(width, height);
    this.applyResponsiveLayout();
    this.setSize(width, height);

    return this;
  }

  setDialogue(dialogue = {}, { restartTypewriter = true } = {}) {
    const speaker = dialogue.speaker || dialogue.name || '';
    const body = dialogue.body || dialogue.text || '';
    const prompt = dialogue.continueText || dialogue.promptText || 'Continue  ENTER / SPACE';
    const showContinue = dialogue.showContinue !== false;
    const lineIndex = Number.isFinite(dialogue.lineIndex) ? dialogue.lineIndex : null;
    const totalLines = Number.isFinite(dialogue.totalLines) ? dialogue.totalLines : null;

    this.currentSignature = getDialogueSignature(dialogue);

    this.nameText.setText(speaker);
    this.namePlate.setVisible(Boolean(speaker));
    this.nameText.setVisible(Boolean(speaker));

    if (restartTypewriter) {
      this.startTypewriter(body, prompt, showContinue);
    }

    if (lineIndex !== null && totalLines) {
      this.counterText.setVisible(true);
      this.counterText.setText(`${lineIndex + 1} / ${totalLines}`);
    } else {
      this.counterText.setVisible(false);
      this.counterText.setText('');
    }

    this.applyResponsiveLayout();
    return this;
  }

  show(dialogue = {}, instant = false) {
    const nextSignature = getDialogueSignature(dialogue);
    const wasVisible = this.visible;
    const previousSignature = this.currentSignature;
    const sameSignature = wasVisible && previousSignature === nextSignature;

    this.setDialogue(dialogue, { restartTypewriter: !sameSignature });
    this.setVisible(true);

    this.scene.tweens.killTweensOf(this);

    if (instant || sameSignature) {
      this.setAlpha(1);
      return this;
    }

    if (!wasVisible) {
      this.setAlpha(0);
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: wasVisible ? 120 : 180,
      ease: 'Quad.easeOut',
    });

    return this;
  }

  hide(instant = false) {
    this.stopTypewriter();
    this.scene.tweens.killTweensOf(this);

    if (instant) {
      this.setAlpha(0);
      this.setVisible(false);
      this.currentSignature = null;
      return this;
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 150,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
        this.currentSignature = null;
      },
    });

    return this;
  }

  startTypewriter(body = '', prompt = 'Continue  ENTER / SPACE', showContinue = true) {
    this.stopTypewriter();

    this.fullBodyText = body;
    this.typewriterCharacters = Array.from(body);
    this.typewriterIndex = 0;
    this.pendingPrompt = prompt;
    this.pendingShowContinue = showContinue;

    if (!this.typewriterCharacters.length) {
      this.bodyText.setText('');
      this.finishTypewriter();
      return;
    }

    this.typing = true;
    this.bodyText.setText('');
    this.showTypingIndicator();
    this.scheduleTypewriterTick(TYPEWRITER_INITIAL_DELAY_MS);
  }

  scheduleTypewriterTick(delay = TYPEWRITER_CHAR_DELAY_MS) {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove(false);
    }

    this.typewriterTimer = this.scene.time.delayedCall(delay, () => {
      this.typewriterTimer = null;
      this.advanceTypewriter();
    });
  }

  advanceTypewriter() {
    if (!this.typing) {
      return;
    }

    if (this.typewriterIndex >= this.typewriterCharacters.length) {
      this.finishTypewriter();
      return;
    }

    const nextCharacter = this.typewriterCharacters[this.typewriterIndex];
    this.typewriterIndex += 1;
    this.bodyText.setText(this.typewriterCharacters.slice(0, this.typewriterIndex).join(''));

    if (this.typewriterIndex >= this.typewriterCharacters.length) {
      this.finishTypewriter();
      return;
    }

    this.scheduleTypewriterTick(getTypewriterDelay(nextCharacter));
  }

  showTypingIndicator() {
    this.stopTypingIndicator();
    this.typingIndicatorStep = 0;
    this.promptText.setVisible(true);
    this.promptCaret.setVisible(false);
    this.promptText.setText('Typing');

    this.typingIndicatorTimer = this.scene.time.addEvent({
      delay: TYPING_INDICATOR_INTERVAL_MS,
      loop: true,
      callback: () => {
        const dots = '.'.repeat((this.typingIndicatorStep % 3) + 1);
        this.typingIndicatorStep += 1;
        this.promptText.setText(`Typing${dots}`);
      },
    });
  }

  finishTypewriter() {
    this.typing = false;
    this.bodyText.setText(this.fullBodyText);
    this.stopTypingIndicator();
    this.promptText.setText(this.pendingPrompt);
    this.promptText.setVisible(this.pendingShowContinue);
    this.promptCaret.setText('>');
    this.promptCaret.setVisible(this.pendingShowContinue);
  }

  stopTypingIndicator() {
    if (this.typingIndicatorTimer) {
      this.typingIndicatorTimer.remove(false);
      this.typingIndicatorTimer = null;
    }
  }

  stopTypewriter() {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove(false);
      this.typewriterTimer = null;
    }

    this.stopTypingIndicator();
    this.typing = false;
  }

  isTyping() {
    return this.typing;
  }

  isReadyToAdvance() {
    return this.visible && !this.isTyping();
  }

  destroy(fromScene) {
    this.stopTypewriter();

    if (this.promptTween) {
      this.promptTween.stop();
      this.promptTween = null;
    }

    super.destroy(fromScene);
  }
}
