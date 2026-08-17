import { Transform, Velocity, Sprite, Collider, Health, CombatData, Hurtbox, AI } from '../ecs/Components.js';

export function createGoblin(world, x, y) {
  const goblinId = world.createEntity();
  
  world.addComponent(goblinId, new Transform(x, y, 32, 32));
  world.addComponent(goblinId, new Velocity());
  
  const sprite = new Sprite('goblin');
  world.addComponent(goblinId, sprite); 
  
  world.addComponent(goblinId, new Collider('aabb', true, 0, 0, 32, 32));
  world.addComponent(goblinId, new Health(30, 30, 0, 0));
  world.addComponent(goblinId, new CombatData(6, 2, 5, true, 15)); // 6 atk, 2 def, 5 contact, absorbable, 15 XP
  world.addComponent(goblinId, new Hurtbox(0, 0, 32, 32));
  
  // Attach AI
  world.addComponent(goblinId, new AI('goblin'));

  return goblinId;
}

export function createGoblinBrawler(world, x, y) {
  const goblinId = world.createEntity();
  
  world.addComponent(goblinId, new Transform(x, y, 36, 36));
  world.addComponent(goblinId, new Velocity());
  
  const sprite = new Sprite('goblin');
  sprite.color = 'rgba(239, 68, 68, 0.25)'; // Enraged reddish/dark tint for elite brawler
  world.addComponent(goblinId, sprite); 
  
  world.addComponent(goblinId, new Collider('aabb', true, 0, 0, 36, 36));
  world.addComponent(goblinId, new Health(65, 65, 0, 0)); // Double HP
  world.addComponent(goblinId, new CombatData(12, 6, 8, true, 35, 1.6)); // 12 atk, 6 def, heavier mass (knockback resistance), 35 XP
  world.addComponent(goblinId, new Hurtbox(0, 0, 36, 36));
  
  // Attach AI with aggressive parameters
  const ai = new AI('goblin');
  ai.detectionRange = 250;
  world.addComponent(goblinId, ai);

  return goblinId;
}

export function createGoblinArcher(world, x, y) {
  const goblinId = world.createEntity();
  
  world.addComponent(goblinId, new Transform(x, y, 32, 32));
  world.addComponent(goblinId, new Velocity());
  
  const sprite = new Sprite('goblin_archer');
  world.addComponent(goblinId, sprite); 
  
  world.addComponent(goblinId, new Collider('aabb', true, 0, 0, 32, 32));
  world.addComponent(goblinId, new Health(25, 25, 0, 0));
  world.addComponent(goblinId, new CombatData(10, 2, 4, true, 30, 0.8)); // 10 atk arrow, light mass
  world.addComponent(goblinId, new Hurtbox(0, 0, 32, 32));
  
  // Attach Ranged Archer AI
  const ai = new AI('goblin_archer');
  ai.detectionRange = 350;
  world.addComponent(goblinId, ai);

  return goblinId;
}
