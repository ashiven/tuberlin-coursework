// external dependencies
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// local from us provided utilities
import RenderWidget from "./lib/rendererWidget"
import type * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

// helper lib, provides exercise dependent prewritten Code
import * as helper from "./helper"

// declare teddy bear so it can be used in the callback function
var teddy: THREE.Object3D

// declare screen camera so it can be used in the callback function
var screenCamera: THREE.PerspectiveCamera

// declare the world camera so it can be used in the callback function
var worldCamera: THREE.PerspectiveCamera

// declare the camera helper so it can be used in the callback function
var cameraHelper: THREE.CameraHelper

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   if (changed.key === "rotateX") {
      teddy.rotation.x = changed.value
   } else if (changed.key === "rotateY") {
      teddy.rotation.y = changed.value
   } else if (changed.key === "rotateZ") {
      teddy.rotation.z = changed.value
   } else if (changed.key === "translateX") {
      teddy.position.x = changed.value
   } else if (changed.key === "translateY") {
      teddy.position.y = changed.value
   } else if (changed.key === "translateZ") {
      teddy.position.z = changed.value
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

   /*
   // add an event listener that triggers whenever the screenControls change
   // these changes should then trigger the world camera to change equivalently
   screenControls.addEventListener("change", () => {
      console.log("screenControls changed")
      worldControls.target = screenControls.target
      worldControls.update()
      worldCamera.position.copy(screenCamera.position)
      worldCamera.lookAt(screenControls.target)
      worldCamera.updateProjectionMatrix()
   })
   */

   // ========================== CANONICAL SPACE  ==========================
   let canonicalCamera = helper.createCanonicalCamera()
   let canonicalControls = new OrbitControls(canonicalCamera, canonicalDiv)
   helper.setupControls(canonicalControls)

   let canonicalScene = new THREE.Scene()
   canonicalScene.background = new THREE.Color(0xffffff)
   helper.setupCube(canonicalScene)

   let teddy_copy = teddy.clone()
   canonicalScene.add(teddy_copy)

   let canonicalRenderer = new THREE.WebGLRenderer({ antialias: true })
   var wid3 = new RenderWidget(
      canonicalDiv,
      canonicalRenderer,
      canonicalCamera,
      canonicalScene,
      canonicalControls
   )
   wid3.animate()
}

// call main entrypoint
main()
