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
            const x = vector.x
            const y = vector.y
            const z = vector.z
            const elems = matrix.elements

            // p' = p * M  with p = (x, y, z, 1)
            const wPrime =
               x * elems[3] + y * elems[7] + z * elems[11] + elems[15]

            // p' in cartesian coordinates is (x'/w', y'/w', z'/w')
            vector.x =
               (x * elems[0] + y * elems[4] + z * elems[8] + elems[12]) / wPrime
            vector.y =
               (x * elems[1] + y * elems[5] + z * elems[9] + elems[13]) / wPrime
            vector.z =
               (x * elems[2] + y * elems[6] + z * elems[10] + elems[14]) /
               wPrime
            // ---------------------------------------------
            position.setXYZ(i, vector.x, vector.y, vector.z)
         }
         // ---------------------------------------------
         position.needsUpdate = true
      }
   })
}

function makeFlatMatrix(object: THREE.Object3D, screenCamera: THREE.Camera) {
   function customApplyMatrix(object: THREE.Object3D, matrix: THREE.Matrix4) {
      object.updateMatrix()
      object.matrix = object.matrix.premultiply(matrix)
      object.matrix.decompose(object.position, object.quaternion, object.scale)
   }

   // convert object to screen camera space, meaning that the object will face the screen camera
   customApplyMatrix(object, screenCamera.matrixWorldInverse)

   // convert the object from 3d space to 2d space via the projection transformation, using the projection matrix of the canonical camera
   customApplyMatrix(object, screenCamera.projectionMatrix)

   // flip the object along the z axis
   let flipMatrix = new THREE.Matrix4()
   flipMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)
   customApplyMatrix(object, flipMatrix)

   // This is what the above code does:
   /*
   canonicalTeddy.applyMatrix4(screenCamera.matrixWorldInverse)
   canonicalTeddy.applyMatrix4(screenCamera.projectionMatrix)
   canonicalTeddy.applyMatrix4(flipMatrix)
   */
}

function makeFlatVertex(object: THREE.Object3D, screenCamera: THREE.Camera) {
   // ----------------- 1. -----------------
   // we have to ensure that every point of the geometry is defined in world coordinates
   // before moving from world coordinates to camera coordinates in the next step
   customApplyMatrix(object, object.matrixWorld)

   // ----------------- 2. -----------------
   // move every point of the geometry from world coordinates to the coordinate system of the screen camera
   customApplyMatrix(object, screenCamera.matrixWorldInverse)

   // ----------------- 3. -----------------
   // apply the projection transformation to every point of the geometry to project them onto the near plane of the screen camera
   customApplyMatrix(object, screenCamera.projectionMatrix)

   // set every matrix of the teddy to the identity matrix (doesn't seem to change anything)
   object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
         child.matrix.identity()
      }
   })

   // ----------------- 4. -----------------
   // flip the teddy along the z axis because the screen camera looks along the negative z axis
   let flipMatrix = new THREE.Matrix4()
   flipMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)
   // customApplyMatrix(flipMatrix)
}

export { makeFlatMatrix, makeFlatVertex, updateClippingPlane }
