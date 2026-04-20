import Phaser from 'phaser';

const OPTION_COUNT = 4;

export default class ChallengeBox extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width = 680, height = 344) {
    super(scene, x, y);

    this.scene = scene;
    this.boxWidth = width;
    this.boxHeight = height;
    this.minBoxHeight = Math.max(344, Math.min(height, 380));
    this.maxBoxHeight = height;
    this.choiceHandler = null;
    this.optionRows = [];
    this.currentSnapshot = null;

    this.shadow = scene.add.rectangle(0, 8, width, height, 0x020508, 0.38);
    this.shadow.setOrigin(0.5);

    this.backdrop = scene.add.rectangle(0, 0, width, height, 0x102430, 0.98);
    this.backdrop.setOrigin(0.5);
    this.backdrop.setStrokeStyle(2, 0xd7c07b, 0.88);

    this.headerBand = scene.add.rectangle(0, -height * 0.5 + 24, width - 8, 42, 0x22394a, 0.96);
    this.headerBand.setOrigin(0.5);

    this.titleText = scene.add.text(-width * 0.5 + 28, -height * 0.5 + 8, '', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f4e8c9',
    });

    this.subtitleText = scene.add.text(-width * 0.5 + 28, -height * 0.5 + 52, '', {
      fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
      fontSize: '15px',
      color: '#dce8ef',
      wordWrap: { width: width - 56, useAdvancedWrap: true },
      lineSpacing: 4,
    });
    this.subtitleText.setOrigin(0, 0);

    this.progressText = scene.add.text(width * 0.5 - 28, -height * 0.5 + 10, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#f1ddaa',
      align: 'right',
    });
    this.progressText.setOrigin(1, 0);

    this.promptText = scene.add.text(-width * 0.5 + 28, -height * 0.5 + 112, '', {
      fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
      fontSize: '21px',
      color: '#f7f2dd',
      wordWrap: { width: width - 56, useAdvancedWrap: true },
      lineSpacing: 8,
    });
    this.promptText.setOrigin(0, 0);

    this.instructionsText = scene.add.text(-width * 0.5 + 28, height * 0.5 - 42, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#d8c792',
      wordWrap: { width: width - 56, useAdvancedWrap: true },
    });
    this.instructionsText.setOrigin(0, 0);

    this.meterTrack = scene.add.rectangle(0, 54, width - 96, 26, 0x08131b, 0.96);
    this.meterTrack.setOrigin(0.5);
    this.meterTrack.setStrokeStyle(1, 0xa3bbcb, 0.55);

    this.meterFill = scene.add.rectangle(-((width - 96) * 0.5), 54, 0, 20, 0x9fcf88, 1);
    this.meterFill.setOrigin(0, 0.5);

    this.meterLabel = scene.add.text(0, 54, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#f1ebcf',
      align: 'center',
    });
    this.meterLabel.setOrigin(0.5);

    for (let index = 0; index < OPTION_COUNT; index += 1) {
      const y = -8 + index * 48;
      const rowBackdrop = scene.add.rectangle(0, y, width - 72, 40, 0x162b37, 0.92);
      rowBackdrop.setOrigin(0.5);
      rowBackdrop.setStrokeStyle(1, 0xffffff, 0.06);
      rowBackdrop.setInteractive({ useHandCursor: true });

      const rowMarker = scene.add.text(-width * 0.5 + 30, y, '>', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#102430',
      });
      rowMarker.setOrigin(0.5);

      const rowMarkerBackdrop = scene.add.rectangle(-width * 0.5 + 30, y, 22, 22, 0x627b8c, 1);
      rowMarkerBackdrop.setOrigin(0.5);

      const rowText = scene.add.text(-width * 0.5 + 52, y, '', {
        fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
        fontSize: '16px',
        color: '#dce8ef',
        wordWrap: { width: width - 124, useAdvancedWrap: true },
        lineSpacing: 3,
      });
      rowText.setOrigin(0, 0.5);

      rowBackdrop.on('pointerdown', () => {
        this.choiceHandler?.(index);
      });

      this.optionRows.push({
        rowBackdrop,
        rowMarkerBackdrop,
        rowMarker,
        rowText,
      });
    }

    this.add([
      this.shadow,
      this.backdrop,
      this.headerBand,
      this.titleText,
      this.subtitleText,
      this.progressText,
      this.promptText,
      this.meterTrack,
      this.meterFill,
      this.meterLabel,
      this.instructionsText,
      ...this.optionRows.flatMap((row) => [
        row.rowBackdrop,
        row.rowMarkerBackdrop,
        row.rowMarker,
        row.rowText,
      ]),
    ]);

    this.setDepth(31);
    this.setScrollFactor(0);
    this.setVisible(false);
    this.setAlpha(0);

    this.layout();
    scene.add.existing(this);
  }

  resize(width = this.boxWidth, height = this.maxBoxHeight) {
    this.boxWidth = width;
    this.maxBoxHeight = height;
    this.boxHeight = Phaser.Math.Clamp(this.boxHeight, this.minBoxHeight, this.maxBoxHeight);
    this.layout();

    if (this.currentSnapshot?.active) {
      this.setChallenge(this.currentSnapshot);
    }

    return this;
  }

  setChoiceHandler(handler) {
    this.choiceHandler = handler;
    return this;
  }

  show(snapshot) {
    this.setChallenge(snapshot);

    if (!this.visible || this.alpha < 0.98) {
      this.setVisible(true);
      this.scene.tweens.killTweensOf(this);
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        duration: 140,
        ease: 'Quad.easeOut',
      });
    }
    return this;
  }

  hide(instant = false) {
    if (instant) {
      this.setAlpha(0);
      this.setVisible(false);
      return this;
    }

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.setVisible(false);
      },
    });

    return this;
  }

  setChallenge(snapshot) {
    if (!snapshot?.active) {
      this.hide(true);
      return this;
    }

    this.currentSnapshot = snapshot;
    const round = snapshot.round || {};
    const isActionMeter = snapshot.type === 'actionMeter';
    const meterWidth = this.boxWidth - 96;
    const progress = snapshot.meterGoal
      ? Phaser.Math.Clamp(snapshot.meterProgress / snapshot.meterGoal, 0, 1)
      : 0;

    this.titleText.setText(snapshot.title || '');
    this.subtitleText.setText(snapshot.subtitle || '');
    this.progressText.setText(`${Math.max(0, snapshot.roundIndex + 1)} / ${snapshot.roundCount || 1}`);
    this.promptText.setText(round.prompt || '');
    this.instructionsText.setText(snapshot.instructions || round.instructions || '');

    this.optionRows.forEach((row, index) => {
      const option = round.options?.[index];
      const selected = index === snapshot.selectedIndex;

      row.rowBackdrop.setVisible(!isActionMeter && Boolean(option));
      row.rowMarkerBackdrop.setVisible(!isActionMeter && Boolean(option));
      row.rowMarker.setVisible(!isActionMeter && Boolean(option));
      row.rowText.setVisible(!isActionMeter && Boolean(option));

      if (!option) {
        return;
      }

      row.rowText.setText(option.text || '');
      row.rowBackdrop.setFillStyle(selected ? 0x2d4757 : 0x162b37, 0.94);
      row.rowBackdrop.setStrokeStyle(1, selected ? 0xd7c07b : 0xffffff, selected ? 0.72 : 0.06);
      row.rowMarkerBackdrop.setFillStyle(selected ? 0xd7c07b : 0x627b8c, 1);
      row.rowMarker.setColor(selected ? '#102430' : '#f0f4f6');
      row.rowText.setColor(selected ? '#f6ecd1' : '#dce8ef');
    });

    this.layout(isActionMeter);

    this.meterTrack.setVisible(isActionMeter);
    this.meterFill.setVisible(isActionMeter);
    this.meterLabel.setVisible(isActionMeter);

    if (isActionMeter) {
      this.meterFill.width = Math.max(0, (meterWidth - 6) * progress);
      this.meterLabel.setText(`${snapshot.meterProgress || 0} / ${snapshot.meterGoal || 0}    ${Math.ceil((snapshot.timeRemainingMs || 0) / 1000)}s`);
    }

    return this;
  }

  layout(isActionMeter = false) {
    const headerHeight = 42;
    const subtitleGap = 16;
    const promptGap = 18;
    const rowGap = 8;
    const instructionsGap = 18;
    const footerPad = 18;
    const leftPad = 28;
    const rowMarkerX = -this.boxWidth * 0.5 + 30;
    const rowTextX = -this.boxWidth * 0.5 + 52;
    const wrapWidth = this.boxWidth - 56;
    const rowWrapWidth = this.boxWidth - 124;

    this.subtitleText.setWordWrapWidth(wrapWidth, true);
    this.promptText.setWordWrapWidth(wrapWidth, true);
    this.instructionsText.setWordWrapWidth(wrapWidth, true);
    this.optionRows.forEach((row) => {
      row.rowText.setWordWrapWidth(rowWrapWidth, true);
    });

    let neededHeight = 84;
    neededHeight += this.subtitleText.height;
    neededHeight += subtitleGap;
    neededHeight += this.promptText.height;
    neededHeight += promptGap;

    if (isActionMeter) {
      neededHeight += 44;
    } else {
      const visibleRows = this.optionRows.filter((row) => row.rowBackdrop.visible);
      const rowHeights = visibleRows.map((row) => Math.max(40, row.rowText.height + 16));
      neededHeight += rowHeights.reduce((sum, height) => sum + height, 0);
      neededHeight += Math.max(0, visibleRows.length - 1) * rowGap;
    }

    neededHeight += instructionsGap;
    neededHeight += this.instructionsText.height;
    neededHeight += footerPad;

    this.boxHeight = Phaser.Math.Clamp(neededHeight, this.minBoxHeight, this.maxBoxHeight);

    const halfWidth = this.boxWidth * 0.5;
    const top = -this.boxHeight * 0.5;
    let cursorY = top + 8;

    this.shadow.setSize(this.boxWidth, this.boxHeight);
    this.backdrop.setSize(this.boxWidth, this.boxHeight);
    this.headerBand.setPosition(0, top + 24);
    this.headerBand.setSize(this.boxWidth - 8, headerHeight);
    this.titleText.setPosition(-halfWidth + leftPad, top + 8);
    this.progressText.setPosition(halfWidth - leftPad, top + 10);

    cursorY = top + 52;
    this.subtitleText.setPosition(-halfWidth + leftPad, cursorY);
    cursorY += this.subtitleText.height + subtitleGap;

    this.promptText.setPosition(-halfWidth + leftPad, cursorY);
    cursorY += this.promptText.height + promptGap;

    if (isActionMeter) {
      const meterY = cursorY + 13;
      this.meterTrack.setPosition(0, meterY);
      this.meterTrack.setSize(this.boxWidth - 96, 26);
      this.meterFill.setPosition(-((this.boxWidth - 96) * 0.5), meterY);
      this.meterLabel.setPosition(0, meterY);
      cursorY += 44;

      this.optionRows.forEach((row) => {
        row.rowBackdrop.setVisible(false);
        row.rowMarkerBackdrop.setVisible(false);
        row.rowMarker.setVisible(false);
        row.rowText.setVisible(false);
      });
    } else {
      this.optionRows.forEach((row) => {
        if (!row.rowBackdrop.visible) {
          return;
        }

        const rowHeight = Math.max(40, row.rowText.height + 16);
        const centerY = cursorY + rowHeight * 0.5;

        row.rowBackdrop.setPosition(0, centerY);
        row.rowBackdrop.setSize(this.boxWidth - 72, rowHeight);
        row.rowMarkerBackdrop.setPosition(rowMarkerX, centerY);
        row.rowMarker.setPosition(rowMarkerX, centerY);
        row.rowText.setPosition(rowTextX, centerY);

        cursorY += rowHeight + rowGap;
      });
    }

    this.instructionsText.setPosition(-halfWidth + leftPad, cursorY + instructionsGap);
    this.setSize(this.boxWidth, this.boxHeight);
  }
}
