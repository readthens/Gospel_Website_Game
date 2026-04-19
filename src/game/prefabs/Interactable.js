import Phaser from 'phaser';

const DEFAULTS = Object.freeze({
  width: 72,
  height: 96,
  interactionRadius: 118,
  prompt: 'Interact',
  tint: 0xffffff,
  inactiveAlpha: 0.25,
  idleAlpha: 0.95,
  completedAlpha: 0.55,
  completedTint: 0x92c36b,
  highlightScale: 1.05,
});

class Interactable extends Phaser.GameObjects.Sprite {
  constructor(scene, config = {}) {
    const settings = { ...DEFAULTS, ...config };
    const textureKey = scene.textures.exists(settings.textureKey)
      ? settings.textureKey
      : '__WHITE';

    super(scene, settings.x, settings.y, textureKey);

    this.scene = scene;
    this.settings = settings;
    this.handler = settings.onInteract || null;
    this.highlighted = false;
    this.completed = false;

    this.id = settings.id;
    this.type = settings.type || 'interactable';
    this.prompt = settings.prompt;
    this.dialogueKey = settings.dialogueKey || null;
    this.taskId = settings.taskId || null;
    this.beat = settings.beat || null;
    this.requiredFlags = [...(settings.requiredFlags || [])];
    this.blockedFlags = [...(settings.blockedFlags || [])];
    this.hideUntilAvailable = Boolean(settings.hideUntilAvailable);
    this.interactionRadius = settings.interactionRadius;

    scene.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setDepth(settings.depth || 48);
    this.setDisplaySize(settings.width, settings.height);
    this.setTint(settings.tint);
    this.setAlpha(settings.idleAlpha);

    this.defaultScale = this.scale;
  }

  setHandler(handler) {
    this.handler = handler;
    return this;
  }

  setCompleted(completed = true) {
    this.completed = completed;
    return this;
  }

  meetsRequirements(context) {
    const requiredFlagsMet = this.requiredFlags.every((flag) => context.getFlag(flag));
    const blockedFlagsMet = this.blockedFlags.some((flag) => context.getFlag(flag));
    return requiredFlagsMet && !blockedFlagsMet;
  }

  isAvailable(context) {
    if (!this.active || !this.visible) {
      return false;
    }

    if (!this.meetsRequirements(context)) {
      return false;
    }

    if (this.taskId && context.isTaskComplete(this.taskId)) {
      return false;
    }

    return !this.completed;
  }

  refreshState(context) {
    const unlocked = this.meetsRequirements(context);
    const taskComplete = this.taskId ? context.isTaskComplete(this.taskId) : false;
    const available = unlocked && !taskComplete && !this.completed;

    if (this.hideUntilAvailable) {
      this.setVisible(unlocked || taskComplete);
    }

    if (taskComplete || this.completed) {
      this.setVisible(true);
      this.setAlpha(this.settings.completedAlpha);
      this.setTint(this.settings.completedTint);
      this.highlighted = false;
      this.setScale(this.defaultScale);
      return this;
    }

    this.clearTint();
    this.setTint(this.settings.tint);
    this.setAlpha(available ? this.settings.idleAlpha : this.settings.inactiveAlpha);
    this.setScale(this.highlighted && available ? this.defaultScale * this.settings.highlightScale : this.defaultScale);
    return this;
  }

  setHighlighted(highlighted) {
    this.highlighted = highlighted;
    return this;
  }

  getInteractionDistanceTo(target) {
    const sourcePoint =
      typeof target.getInteractionPoint === 'function'
        ? target.getInteractionPoint()
        : new Phaser.Math.Vector2(target.x, target.y);

    return Phaser.Math.Distance.Between(sourcePoint.x, sourcePoint.y, this.x, this.y - this.displayHeight * 0.45);
  }

  canPrompt(target) {
    return this.getInteractionDistanceTo(target) <= this.interactionRadius;
  }

  getPromptPosition() {
    return {
      x: this.x,
      y: this.y - this.displayHeight - 16,
    };
  }

  interact(context) {
    if (typeof this.handler === 'function') {
      return this.handler(context, this);
    }

    return false;
  }
}

export default Interactable;
