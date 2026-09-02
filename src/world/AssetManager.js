import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { unzipSync } from 'fflate';

export class AssetManager {
  #manager = new THREE.LoadingManager(); #gltf = new GLTFLoader(this.#manager); #ktx2 = null; #cache = new Map();
  constructor({ renderer = null, ktx2TranscoderPath = null } = {}) {
    this.#gltf.setMeshoptDecoder(MeshoptDecoder);
    if (renderer && ktx2TranscoderPath) {
      this.#ktx2 = new KTX2Loader(this.#manager).setTranscoderPath(ktx2TranscoderPath).detectSupport(renderer);
      this.#gltf.setKTX2Loader(this.#ktx2);
    }
  }
  #cachedLoad(key, factory) {
    if (this.#cache.has(key)) return this.#cache.get(key);
    const promise = Promise.resolve().then(factory).catch((error) => {
      // Failed loads must not poison the cache. A later retry may succeed after
      // memory pressure, a transient local-file failure, or chapter recovery.
      if (this.#cache.get(key) === promise) this.#cache.delete(key);
      throw error;
    });
    this.#cache.set(key, promise);
    return promise;
  }
  async gltf(url) {
    await MeshoptDecoder.ready;
    return this.#cachedLoad(`gltf:${url}`, () => this.#gltf.loadAsync(url));
  }
  texture(url) {
    return this.#cachedLoad(`texture:${url}`, () => new THREE.TextureLoader(this.#manager).loadAsync(url));
  }
  unpackZipBytes(uint8) { return unzipSync(uint8); }
  dispose() { this.#ktx2?.dispose(); this.#cache.clear(); }
}
