import { Transform, Velocity, Sprite, Collider, Health, CombatData, Hurtbox, AI } from '../ecs/Components.js';

export function createTempestSerpent(world, x, y) {
  const bossId = world.createEntity();
  
  // Rendered at 96x96
  world.addComponent(bossId, new Transform(x, y, 96, 96));
  world.addComponent(bossId, new Velocity());
  
  const sprite = new Sprite('serpent');
  world.addComponent(bossId, sprite); 
  
  world.addComponent(bossId, new Collider('aabb', true, 16, 16, 64, 80));
  world.addComponent(bossId, new Health(300, 300, 0, 0)); // Huge HP pool
  world.addComponent(bossId, new CombatData(15, 5, 20, false, 100)); // Non-absorbable while alive!
  world.addComponent(bossId, new Hurtbox(16, 16, 64, 80));
  
  // Attach Boss AI
  world.addComponent(bossId, new AI('boss_serpent'));

  return bossId;
}
