// external dependencies
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import { Application, createWindow, Window } from "./lib/window"

import * as helper from "./helper"

var camera: THREE.PerspectiveCamera
var controls: OrbitControls
var rendererDiv: Window

function main() {
   var root = Application("Robot")
   root.setLayout([["renderer"]])
   root.setLayoutColumns(["100%"])
   root.setLayoutRows(["100%"])

   rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   // create renderer
   var renderer = new THREE.WebGLRenderer({
      antialias: true, // to enable anti-alias and get smoother output
   })

   // important exercise specific limitation, do not remove this line
   THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false

   // create scene
   var scene = new THREE.Scene()
   // manually set matrixWorld
   scene.matrixWorld.copy(scene.matrix)

   helper.setupLight(scene)

   // create camera
   camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)

   // create controls
   controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   // start the animation loop (async)
   var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
