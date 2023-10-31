import * as THREE from "three"

import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// add two point lights and a basic ambient light
// https://threejs.org/docs/#api/lights/PointLight
//https://threejs.org/docs/#api/en/lights/AmbientLight
export function setupLight(scene: THREE.Scene) {
   var light = new THREE.PointLight(0xffffcc, 10000, 100)
   light.position.set(10, 30, 15)
   light.matrixAutoUpdate = true
   scene.add(light)

   var light2 = new THREE.PointLight(0xffffcc, 10000, 100)
   light2.position.set(10, -30, -15)
   light2.matrixAutoUpdate = true
   scene.add(light2)

   scene.add(new THREE.AmbientLight(0xffffff))
   return scene
}

// define camera that looks into scene
// https://threejs.org/docs/#api/cameras/PerspectiveCamera
export function setupCamera(
   camera: THREE.PerspectiveCamera,
   scene: THREE.Scene
) {
   camera.near = 0.01
   camera.far = 10
   camera.fov = 70
   // TODO: - might have to revert this value to 1 because it was 1 in the original code
   camera.position.z = 10
   camera.lookAt(scene.position)
   camera.updateProjectionMatrix()
   camera.matrixAutoUpdate = true
   return camera
}

// define controls (mouse interaction with the renderer)
// https://threejs.org/docs/#examples/en/controls/OrbitControls
export function setupControls(controls: OrbitControls) {
   controls.rotateSpeed = 1.0
   controls.zoomSpeed = 1.2
   controls.enableZoom = true
   controls.minDistance = 0.1
   controls.maxDistance = 5
   return controls
}
