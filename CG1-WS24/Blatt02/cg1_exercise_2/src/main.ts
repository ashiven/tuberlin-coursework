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

   // ========================== SCREEN SPACE RENDERER ==========================
   let screenScene = new THREE.Scene()
   let screenCamera = new THREE.PerspectiveCamera()
   helper.setupCamera(screenCamera, screenScene, 0.01, 10, 70)
   screenScene.background = new THREE.Color(0xffffff)
   // TODO: - may have to modify the parameters of screenControls
   let screenControls = new OrbitControls(screenCamera, screenDiv)

   // add teddy bear to the scene
   teddy = helper.createTeddyBear()
   screenScene.add(teddy)

   // render the scene
   let renderer = new THREE.WebGLRenderer({ antialias: true })
   var wid = new RenderWidget(
      screenDiv,
      renderer,
      screenCamera,
      screenScene,
      screenControls
   )
   wid.animate()
}

// call main entrypoint
main()
