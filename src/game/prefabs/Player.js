import Phaser from 'phaser';

const DEFAULTS = Object.freeze({
  textureKey: 'player',
  width: 46,
  height: 72,
  moveSpeed: 260,
  jumpSpeed: 645,
  dragX: 1800,
  airDragX: 900,
  maxFallSpeed: 980,
  jumpBufferTime: 140,
  coyoteTime: 120,
  unlockJumpGuardTime: 160,
  bodyWidthRatio: 0.62,
  bodyHeightRatio: 0.9,
  bodyOffsetX: 0.19,
  bodyOffsetY: 0.08,
  tint: 0xf3f1eb,
});

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    const settings = { ...DEFAULTS, ...config };
    const textureKey = scene.textures.exists(settings.textureKey)
      ? settings.textureKey
      : '__WHITE';

    super(scene, x, y, textureKey);

    this.scene = scene;
    this.settings = settings;
    this.movementLocked = false;
    this.lastGroundedAt = 0;
    this.lastJumpPressedAt = -Infinity;
    this.jumpSuppressedUntil = 0;
    this.pendingJumpCue = false;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(60);
    this.setOrigin(0.5, 1);
    this.setDisplaySize(settings.width, settings.height);
    this.setTint(settings.tint);
    this.setMaxVelocity(settings.moveSpeed, settings.maxFallSpeed);
    this.setCollideWorldBounds(true);

    // Arcade bodies are scaled with the sprite, so size/offset must be based on
    // the source frame instead of the displayed dimensions to avoid double scaling.
    const frameWidth = this.frame?.realWidth || this.frame?.width || this.width || settings.width;
    const frameHeight = this.frame?.realHeight || this.frame?.height || this.height || settings.height;

    this.body.setSize(frameWidth * settings.bodyWidthRatio, frameHeight * settings.bodyHeightRatio);
    this.body.setOffset(frameWidth * settings.bodyOffsetX, frameHeight * settings.bodyOffsetY);
    this.body.setGravityY(0);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.W,
      jumpAlt: Phaser.Input.Keyboard.KeyCodes.SPACE,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
    });
  }

  update(time) {
    if (!this.body) {
      return;
    }

    const onGround = this.isGrounded();
    if (onGround) {
      this.lastGroundedAt = time;
    }

    if (this.movementLocked) {
      this.lastJumpPressedAt = -Infinity;
      this.pendingJumpCue = false;
      this.setVelocityX(0);
      return;
    }

    const jumpInputSuppressed = time < this.jumpSuppressedUntil;

    if (!jumpInputSuppressed && (Phaser.Input.Keyboard.JustDown(this.keys.jump) || Phaser.Input.Keyboard.JustDown(this.keys.jumpAlt))) {
      this.lastJumpPressedAt = time;
    }

    const direction = this.getHorizontalInput();
    const speed = this.settings.moveSpeed;
    this.setDragX(onGround ? this.settings.dragX : this.settings.airDragX);

    if (direction !== 0) {
      this.setVelocityX(direction * speed);
      if (direction < 0) {
        this.setFlipX(true);
      } else if (direction > 0) {
        this.setFlipX(false);
      }
    } else if (onGround) {
      this.setVelocityX(0);
    }

    const jumpBuffered = time - this.lastJumpPressedAt <= this.settings.jumpBufferTime;
    const coyoteJump = time - this.lastGroundedAt <= this.settings.coyoteTime;
    if (jumpBuffered && coyoteJump) {
      this.setVelocityY(-this.settings.jumpSpeed);
      this.lastJumpPressedAt = -Infinity;
      this.lastGroundedAt = -Infinity;
      this.pendingJumpCue = true;
    }

    const jumpReleased =
      Phaser.Input.Keyboard.JustUp(this.keys.jump) || Phaser.Input.Keyboard.JustUp(this.keys.jumpAlt);
    if (jumpReleased && this.body.velocity.y < -180) {
      this.setVelocityY(this.body.velocity.y * 0.58);
    }
  }

  getHorizontalInput() {
    const movingLeft = this.cursors.left.isDown || this.keys.left.isDown;
    const movingRight = this.cursors.right.isDown || this.keys.right.isDown;

    if (movingLeft === movingRight) {
      return 0;
    }

    return movingLeft ? -1 : 1;
  }

  isGrounded() {
    if (!this.body) {
      return false;
    }

    return this.body.blocked.down || this.body.touching.down;
  }

  wantsToInteract() {
    return Phaser.Input.Keyboard.JustDown(this.keys.interact);
  }

  lockMovement(locked = true) {
    const wasLocked = this.movementLocked;
    this.movementLocked = locked;
    if (locked && this.body) {
      this.setVelocity(0, this.body.velocity.y);
      this.lastJumpPressedAt = -Infinity;
      this.pendingJumpCue = false;
      return this;
    }

    if (wasLocked && !locked) {
      this.lastJumpPressedAt = -Infinity;
      this.pendingJumpCue = false;
      this.jumpSuppressedUntil = this.scene.time.now + this.settings.unlockJumpGuardTime;
    }

    return this;
  }

  getInteractionPoint() {
    return new Phaser.Math.Vector2(this.x, this.y - this.displayHeight * 0.45);
  }

  consumeJumpCue() {
    const shouldPlay = this.pendingJumpCue;
    this.pendingJumpCue = false;
    return shouldPlay;
  }
}

export default Player;
