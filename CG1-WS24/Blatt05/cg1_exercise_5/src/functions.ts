import * as THREE from "three"

const raycaster = new THREE.Raycaster()

function getColor(
   scene: THREE.Scene,
   camera: THREE.PerspectiveCamera,
   width: number,
   height: number,
   x: number,
   y: number,
   addHelper: boolean,
   correctSpheres: boolean
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

   const intersects = correctSpheres
      ? intersectSpheres(scene.children)
      : raycaster.intersectObjects(scene.children)

   if (intersects.length > 0) {
      const object = intersects[0].object

      if (object instanceof THREE.Mesh) {
         return object.material.color
      }
   }

   return new THREE.Color(0, 0, 0)
}

function intersectSpheres(objects: any) {
   let closestSphere: any = null

   for (const object of objects) {
      if (
         object instanceof THREE.Mesh &&
         object.geometry instanceof THREE.SphereGeometry
      ) {
         let t = calculateT(object)

         if (t > 0 && (closestSphere === null || t < closestSphere.distance)) {
            closestSphere = {
               distance: t,
               object: object,
            }
         }
      }
   }

   if (closestSphere === null) {
      return raycaster.intersectObjects(objects)
   }

   return [closestSphere]
}

function calculateT(sphere: any) {
   const center = sphere.position
   const radius = sphere.geometry.parameters.radius

   const oc = new THREE.Vector3().subVectors(raycaster.ray.origin, center)

   const a = raycaster.ray.direction.dot(raycaster.ray.direction)
   const b = 2.0 * oc.dot(raycaster.ray.direction)
   const c = oc.dot(oc) - radius * radius

   const discriminant = b * b - 4 * a * c

   let t = 0

   if (discriminant < 0) {
      return -1
   } else if (discriminant === 0) {
      t = (-0.5 * b) / a
   } else {
      const q =
         b > 0
            ? -0.5 * (b + Math.sqrt(discriminant))
            : -0.5 * (b - Math.sqrt(discriminant))

      const t0 = q / a
      const t1 = c / q

      t = Math.min(t0, t1)
   }

   return t
}

function renderImg(
   scene: THREE.Scene,
   camera: THREE.PerspectiveCamera,
   width: number,
   height: number,
   canvasWid: any,
   correctSpheres: boolean
) {
   for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
         const color = getColor(
            scene,
            camera,
            width,
            height,
            x,
            y,
            false,
            correctSpheres
         )

         canvasWid.setPixel(x, y, color)
      }
   }
}

export { renderImg }
