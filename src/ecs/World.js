export class World {
  constructor() {
    this.entities = new Map(); // entityId -> { componentName: ComponentInstance }
    this.systems = [];
    this.nextEntityId = 1;
    this.entitiesToDelete = [];
  }

  createEntity() {
    const id = this.nextEntityId++;
    this.entities.set(id, {});
    return id;
  }

  addComponent(entityId, component) {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity[component.constructor.name] = component;
    }
  }

  getComponent(entityId, componentClass) {
    const entity = this.entities.get(entityId);
    if (entity) {
      return entity[componentClass.name];
    }
    return null;
  }

  hasComponent(entityId, componentClass) {
    return !!this.getComponent(entityId, componentClass);
  }

  removeEntity(entityId) {
    this.entitiesToDelete.push(entityId);
  }

  // Get all entity IDs that possess ALL of the requested component classes
  queryEntities(componentClasses) {
    const results = [];
    for (const [id, entity] of this.entities.entries()) {
      let hasAll = true;
      for (const compClass of componentClasses) {
        if (!entity[compClass.name]) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        results.push(id);
      }
    }
    return results;
  }

  registerSystem(system) {
    this.systems.push(system);
  }

  update(dt, context) {
    // Run all systems
    for (const system of this.systems) {
      system.update(this, dt, context);
    }

    // Cleanup deleted entities at the end of the frame
    if (this.entitiesToDelete.length > 0) {
      for (const id of this.entitiesToDelete) {
        this.entities.delete(id);
      }
      this.entitiesToDelete = [];
    }
  }
}
