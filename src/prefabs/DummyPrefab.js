import { Transform, Velocity, Sprite, Collider, Health, CombatData, Hurtbox } from '../ecs/Components.js';
import { CONSTANTS } from '../data/constants.js';

export function createDummy(world, x, y) {
  const dummyId = world.createEntity();
  
  world.addComponent(dummyId, new Transform(x, y, 32, 32));
  world.addComponent(dummyId, new Velocity());
  
  // Create a red square for dummy since we don't have a sprite yet, or just reuse rimuru
  const sprite = new Sprite('rimuru');
  sprite.color = 'red'; // Will need to tweak render system to support fallback color if bitmap fails
  world.addComponent(dummyId, sprite); 
  
  world.addComponent(dummyId, new Collider('aabb', true, 0, 0, 32, 32));
  world.addComponent(dummyId, new Health(500, 500, 0, 0));
  world.addComponent(dummyId, new CombatData(0, 0, 0, false, 0));
  world.addComponent(dummyId, new Hurtbox(0, 0, 32, 32));

  return dummyId;
}
