import { Transform, Velocity, Sprite, Collider, PlayerInput, Health, CombatData, Hurtbox } from '../ecs/Components.js';
import { CONSTANTS } from '../data/constants.js';

export function createPlayer(world, x, y) {
  const playerId = world.createEntity();
  
  world.addComponent(playerId, new Transform(x, y, 32, 32));
  world.addComponent(playerId, new Velocity());
  world.addComponent(playerId, new Sprite('rimuru')); 
  
  let maxHp = 100;
  try {
      const savedHp = localStorage.getItem('tempest_save_max_hp');
      if (savedHp) maxHp = parseInt(savedHp, 10) || 100;
  } catch(e) {}
  
  // Player physical collider
  world.addComponent(playerId, new Collider('aabb', true, 0, 0, 32, 32));
  
  // Input and State tracking
  world.addComponent(playerId, new PlayerInput());
  
  // Health
  world.addComponent(playerId, new Health(maxHp, maxHp, CONSTANTS.BASE_MP, CONSTANTS.BASE_MP));
  
  // Combat stats
  world.addComponent(playerId, new CombatData(CONSTANTS.BASE_ATK, CONSTANTS.BASE_DEF));
  
  // Hurtbox for taking damage
  world.addComponent(playerId, new Hurtbox(0, 0, 32, 32));

  return playerId;
}
