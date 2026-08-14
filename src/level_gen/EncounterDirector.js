export class EncounterDirector {
  /**
   * Calculates Character Combat Power Index (CPI)
   * @param {object} playerStats - { level, hp, maxHp, atk, def }
   * @returns {number} CPI score
   */
  static calculatePowerIndex(playerStats = {}) {
    const lvl = playerStats.level || 1;
    const atk = playerStats.atk || 10;
    const def = playerStats.def || 8;
    const hp = playerStats.maxHp || 100;

    return Math.floor((lvl * 15) + (atk * 2.5) + (def * 2.0) + (hp * 0.15));
  }

  /**
   * Computes the threat budget and enemy squad composition for a stage
   * @param {number} stageIndex
   * @param {number} cpi - Combat Power Index
   * @returns {object} { totalBudget, enemyTypes }
   */
  static getThreatBudget(stageIndex = 1, cpi = 50) {
    const baseBudget = 20 + stageIndex * 15;
    const powerModifier = Math.floor(cpi * 0.4);
    const totalBudget = baseBudget + powerModifier;

    return {
      totalBudget,
      maxEnemiesPerArena: Math.min(4, 2 + Math.floor(stageIndex / 2)),
      allowElites: stageIndex >= 2 || cpi > 80
    };
  }
}
