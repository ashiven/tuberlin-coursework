// external dependencies
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// local from us provided utilities
import RenderWidget from "./lib/rendererWidget"
import type * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

// helper lib, provides exercise dependent prewritten Code
import * as helper from "./helper"

// declare variables so they can be used in the callback function
var teddy: THREE.Object3D
var screenCamera: THREE.PerspectiveCamera
var worldCamera: THREE.PerspectiveCamera
var cameraHelper: THREE.CameraHelper
var canonicalRenderer: THREE.WebGLRenderer
var canonicalCamera: THREE.OrthographicCamera
var canonicalTeddy: THREE.Object3D

// create clipping planes
var clippingPlaneX0 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 1)
var clippingPlaneX1 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1)
var clippingPlaneY0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1)
var clippingPlaneY1 = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1)
var clippingPlaneZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1)
var clippingPlaneZ1 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1)

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   if (changed.key === "rotateX") {
      teddy.rotation.x = changed.value
      canonicalTeddy.rotation.x = changed.value
   } else if (changed.key === "rotateY") {
      teddy.rotation.y = changed.value
      canonicalTeddy.rotation.y = changed.value
   } else if (changed.key === "rotateZ") {
      teddy.rotation.z = changed.value
      canonicalTeddy.rotation.z = changed.value
   } else if (changed.key === "translateX") {
      teddy.position.x = changed.value
      canonicalTeddy.position.x = changed.value
   } else if (changed.key === "translateY") {
      teddy.position.y = changed.value
      canonicalTeddy.position.y = changed.value
   } else if (changed.key === "translateZ") {
      teddy.position.z = changed.value
      canonicalTeddy.position.z = changed.value
   } else if (changed.key === "near") {
      screenCamera.near = changed.value
      screenCamera.updateProjectionMatrix()
      cameraHelper.update()
   } else if (changed.key === "far") {
      screenCamera.far = changed.value
      screenCamera.updateProjectionMatrix()
      cameraHelper.update()
   } else if (changed.key === "fov") {
      screenCamera.fov = changed.value
      screenCamera.updateProjectionMatrix()
      cameraHelper.update()
   } else if (changed.key === "planeX0") {
      updateClippingPlane(changed, clippingPlaneX0)
   } else if (changed.key === "planeX1") {
      updateClippingPlane(changed, clippingPlaneX1)
   } else if (changed.key === "planeY0") {
      updateClippingPlane(changed, clippingPlaneY0)
   } else if (changed.key === "planeY1") {
      updateClippingPlane(changed, clippingPlaneY1)
   } else if (changed.key === "planeZ0") {
      updateClippingPlane(changed, clippingPlaneZ0)
   } else if (changed.key === "planeZ1") {
      updateClippingPlane(changed, clippingPlaneZ1)
   }
}

function updateClippingPlane(changed: any, changedPlane: THREE.Plane) {
   if (!changed.value) {
      canonicalRenderer.clippingPlanes =
         canonicalRenderer.clippingPlanes.filter(
            (plane) =>
               plane.normal.x !== changedPlane.normal.x ||
               plane.normal.y !== changedPlane.normal.y ||
               plane.normal.z !== changedPlane.normal.z
         )
   } else {
      let clippingPlanes = []
      for (let plane of canonicalRenderer.clippingPlanes) {
         clippingPlanes.push(plane)
      }
      clippingPlanes.push(changedPlane)
      canonicalRenderer.clippingPlanes = clippingPlanes
   }
}

// TODO: - do the following steps manually
function makeTeddyFlat() {
   // Step 1: transform everything from world space to camera space using K = T ** -1 , the inverse of the camera matrix
   let cameraMatrix = new THREE.Matrix4()
   cameraMatrix.copy(canonicalCamera.matrixWorldInverse)
   canonicalTeddy.applyMatrix4(cameraMatrix)

   // Step 2: apply primary view projection matrix to transform from camera space to screen space
   let projectionMatrix = new THREE.Matrix4()
   projectionMatrix.copy(canonicalCamera.projectionMatrix)
   canonicalTeddy.applyMatrix4(projectionMatrix)

   // Step 3: camera coordinate system is left-handed, so we need to flip the z-axis
   let flipMatrix = new THREE.Matrix4()
   flipMatrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)
   canonicalTeddy.applyMatrix4(flipMatrix)
}

/*******************************************************************************
 * Main entrypoint.
 ******************************************************************************/

var settings: helper.Settings

function main() {
   var root = Application("Camera")
   root.setLayout([["world", "canonical", "screen"]])
   root.setLayoutColumns(["1fr", "1fr", "1fr"])
   root.setLayoutRows(["100%"])

   var screenDiv = createWindow("screen")
   root.appendChild(screenDiv)

   // create RenderDiv
   var worldDiv = createWindow("world")
   root.appendChild(worldDiv)

   // create canonicalDiv
   var canonicalDiv = createWindow("canonical")
   root.appendChild(canonicalDiv)

   // ---------------------------------------------------------------------------
   // create Settings and create GUI settings
   settings = new helper.Settings()
   helper.createGUI(settings)
   settings.addCallback(callback)

   // ========================== SCENE ==========================
   let scene = new THREE.Scene()
   scene.background = new THREE.Color(0xffffff)

   // add teddy bear to the scene
   teddy = helper.createTeddyBear()
   scene.add(teddy)

   // ========================== SCREEN SPACE  ==========================
   screenCamera = new THREE.PerspectiveCamera()
   helper.setupCamera(screenCamera, scene, 1, 5, 80)
   let screenControls = new OrbitControls(screenCamera, screenDiv)
   helper.setupControls(screenControls)

   // add CameraHelper to the scene to visualize the screen camera
   cameraHelper = new THREE.CameraHelper(screenCamera)
   scene.add(cameraHelper)

   let renderer = new THREE.WebGLRenderer({ antialias: true })
   var wid = new RenderWidget(
      screenDiv,
      renderer,
      screenCamera,
      scene,
      screenControls
   )
   wid.animate()

   // ========================== WORLD SPACE  ==========================
   worldCamera = new THREE.PerspectiveCamera()
   helper.setupCamera(worldCamera, scene, 0.01, 10, 150)
   worldCamera.position.z = 4
   let worldControls = new OrbitControls(worldCamera, worldDiv)
   helper.setupControls(worldControls)

   let worldRenderer = new THREE.WebGLRenderer({ antialias: true })
   var wid2 = new RenderWidget(
      worldDiv,
      worldRenderer,
      worldCamera,
      scene,
      worldControls
   )
   wid2.animate()

   // ========================== CANONICAL SPACE  ==========================
   canonicalCamera = helper.createCanonicalCamera()
   let canonicalControls = new OrbitControls(canonicalCamera, canonicalDiv)
   helper.setupControls(canonicalControls)

   let canonicalScene = new THREE.Scene()
   canonicalScene.background = new THREE.Color(0xffffff)
   helper.setupCube(canonicalScene)

   canonicalTeddy = teddy.clone()
   canonicalScene.add(canonicalTeddy)

   makeTeddyFlat()

   canonicalRenderer = new THREE.WebGLRenderer({ antialias: true })
   canonicalRenderer.clippingPlanes = [
      clippingPlaneX0,
      clippingPlaneX1,
      clippingPlaneY0,
      clippingPlaneY1,
      clippingPlaneZ0,
      clippingPlaneZ1,
   ]

   var wid3 = new RenderWidget(
      canonicalDiv,
      canonicalRenderer,
      canonicalCamera,
      canonicalScene,
      canonicalControls
   )
   wid3.animate()
}

main()
