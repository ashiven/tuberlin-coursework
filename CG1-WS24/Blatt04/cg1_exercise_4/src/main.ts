import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RenderWidget from "./lib/rendererWidget"
import * as utils from "./lib/utils"
import { Application, createWindow } from "./lib/window"

import * as helper from "./helper"
import ImageWidget from "./imageWidget"

function callback(changed: utils.KeyValuePair<helper.Settings>) {
   switch (changed.key) {
      case "geometry":
         break
      case "texture":
         break
      case "shader":
         break
      case "environment":
         break
      case "normalmap":
         break
      default:
         break
   }
}

function main() {
   let root = Application("Texturing")
   root.setLayout([["texture", "renderer"]])
   root.setLayoutColumns(["50%", "50%"])
   root.setLayoutRows(["100%"])

   // ---------------------------------------------------------------------------
   let settings = new helper.Settings()
   let gui = helper.createGUI(settings)

   settings.addCallback(callback)

   // ---------------------------------------------------------------------------
   let textureDiv = createWindow("texture")
   root.appendChild(textureDiv)

   // the image widget. Change the image with setImage
   // you can enable drawing with enableDrawing
   // and it triggers the event "updated" while drawing
   let ImgWid = new ImageWidget(textureDiv)
   ImgWid.setImage("./textures/earth.jpg")

   // ---------------------------------------------------------------------------
   let rendererDiv = createWindow("renderer")
   root.appendChild(rendererDiv)

   let renderer = new THREE.WebGLRenderer({
      antialias: true,
   })

   let scene = new THREE.Scene()

   let camera = new THREE.PerspectiveCamera()
   helper.setupCamera(camera, scene)

   let controls = new OrbitControls(camera, rendererDiv)
   helper.setupControls(controls)

   let wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls)
   wid.animate()
}

main()
