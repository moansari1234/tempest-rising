import { CONSTANTS } from '../data/constants.js';

export class XPSystem {
  constructor() {
    this.level = 1;
    this.currentXP = 0;
    this.sp = 0;
    this.load();
  }

  getXPThreshold(level) {
    return Math.floor(CONSTANTS.XP_BASE * Math.pow(CONSTANTS.XP_SCALE, level - 1));
  }

  awardXP(amount, comboMultiplier = 1.0, context) {
    const total = Math.floor(amount * comboMultiplier);
    this.currentXP += total;
    
    if (context && context.floaterQueue) {
        // Find player position for floater
        const { Transform, PlayerInput } = require('../ecs/Components.js'); // dynamic require to avoid circular deps if any
        const players = context.world ? context.world.queryEntities([Transform, PlayerInput]) : [];
        if (players.length > 0) {
            const transform = context.world.getComponent(players[0], Transform);
            context.floaterQueue.push({
                x: transform.x + transform.width / 2,
                y: transform.y - 20,
                text: `+${total} XP`,
                color: '#88FF88',
                lifetime: 1.5,
                maxLifetime: 1.5
            });
        }
    }
    
    while (this.currentXP >= this.getXPThreshold(this.level)) {
      this.currentXP -= this.getXPThreshold(this.level);
      this.levelUp(context);
    }
    this.save();
    return total;
  }

  levelUp(context) {
    this.level++;
    this.sp += CONSTANTS.SP_PER_LEVEL;
    
    if (context && context.floaterQueue) {
        const { Transform, PlayerInput } = require('../ecs/Components.js');
        const players = context.world ? context.world.queryEntities([Transform, PlayerInput]) : [];
        if (players.length > 0) {
            const transform = context.world.getComponent(players[0], Transform);
            context.floaterQueue.push({
                x: transform.x + transform.width / 2,
                y: transform.y - 40,
                text: 'LEVEL UP!',
                color: '#FFD700',
                lifetime: 2.0,
                maxLifetime: 2.0
            });
            
            // Apply scaling instantly
            const { Health, CombatData } = require('../ecs/Components.js');
            const health = context.world.getComponent(players[0], Health);
            const combat = context.world.getComponent(players[0], CombatData);
            if (health && combat) {
                this.applyStatScaling(health, combat);
            }
        }
    }
    
    if (context && context.audio) {
        context.audio.play('level_up');
    }
  }

  awardBossBonus() {
    this.sp += CONSTANTS.SP_PER_BOSS;
    this.save();
  }

  applyStatScaling(playerHealth, playerCombat) {
    const scale = 1 + (this.level - 1) * 0.1;
    playerHealth.maxHp = Math.floor(CONSTANTS.BASE_HP * scale);
    playerHealth.hp = playerHealth.maxHp; // full heal on level up
    playerCombat.atk = Math.floor(CONSTANTS.BASE_ATK * scale);
    playerCombat.def = Math.floor(CONSTANTS.BASE_DEF * scale);
  }

  save() {
    try {
        localStorage.setItem('tempest_xp', JSON.stringify({
            level: this.level,
            currentXP: this.currentXP,
            sp: this.sp
        }));
    } catch(e) {}
  }
  
  load() {
    try {
        const saved = localStorage.getItem('tempest_xp');
        if (saved) {
            const data = JSON.parse(saved);
            this.level = data.level || 1;
            this.currentXP = data.currentXP || 0;
            this.sp = data.sp || 0;
        }
    } catch (e) {}
  }
}
