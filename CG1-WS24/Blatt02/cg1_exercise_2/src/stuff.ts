import * as THREE from "three"

function updateClippingPlane(
   renderer: THREE.WebGLRenderer,
   changedPlane: THREE.Plane,
   changed: any
) {
   if (!changed.value) {
      renderer.clippingPlanes = renderer.clippingPlanes.filter(
         (plane) =>
            plane.normal.x !== changedPlane.normal.x ||
            plane.normal.y !== changedPlane.normal.y ||
            plane.normal.z !== changedPlane.normal.z
      )
   } else {
      let clippingPlanes = []
      for (let plane of renderer.clippingPlanes) {
         clippingPlanes.push(plane)
      }
      clippingPlanes.push(changedPlane)
      renderer.clippingPlanes = clippingPlanes
   }
}

function customApplyMatrix(object: THREE.Object3D, matrix: THREE.Matrix4) {
   /*
   - BufferGeometry is a class that represents a geometry 
   - BufferGeometry has a BufferAttribute named position that stores the vertex positions making up the geometry

   - BufferAttribute is a class that represents a buffer that can be used for storing data such as vertex positions, colors, normals, etc.
   - the count attribute stores the number of vertices in the buffer
   - the setXYZ method sets the x, y and z coordinates of the vertex at the given index
   - the fromBufferAttribute method copies the x, y and z coordinates of the vertex at the given index into the given vector
   - the needsUpdate attribute indicates that the buffer has changed and should be uploaded to the GPU
   - a BufferAttribute can be constructed via an array of values and an itemSize that indicates the number of values per vertex
   */
   object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
         const geometry: THREE.BufferGeometry = child.geometry
         const position:
            | THREE.BufferAttribute
            | THREE.InterleavedBufferAttribute =
            geometry.getAttribute("position")

         // ---- position.applyMatrix4(matrix) ----

         for (let i = 0, l = position.count; i < l; i++) {
            let vector = new THREE.Vector3().fromBufferAttribute(position, i)

            //  ---- vector.applyMatrix4(matrix) ----

            // p' = p * M  with p = (x, y, z, 1)
            const x = vector.x
            const y = vector.y
            const z = vector.z
            const M = matrix.elements

            const wPrime = x * M[3] + y * M[7] + z * M[11] + M[15]
            const xPrime = x * M[0] + y * M[4] + z * M[8] + M[12]
            const yPrime = x * M[1] + y * M[5] + z * M[9] + M[13]
            const zPrime = x * M[2] + y * M[6] + z * M[10] + M[14]

            // p' in cartesian coordinates is (x'/w', y'/w', z'/w')
            vector.set(xPrime / wPrime, yPrime / wPrime, zPrime / wPrime)

            // ---------------------------------------------

            position.setXYZ(i, vector.x, vector.y, vector.z)
         }

         // ---------------------------------------------

         position.needsUpdate = true
      }
   })
}

function makeFlat(
   object: THREE.Object3D,
   camera: THREE.Camera,
   projectionMatrix: THREE.Matrix4
) {
   // ----------------- 1. -----------------
   // move every point of the geometry from world coordinates to the coordinate system of the screen camera
   customApplyMatrix(object, camera.matrixWorldInverse)

   // ----------------- 2. -----------------
   // apply the projection transformation to every point of the geometry to project them onto the near plane of the screen camera
   customApplyMatrix(object, projectionMatrix)

   // set every matrix of the teddy to the identity matrix (doesn't seem to change anything)
   object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
         child.matrix.identity()
      }
   })

   // ----------------- 3. -----------------
   // flip the teddy along the z axis because the screen camera looks along the negative z axis
   let flipMatrix = new THREE.Matrix4()
   flipMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)
   customApplyMatrix(object, flipMatrix)
}

export { makeFlat, updateClippingPlane }
