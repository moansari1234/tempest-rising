export class InputManager {
  constructor() {
    this.keys = {};
    this.previousKeys = {};
    this.actionMap = {
      'moveLeft': ['ArrowLeft', 'a', 'A', 'KeyA'],
      'moveRight': ['ArrowRight', 'd', 'D', 'KeyD'],
      'moveUp': ['ArrowUp', 'w', 'W', 'KeyW'],
      'moveDown': ['ArrowDown', 's', 'S', 'KeyS'],
      'jump': [' ', 'Space', 'Spacebar', 'ArrowUp', 'w', 'W', 'KeyW', 'Up'], // Spacebar or Up/W
      'dash': ['Shift', 'ShiftLeft', 'ShiftRight'],
      'attackLight': ['z', 'Z', 'KeyZ', 'j', 'J'],
      'attackHeavy': ['x', 'X', 'KeyX', 'k', 'K'],
      'parry': ['c', 'C', 'KeyC', 'l', 'L'],
      'absorb': ['e', 'E', 'KeyE'],
      'skillPredator': ['e', 'E', 'KeyE'],
      'skill1': ['1', 'Digit1', 'Numpad1'],
      'skill2': ['2', 'Digit2', 'Numpad2'],
      'skill3': ['3', 'Digit3', 'Numpad3'],
      'skill4': ['4', 'Digit4', 'Numpad4'],
      'pause': ['Escape', 'p', 'P', 'KeyP'],
      'quit': ['q', 'Q', 'KeyQ'],
      'interact': ['Enter', 'e', 'E', 'KeyE'],
      'viewAssets': ['v', 'V', 'KeyV'],
      'toggleStatus': ['Tab', 'i', 'I', 'KeyI', 'b', 'B', 'KeyB'],
      'togglePack': ['t', 'T', 'KeyT'],
      'stepBack': ['j', 'J', '[', 'BracketLeft'],
      'stepForward': ['k', 'K', ']', 'BracketRight']
    };
    
    // Store timing for input buffering
    this.inputTimestamps = {};

    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseClicked = false;
    this.mouseJustPressed = false;
    this.pendingClicks = [];

    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    
    const updateMousePos = (e) => {
      const canvas = document.getElementById('game-canvas') || document.querySelector('canvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
    };

    window.addEventListener('mousemove', (e) => {
      updateMousePos(e);
    });

    window.addEventListener('mousedown', (e) => {
      updateMousePos(e);
      this.mouseClicked = true;
      this.mouseJustPressed = true;
      this.pendingClicks.push({ x: this.mouseX, y: this.mouseY });
    });

    window.addEventListener('mouseup', (e) => {
      updateMousePos(e);
      this.mouseClicked = false;
    });
  }

  onKeyDown(e) {
    if ([' ', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) || e.code === 'Space') {
      e.preventDefault();
    }
    this.keys[e.key] = true;
    if (e.code) this.keys[e.code] = true;
    this.inputTimestamps[e.key] = performance.now();
    if (e.code) this.inputTimestamps[e.code] = performance.now();
  }

  onKeyUp(e) {
    if ([' ', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) || e.code === 'Space') {
      e.preventDefault();
    }
    this.keys[e.key] = false;
    if (e.code) this.keys[e.code] = false;
  }

  update() {
    // Kept for backward compatibility
  }

  endFrame() {
    this.mouseJustPressed = false;
    this.pendingClicks = [];
    this.previousKeys = { ...this.keys };
  }

  isJustClicked() {
    return this.mouseJustPressed || this.pendingClicks.length > 0;
  }

  isClickInRect(x, y, w, h) {
    if (this.mouseJustPressed && this.mouseX >= x && this.mouseX <= x + w && this.mouseY >= y && this.mouseY <= y + h) {
      return true;
    }
    for (let i = 0; i < this.pendingClicks.length; i++) {
      const p = this.pendingClicks[i];
      if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
        this.pendingClicks.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  isHoverInRect(x, y, w, h) {
    return this.mouseX >= x && this.mouseX <= x + w && this.mouseY >= y && this.mouseY <= y + h;
  }

  isMouseDownInRect(x, y, w, h) {
    return this.mouseClicked && this.mouseX >= x && this.mouseX <= x + w && this.mouseY >= y && this.mouseY <= y + h;
  }

  // Check if any key mapped to an action is currently held down
  isActionHeld(action) {
    const keysForAction = this.actionMap[action];
    if (!keysForAction) return false;
    return keysForAction.some(key => this.keys[key]);
  }

  // Check if an action was just pressed this frame
  isActionJustPressed(action) {
    const keysForAction = this.actionMap[action];
    if (!keysForAction) return false;
    return keysForAction.some(key => this.keys[key] && !this.previousKeys[key]);
  }

  // Check if an action was just released this frame
  isActionJustReleased(action) {
    const keysForAction = this.actionMap[action];
    if (!keysForAction) return false;
    return keysForAction.some(key => !this.keys[key] && this.previousKeys[key]);
  }

  // Input buffering check
  wasActionPressedWithin(action, timeMs) {
    const keysForAction = this.actionMap[action];
    if (!keysForAction) return false;
    
    const now = performance.now();
    for (const key of keysForAction) {
      if (this.inputTimestamps[key] && (now - this.inputTimestamps[key]) <= timeMs) {
        return true;
      }
    }
    return false;
  }
  
  consumeAction(action) {
      const keysForAction = this.actionMap[action];
      if (!keysForAction) return;
      for (const key of keysForAction) {
          this.inputTimestamps[key] = 0; // Consume the buffer
          this.previousKeys[key] = true; // Consume for isActionJustPressed
      }
  }
}
