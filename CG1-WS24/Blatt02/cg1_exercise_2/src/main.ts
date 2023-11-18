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

   let worldScene = scene.clone()

   // ========================== SCREEN SPACE RENDERER ==========================
   let screenCamera = new THREE.PerspectiveCamera()
   helper.setupCamera(screenCamera, scene, 0.01, 10, 70)
   // TODO: - may have to modify the parameters of screenControls
   let screenControls = new OrbitControls(screenCamera, screenDiv)

   // render the scene
   let renderer = new THREE.WebGLRenderer({ antialias: true })
   var wid = new RenderWidget(
      screenDiv,
      renderer,
      screenCamera,
      scene,
      screenControls
   )
   wid.animate()

   // ========================== WORLD SPACE RENDERER ==========================
   let worldCamera = new THREE.PerspectiveCamera()
   helper.setupCamera(worldCamera, scene, 0.01, 10, 70)
   let worldControls = new OrbitControls(worldCamera, worldDiv)

   // add CameraHelper to the scene to visualize the camera
   let cameraHelper = new THREE.CameraHelper(worldCamera)
   worldScene.add(cameraHelper)

   // render the scene
   let worldRenderer = new THREE.WebGLRenderer({ antialias: true })
   var wid2 = new RenderWidget(
      worldDiv,
      worldRenderer,
      worldCamera,
      worldScene,
      worldControls
   )
   wid2.animate()
}

// call main entrypoint
main()
