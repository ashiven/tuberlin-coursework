import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CanvasWidget } from "./canvasWidget"
import { renderImg } from "./functions"
import * as helper from "./helper"
import RenderWidget from "./lib/rendererWidget"
import * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

var scene: THREE.Scene
var camera: THREE.PerspectiveCamera
var canvasWid: CanvasWidget
var lights: THREE.Light[]
var settings: helper.Settings = new helper.Settings()
var currentWidth: number = settings.width
var currentHeight: number = settings.height
var correctSpheres: boolean = settings.correctSpheres
var usePhong: boolean = settings.phong
var allLights: boolean = settings.alllights
var useShadows: boolean = settings.shadows

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   switch (changed.key) {
      case "width":
         currentWidth = changed.value
         canvasWid.changeDimensions(currentWidth, currentHeight)
         break
      case "height":
         currentHeight = changed.value
         canvasWid.changeDimensions(currentWidth, currentHeight)
         break
      case "correctSpheres":
         correctSpheres = changed.value
         break
      case "phong":
         usePhong = changed.value
         break
      case "alllights":
         allLights = changed.value
         break
      case "shadows":
         useShadows = changed.value
         break
   }
}

function main() {
   let root = Application("Raytracing")
   root.setLayout([["canvas", "renderer"]])
   root.setLayoutColumns(["50%", "50%"])
   root.setLayoutRows(["100%"])

   let gui = helper.createGUI(settings)
   settings.addCallback(callback)
   settings.saveImg = () => {
      canvasWid.savePNG()
   }
   settings.render = () => {
      renderImg(
         scene,
         camera,
         currentWidth,
         currentHeight,
         canvasWid,
         correctSpheres,
         usePhong,
         lights,
         allLights,
         useShadows
      )
   }

   let canvasDiv = createWindow("canvas")
   root.appendChild(canvasDiv)
   canvasWid = new CanvasWidget(canvasDiv, settings.width, settings.height)

   let rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)
   let renderer = new THREE.WebGLRenderer({
      antialias: true,
   })

   scene = new THREE.Scene()
   helper.setupGeometry(scene)
   lights = helper.setupLight(scene)

   camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera)

   let controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   let wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
