import Phaser from 'phaser';

const DEFAULT_TASKS = [
  { id: 'listen', label: 'Listen', complete: false, status: 'locked' },
  { id: 'document', label: 'Record', complete: false, status: 'locked' },
  { id: 'repair', label: 'Repair', complete: false, status: 'locked' },
];

function getDefaultIconKey(taskId) {
  if (!taskId) {
    return null;
  }

  return `task-${taskId}`;
}

function normalizeStatus(task = {}) {
  if (task.complete || task.done || task.completed || task.isCompleted) {
    return 'completed';
  }

  return task.status || 'locked';
}

function normalizeTasks(tasks) {
  if (Array.isArray(tasks) && tasks.length) {
    return tasks.map((task, index) => ({
      id: task.id || DEFAULT_TASKS[index]?.id || `task-${index + 1}`,
      label: task.label || task.shortLabel || task.text || DEFAULT_TASKS[index]?.label || `Task ${index + 1}`,
      summary: task.summary || task.description || '',
      complete: Boolean(task.complete || task.done || task.completed || task.isCompleted || task.status === 'completed'),
      status: normalizeStatus(task),
      iconKey: task.iconKey || getDefaultIconKey(task.id || DEFAULT_TASKS[index]?.id),
    }));
  }

  if (tasks && typeof tasks === 'object') {
    return DEFAULT_TASKS.map((task) => {
      const value = tasks[task.id];

      if (value && typeof value === 'object') {
        return {
          id: task.id,
          label: value.label || value.shortLabel || value.text || task.label,
          summary: value.summary || value.description || '',
          complete: Boolean(
            value.complete
              || value.done
              || value.completed
              || value.isCompleted
              || value.status === 'completed'
          ),
          status: normalizeStatus(value),
          iconKey: value.iconKey || getDefaultIconKey(task.id),
        };
      }

      return {
        id: task.id,
        label: task.label,
        summary: '',
        complete: Boolean(value),
        status: value ? 'completed' : 'locked',
        iconKey: getDefaultIconKey(task.id),
      };
    });
  }

  return DEFAULT_TASKS.map((task) => ({
    ...task,
    iconKey: getDefaultIconKey(task.id),
  }));
}

function getStatusDisplay(task) {
  if (task.complete || task.status === 'completed') {
    return {
      label: 'DONE',
      fill: 0x335643,
      textColor: '#dff4d8',
      rowFill: 0x21382c,
      rowAlpha: 0.88,
      iconFill: 0xa9d48a,
      iconText: '#122117',
      bullet: 'x',
    };
  }

  if (task.status === 'available') {
    return {
      label: 'READY',
      fill: 0x5a4524,
      textColor: '#f5e3ab',
      rowFill: 0x2b3540,
      rowAlpha: 0.9,
      iconFill: 0xd7c07b,
      iconText: '#13202a',
      bullet: '>',
    };
  }

  return {
    label: 'LOCKED',
    fill: 0x283540,
    textColor: '#b7c4cf',
    rowFill: 0x16232d,
    rowAlpha: 0.72,
    iconFill: 0x4d6270,
    iconText: '#e6eef2',
    bullet: '-',
  };
}

export default class ObjectivePanel extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width = 340, config = {}) {
    super(scene, x, y);

    this.scene = scene;
    this.panelWidth = width;
    this.rows = [];
    this.tasks = normalizeTasks(config.tasks);

    this.backdrop = scene.add.rectangle(0, 0, width, 240, config.fillColor || 0x0d1b24, 0.9);
    this.backdrop.setOrigin(0, 0);
    this.backdrop.setStrokeStyle(2, config.strokeColor || 0xcfae67, 0.78);

    this.header = scene.add.text(18, 16, 'Current objective', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f0e0b7',
    });

    this.progressPill = scene.add.rectangle(width - 62, 24, 88, 26, 0x233746, 0.96);
    this.progressPill.setStrokeStyle(1, 0xffffff, 0.08);

    this.progressText = scene.add.text(width - 62, 24, '0 / 3', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#f5e7b6',
      align: 'center',
    });
    this.progressText.setOrigin(0.5);

    this.objectiveCard = scene.add.rectangle(18, 46, width - 36, 66, 0x152733, 0.96);
    this.objectiveCard.setOrigin(0, 0);
    this.objectiveCard.setStrokeStyle(1, 0xffffff, 0.08);

    this.objectiveText = scene.add.text(30, 58, config.objective || 'Walk into the waiting village.', {
      fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
      fontSize: '17px',
      color: '#edf5fa',
      lineSpacing: 6,
      wordWrap: { width: width - 60, useAdvancedWrap: true },
    });

    this.taskHeader = scene.add.text(18, 124, 'Community response', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: '#d5c28a',
    });

    this.add([
      this.backdrop,
      this.header,
      this.progressPill,
      this.progressText,
      this.objectiveCard,
      this.objectiveText,
      this.taskHeader,
    ]);

    this.buildRows();
    this.renderRows();
    this.relayout();

    this.setScrollFactor(0);
    this.setDepth(config.depth || 20);

    scene.add.existing(this);
  }

  buildRows() {
    this.rows.forEach((row) => row.container.destroy());
    this.rows = [];

    for (let index = 0; index < 3; index += 1) {
      const rowBackground = this.scene.add.rectangle(18, 0, this.panelWidth - 36, 42, 0x16232d, 0.72);
      rowBackground.setOrigin(0, 0);

      const iconBackdrop = this.scene.add.circle(34, 0, 11, 0x4d6270, 1);
      const checkMark = this.scene.add.text(34, 0, '-', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: '#edf5fa',
      });
      checkMark.setOrigin(0.5);

      const label = this.scene.add.text(54, 0, '', {
        fontFamily: '"Trebuchet MS", Helvetica, sans-serif',
        fontSize: '16px',
        color: '#dce8ef',
      });

      const statusPill = this.scene.add.rectangle(this.panelWidth - 74, 0, 66, 22, 0x283540, 0.98);
      statusPill.setOrigin(0.5);

      const statusText = this.scene.add.text(this.panelWidth - 74, 0, 'LOCKED', {
        fontFamily: '"Courier New", monospace',
        fontSize: '11px',
        color: '#b7c4cf',
      });
      statusText.setOrigin(0.5);

      const container = this.scene.add.container(0, 0, [
        rowBackground,
        iconBackdrop,
        checkMark,
        label,
        statusPill,
        statusText,
      ]);

      this.add(container);
      this.rows.push({
        container,
        rowBackground,
        iconBackdrop,
        checkMark,
        label,
        statusPill,
        statusText,
        sprite: null,
        id: null,
      });
    }
  }

  relayout() {
    const cardHeight = Math.max(66, this.objectiveText.height + 24);
    const taskStartY = 22 + 24 + cardHeight + 28;

    this.objectiveCard.setSize(this.panelWidth - 36, cardHeight);
    this.objectiveText.setWordWrapWidth(this.panelWidth - 60, true);
    this.taskHeader.setPosition(18, taskStartY - 18);

    this.rows.forEach((row, index) => {
      const rowY = taskStartY + index * 48;
      row.rowBackground.setPosition(18, rowY);
      row.rowBackground.setSize(this.panelWidth - 36, 42);
      row.iconBackdrop.setPosition(34, rowY + 21);
      row.checkMark.setPosition(34, rowY + 21);
      row.label.setPosition(54, rowY + 12);
      row.statusPill.setPosition(this.panelWidth - 62, rowY + 21);
      row.statusText.setPosition(this.panelWidth - 62, rowY + 21);

      if (row.sprite) {
        row.sprite.setPosition(34, rowY + 21);
      }
    });

    const panelHeight = taskStartY + this.rows.length * 48 + 14;
    this.backdrop.setSize(this.panelWidth, panelHeight);
    this.progressPill.setPosition(this.panelWidth - 62, 24);
    this.progressText.setPosition(this.panelWidth - 62, 24);
    this.setSize(this.panelWidth, panelHeight);
  }

  resize(width = this.panelWidth) {
    this.panelWidth = width;
    this.relayout();
    this.renderRows();
    return this;
  }

  setObjective(text) {
    this.objectiveText.setText(text || 'Walk into the waiting village.');
    this.relayout();
    return this;
  }

  setTaskStatus(id, complete, label) {
    const task = this.tasks.find((entry) => entry.id === id);

    if (task) {
      task.complete = Boolean(complete);
      task.status = task.complete ? 'completed' : task.status;

      if (label) {
        task.label = label;
      }
    }

    this.renderRows();
    return this;
  }

  setTasks(tasks) {
    this.tasks = normalizeTasks(tasks);
    this.renderRows();
    return this;
  }

  pulseTask(taskId) {
    const row = this.rows.find((entry) => entry.id === taskId);

    if (!row) {
      return this;
    }

    this.scene.tweens.killTweensOf([row.rowBackground, row.statusPill]);
    this.scene.tweens.add({
      targets: [row.rowBackground, row.statusPill],
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 120,
      yoyo: true,
      ease: 'Sine.easeOut',
    });

    return this;
  }

  pulseObjective() {
    this.scene.tweens.killTweensOf(this);
    this.setScale(1);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 120,
      yoyo: true,
      ease: 'Sine.easeOut',
    });

    return this;
  }

  renderRows() {
    const completedCount = this.tasks.filter((task) => task.complete || task.status === 'completed').length;
    this.progressText.setText(`${completedCount} / ${this.tasks.length}`);

    this.rows.forEach((row, index) => {
      const task = this.tasks[index] || {
        id: `task-${index + 1}`,
        label: `Task ${index + 1}`,
        complete: false,
        status: 'locked',
        iconKey: null,
      };

      const display = getStatusDisplay(task);
      row.id = task.id;
      row.label.setText(task.label);
      row.label.setColor(task.complete ? '#f5e7b6' : '#dce8ef');
      row.rowBackground.setFillStyle(display.rowFill, display.rowAlpha);
      row.iconBackdrop.setFillStyle(display.iconFill, 1);
      row.checkMark.setText(display.bullet);
      row.checkMark.setColor(display.iconText);
      row.statusPill.setFillStyle(display.fill, 0.98);
      row.statusText.setColor(display.textColor);
      row.statusText.setText(display.label);

      if (task.iconKey && this.scene.textures.exists(task.iconKey)) {
        if (!row.sprite) {
          row.sprite = this.scene.add.image(34, row.rowBackground.y + 21, task.iconKey);
          row.container.add(row.sprite);
        } else {
          row.sprite.setTexture(task.iconKey);
        }

        row.sprite.setDisplaySize(18, 18);
        row.sprite.setVisible(true);
        row.iconBackdrop.setVisible(false);
        row.checkMark.setVisible(false);
      } else {
        if (row.sprite) {
          row.sprite.setVisible(false);
        }

        row.iconBackdrop.setVisible(true);
        row.checkMark.setVisible(true);
      }
    });

    this.relayout();
  }
}
