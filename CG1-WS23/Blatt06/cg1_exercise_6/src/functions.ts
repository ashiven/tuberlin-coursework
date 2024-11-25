import * as THREE from "three"

function addSkeleton(scene: THREE.Scene, animation: any) {
   for (const matrixWorldArr of animation) {
      const matrixWorld = new THREE.Matrix4().fromArray(matrixWorldArr)
      const sphere = new THREE.Mesh(
         new THREE.SphereGeometry(0.01),
         new THREE.MeshBasicMaterial({ color: 0xff0000 })
      )
      sphere.applyMatrix4(matrixWorld)
      scene.add(sphere)
   }
}

function removeSkeleton(scene: THREE.Scene) {
   scene.children = scene.children.filter(
      (child) =>
         !(
            child instanceof THREE.Mesh &&
            child.geometry instanceof THREE.SphereGeometry
         )
   )
}

function boneMatrixInvs(currentAnimation: any) {
   let restBoneMatrixInversions = []
   for (let i = 0; i < currentAnimation.restpose.length; i++) {
      const restBoneMatrix = new THREE.Matrix4().fromArray(
         currentAnimation.restpose[i]
      )
      restBoneMatrixInversions.push(restBoneMatrix.clone().invert())
   }
   return restBoneMatrixInversions
}

function addMatrices(matrixA: THREE.Matrix4, matrixB: THREE.Matrix4) {
   const result = new THREE.Matrix4()
   for (let i = 0; i < 16; i++) {
      result.elements[i] = matrixA.elements[i] + matrixB.elements[i]
   }
   return result
}

function updateLine(line: any, objectA: THREE.Mesh, objectB: THREE.Mesh) {
   const points = [objectA.position, objectB.position]
   line.geometry.setFromPoints(points)
}

export { addMatrices, addSkeleton, boneMatrixInvs, removeSkeleton, updateLine }
