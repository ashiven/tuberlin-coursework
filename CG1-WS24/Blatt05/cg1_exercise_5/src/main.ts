import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CanvasWidget } from "./canvasWidget"
import * as helper from "./helper"
import RenderWidget from "./lib/rendererWidget"
import * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

function callback(changed: utils.KeyValuePair<helper.Settings>) {}

function main() {
   let root = Application("Raytracing")
   root.setLayout([["canvas", "renderer"]])
   root.setLayoutColumns(["50%", "50%"])
   root.setLayoutRows(["100%"])

   let settings = new helper.Settings()
   let gui = helper.createGUI(settings)
   settings.addCallback(callback)

   let canvasDiv = createWindow("canvas")
   root.appendChild(canvasDiv)
   let canvasWid = new CanvasWidget(canvasDiv, settings.width, settings.height)

   let rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)
   let renderer = new THREE.WebGLRenderer({
      antialias: true,
   })

   let scene = new THREE.Scene()
   helper.setupGeometry(scene)
   helper.setupLight(scene)

   let camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera)

   let controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   let wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

// call main entrypoint
main()
