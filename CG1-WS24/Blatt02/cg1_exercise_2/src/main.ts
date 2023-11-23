// external dependencies
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// local from us provided utilities
import RenderWidget from "./lib/rendererWidget"
import type * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"
import { makeFlat, updateClippingPlane } from "./stuff"

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

// create clipping planes for the canonical renderer
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
      updateClippingPlane(canonicalRenderer, clippingPlaneX0, changed)
   } else if (changed.key === "planeX1") {
      updateClippingPlane(canonicalRenderer, clippingPlaneX1, changed)
   } else if (changed.key === "planeY0") {
      updateClippingPlane(canonicalRenderer, clippingPlaneY0, changed)
   } else if (changed.key === "planeY1") {
      updateClippingPlane(canonicalRenderer, clippingPlaneY1, changed)
   } else if (changed.key === "planeZ0") {
      updateClippingPlane(canonicalRenderer, clippingPlaneZ0, changed)
   } else if (changed.key === "planeZ1") {
      updateClippingPlane(canonicalRenderer, clippingPlaneZ1, changed)
   }
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

   teddy = helper.createTeddyBear()
   scene.add(teddy)

   // ========================== SCREEN SPACE  ==========================
   screenCamera = new THREE.PerspectiveCamera()
   helper.setupCamera(
      screenCamera,
      scene,
      settings.near,
      settings.far,
      settings.fov
   )
   let screenControls = new OrbitControls(screenCamera, screenDiv)
   helper.setupControls(screenControls)

   // add CameraHelper to the scene to visualize the screen camera
   cameraHelper = new THREE.CameraHelper(screenCamera)
   scene.add(cameraHelper)

   // TODO: - remove after testing
   let axesHelper = new THREE.AxesHelper(5)
   scene.add(axesHelper)

   // whenever the camera is moved, the change should be displayed in the canonical space
   screenControls.addEventListener("change", () => {
      console.log("transform teddy")
      console.log(
         "Camera position: ",
         "x: ",
         screenCamera.position.x.toPrecision(2),
         "y: ",
         screenCamera.position.y.toPrecision(2),
         "z: ",
         screenCamera.position.z.toPrecision(2)
      )
      makeFlat(canonicalTeddy, screenCamera, canonicalCamera.projectionMatrix)
   })

   let screenRenderer = new THREE.WebGLRenderer({ antialias: true })
   var wid = new RenderWidget(
      screenDiv,
      screenRenderer,
      screenCamera,
      scene,
      screenControls
   )
   wid.animate()

   // ========================== WORLD SPACE  ==========================
   worldCamera = new THREE.PerspectiveCamera()
   helper.setupCamera(worldCamera, scene, 0.01, 10, 120)
   worldCamera.position.z = 3.5
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

   canonicalTeddy = helper.createTeddyBear()
   canonicalScene.add(canonicalTeddy)

   makeFlat(canonicalTeddy, screenCamera, canonicalCamera.projectionMatrix)

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
