import * as THREE from "three"

const raycaster = new THREE.Raycaster()

function getColor(
   scene: THREE.Scene,
   camera: THREE.PerspectiveCamera,
   width: number,
   height: number,
   x: number,
   y: number,
   addHelper: boolean
): THREE.Color {
   const ndcX = (x / width) * 2 - 1
   const ndcY = -(y / height) * 2 + 1

   raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)

   if (addHelper) {
      scene.add(
         new THREE.ArrowHelper(
            raycaster.ray.direction,
            raycaster.ray.origin,
            100,
            0xff0000
         )
      )
   }

   const intersects = raycaster.intersectObjects(scene.children)

   if (intersects.length > 0) {
      const object = intersects[0].object

      if (object instanceof THREE.Mesh) {
         return object.material.color
      }
   }

   return new THREE.Color(0, 0, 0)
}

function renderImg(
   scene: THREE.Scene,
   camera: THREE.PerspectiveCamera,
   width: number,
   height: number,
   canvasWid: any
) {
   for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
         const color = getColor(scene, camera, width, height, x, y, false)

         canvasWid.setPixel(x, y, color)
      }
   }
}

export { renderImg }
