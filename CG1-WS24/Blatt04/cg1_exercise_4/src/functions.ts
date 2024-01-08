import * as THREE from "three"

export function createQuad() {
   let geometry = new THREE.BufferGeometry()
   let vertices = new Float32Array([
      -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0,
   ])
   let indices = new Uint32Array([0, 1, 2, 0, 2, 3])
   let nor
   geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
   geometry.setIndex(new THREE.BufferAttribute(indices, 1))
   nor = new THREE.BufferAttribute(new Float32Array(vertices.length).fill(0), 3)
   geometry.setAttribute("normal", nor)
   return geometry
}
