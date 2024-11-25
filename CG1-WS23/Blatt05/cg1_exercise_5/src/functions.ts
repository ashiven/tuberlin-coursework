import * as THREE from "three"

const raycaster = new THREE.Raycaster()

function getColor(
   scene: THREE.Scene,
   camera: THREE.PerspectiveCamera,
   width: number,
   height: number,
   x: number,
   y: number,
   correctSpheres: boolean,
   usePhong: boolean,
   lights: any,
   allLights: boolean,
   useShadows: boolean,
   useMirrors: boolean,
   maxReflectionDepth: number,
   reflectionDepth: number = 0
): THREE.Color {
   let color = new THREE.Color(0, 0, 0)

   const ndcX = (x / width) * 2 - 1
   const ndcY = -(y / height) * 2 + 1

   reflectionDepth === 0
      ? raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
      : null

   const intersects = correctSpheres
      ? intersectSpheres(scene.children)
      : raycaster.intersectObjects(scene.children)

   if (intersects.length > 0) {
      const intersection = intersects[0]
      const object = intersection.object
      let normal = intersection.face.normal
      if (
         !(correctSpheres && object.geometry instanceof THREE.SphereGeometry)
      ) {
         normal = intersection.face.normal
            .applyMatrix4(object.matrixWorld.clone().invert().transpose())
            .normalize()
      }
      const point = intersection.point

      if (object instanceof THREE.Mesh) {
         if (usePhong) {
            if (allLights) {
               for (const light of lights) {
                  color.add(getPhongColor(object, light, normal, point))
               }
            } else {
               const light = lights[0]
               color.add(getPhongColor(object, light, normal, point))
            }

            if (
               useMirrors &&
               object.material.mirror &&
               reflectionDepth < maxReflectionDepth
            ) {
               const reflectionDirection = raycaster.ray.direction
                  .clone()
                  .reflect(normal)
                  .normalize()
               const reflectionOrigin = point
                  .clone()
                  .add(reflectionDirection.clone().multiplyScalar(1e-8))
               raycaster.set(reflectionOrigin, reflectionDirection)

               const reflectionColor = getColor(
                  scene,
                  camera,
                  width,
                  height,
                  x,
                  y,
                  correctSpheres,
                  usePhong,
                  lights,
                  allLights,
                  useShadows,
                  useMirrors,
                  maxReflectionDepth,
                  reflectionDepth + 1
               )

               const reflectivity = object.material.reflectivity
               color.lerp(reflectionColor, reflectivity)
            }

            if (useShadows) {
               if (allLights) {
                  for (const light of lights) {
                     if (
                        isShadowed(
                           scene,
                           object,
                           light.position,
                           point,
                           correctSpheres,
                           normal
                        )
                     ) {
                        color.multiplyScalar(0.2 * lights.length)
                     }
                  }
               } else {
                  const light = lights[0]
                  if (
                     isShadowed(
                        scene,
                        object,
                        light.position,
                        point,
                        correctSpheres,
                        normal
                     )
                  ) {
                     color.multiplyScalar(0.2)
                  }
               }
            }
         } else {
            color = object.material.color
         }
      }
   }

   return color
}

function getPhongColor(
   object: any,
   light: THREE.PointLight,
   normal: THREE.Vector3,
   point: THREE.Vector3
) {
   const material = object.material as THREE.MeshPhongMaterial
   const diffuseReflectance = material.color.clone()
   const specularReflectance = material.specular.clone()
   const magnitude = material.shininess

   const lightPosition = light.position.clone()
   const lightColor = light.color.clone()
   const lightIntensity = light.intensity * 4

   const direction = raycaster.ray.direction.clone()
   const intersectionPoint = point

   const normalDirection = normal
   const lightDirection = lightPosition
      .clone()
      .sub(intersectionPoint)
      .normalize()
   const viewDirection = direction.clone().negate().normalize()
   const reflectionDirection = normalDirection
      .clone()
      .multiplyScalar(lightDirection.clone().dot(normalDirection) * 2)
      .sub(lightDirection)
      .normalize()

   const diffuseTerm = diffuseReflectance
      .clone()
      .multiplyScalar(lightIntensity)
      .multiplyScalar(Math.max(0, normalDirection.clone().dot(lightDirection)))

   const specularTerm = specularReflectance
      .clone()
      .multiplyScalar(lightIntensity)
      .multiplyScalar(
         Math.pow(
            Math.max(0, viewDirection.clone().dot(reflectionDirection)),
            magnitude
         )
      )

   const specularColor = specularTerm
      .multiply(lightColor)
      .multiplyScalar(magnitude / 50)
   const diffuseColor = diffuseTerm.multiply(lightColor)

   const distanceToLight = intersectionPoint.distanceTo(lightPosition)
   const attenuation = 1 / (distanceToLight * distanceToLight)

   let color = diffuseColor.add(specularColor).multiplyScalar(attenuation)

   return color
}

function isShadowed(
   scene: THREE.Scene,
   currentObject: any,
   lightPosition: THREE.Vector3,
   intersectionPoint: THREE.Vector3,
   correctSpheres: boolean,
   normalDirection: THREE.Vector3
) {
   const lightDirection = lightPosition
      .clone()
      .sub(intersectionPoint)
      .normalize()

   const offset = 1e-8
   const origin = intersectionPoint
      .clone()
      .add(normalDirection.clone().multiplyScalar(offset))

   raycaster.set(origin, lightDirection)

   const intersects = correctSpheres
      ? intersectSpheres(scene.children)
      : raycaster.intersectObjects(scene.children)

   if (intersects.length > 0) {
      const intersection = intersects[0]
      const object = intersection.object
      const distance = intersection.distance

      if (object instanceof THREE.Mesh && object !== currentObject) {
         return distance < intersectionPoint.distanceTo(lightPosition)
      }
   }

   return false
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
               face: { normal: null },
               point: null,
            }
         }
      }
   }

   if (closestSphere === null) {
      return raycaster.intersectObjects(objects)
   }

   const object = closestSphere.object
   const center = object.position.clone()
   const origin = raycaster.ray.origin.clone()
   const direction = raycaster.ray.direction.clone()

   const intersectionPoint = origin
      .clone()
      .add(direction.clone().multiplyScalar(closestSphere.distance))
   const normalDirection = intersectionPoint.clone().sub(center).normalize()

   closestSphere.face.normal = normalDirection
   closestSphere.point = intersectionPoint

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
   correctSpheres: boolean,
   usePhong: boolean,
   lights: any,
   allLights: boolean,
   useShadows: boolean,
   useMirrors: boolean,
   maxReflectionDepth: number,
   subsamples: number
) {
   for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
         let color = new THREE.Color(0, 0, 0)

         for (let i = 0; i < subsamples; i++) {
            for (let j = 0; j < subsamples; j++) {
               const sampleColor = getColor(
                  scene,
                  camera,
                  width,
                  height,
                  x + i / subsamples,
                  y + j / subsamples,
                  correctSpheres,
                  usePhong,
                  lights,
                  allLights,
                  useShadows,
                  useMirrors,
                  maxReflectionDepth
               )
               color.add(sampleColor)
            }
         }
         color.multiplyScalar(1 / (subsamples * subsamples))

         canvasWid.setPixel(x, y, color)
      }
   }
}

export { renderImg }
