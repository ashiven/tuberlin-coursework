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

function makeFlatMatrix(
   object: THREE.Object3D,
   canonicalCamera: THREE.Camera,
   screenCamera: THREE.Camera
) {
   function customMultiplyMatrices(matrixA: any, matrixB: any) {
      let productMatrix: any = new THREE.Matrix4()
      let productMatrixElems = productMatrix.elements

      const matrixAElems = matrixA.elements
      const matrixBElems = matrixB.elements

      const A11 = matrixAElems[0]
      const A21 = matrixAElems[1]
      const A31 = matrixAElems[2]
      const A41 = matrixAElems[3]
      const A12 = matrixAElems[4]
      const A22 = matrixAElems[5]
      const A32 = matrixAElems[6]
      const A42 = matrixAElems[7]
      const A13 = matrixAElems[8]
      const A23 = matrixAElems[9]
      const A33 = matrixAElems[10]
      const A43 = matrixAElems[11]
      const A14 = matrixAElems[12]
      const A24 = matrixAElems[13]
      const A34 = matrixAElems[14]
      const A44 = matrixAElems[15]

      const B11 = matrixBElems[0]
      const B21 = matrixBElems[1]
      const B31 = matrixBElems[2]
      const B41 = matrixBElems[3]
      const B12 = matrixBElems[4]
      const B22 = matrixBElems[5]
      const B32 = matrixBElems[6]
      const B42 = matrixBElems[7]
      const B13 = matrixBElems[8]
      const B23 = matrixBElems[9]
      const B33 = matrixBElems[10]
      const B43 = matrixBElems[11]
      const B14 = matrixBElems[12]
      const B24 = matrixBElems[13]
      const B34 = matrixBElems[14]
      const B44 = matrixBElems[15]

      productMatrixElems[0] = A11 * B11 + A12 * B21 + A13 * B31 + A14 * B41
      productMatrixElems[1] = A21 * B11 + A22 * B21 + A23 * B31 + A24 * B41
      productMatrixElems[2] = A31 * B11 + A32 * B21 + A33 * B31 + A34 * B41
      productMatrixElems[3] = A41 * B11 + A42 * B21 + A43 * B31 + A44 * B41
      productMatrixElems[4] = A11 * B12 + A12 * B22 + A13 * B32 + A14 * B42
      productMatrixElems[5] = A21 * B12 + A22 * B22 + A23 * B32 + A24 * B42
      productMatrixElems[6] = A31 * B12 + A32 * B22 + A33 * B32 + A34 * B42
      productMatrixElems[7] = A41 * B12 + A42 * B22 + A43 * B32 + A44 * B42
      productMatrixElems[8] = A11 * B13 + A12 * B23 + A13 * B33 + A14 * B43
      productMatrixElems[9] = A21 * B13 + A22 * B23 + A23 * B33 + A24 * B43
      productMatrixElems[10] = A31 * B13 + A32 * B23 + A33 * B33 + A34 * B43
      productMatrixElems[11] = A41 * B13 + A42 * B23 + A43 * B33 + A44 * B43
      productMatrixElems[12] = A11 * B14 + A12 * B24 + A13 * B34 + A14 * B44
      productMatrixElems[13] = A21 * B14 + A22 * B24 + A23 * B34 + A24 * B44
      productMatrixElems[14] = A31 * B14 + A32 * B24 + A33 * B34 + A34 * B44
      productMatrixElems[15] = A41 * B14 + A42 * B24 + A43 * B34 + A44 * B44

      return productMatrix
   }

   function customApplyMatrix(object: THREE.Object3D, matrix: THREE.Matrix4) {
      object.updateMatrix()
      object.matrix = customMultiplyMatrices(matrix, object.matrix)
      object.matrix.decompose(object.position, object.quaternion, object.scale)
   }

   let flipMatrix = new THREE.Matrix4()
   flipMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)

   // convert object to screen camera space, meaning that the object will face the screen camera
   customApplyMatrix(object, screenCamera.matrixWorldInverse)

   // convert the object from 3d space to 2d space via the projection transformation, using the projection matrix of the canonical camera
   customApplyMatrix(object, canonicalCamera.projectionMatrix)

   // flip the object along the z axis
   customApplyMatrix(object, flipMatrix)

   // This is what the above code does:
   /*
   canonicalTeddy.applyMatrix4(flipMatrix)
   canonicalTeddy.applyMatrix4(canonicalCamera.matrixWorldInverse)
   canonicalTeddy.applyMatrix4(canonicalCamera.projectionMatrix)
   */
}

function makeFlatVertex(
   object: THREE.Object3D,
   canonicalCamera: THREE.Camera,
   screenCamera: THREE.Camera
) {
   function customApplyMatrix(matrix: THREE.Matrix4) {
      /*
      - BufferGeometry is a class that represents a geometry 
      - BufferGeometry has a BufferAttribute position that stores the vertex positions making up the geometry
   
      - BufferAttribute is a class that represents a buffer that can be used for storing data such as vertex positions, colors, normals, etc.
      - the count attribute stores the number of vertices in the buffer
      - the setXYZ method sets the x, y and z coordinates of the vertex at the given index
      - the fromBufferAttribute method copies the x, y and z coordinates of the vertex at the given index into the given vector
      - the needsUpdate attribute indicates that the buffer has changed and should be uploaded to the GPU
      - a BufferAttribute can be constructed via an array of values and an itemSize that indicates the number of values per vertex
      */
      object.traverse((child) => {
         if (child instanceof THREE.Mesh) {
            const bufferGeometry = child.geometry
            const position = bufferGeometry.getAttribute("position")

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

               vector.x =
                  (x * elems[0] + y * elems[4] + z * elems[8] + elems[12]) /
                  wPrime
               vector.y =
                  (x * elems[1] + y * elems[5] + z * elems[9] + elems[13]) /
                  wPrime
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

   // ----------------- 1. -----------------
   // we have to ensure that every point of the geometry is defined in world coordinates
   // before moving from world coordinates to camera coordinates in the next step
   object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
         child.updateMatrixWorld()
      }
   })

   // ----------------- 2. -----------------
   // move every point of the geometry from world coordinates to the coordinate system of the screen camera
   customApplyMatrix(screenCamera.matrixWorldInverse)

   // ----------------- 3. -----------------
   // apply the projection transformation to every point of the geometry to project them onto the near plane of the screen camera
   // customApplyMatrix(screenCamera.projectionMatrix)

   // set every matrix of the teddy to the identity matrix (doesn't seem to change anything)
   // object.traverse((child) => {
   //    if (child instanceof THREE.Mesh) {
   //       child.matrix.identity()
   //    }
   // })

   // ----------------- 4. -----------------
   // flip the teddy along the z axis because the screen camera looks along the negative z axis
   let flipMatrix = new THREE.Matrix4()
   flipMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)
   // customApplyMatrix(flipMatrix)
}

export { makeFlatMatrix, makeFlatVertex, updateClippingPlane }
