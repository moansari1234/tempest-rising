export class InputManager {
  constructor() {
    this.keys = {};
    this.previousKeys = {};
    this.actionMap = {
      'moveLeft': ['ArrowLeft', 'a', 'A'],
      'moveRight': ['ArrowRight', 'd', 'D'],
      'moveUp': ['ArrowUp', 'w', 'W'],
      'moveDown': ['ArrowDown', 's', 'S'],
      'jump': [' '], // Spacebar
      'dash': ['Shift'],
      'attackLight': ['z', 'Z'],
      'attackHeavy': ['x', 'X'],
      'parry': ['c', 'C'],
      'absorb': ['e', 'E'],
      'skillPredator': ['e', 'E'],
      'skill1': ['1'],
      'skill2': ['2'],
      'skill3': ['3'],
      'skill4': ['4'],
      'pause': ['Escape', 'p', 'P'],
      'quit': ['q', 'Q'],
      'interact': ['Enter', 'e', 'E'],
      'viewAssets': ['v', 'V'],
      'toggleStatus': ['Tab', 'i', 'I', 'b', 'B'],
      'togglePack': ['t', 'T'],
      'stepBack': ['j', 'J', '['],
      'stepForward': ['k', 'K', ']']
    };
    
    // Store timing for input buffering
    this.inputTimestamps = {};

    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseClicked = false;
    this.previousMouseClicked = false;

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
    });

    window.addEventListener('mouseup', (e) => {
      updateMousePos(e);
      this.mouseClicked = false;
    });
  }

  onKeyDown(e) {
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
    this.keys[e.key] = true;
    this.inputTimestamps[e.key] = performance.now();
  }

  onKeyUp(e) {
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
    this.keys[e.key] = false;
  }

  update() {
    this.previousKeys = { ...this.keys };
    this.previousMouseClicked = this.mouseClicked;
  }

  isJustClicked() {
    return this.mouseClicked && !this.previousMouseClicked;
  }

  isClickInRect(x, y, w, h) {
    if (!this.isJustClicked()) return false;
    return this.mouseX >= x && this.mouseX <= x + w && this.mouseY >= y && this.mouseY <= y + h;
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
