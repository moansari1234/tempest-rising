import { Transform, Velocity, Sprite, Collider, Health, CombatData, Hurtbox, AI } from '../ecs/Components.js';

export function createGoblin(world, x, y) {
  const goblinId = world.createEntity();
  
  world.addComponent(goblinId, new Transform(x, y, 32, 32));
  world.addComponent(goblinId, new Velocity());
  
  const sprite = new Sprite('goblin');
  world.addComponent(goblinId, sprite); 
  
  world.addComponent(goblinId, new Collider('aabb', true, 0, 0, 32, 32));
  world.addComponent(goblinId, new Health(30, 30, 0, 0));
  world.addComponent(goblinId, new CombatData(5, 2, 5, true, 10)); // 5 atk, 2 def, 5 contact dmg, absorbable, 10 XP
  world.addComponent(goblinId, new Hurtbox(0, 0, 32, 32));
  
  // Attach AI
  world.addComponent(goblinId, new AI('goblin'));

  return goblinId;
}
