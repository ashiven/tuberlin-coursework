import * as THREE from "three"

function makeFlatMatrix(object: THREE.Object3D, camera: THREE.Camera) {
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

   customApplyMatrix(object, flipMatrix)
   customApplyMatrix(object, camera.matrixWorldInverse)
   customApplyMatrix(object, camera.projectionMatrix)

   // This is what the above code does:
   /*
   canonicalTeddy.applyMatrix4(flipMatrix)
   canonicalTeddy.applyMatrix4(canonicalCamera.matrixWorldInverse)
   canonicalTeddy.applyMatrix4(canonicalCamera.projectionMatrix)
   */
}

function makeFlatVertex(object: THREE.Object3D, camera: THREE.Camera) {
   function customApplyMatrix(matrix: THREE.Matrix4) {
      object.traverse((child) => {
         if (child instanceof THREE.Mesh) {
            const bufferGeometry = child.geometry
            const position = bufferGeometry.getAttribute("position")

            // ---- position.applyMatrix4(matrix) ----
            for (let i = 0, l = position.count; i < l; i++) {
               let vector = new THREE.Vector3()
               vector.fromBufferAttribute(position, i)
               //  ---- vector.applyMatrix4(matrix) ----
               const x = vector.x
               const y = vector.y
               const z = vector.z
               const e = matrix.elements
               const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15])
               vector.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w
               vector.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w
               vector.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w
               // ---------------------------------------------
               position.setXYZ(i, vector.x, vector.y, vector.z)
            }
            // ---------------------------------------------
            position.needsUpdate = true
         }
      })
   }

   let flipMatrix = new THREE.Matrix4()
   flipMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)
   customApplyMatrix(flipMatrix)

   customApplyMatrix(camera.matrixWorldInverse)
   customApplyMatrix(camera.projectionMatrix)

   // set every matrix of the teddy to the identity matrix (doesn't seem to change anything)
   object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
         child.matrix.identity()
      }
   })
}

export { makeFlatMatrix, makeFlatVertex }
