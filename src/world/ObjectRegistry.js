import { invariant } from '../core/assert.js';
import { SpoilerLevel } from '../constants.js';

export class ObjectRegistry {
  #objects = new Map();
  register(descriptor, object3D) {
    invariant(descriptor?.id, 'Object descriptor requires id');
    invariant(!this.#objects.has(descriptor.id), `Duplicate object: ${descriptor.id}`);
    const normalized = {
      family: 'GENERIC', variant: 'DEFAULT', storyCritical: false, spoilerLevel: SpoilerLevel.LEVEL_0,
      collisionProfile: 'NONE', interactionProfile: 'NONE', gripPoints: [], anchors: [], lod: null, ...descriptor,
    };
    object3D.userData.objectId = normalized.id;
    this.#objects.set(normalized.id, { descriptor: normalized, object3D });
    return object3D;
  }
  get(id) { return this.#objects.get(id) ?? null; }
  object(id) { return this.get(id)?.object3D ?? null; }
  descriptor(id) { return this.get(id)?.descriptor ?? null; }
  values() { return [...this.#objects.values()]; }
  clear() { this.#objects.clear(); }
}
