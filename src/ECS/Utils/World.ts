import type { System } from "./System";
import type { Component, ComponentTypeId } from "./Types";

type EntityId = number;


export class World {
  private nextId: EntityId = 1;
  private entities = new Set<EntityId>();
  private components = new Map<ComponentTypeId, Map<EntityId, Component>>();
  private entityMasks = new Map<EntityId, boolean[]>(); 
  private systems: System[] = [];

  createEntity(): EntityId {
    const id = this.nextId++;
    this.entities.add(id);
    this.entityMasks.set(id, []);
    return id;
  }

  addComponent<T extends Component>(entity: EntityId, component: T): void {
    const typeId = component.__type;

    if (!this.components.has(typeId)) {
      this.components.set(typeId, new Map());
    }

    this.components.get(typeId)!.set(entity, component);

    const mask = this.entityMasks.get(entity)!;
    mask[typeId] = true;
  }

  getComponent<T extends Component>(entity: EntityId, type: ComponentTypeId): T | undefined {
    return this.components.get(type)?.get(entity) as T | undefined;
  }

  hasComponent(entity: EntityId, type: ComponentTypeId): boolean {
    return this.entityMasks.get(entity)?.[type] ?? false;
  }

  removeComponent(entity: EntityId, type: ComponentTypeId): void {
    this.components.get(type)?.delete(entity);
    if (this.entityMasks.get(entity)) {
      this.entityMasks.get(entity)![type] = false;
    }
  }

  getEntitiesWith(...types: ComponentTypeId[]): EntityId[] {
    return [...this.entities].filter(entity =>
      types.every(type => this.hasComponent(entity, type))
    );
  }

  registerSystem(system: System): void {
    this.systems.push(system);
  }

  update(delta: number): void {
    for (const system of this.systems) {
      system.update(this, delta);
    }
  }
}

