// Enhanced Cricket class (ES6+)
// Usage example is shown after the class.

class Cricket {
  constructor({
    container,                         // required: HTMLElement (game box)
    size = { w: 80, h: 80 },
    startCentered = true,
    assets = {
      idle: './images/cricket_idle.png',
      run: './images/cricket_run.png',
      jump: './images/cricket_jump.png',
      fall: './images/cricket_fall.png',
      land: './images/cricket_land.png',
    },
    sfx = {
      jump: () => (typeof jumpSound !== 'undefined' && jumpSound.play ? jumpSound.play() : void 0),
      land: () => (typeof landSound !== 'undefined' && landSound.play ? landSound.play() : void 0),
    },
    physics = {
      gravity: 1800,        // px/s^2
      moveAccel: 3200,      // px/s^2
      airControl: 0.6,      // 0..1 multiplier
      groundFriction: 2200, // px/s^2
      maxSpeedX: 520,       // px/s
      jumpSpeed: 900,       // px/s (upwards)
    },
    landPoseMs = 180,       // how long to show the "land" sprite before idle/run
    autoAttachControls = false,
  } = {}) {
    if (!container) throw new Error('Cricket requires a {container} element.');
    this.container = container;
    this.assets = assets;
    this.sfx = sfx;
    this.physics = physics;
    this.landPoseMs = landPoseMs;

    // DOM node
    this.node = document.createElement('img');
    this.node.className = 'cricket';
    this.node.alt = 'Cricket';
    this.w = size.w;
    this.h = size.h;
    Object.assign(this.node.style, {
      position: 'absolute',
      width: `${this.w}px`,
      height: `${this.h}px`,
      willChange: 'transform, left, top',
      userSelect: 'none',
      pointerEvents: 'none',
    });
    container.append(this.node);

    // Initial position
    this.x = startCentered ? (container.clientWidth - this.w) / 2 : 0;
    this.y = container.clientHeight - this.h - 100;

    // Kinematics
    this.vx = 0;
    this.vy = 0;

    // State
    this.onPlatform = false;
    this.currentLantern = null;
    this.facing = 'right'; // 'left' | 'right'
    this.state = 'idle';
    this._landTimeout = null;

    // Input
    this.input = { left: false, right: false };
    this.jumpOnMove = true; // preserves your original "jump when moving on platform"

    // Setup
    this._setSprite('idle');
    this._applyPosition();
    this._preloadSprites();

    // Event bindings
    this._bound = {
      keydown: (e) => this._onKeyDown(e),
      keyup: (e) => this._onKeyUp(e),
      resize: () => this._onResize(),
    };
    if (autoAttachControls) this.attachControls();
  }

  // ------------ Public API ------------

  attachControls() {
    window.addEventListener('keydown', this._bound.keydown);
    window.addEventListener('keyup', this._bound.keyup);
    window.addEventListener('resize', this._bound.resize);
    return this;
  }
  detachControls() {
    window.removeEventListener('keydown', this._bound.keydown);
    window.removeEventListener('keyup', this._bound.keyup);
    window.removeEventListener('resize', this._bound.resize);
    return this;
  }
  destroy() {
    this.detachControls();
    clearTimeout(this._landTimeout);
    this.node.remove();
  }

  /**
   * Call per frame with delta time in seconds.
   * If you don’t have dt yet, you can call update() with no args (assumes ~60 FPS).
   */
  update(dt = 1 / 60) {
    const p = this.physics;

    // If standing on a lantern, drift along with it
    if (this.onPlatform && this.currentLantern) {
      // Original code added these each frame; approximate that here.
      // If your lantern speeds are already per-second, replace "* dt * 60" with "* dt".
      this.x += (this.currentLantern.currentWindSpeed || 0) * dt * 60;
      this.y += (this.currentLantern.currentFloatSpeed || 0) * dt * 60;
      this.vy = 0; // don't sink while attached
    }

    // Horizontal input and optional auto-jump-on-move (keeps original behavior)
    const left = this.input.left;
    const right = this.input.right;
    const want = (right ? 1 : 0) - (left ? 1 : 0);

    if (this.onPlatform && this.jumpOnMove && want !== 0) {
      this.jump();
    }

    // Horizontal acceleration / friction
    const accel = (this.onPlatform ? p.moveAccel : p.moveAccel * p.airControl) * want;
    this.vx += accel * dt;

    if (this.onPlatform && want === 0) {
      // ground friction when idle on a platform
      const sign = Math.sign(this.vx);
      const mag = Math.max(0, Math.abs(this.vx) - p.groundFriction * dt);
      this.vx = mag * sign;
    }

    // Clamp X speed
    this.vx = Math.max(-p.maxSpeedX, Math.min(p.maxSpeedX, this.vx));

    // Gravity only while in air
    if (!this.onPlatform) {
      this.vy += p.gravity * dt;
    }

    // Integrate
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Update facing
    if (right && !left) this._setFacing('right');
    else if (left && !right) this._setFacing('left');

    // Sprite state machine
    if (!this.onPlatform) {
      if (this.vy < -30) this._setSprite('jump');
      else if (this.vy > 120) this._setSprite('fall');
    } else {
      if (this.state !== 'land') {
        this._setSprite(Math.abs(this.vx) > 40 ? 'run' : 'idle');
      }
    }

    // Keep inside container
    this._resolveBounds();
    this._applyPosition();
  }

  jump() {
    if (!this.onPlatform) return;
    const { jumpSpeed } = this.physics;
    this.onPlatform = false;
    if (this.currentLantern?.releaseCricket) this.currentLantern.releaseCricket(this);
    this.currentLantern = null;
    this.vy = -Math.abs(jumpSpeed); // up
    this._setSprite('jump');
    this.sfx?.jump?.();
  }

  /** Call this when your collision system detects the cricket has landed on a lantern. */
  landOn(lantern) {
    this.onPlatform = true;
    this.currentLantern = lantern || null;

    // Center and stop motion
    this.repositionOnLantern();
    if (lantern) lantern.containsCricket = true;

    // Show landing sprite briefly, then idle/run
    clearTimeout(this._landTimeout);
    this._setSprite('land');
    this.sfx?.land?.();
    this._landTimeout = setTimeout(() => {
      if (this.onPlatform) this._setSprite('idle');
    }, this.landPoseMs);
  }

  // Keep method name close to your original (plus a typo-safe alias below)
  repositionOnLantern() {
    if (!this.currentLantern) return;
    const L = this.currentLantern;
    this.vx = 0; this.vy = 0;
    this.x = L.x + L.w / 2 - this.w / 2;
    this.y = L.y + L.h / 2;
    this._applyPosition();
  }

  // ------------ Backwards-compat shims ------------
  // (so you can swap this class in without touching existing call sites)
  automaticMovement() { this.update(1 / 60); } // legacy name
  landed(lantern) { this.landOn(lantern); }     // legacy name
  repositionOnLanturn() { this.repositionOnLantern(); } // fix original typo

  // ------------ Internals ------------

  _setSprite(next) {
    if (this.state === next) return;
    this.state = next;
    const src = this.assets[next] || this.assets.idle;
    // Avoid forcing layout if the URL didn't actually change
    const current = this.node.getAttribute('data-src') || '';
    if (current === src) return;
    this.node.src = src;
    this.node.setAttribute('data-src', src);
  }

  _setFacing(dir) {
    if (this.facing === dir) return;
    this.facing = dir;
    this.node.style.transform = dir === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
    this.node.style.transformOrigin = '50% 50%';
  }

  _applyPosition() {
    // Bitwise-or 0 to floor without string coercion
    this.node.style.left = `${this.x | 0}px`;
    this.node.style.top = `${this.y | 0}px`;
  }

  _resolveBounds() {
    const maxX = this.container.clientWidth - this.w;
    const maxY = this.container.clientHeight - this.h;

    if (this.x < 0) { this.x = 0; this.vx = 0; }
    if (this.x > maxX) { this.x = maxX; this.vx = 0; }
    if (this.y < 0) { this.y = 0; this.vy = 0; }
    if (this.y > maxY) {
      // Fell off screen; you can decide how to handle this
      this.y = maxY;
      this.vy = 0;
      this.onPlatform = false;
      this.currentLantern = null;
    }
  }

  _preloadSprites() {
    Object.values(this.assets).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  _onResize() {
    // Keep cricket on-screen after container resizes
    this._resolveBounds();
    this._applyPosition();
  }

  _onKeyDown(e) {
    if (e.key === 'a' || e.key === 'ArrowLeft') this.input.left = true, this._setFacing('left');
    if (e.key === 'd' || e.key === 'ArrowRight') this.input.right = true, this._setFacing('right');
  }

  _onKeyUp(e) {
    if (e.key === 'a' || e.key === 'ArrowLeft') this.input.left = false;
    if (e.key === 'd' || e.key === 'ArrowRight') this.input.right = false;
  }
}
