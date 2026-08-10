export const GameState = {
  BOOT: 0,
  MENU: 1,
  PLAYING: 2,
  PAUSED: 3,
  DIALOGUE: 4,
  CUTSCENE: 5,
  GAME_OVER: 6,
  LEVEL_TRANSITION: 7
};

export class GameStateManager {
  constructor() {
    this.currentState = GameState.BOOT;
    this.previousState = GameState.BOOT;
  }

  setState(newState) {
    this.previousState = this.currentState;
    this.currentState = newState;
    console.log(`[GameState] Transition: ${this._getStateName(this.previousState)} -> ${this._getStateName(this.currentState)}`);
  }

  getState() {
    return this.currentState;
  }

  _getStateName(stateVal) {
    return Object.keys(GameState).find(key => GameState[key] === stateVal) || 'UNKNOWN';
  }
}
