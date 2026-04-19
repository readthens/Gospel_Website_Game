import Phaser from 'phaser';

class TriggerZone extends Phaser.GameObjects.Zone {
  constructor(scene, config = {}) {
    super(scene, config.x, config.y, config.width, config.height);

    this.scene = scene;
    this.id = config.id;
    this.beat = config.beat || null;
    this.once = config.once !== false;
    this.requiredFlags = [...(config.requiredFlags || [])];
    this.blockedFlags = [...(config.blockedFlags || [])];
    this.flagsOnEnter = [...(config.flagsOnEnter || [])];
    this.objectiveKey = config.objectiveKey || null;
    this.eventKey = config.eventKey || null;
    this.consumed = false;
    this.handler = config.onEnter || null;
    this.cooldownMs = config.cooldownMs ?? (this.once ? 0 : 500);
    this.lastTriggeredAt = -Infinity;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.setOrigin(0.5);
    this.setDepth(config.depth || 1);
    this.setVisible(false);

    if ('allowGravity' in this.body) {
      this.body.allowGravity = false;
    }
    this.body.moves = false;
  }

  setHandler(handler) {
    this.handler = handler;
    return this;
  }

  resetTrigger() {
    this.consumed = false;
    return this;
  }

  meetsRequirements(context) {
    const requiredFlagsMet = this.requiredFlags.every((flag) => context.getFlag(flag));
    const blockedFlagsMet = this.blockedFlags.some((flag) => context.getFlag(flag));
    return requiredFlagsMet && !blockedFlagsMet;
  }

  canTrigger(context) {
    const cooledDown = this.scene.time.now - this.lastTriggeredAt >= this.cooldownMs;
    return (!this.once || !this.consumed) && cooledDown && this.meetsRequirements(context);
  }

  handleOverlap(context) {
    if (!this.canTrigger(context)) {
      return false;
    }

    this.lastTriggeredAt = this.scene.time.now;

    if (this.once) {
      this.consumed = true;
    }

    if (typeof this.handler === 'function') {
      this.handler(context, this);
    }

    return true;
  }
}

export default TriggerZone;
