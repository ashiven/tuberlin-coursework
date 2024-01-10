import * as THREE from "three"

export function createQuad() {
   let geometry = new THREE.BufferGeometry()
   let vertices = new Float32Array([
      -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0,

      1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0,
   ])
   geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
   return geometry
}
