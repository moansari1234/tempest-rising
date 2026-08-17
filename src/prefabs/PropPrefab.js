import { Transform, Sprite, Collider, Health, CombatData, Hurtbox, InteractiveProp, Hazard } from '../ecs/Components.js';

export function createMagisteelOre(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('magisteel'));
  world.addComponent(id, new Health(25, 25));
  world.addComponent(id, new CombatData(0, 5, 0, true, 40));
  world.addComponent(id, new Hurtbox(0, 0, 32, 32));
  world.addComponent(id, new InteractiveProp('magisteel', '[E] MINE ORE', 50, 40, 0));
  return id;
}

export function createHipokuteHerb(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('hipokute'));
  world.addComponent(id, new InteractiveProp('hipokute', '[E] HARVEST LOTUS', 45, 25, 35));
  return id;
}

export function createTreasureChest(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('chest'));
  world.addComponent(id, new InteractiveProp('chest', '[E] OPEN CHEST', 50, 100, 50));
  return id;
}

export function createClayUrn(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('urn'));
  world.addComponent(id, new Health(10, 10));
  world.addComponent(id, new CombatData(0, 0, 0, true, 15));
  world.addComponent(id, new Hurtbox(0, 0, 32, 32));
  world.addComponent(id, new InteractiveProp('urn', '[E] SMASH', 45, 15, 10));
  return id;
}

export function createDragonTorch(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('torch'));
  world.addComponent(id, new InteractiveProp('torch', null, 0, 0, 0));
  return id;
}

export function createCampfire(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('campfire'));
  world.addComponent(id, new InteractiveProp('campfire', '[E] REST AT FIRE', 60, 10, 100));
  return id;
}

export function createRunicMonolith(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('monolith'));
  world.addComponent(id, new InteractiveProp('monolith', '[E] COMMUNE WITH MONOLITH', 55, 60, 20));
  return id;
}

export function createFloorSpikes(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y + 16, 32, 16));
  world.addComponent(id, new Sprite('spikes'));
  world.addComponent(id, new Hazard('spikes', 15, 32));
  return id;
}

export function createCeilingStalactite(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('stalactite'));
  world.addComponent(id, new Hazard('stalactite', 25, 48));
  return id;
}

export function createSporeShroom(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('spore_shroom'));
  world.addComponent(id, new Hazard('spore_shroom', 12, 60));
  return id;
}

export function createAcidVent(world, x, y) {
  const id = world.createEntity();
  world.addComponent(id, new Transform(x, y, 32, 32));
  world.addComponent(id, new Sprite('acid_vent'));
  world.addComponent(id, new Hazard('acid_vent', 18, 40));
  return id;
}
