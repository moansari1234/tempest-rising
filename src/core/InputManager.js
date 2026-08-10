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
      'interact': ['Enter', 'e', 'E']
    };
    
    // Store timing for input buffering
    this.inputTimestamps = {};

    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onKeyDown(e) {
    this.keys[e.key] = true;
    this.inputTimestamps[e.key] = performance.now();
  }

  onKeyUp(e) {
    this.keys[e.key] = false;
  }

  update() {
    // Copy current state to previous state at the end of the frame
    // This allows checking for just-pressed or just-released keys
    this.previousKeys = { ...this.keys };
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
      }
  }
}
